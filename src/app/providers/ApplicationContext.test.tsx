import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useApplicationContext } from './ApplicationContext';
import { renderWithFoundation } from '../../test/renderWithFoundation';

function ContextProbe() {
  const { productiveArea, resetApplicationContext } = useApplicationContext();
  return <><output>{productiveArea.label}</output><button onClick={resetApplicationContext}>Reset</button></>;
}

test('provides and resets the productive area independently', async () => {
  window.sessionStorage.setItem('hikari.demo.application-context.productive-area', 'invalid');
  renderWithFoundation(<ContextProbe />);
  expect(screen.getByText('Fundição DC')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(window.sessionStorage.length).toBe(0);
});
