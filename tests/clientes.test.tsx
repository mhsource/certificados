// Clientes.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Clientes from './clientes';
import { listS3Pastas } from '../../services/apis';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock da função listS3Pastas
jest.mock('../../services/apis', () => ({
  listS3Pastas: jest.fn(),
}));

// Mock do hook useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Clientes Component', () => {
  it('deve buscar e exibir os dados corretamente', async () => {
    // Dados mockados
    const mockData = [
      { Prefix: 'Aplicação A' },
      { Prefix: 'Aplicação B' },
    ];

    // Define o retorno da função mockada listS3Pastas
    (listS3Pastas as jest.Mock).mockResolvedValue(mockData);

    // Mock da função navigate
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    // Renderiza o componente
    render(<Clientes />);

    // Verifica se os dados estão sendo exibidos
    expect(await screen.findByText('Aplicação A')).toBeInTheDocument();
    expect(await screen.findByText('Aplicação B')).toBeInTheDocument();

    // Verifica se listS3Pastas foi chamada
    expect(listS3Pastas).toHaveBeenCalledTimes(1);

    // Simula o clique no Chip da "Aplicação A"
    const chip = screen.getAllByText('Visualizar logs')[0];
    fireEvent.click(chip);

    // Verifica se a função navigate foi chamada corretamente
    expect(mockNavigate).toHaveBeenCalledWith('/logs/Aplicação A');
  });
});
