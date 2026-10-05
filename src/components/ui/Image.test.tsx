import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Image } from './Image'

describe('Image source lifecycle', () => {
  it('resets a loaded fallback when the requested source changes', () => {
    const { rerender } = render(
      <Image src="/first.png" alt="Preview" fallbackSrc="/fallback.png" placeholder="skeleton" />
    )
    fireEvent.error(screen.getByRole('img', { name: 'Preview' }))
    const fallbackImage = screen.getByRole('img', { name: 'Preview' })
    expect(fallbackImage).toHaveAttribute('src', '/fallback.png')
    fireEvent.load(fallbackImage)
    expect(fallbackImage).toHaveClass('opacity-100')

    rerender(
      <Image src="/second.png" alt="Preview" fallbackSrc="/fallback.png" placeholder="skeleton" />
    )
    const nextImage = screen.getByRole('img', { name: 'Preview' })
    expect(nextImage).not.toBe(fallbackImage)
    expect(nextImage).toHaveAttribute('src', '/second.png')
    expect(nextImage).toHaveClass('opacity-0')
    fireEvent.error(nextImage)
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute('src', '/fallback.png')
  })

  it('retries a new source after rendering a terminal fallback', () => {
    const { rerender } = render(
      <Image src="/first.png" alt="Preview" fallback={<p>Image unavailable</p>} />
    )
    fireEvent.error(screen.getByRole('img', { name: 'Preview' }))
    expect(screen.queryByRole('img', { name: 'Preview' })).not.toBeInTheDocument()

    rerender(<Image src="/second.png" alt="Preview" fallback={<p>Image unavailable</p>} />)
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute('src', '/second.png')
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveClass('opacity-0')
  })
})
