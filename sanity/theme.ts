import { buildLegacyTheme } from 'sanity'

const colors = {
  cream: '#f5f3ee',
  softCream: '#eeeae2',
  grayButton: '#d7d5ce',
  grayButtonHover: '#c9c6bd',
  black: '#111217',
  muted: '#6b6b63',
  orange: '#f97316',
  green: '#16a34a',
  yellow: '#f59e0b',
  red: '#dc2626',
}

export const thresholdPeaksTheme = buildLegacyTheme({
  '--black': colors.black,
  '--white': colors.cream,

  '--gray': colors.muted,
  '--gray-base': colors.grayButton,

  '--component-bg': colors.cream,
  '--component-text-color': colors.black,

  '--brand-primary': colors.orange,

  '--default-button-color': colors.black,
  '--default-button-primary-color': colors.orange,
  '--default-button-success-color': colors.green,
  '--default-button-warning-color': colors.yellow,
  '--default-button-danger-color': colors.red,

  '--state-info-color': colors.orange,
  '--state-success-color': colors.green,
  '--state-warning-color': colors.yellow,
  '--state-danger-color': colors.red,

  '--main-navigation-color': colors.black,
  '--main-navigation-color--inverted': colors.cream,

  '--focus-color': colors.orange,
})