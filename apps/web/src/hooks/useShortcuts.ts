import { useEffect, useRef } from 'react'

export interface ShortcutConfig {
  /** Key name matching KeyboardEvent.key, e.g. 'Delete', 's', 'z' */
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  /** Human-readable description, useful for a future help panel */
  description?: string
  /** Whether to call e.preventDefault() — defaults to true */
  preventDefault?: boolean
}

/**
 * Register keyboard shortcuts for the current component scope.
 *
 * Handlers are always current (updated via ref), so the hook never
 * needs to be torn down / re-attached when handlers change.
 *
 * Shortcuts are ignored when focus is inside an input, textarea,
 * or contentEditable element.
 *
 * Current bindings (registered in EditorPage):
 *   Delete / Backspace — delete selected track item
 *   Ctrl+S             — save project
 */
export function useShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const sc of shortcutsRef.current) {
        const keyMatch = e.key === sc.key
        const ctrlMatch = !!sc.ctrl === (e.ctrlKey || e.metaKey)
        const shiftMatch = !!sc.shift === e.shiftKey
        const altMatch = !!sc.alt === e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (sc.preventDefault !== false) e.preventDefault()
          sc.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // attach once; shortcutsRef.current is always up-to-date
}
