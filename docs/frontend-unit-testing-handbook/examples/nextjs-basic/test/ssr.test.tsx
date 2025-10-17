import React from 'react';
import { render, screen } from '@testing-library/react';
import Home, { getServerSideProps } from '../pages/index';
import { server, http, HttpResponse } from './setup.msw';

describe('Next.js SSR + MSW', () => {
  it('renders user from getServerSideProps', async () => {
    server.use(
      http.get('https://api.example.com/users/1', () =>
        HttpResponse.json({ id: '1', name: 'Trinity' })
      )
    );

    const { props } = (await getServerSideProps()) as any;
    render(<Home {...props} />);
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByLabelText('user')).toHaveTextContent(/trinity/i);
  });

  it('handles non-200 as notFound', async () => {
    server.use(
      http.get('https://api.example.com/users/1', () => new HttpResponse(null, { status: 500 }))
    );
    const result = (await getServerSideProps()) as any;
    expect(result).toHaveProperty('notFound', true);
  });
});