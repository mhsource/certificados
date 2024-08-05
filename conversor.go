package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "os"
    "strconv"
    "strings"
)

type PositionMap map[string][2]int

func main() {
    // Exemplo de mapeamento de posições
    paramJSON := `{
        "cpf":[1,5],
        "nome":[6,10]
    }`

    // Carregar o mapeamento de posições
    var positions PositionMap
    if err := json.Unmarshal([]byte(paramJSON), &positions); err != nil {
        log.Fatalf("failed to unmarshal JSON: %v", err)
    }

    // Caminho para o arquivo TXT posicional
    filePath := "input.txt"

    // Ler o conteúdo do arquivo
    fileContent, err := ioutil.ReadFile(filePath)
    if err != nil {
        log.Fatalf("failed to read file: %v", err)
    }

    // Converter o conteúdo do arquivo em linhas
    lines := strings.Split(string(fileContent), "\n")

    var results []map[string]string

    // Processar cada linha
    for _, line := range lines {
        if strings.TrimSpace(line) == "" {
            continue // Pular linhas vazias
        }
        
        record := make(map[string]string)

        for key, pos := range positions {
            start := pos[0] - 1 // Ajustar para índice baseado em 0
            end := pos[1]
            if end > len(line) {
                end = len(line)
            }
            if start < len(line) {
                record[key] = line[start:end]
            }
        }
        
        results = append(results, record)
    }

    // Converter o resultado para JSON
    outputJSON, err := json.MarshalIndent(results, "", "  ")
    if err != nil {
        log.Fatalf("failed to marshal result to JSON: %v", err)
    }

    fmt.Println(string(outputJSON))
}
