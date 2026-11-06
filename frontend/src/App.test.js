import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the SkillBridge home page', () => {
  render(<App />);
  const linkElement = screen.getByText(/Put your skills/i);
  expect(linkElement).toBeInTheDocument();
});
