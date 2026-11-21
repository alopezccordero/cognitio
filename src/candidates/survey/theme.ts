import { createContext, useContext } from 'react'

// Survey ships in two modes. Tailwind's sv-* tokens are CSS variables, so the
// `.sv-night` class (index.css) re-skins every utility; WebGL and SVG read this palette.
export const palettes = {
  day: { bg: '#e7f0f1', sheet: '#f5f9f9', ink: '#14283c', contour: '#2f8f9d', mark: '#f2da4b', markAmt: 0.85, hatch: 0.35 },
  night: { bg: '#0b1620', sheet: '#0f1f2a', ink: '#e4eef0', contour: '#4fb8c4', mark: '#f2da4b', markAmt: 0.32, hatch: 0.22 },
}
export type Palette = (typeof palettes)['day']

export const SurveyMode = createContext({ night: false, base: '/b', pal: palettes.day as Palette })
export const useSurvey = () => useContext(SurveyMode)
export const modeFor = (night: boolean) => ({ night, base: night ? '/b-night' : '/b', pal: night ? palettes.night : palettes.day })
