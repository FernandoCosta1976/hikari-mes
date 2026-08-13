import { RouterProvider } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { router } from './router';

test('renders the authorized production scheduling placeholder', async () => {
  await router.navigate('/demo/fundicao-dc/production-scheduling');
  renderWithFoundation(<RouterProvider router={router} />);
  expect(await screen.findByRole('heading', { name: 'O que precisamos produzir?' })).toBeInTheDocument();
  expect(screen.getByText('Cenário demonstrativo')).toBeInTheDocument();
  await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
});

test('handles an unknown scenario', async () => {
  await router.navigate('/demo/inexistente/production-scheduling');
  renderWithFoundation(<RouterProvider router={router} />);
  expect(await screen.findByRole('heading', { name: 'Cenário demonstrativo não encontrado' })).toBeInTheDocument();
});
