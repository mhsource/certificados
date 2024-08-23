const { ipcRenderer } = require('electron');

document.getElementById('consultar').addEventListener('click', () => {
  const query = 'SELECT * FROM sua_tabela'; // Substitua pela sua consulta SQL

  ipcRenderer.send('query-database', query);
});

ipcRenderer.on('query-result', (event, data) => {
  if (data.error) {
    alert('Erro ao consultar o banco de dados: ' + data.error);
    return;
  }

  const tableHeader = document.getElementById('table-header');
  const tableBody = document.getElementById('table-body');

  // Limpar conteúdo anterior
  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';

  if (data.length > 0) {
    // Criar cabeçalho da tabela
    Object.keys(data[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      tableHeader.appendChild(th);
    });

    // Criar linhas da tabela
    data.forEach(row => {
      const tr = document.createElement('tr');
      Object.values(row).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = 'Nenhum resultado encontrado';
    td.colSpan = Object.keys(data[0] || {}).length;
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }
});
