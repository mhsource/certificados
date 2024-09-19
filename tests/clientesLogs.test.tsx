// ClientesLogs.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientesLogs from './clienteslogs';
import { listS3Prefix, getLogS3Prefix } from '../../services/apis';
import { useParams } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock das funções listS3Prefix e getLogS3Prefix
jest.mock('../../services/apis', () => ({
  listS3Prefix: jest.fn(),
  getLogS3Prefix: jest.fn(),
}));

// Mock do hook useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// Mock do componente EditarCliente
jest.mock('./editarCliente', () => (props: any) => (
  <div data-testid="editar-cliente">
    <button onClick={props.onClose}>Fechar</button>
    <div>{props.selectedValue}</div>
  </div>
));

describe('ClientesLogs Component', () => {
  it('deve buscar e exibir os dados corretamente', async () => {
    // Dados mockados
    const mockRows = ['Log A', 'Log B'];
    const mockLogs = { logs: 'Detalhes do Log' };
    const mockPasta = 'pasta123';

    // Mock das implementações
    (listS3Prefix as jest.Mock).mockResolvedValue(mockRows);
    (getLogS3Prefix as jest.Mock).mockResolvedValue(mockLogs);
    (useParams as jest.Mock).mockReturnValue({ pasta: mockPasta });

    // Renderiza o componente
    render(<ClientesLogs />);

    // Verifica se listS3Prefix foi chamada
    expect(listS3Prefix).toHaveBeenCalledTimes(1);

    // Verifica se os dados estão sendo exibidos na tabela
    expect(await screen.findByText('Log A')).toBeInTheDocument();
    expect(await screen.findByText('Log B')).toBeInTheDocument();

    // Simula o clique no Chip da "Log A"
    const chip = screen.getAllByText('Visualizar log')[0];
    fireEvent.click(chip);

    // Verifica se getLogS3Prefix foi chamada
    expect(getLogS3Prefix).toHaveBeenCalledTimes(1);

    // Verifica se o modal EditarCliente é exibido com os dados corretos
    expect(await screen.findByTestId('editar-cliente')).toBeInTheDocument();
    expect(screen.getByText('Detalhes do Log')).toBeInTheDocument();

    // Simula o fechamento do modal
    const closeButton = screen.getByText('Fechar');
    fireEvent.click(closeButton);


  });
});
