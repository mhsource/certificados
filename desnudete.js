<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta SQL Server com CPF</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table, th, td {
            border: 1px solid black;
        }

        th, td {
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
    <h1>Resultados das Consultas SQL</h1>
    
    <!-- Campo de entrada para o CPF -->
    <label for="cpf">CPF:</label>
    <input type="text" id="cpf" placeholder="Digite o CPF">
    
    <button id="execute">Executar Consultas</button>

    <h2>Tabela 1</h2>
    <table id="table1">
        <thead></thead>
        <tbody></tbody>
    </table>

    <h2>Tabela 2</h2>
    <table id="table2">
        <thead></thead>
        <tbody></tbody>
    </table>

    <script>
        const { ipcRenderer } = require('electron');

        const executeButton = document.getElementById('execute');
        const cpfInput = document.getElementById('cpf');
        const table1 = document.getElementById('table1');
        const table2 = document.getElementById('table2');

        executeButton.addEventListener('click', () => {
            const cpf = cpfInput.value.trim();
            if (cpf) {
                ipcRenderer.send('execute-query', cpf);
            } else {
                alert('Por favor, insira um CPF.');
            }
        });

        ipcRenderer.on('query-results', (event, result1, result2) => {
            populateTable(table1, result1);
            populateTable(table2, result2);
        });

        ipcRenderer.on('query-error', (event, errorMessage) => {
            alert('Erro na consulta SQL: ' + errorMessage);
        });

        function populateTable(table, data) {
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');

            // Limpar tabelas existentes
            thead.innerHTML = '';
            tbody.innerHTML = '';

            // Criar cabeçalhos
            const headers = Object.keys(data[0]);
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            // Criar linhas de dados
            data.forEach(row => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = row[header];
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
    </script>
</body>
</html>


const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');

// Configurações de conexão com o SQL Server
const config = {
    user: 'seu_usuario',
    password: 'sua_senha',
    server: 'seu_servidor',
    database: 'sua_base_de_dados',
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: true // Para servidores locais
    }
};

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handler para realizar consultas SQL com CPF
ipcMain.on('execute-query', async (event, cpf) => {
    try {
        // Conectar ao SQL Server
        let pool = await sql.connect(config);

        // Realizar consultas nas duas tabelas usando o CPF como parâmetro
        const result1 = await pool.request()
            .input('cpf', sql.VarChar, cpf)
            .query('SELECT * FROM tabela1 WHERE cpf = @cpf');

        const result2 = await pool.request()
            .input('cpf', sql.VarChar, cpf)
            .query('SELECT * FROM tabela2 WHERE cpf = @cpf');

        // Enviar os resultados para a interface
        event.sender.send('query-results', result1.recordset, result2.recordset);
        
    } catch (err) {
        console.error('Erro na consulta SQL: ', err);
        event.sender.send('query-error', err.message);
    } finally {
        sql.close(); // Fechar a conexão
    }
});


