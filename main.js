const { app, BrowserWindow, ipcMain } = require('electron');
const sql = require('mssql');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.on('mass-insert', async (event, rows) => {
    try {
        const config = {
            user: 'seu_usuario',
            password: 'sua_senha',
            server: 'seu_servidor',
            database: 'sua_base_de_dados',
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };

        // Conecte-se ao SQL Server
        await sql.connect(config);

        const table = new sql.Table('sua_tabela'); // Substitua pelo nome da sua tabela
        table.create = false; // Não recrie a tabela se já existir
        table.columns.add('Coluna1', sql.NVarChar(50), { nullable: true }); // Substitua pelos nomes e tipos das colunas
        table.columns.add('Coluna2', sql.Int, { nullable: true });
        // Adicione mais colunas conforme necessário

        rows.forEach(row => {
            table.rows.add(row[0], row[1]); // Substitua pelos valores das colunas
        });

        const request = new sql.Request();
        await request.bulk(table); // Inserção em massa

        event.reply('insert-result', 'Inserção bem-sucedida!');
    } catch (err) {
        console.error('Erro ao inserir dados:', err);
        event.reply('insert-result', `Erro: ${err.message}`);
    } finally {
        await sql.close();
    }
});


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inserção Massiva de Dados</title>
    <style>
        table {
            width: 100%;
            margin-top: 10px;
            border-collapse: collapse;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <h1>Inserção Massiva de Dados</h1>
    <button id="add-row">Adicionar Linha</button>
    <button id="submit">Inserir Dados</button>
    <table id="input-table">
        <thead>
            <tr>
                <th>Coluna1</th> <!-- Substitua pelos nomes das colunas -->
                <th>Coluna2</th>
                <!-- Adicione mais colunas conforme necessário -->
            </tr>
        </thead>
        <tbody id="table-body">
            <tr>
                <td><input type="text" placeholder="Valor 1"></td> <!-- Tipo de entrada correspondente -->
                <td><input type="number" placeholder="Valor 2"></td>
                <!-- Adicione mais entradas conforme necessário -->
            </tr>
        </tbody>
    </table>
    <p id="status"></p>
    <script src="renderer.js"></script>
</body>
</html>

const { ipcRenderer } = require('electron');

document.getElementById('add-row').addEventListener('click', () => {
    const tableBody = document.getElementById('table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input type="text" placeholder="Valor 1"></td> <!-- Substitua pelos tipos de entrada necessários -->
        <td><input type="number" placeholder="Valor 2"></td>
        <!-- Adicione mais entradas conforme necessário -->
    `;

    tableBody.appendChild(newRow);
});

document.getElementById('submit').addEventListener('click', () => {
    const rows = [];
    const tableBody = document.getElementById('table-body');
    const rowElements = tableBody.getElementsByTagName('tr');

    for (let row of rowElements) {
        const inputs = row.getElementsByTagName('input');
        const values = [];

        for (let input of inputs) {
            values.push(input.value);
        }

        rows.push(values);
    }

    ipcRenderer.send('mass-insert', rows);
});

ipcRenderer.on('insert-result', (event, message) => {
    document.getElementById('status').innerText = message;
});




