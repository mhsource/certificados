const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sql = require('mssql');

// Configurações de conexão com o SQL Server
const config = {
    user: 'seu_usuario',
    password: 'sua_senha',
    server: 'seu_servidor',
    database: 'sua_base_de_dados',
    options: {
        encrypt: true,
        trustServerCertificate: true
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

// IPC handler para carregar o arquivo TXT
ipcMain.on('load-txt-file', async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (result.canceled) return;

    const filePath = result.filePaths[0];
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            event.sender.send('file-load-error', 'Erro ao ler o arquivo.');
            return;
        }

        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Envia as linhas do arquivo para a interface
        event.sender.send('file-loaded', lines);
    });
});

// IPC handler para gravar dados no SQL Server
ipcMain.on('save-to-sql', async (event, formData) => {
    try {
        let pool = await sql.connect(config);

        const query = `
            INSERT INTO sua_tabela (cpf, nome)
            VALUES (@cpf, @nome)
        `;

        for (const row of formData) {
            const request = pool.request();
            request.input('cpf', sql.VarChar, row.cpf);
            request.input('nome', sql.VarChar, row.nome);

            await request.query(query);
        }

        event.sender.send('save-success', 'Dados gravados com sucesso!');
    } catch (err) {
        console.error('Erro ao salvar no SQL Server:', err);
        event.sender.send('save-error', 'Erro ao salvar no banco de dados.');
    } finally {
        sql.close();
    }
});


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitura de Arquivo TXT Posicional</title>
    <style>
        .record {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>Leitura de Arquivo TXT Posicional</h1>
    <button id="loadFile">Carregar Arquivo TXT</button>
    
    <div id="formContainer"></div>
    <button id="saveData" style="display:none;">Salvar Dados no SQL Server</button>

    <script>
        const { ipcRenderer } = require('electron');

        const loadFileButton = document.getElementById('loadFile');
        const saveDataButton = document.getElementById('saveData');
        const formContainer = document.getElementById('formContainer');

        loadFileButton.addEventListener('click', () => {
            ipcRenderer.send('load-txt-file');
        });

        ipcRenderer.on('file-loaded', (event, lines) => {
            formContainer.innerHTML = ''; // Limpa o container de formulários

            lines.forEach((line, index) => {
                const fields = parsePositionalData(line);

                const recordDiv = document.createElement('div');
                recordDiv.className = 'record';

                createForm(fields, index, recordDiv);
                formContainer.appendChild(recordDiv);
            });

            saveDataButton.style.display = 'block';
        });

        ipcRenderer.on('file-load-error', (event, errorMessage) => {
            alert(errorMessage);
        });

        saveDataButton.addEventListener('click', () => {
            const formData = getFormData();
            ipcRenderer.send('save-to-sql', formData);
        });

        ipcRenderer.on('save-success', (event, message) => {
            alert(message);
        });

        ipcRenderer.on('save-error', (event, errorMessage) => {
            alert(errorMessage);
        });

        function parsePositionalData(line) {
            // Exemplo: suponha que o CPF vai de 0 a 11, e o Nome de 11 a 20
            const cpf = line.substring(0, 11).trim();
            const nome = line.substring(11, 20).trim();

            return { cpf, nome };
        }

        function createForm(fields, index, container) {
            for (const [key, value] of Object.entries(fields)) {
                const label = document.createElement('label');
                label.textContent = `${key} ${index + 1}: `;
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `${key}-${index}`;
                input.value = value;
                container.appendChild(label);
                container.appendChild(input);
                container.appendChild(document.createElement('br'));
            }
        }

        function getFormData() {
            const records = document.querySelectorAll('.record');
            const formData = [];

            records.forEach((record, index) => {
                const cpf = document.getElementById(`cpf-${index}`).value.trim();
                const nome = document.getElementById(`nome-${index}`).value.trim();

                formData.push({ cpf, nome });
            });

            return formData;
        }
    </script>
</body>
</html>


