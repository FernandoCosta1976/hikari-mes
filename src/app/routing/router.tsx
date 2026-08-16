import { Navigate, createBrowserRouter } from 'react-router';
import { DemoRouteBoundary } from './DemoRouteBoundary';
import { RouteMessage } from '../../shared/ui/RouteMessage/RouteMessage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/demo/fundicao-dc" replace /> },
  {
    path: '/demo/:scenarioId',
    element: <DemoRouteBoundary />,
    errorElement: <main><RouteMessage title="Não foi possível abrir esta experiência" detail="Verifique o endereço demonstrativo e tente novamente." /></main>,
  },
  {
    path: '/demo/:scenarioId/:experience',
    element: <DemoRouteBoundary />,
    errorElement: <main><RouteMessage title="Não foi possível abrir esta experiência" detail="Verifique o endereço demonstrativo e tente novamente." /></main>,
  },
  {
    path: '/demo/:scenarioId/orders/:lotId',
    element: <DemoRouteBoundary />,
    errorElement: <main><RouteMessage title="Não foi possível abrir esta experiência" detail="Verifique o endereço demonstrativo e tente novamente." /></main>,
  },
  { path: '*', element: <main><RouteMessage title="Página não encontrada" detail="Use uma rota válida do modo demonstrativo HIKARI." /></main> },
], { basename: import.meta.env.BASE_URL });
