import { RouterProvider } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { FoundationProviders } from '../../test/renderWithFoundation';
import { router } from './router';

test('redirects the root to the Executive Home', async () => {
  await router.navigate('/');
  render(<FoundationProviders><RouterProvider router={router} /></FoundationProviders>);
  expect(await screen.findByRole('heading', { name: 'PROGRAMA HIKARI' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/demo/fundicao-dc');
});

test('renders the authorized production scheduling placeholder', async () => {
  await router.navigate('/demo/fundicao-dc/production-scheduling');
  render(<FoundationProviders><RouterProvider router={router} /></FoundationProviders>);
  expect(await screen.findByRole('heading', { name: 'O que precisamos produzir?' })).toBeInTheDocument();
  expect(screen.getAllByText('Cenário demonstrativo').length).toBeGreaterThan(0);
  await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
});

test('handles an unknown scenario', async () => {
  await router.navigate('/demo/inexistente/production-scheduling');
  render(<FoundationProviders><RouterProvider router={router} /></FoundationProviders>);
  expect(await screen.findByRole('heading', { name: 'Cenário demonstrativo não encontrado' })).toBeInTheDocument();
});
