import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './components/header';
import { useUser } from './components/UserContext';

jest.mock('./components/UserContext', () => ({
  useUser: jest.fn(),
}));

describe('Create Post Button access', () => {
  const mockSetCurrentPage = jest.fn();
  const mockSetSearchTerm = jest.fn();

  test('disables Create Post button for guest user', () => {
    useUser.mockReturnValue({
      user: { role: 'guest', username: 'Guest' },
      logout: jest.fn()
    });

    render(
      <Header
        currentPage="homePage"
        setCurrentPage={mockSetCurrentPage}
        setSearchTerm={mockSetSearchTerm}
      />
    );

    const buttonDiv = screen.getByText('Create Post').parentElement;
    expect(buttonDiv).toHaveClass('guest-disabled');
  });

  test('enables Create Post button for registered user', () => {
    useUser.mockReturnValue({
      user: { role: 'user', username: 'Alice' },
      logout: jest.fn()
    });

    render(
      <Header
        currentPage="homePage"
        setCurrentPage={mockSetCurrentPage}
        setSearchTerm={mockSetSearchTerm}
      />
    );

    const buttonDiv = screen.getByText('Create Post').parentElement;
    expect(buttonDiv).not.toHaveClass('guest-disabled');
  });
});