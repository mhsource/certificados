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

ipcMain.on('query-database', async (event, query) => {
  try {
    // Configurações da conexão com o SQL Server
    const config = {
      user: 'seu_usuario',
      password: 'sua_senha',
      server: 'seu_servidor',
      database: 'sua_base_de_dados',
      options: {
        encrypt: true, // Usar true se você estiver se conectando ao Azure SQL
        trustServerCertificate: true, // Usar true se estiver desenvolvendo localmente
      },
    };

    // Conectar ao SQL Server
    await sql.connect(config);
    const result = await sql.query(query);
    
    // Retorna os resultados para o renderer process
    event.reply('query-result', result.recordset);
  } catch (err) {
    console.error('Erro ao consultar o banco de dados:', err);
    event.reply('query-result', { error: err.message });
  } finally {
    await sql.close();
  }
});
