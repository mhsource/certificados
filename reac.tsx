import React, { useState } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function MyComponent() {
    const [rows, setRows] = useState([{ cpf: '', contrato: '' }]);

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

    return (
        <div>
            <div className="buttons">
                <Button variant="contained" color="primary" onClick={handleAddRow}>
                    Adicionar Linha
                </Button>
                <Button variant="contained" color="secondary">
                    Importar de Excel
                </Button>
                <Button variant="contained" color="success">
                    Inserir Dados
                </Button>
                <input type="file" style={{ display: 'none' }} id="file-input" />
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
