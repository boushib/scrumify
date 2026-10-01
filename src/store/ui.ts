"use client"

import { create } from "zustand"

/** Transient UI state that shouldn't be saved with the workspace data */
interface UiState {
  navOpen: boolean
  paletteOpen: boolean
  shortcutsOpen: boolean
  setNavOpen: (open: boolean) => void
  setPaletteOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
}

export const useUi = create<UiState>(set => ({
  navOpen: false,
  paletteOpen: false,
  shortcutsOpen: false,
  setNavOpen: navOpen => set({ navOpen }),
  setPaletteOpen: paletteOpen => set({ paletteOpen }),
  setShortcutsOpen: shortcutsOpen => set({ shortcutsOpen }),
}))
