import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// Test for the EnhancedCalendar component
test('renders EnhancedCalendar component', () => {
  render(<EnhancedCalendar />);
  const calendarElement = screen.getByText(/calendar/i);
  expect(calendarElement).toBeInTheDocument();
});