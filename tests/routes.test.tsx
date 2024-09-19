// routes.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PortalRoutes from './routes';

// Importa os matchers do jest-dom
import '@testing-library/jest-dom';

// Mock dos componentes usados nas rotas
jest.mock('../layout/main', () => {
  const React = require('react');
  const { Outlet } = require('react-router-dom');
  return function MockMainLayout() {
    return (
      <div data-testid="main-layout">
        <Outlet />
      </div>
    );
  };
});

jest.mock('../pages/clientes/clientes', () => () => (
  <div data-testid="clientes-page">Clientes Page</div>
));

jest.mock('../pages/clientes/clienteslogs', () => () => (
  <div data-testid="clientes-logs-page">Clientes Logs Page</div>
));

describe('PortalRoutes', () => {
  it('deve renderizar o componente Clientes para o caminho raiz "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PortalRoutes />
      </MemoryRouter>
    );

    // Verifica se o MainLayout foi renderizado
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();

    // Verifica se o componente Clientes foi renderizado
    expect(screen.getByTestId('clientes-page')).toBeInTheDocument();
  });

  it('deve renderizar o componente ClientesLogs para o caminho "/logs/:pasta"', () => {
    const testPasta = 'exemploPasta';

    render(
      <MemoryRouter initialEntries={[`/logs/${testPasta}`]}>
        <PortalRoutes />
      </MemoryRouter>
    );

    // Verifica se o MainLayout foi renderizado
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();

    // Verifica se o componente ClientesLogs foi renderizado
    expect(screen.getByTestId('clientes-logs-page')).toBeInTheDocument();
  });
});
