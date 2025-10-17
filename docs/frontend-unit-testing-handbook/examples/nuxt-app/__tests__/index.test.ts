import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import Index from '../pages/index.vue'

describe('Index page', () => {
  it('renders heading', () => {
    render(Index)
    expect(screen.getByRole('heading', { name: /Nuxt 应用示例/i })).toBeDefined()
  })
})