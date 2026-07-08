import { THEMES } from './types';
import type { Theme, ThemeId } from './types';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  isDark: boolean;
  /** Swatch colors for picker preview (hex — display only, not used by components). */
  swatch: { bg: string; accent: string; text: string };
}

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  'arcade-light': {
    id: 'arcade-light',
    label: 'Arcade',
    isDark: false,
    swatch: { bg: '#fef6f9', accent: '#ff80ab', text: '#1a1a2e' },
  },
  'arcade-dark': {
    id: 'arcade-dark',
    label: 'Arcade Dark',
    isDark: true,
    swatch: { bg: '#17131c', accent: '#ff80ab', text: '#f6eef3' },
  },
  serika: {
    id: 'serika',
    label: 'Serika',
    isDark: false,
    swatch: { bg: '#e9e4e0', accent: '#e9ad72', text: '#54495a' },
  },
  'serika-dark': {
    id: 'serika-dark',
    label: 'Serika Dark',
    isDark: true,
    swatch: { bg: '#252321', accent: '#e9ad72', text: '#d6cfc9' },
  },
  nord: {
    id: 'nord',
    label: 'Nord',
    isDark: true,
    swatch: { bg: '#2e3440', accent: '#88c0d0', text: '#eceff4' },
  },
  'gruvbox-dark': {
    id: 'gruvbox-dark',
    label: 'Gruvbox Dark',
    isDark: true,
    swatch: { bg: '#282828', accent: '#fabd2f', text: '#ebdbb2' },
  },
  dracula: {
    id: 'dracula',
    label: 'Dracula',
    isDark: true,
    swatch: { bg: '#282a36', accent: '#bd93f9', text: '#f8f8f2' },
  },
  botanical: {
    id: 'botanical',
    label: 'Botanical',
    isDark: true,
    swatch: { bg: '#1d2b1f', accent: '#7bb480', text: '#cfdac9' },
  },
  mush: {
    id: 'mush',
    label: 'Mush',
    isDark: true,
    swatch: { bg: '#1c1b22', accent: '#c0a3b3', text: '#dcd6df' },
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    isDark: true,
    swatch: { bg: '#0f1f2e', accent: '#5fb4ff', text: '#cfe3f5' },
  },
  'rose-dark': {
    id: 'rose-dark',
    label: 'Rose Dark',
    isDark: true,
    swatch: { bg: '#1d1419', accent: '#e5739b', text: '#f0d3de' },
  },
  cream: {
    id: 'cream',
    label: 'Cream',
    isDark: false,
    swatch: { bg: '#f5ecd9', accent: '#d9a066', text: '#5a4a33' },
  },
  mint: {
    id: 'mint',
    label: 'Mint',
    isDark: false,
    swatch: { bg: '#eef7f1', accent: '#5cb88a', text: '#234a38' },
  },
  sky: {
    id: 'sky',
    label: 'Sky',
    isDark: false,
    swatch: { bg: '#e9f3fb', accent: '#5aa3d9', text: '#1f3b52' },
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender',
    isDark: false,
    swatch: { bg: '#f1ecf7', accent: '#9a7ed4', text: '#3d2f5a' },
  },
  cobalt: {
    id: 'cobalt',
    label: 'Cobalt',
    isDark: true,
    swatch: { bg: '#0a1a33', accent: '#4a8fdb', text: '#d4e4f5' },
  },
  matrix: {
    id: 'matrix',
    label: 'Matrix',
    isDark: true,
    swatch: { bg: '#0a0f0a', accent: '#5fd46a', text: '#c8e6c8' },
  },
  'sunset-dark': {
    id: 'sunset-dark',
    label: 'Sunset Dark',
    isDark: true,
    swatch: { bg: '#1f1310', accent: '#f08a4a', text: '#f0d4c0' },
  },
  cosmic: {
    id: 'cosmic',
    label: 'Cosmic',
    isDark: true,
    swatch: { bg: '#15102b', accent: '#b06fd4', text: '#e0d4f0' },
  },
};

export const THEME_LIST: ThemeMeta[] = Object.values(THEME_META);

/** Resolve legacy 'light'/'dark' values to the new named ids. */
export function normalizeTheme(value: string | null | undefined): Theme {
  if (!value) return 'system';
  if (value === 'light') return 'arcade-light';
  if (value === 'dark') return 'arcade-dark';
  return value as Theme;
}

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}
