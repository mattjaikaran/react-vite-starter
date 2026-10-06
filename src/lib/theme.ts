import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
const storageKey = 'theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

const storedPreference = localStorage.getItem(storageKey)
let preference: Theme | null =
  storedPreference === 'light' || storedPreference === 'dark' ? storedPreference : null
let theme: Theme = preference ?? (media.matches ? 'dark' : 'light')

function applyTheme() {
  theme = preference ?? (media.matches ? 'dark' : 'light')
  document.documentElement.dataset.theme = theme
  for (const listener of listeners) listener()
}

applyTheme()
media.addEventListener('change', () => {
  if (preference === null) applyTheme()
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function toggleTheme() {
  preference = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem(storageKey, preference)
  applyTheme()
}

const getTheme = () => theme

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme)
}
