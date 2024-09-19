// PortalRoutes.tsx
import * as React from 'react';
import { useRoutes } from 'react-router-dom';
import MainLayout from '../layout/main';
import Clientes from '../pages/clientes/clientes';
import ClientesLogs from '../pages/clientes/clienteslogs';

const PortalRoutes = () => {
  let routes = useRoutes([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <Clientes /> },
        { path: 'logs/:pasta', element: <ClientesLogs /> },
      ],
    },
  ]);
  return routes;
};

export default PortalRoutes;
