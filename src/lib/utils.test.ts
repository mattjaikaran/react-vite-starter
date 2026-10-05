import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDateTime } from './utils'

describe('cn (className utility)', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false, 'baz')).toBe('foo baz')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    // Use explicit time to avoid timezone issues
    const date = new Date(2024, 5, 15) // Month is 0-indexed: 5 = June
    const result = formatDate(date)
    expect(result).toContain('June')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('formats a date string with time component', () => {
    // Use ISO string with time to avoid date rollover due to timezone
    const result = formatDate('2024-01-15T12:00:00')
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('formatDateTime', () => {
  it('formats a Date object with time', () => {
    const date = new Date('2024-06-15T14:30:00')
    const result = formatDateTime(date)
    expect(result).toContain('June')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('formats a datetime string', () => {
    const result = formatDateTime('2024-12-25T10:00:00')
    expect(result).toContain('December')
    expect(result).toContain('25')
    expect(result).toContain('2024')
  })
})
