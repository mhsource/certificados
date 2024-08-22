go get -u github.com/gioui/gioui/cmd/gogio
go get -u github.com/gioui/gioui
go get -u github.com/denisenkom/go-mssqldb


package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
    "os"
    "strings"

    "github.com/denisenkom/go-mssqldb"
    "gioui.org/app"
    "gioui.org/font/gofont"
    "gioui.org/io/system"
    "gioui.org/layout"
    "gioui.org/text"
    "gioui.org/unit"
    "gioui.org/widget"
    "gioui.org/widget/material"
    "gioui.org/op"
)

var (
    server   = "seu_servidor"
    user     = "seu_usuario"
    password = "sua_senha"
    database = "sua_base_de_dados"
)

type row []string
type resultSet []row

func main() {
    go func() {
        // Criando uma nova janela Gio
        w := app.NewWindow()
        if err := loop(w); err != nil {
            log.Fatal(err)
        }
        os.Exit(0)
    }()
    app.Main()
}

func loop(w *app.Window) error {
    var (
        result resultSet
        queryBtn widget.Clickable
        list widget.List = widget.List{List: layout.List{Axis: layout.Vertical}}
    )

    th := material.NewTheme(gofont.Collection())

    for {
        e := <-w.Events()
        switch e := e.(type) {
        case system.FrameEvent:
            gtx := layout.NewContext(&op.Ops{}, e)

            if queryBtn.Clicked() {
                var err error
                result, err = queryDatabase()
                if err != nil {
                    log.Printf("Erro na consulta: %v\n", err)
                }
            }

            layout.Flex{Axis: layout.Vertical}.Layout(gtx,
                layout.Rigid(material.Button(th, &queryBtn, "Consultar Banco de Dados").Layout),
                layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
                    return list.Layout(gtx, len(result), func(gtx layout.Context, i int) layout.Dimensions {
                        return layout.Flex{Axis: layout.Horizontal}.Layout(gtx,
                            layout.Rigid(func(gtx layout.Context) layout.Dimensions {
                                return material.Body1(th, fmt.Sprintf("%d", i+1)).Layout(gtx)
                            }),
                            layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
                                return material.Body1(th, strings.Join(result[i], " | ")).Layout(gtx)
                            }),
                        )
                    })
                }),
            )

            e.Frame(gtx.Ops)
        case system.DestroyEvent:
            return e.Err
        }
    }
}

func queryDatabase() (resultSet, error) {
    connString := fmt.Sprintf("server=%s;user id=%s;password=%s;database=%s;",
        server, user, password, database)

    db, err := sql.Open("sqlserver", connString)
    if err != nil {
        return nil, err
    }
    defer db.Close()

    ctx := context.Background()

    err = db.PingContext(ctx)
    if err != nil {
        return nil, err
    }

    query := "SELECT * FROM sua_tabela" // Substitua pela sua consulta
    rows, err := db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    columns, err := rows.Columns()
    if err != nil {
        return nil, err
    }

    result := resultSet{}
    for rows.Next() {
        values := make([]sql.NullString, len(columns))
        valuePtrs := make([]interface{}, len(columns))
        for i := range values {
            valuePtrs[i] = &values[i]
        }

        if err := rows.Scan(valuePtrs...); err != nil {
            return nil, err
        }

        row := make([]string, len(columns))
        for i, val := range values {
            if val.Valid {
                row[i] = val.String
            } else {
                row[i] = "NULL"
            }
        }
        result = append(result, row)
    }

    return result, nil
}
