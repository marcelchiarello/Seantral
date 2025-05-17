/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByText('Test Button');
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies the correct classes based on variant', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByText('Primary');
    expect(button.className).toContain('bg-blue-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByText('Secondary');
    expect(button.className).toContain('bg-gray-200');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByText('Outline');
    expect(button.className).toContain('border-blue-600');
  });

  it('applies the correct classes based on size', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByText('Small');
    expect(button.className).toContain('px-3');

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByText('Medium');
    expect(button.className).toContain('px-4');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByText('Large');
    expect(button.className).toContain('px-5');
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-50');
  });
}); 