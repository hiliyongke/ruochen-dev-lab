import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home page', () => {
  it('renders heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /Next\.js 应用示例/i })).toBeInTheDocument()
  })
})