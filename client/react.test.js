import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Mock UserContext
jest.mock('./UserContext', () => ({
  useUser: jest.fn(),
}));

import { useUser } from './UserContext';

describe('Create Post Button access', () => {
  const mockSetCurrentPage = jest.fn();
  const mockSetSearchTerm = jest.fn();

  test('Create Post button is disabled for guest user (role = "guest")', () => {
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

  test('Create Post button is enabled for registered user (role = "user")', () => {
    useUser.mockReturnValue({
      user: { role: 'user', username: 'testuser' },
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