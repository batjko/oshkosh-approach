import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

/**
 * Aviation-tuned design tokens.
 *
 * Color roles map to product intent (sectional warmth, runway accents,
 * cockpit instrument readability) rather than generic palette names.
 * Typography roles distinguish cockpit-numerals from briefing prose.
 */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        tablet: '744px'
      },
      colors: {
        chart: {
          paper: '#f5efe1',
          ink: '#1d2330',
          muted: '#7a8194',
          warn: '#c46a16',
          danger: '#b3261e',
          grass: '#4f7a3a',
          runway: '#2f3543'
        },
        cockpit: {
          bg: '#0c1118',
          panel: '#161e2c',
          rail: '#1f2a3d',
          accent: '#5fb3ff',
          live: '#22c55e',
          alert: '#ff5a5f'
        }
      },
      fontFamily: {
        cockpit: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace'
        ],
        prose: [
          'InterVariable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ]
      },
      fontSize: {
        'numeral-lg': ['2.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'numeral-md': ['1.875rem', { lineHeight: '1.05', letterSpacing: '-0.01em', fontWeight: '700' }],
        'numeral-sm': ['1.25rem', { lineHeight: '1.1', fontWeight: '600' }]
      },
      borderRadius: {
        cockpit: '0.875rem'
      },
      boxShadow: {
        cockpit: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.4)'
      },
      animation: {
        'pulse-soft': 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        chart: {
          'color-scheme': 'light',
          primary: '#1f4e8c',
          'primary-content': '#f8fafc',
          secondary: '#7a5a2c',
          accent: '#c46a16',
          neutral: '#1d2330',
          'base-100': '#f5efe1',
          'base-200': '#ebe3cf',
          'base-300': '#dcd3bd',
          'base-content': '#1d2330',
          info: '#1f4e8c',
          success: '#4f7a3a',
          warning: '#c46a16',
          error: '#b3261e'
        }
      },
      {
        cockpit: {
          'color-scheme': 'dark',
          primary: '#5fb3ff',
          'primary-content': '#0c1118',
          secondary: '#94a3b8',
          accent: '#fbbf24',
          neutral: '#161e2c',
          'base-100': '#0c1118',
          'base-200': '#161e2c',
          'base-300': '#1f2a3d',
          'base-content': '#e2e8f0',
          info: '#5fb3ff',
          success: '#22c55e',
          warning: '#fbbf24',
          error: '#ff5a5f'
        }
      },
      'light',
      'dark'
    ]
  }
} satisfies Config
