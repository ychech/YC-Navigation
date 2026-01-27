import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'
import { describe, it, expect } from 'vitest'

describe('Hero Component', () => {
  it('renders the title correctly', () => {
    const titleText = "灵感与设计的边界"
    render(<Hero title={titleText} subtitle="数字档案馆" />)
    // Since we split the title into characters, we check if the characters are present
    titleText.split("").forEach(char => {
      expect(screen.getByText(char)).toBeInTheDocument()
    })
  })

  it('renders the subtitle', () => {
    render(<Hero title="测试标题" subtitle="数字档案馆" />)
    expect(screen.getByText(/数字档案馆/)).toBeInTheDocument()
  })
})
