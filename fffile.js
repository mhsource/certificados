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

        // Envia o conteúdo do arquivo para a interface
        event.sender.send('file-loaded', data);
    });
});

// IPC handler para gravar dados no SQL Server
ipcMain.on('save-to-sql', async (event, formData) => {
    try {
        let pool = await sql.connect(config);

        const query = `
            INSERT INTO sua_tabela (campo1, campo2, campo3)
            VALUES (@campo1, @campo2, @campo3)
        `;

        const request = pool.request();
        request.input('campo1', sql.VarChar, formData.campo1);
        request.input('campo2', sql.VarChar, formData.campo2);
        request.input('campo3', sql.VarChar, formData.campo3);

        await request.query(query);

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

        ipcRenderer.on('file-loaded', (event, data) => {
            const fields = parsePositionalData(data);
            createForm(fields);
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

        function parsePositionalData(data) {
            // Exemplo: suponha que cada campo tem 10 caracteres de largura
            const campo1 = data.substring(0, 10).trim();
            const campo2 = data.substring(10, 20).trim();
            const campo3 = data.substring(20, 30).trim();

            return { campo1, campo2, campo3 };
        }

        function createForm(fields) {
            formContainer.innerHTML = '';
            for (const [key, value] of Object.entries(fields)) {
                const label = document.createElement('label');
                label.textContent = key;
                const input = document.createElement('input');
                input.type = 'text';
                input.id = key;
                input.value = value;
                formContainer.appendChild(label);
                formContainer.appendChild(input);
                formContainer.appendChild(document.createElement('br'));
            }
        }

        function getFormData() {
            const campo1 = document.getElementById('campo1').value.trim();
            const campo2 = document.getElementById('campo2').value.trim();
            const campo3 = document.getElementById('campo3').value.trim();

            return { campo1, campo2, campo3 };
        }
    </script>
</body>
</html>

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    loadFile: () => ipcRenderer.send('load-txt-file'),
    onFileLoaded: (callback) => ipcRenderer.on('file-loaded', callback),
    onFileLoadError: (callback) => ipcRenderer.on('file-load-error', callback),
    saveData: (formData) => ipcRenderer.send('save-to-sql', formData),
    onSaveSuccess: (callback) => ipcRenderer.on('save-success', callback),
    onSaveError: (callback) => ipcRenderer.on('save-error', callback),
});



