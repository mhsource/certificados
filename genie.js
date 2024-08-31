const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

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

// IPC handler to execute JAR
ipcMain.on('execute-jar', (event, jarPath, args) => {
    const jarProcess = spawn('java', ['-jar', jarPath, ...args]);

    jarProcess.stdout.on('data', (data) => {
        event.sender.send('log', data.toString());
    });

    jarProcess.stderr.on('data', (data) => {
        event.sender.send('log', `ERROR: ${data.toString()}`);
    });

    jarProcess.on('close', (code) => {
        event.sender.send('log', `Processo finalizado com código: ${code}`);
    });
});

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logs do JAR</title>
</head>
<body>
    <h1>Execução do JAR</h1>
    <button id="execute">Executar JAR</button>
    <pre id="logs"></pre>

    <script>
        const { ipcRenderer } = require('electron');

        const executeButton = document.getElementById('execute');
        const logsContainer = document.getElementById('logs');

        executeButton.addEventListener('click', () => {
            // Caminho do JAR e argumentos
            const jarPath = 'c:\\caminho\\para\\meu_programa.jar';
            const args = ['arg1', 'arg2', 'arg3'];

            // Envia a solicitação para executar o JAR
            ipcRenderer.send('execute-jar', jarPath, args);
        });

        // Recebe e exibe os logs
        ipcRenderer.on('log', (event, log) => {
            logsContainer.textContent += log + '\n';
        });
    </script>
</body>
</html>

