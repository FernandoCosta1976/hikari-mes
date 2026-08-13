import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ApplicationContextProvider } from './app/providers/ApplicationContext';
import { router } from './app/routing/router';
import './design-system/foundations/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('HIKARI application root was not found.');
}

createRoot(root).render(
  <StrictMode>
    <ApplicationContextProvider>
      <RouterProvider router={router} />
    </ApplicationContextProvider>
  </StrictMode>,
);
