<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inserção Massiva de Dados</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
</head>

<body>
    <section class="section">
        <div class="container">
            <h1 class="title">Inserção Massiva de Dados</h1>
            <div class="buttons">
                <button id="add-row" class="button is-primary">Adicionar Linha</button>
                <button id="import-excel" class="button is-link">Importar de Excel</button>
                <button id="submit" class="button is-success">Inserir Dados</button>
                <input type="file" id="file-input" class="file-input" style="display: none;">
            </div>
            <table id="input-table" class="table is-fullwidth is-striped is-hoverable">
                <thead>
                    <tr>
                        <th>Coluna1</th> <!-- Substitua pelos nomes das colunas -->
                        <th>Coluna2</th>
                        <!-- Adicione mais colunas conforme necessário -->
                        <th>Ações</th> <!-- Coluna para ações (remover) -->
                    </tr>
                </thead>
                <tbody id="table-body">
                    <tr>
                        <td><input class="input" type="text" placeholder="Valor 1"></td> <!-- Tipo de entrada correspondente -->
                        <td><input class="input" type="number" placeholder="Valor 2"></td>
                        <!-- Adicione mais entradas conforme necessário -->
                        <td><button class="button is-danger remove-row">Remover</button></td>
                    </tr>
                </tbody>
            </table>
            <p id="status" class="notification is-primary"></p>
        </div>
    </section>
    <script src="renderer.js"></script>
</body>

</html>

const { ipcRenderer } = require('electron');
const XLSX = require('xlsx');

document.getElementById('add-row').addEventListener('click', () => {
    addRow();
});

document.getElementById('import-excel').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            // Preenche a tabela com os dados do Excel
            fillTableWithExcelData(worksheet);
        };
        reader.readAsArrayBuffer(file);
    }
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
    const statusElement = document.getElementById('status');
    statusElement.innerText = message;
    statusElement.classList.remove('is-primary', 'is-danger', 'is-success');
    statusElement.classList.add(message.includes('Erro') ? 'is-danger' : 'is-success');
});

function addRow(values = ["", ""]) {
    const tableBody = document.getElementById('table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input class="input" type="text" placeholder="Valor 1" value="${values[0]}"></td>
        <td><input class="input" type="number" placeholder="Valor 2" value="${values[1]}"></td>
        <td><button class="button is-danger remove-row">Remover</button></td>
    `;

    tableBody.appendChild(newRow);

    // Adiciona o event listener ao botão "Remover" da nova linha
    newRow.querySelector('.remove-row').addEventListener('click', () => {
        tableBody.removeChild(newRow);
    });
}

function fillTableWithExcelData(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Limpa a tabela antes de preencher com os novos dados

    data.forEach((row, index) => {
        if (index > 0) { // Ignora a primeira linha se for um cabeçalho
            addRow(row);
        }
    });
}

// Adiciona o event listener ao botão "Remover" da linha inicial
document.querySelectorAll('.remove-row').forEach(button => {
    button.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        row.parentNode.removeChild(row);
    });
});







