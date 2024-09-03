import React, { useState, useRef } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';

function MyComponent() {
    const [rows, setRows] = useState([{ cpf: '', contrato: '' }]);
    const fileInputRef = useRef(null);

    const handleAddRow = () => {
        setRows([...rows, { cpf: '', contrato: '' }]);
    };

    const handleRemoveRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    const handleImportExcel = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                
                console.log(worksheet);
                fillTableWithExcelData(worksheet);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const fillTableWithExcelData = (data) => {
        const newRows = data.map(row => ({
            cpf: row[0] || '',
            contrato: row[1] || '',
        }));
        setRows(newRows);
    };

    const handleSubmit = () => {
        const rowsData = rows.map(row => [row.cpf, row.contrato]);
        console.log(rowsData); // Adicionando console.log para mostrar os valores
    };

    return (
        <div>
            <div className="buttons">
                <Button variant="contained" color="primary" onClick={handleAddRow}>
                    Adicionar Linha
                </Button>
                <Button variant="contained" color="secondary" onClick={handleImportExcel}>
                    Importar de Excel
                </Button>
                <Button variant="contained" color="success" onClick={handleSubmit}>
                    Inserir Dados
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Numero do CPF</TableCell>
                            <TableCell>Numero Contrato</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        variant="outlined"
                                        name="cpf"
                                        value={row.cpf}
                                        onChange={(event) => handleInputChange(index, event)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        variant="outlined"
                                        name="contrato"
                                        value={row.contrato}
                                        onChange={(event) => handleInputChange(index, event)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="error" onClick={() => handleRemoveRow(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default MyComponent;
