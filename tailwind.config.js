/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16213E',
          50: '#EEF1F7',
          100: '#D6DCEA',
          200: '#AEB9D4',
          400: '#5A6896',
          600: '#27345A',
          700: '#1B2742',
          800: '#16213E',
          900: '#0E1528'
        },
        paper: {
          DEFAULT: '#FAF6EF',
          dim: '#F1EBDF',
          card: '#FFFFFF'
        },
        saffron: {
          DEFAULT: '#E69A28',
          50: '#FDF3E2',
          100: '#FBE6C3',
          400: '#EDAE4E',
          600: '#C9801B',
          700: '#9C6314'
        },
        stamp: {
          DEFAULT: '#2E7D52',
          50: '#E8F4ED',
          600: '#246340'
        },
        rust: {
          DEFAULT: '#C1443B',
          50: '#FBEAE8',
          600: '#9E332B'
        },
        slate: {
          DEFAULT: '#5B6472'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,33,62,0.06), 0 4px 14px rgba(22,33,62,0.06)',
        pop: '0 10px 30px rgba(22,33,62,0.16)'
      },
      borderRadius: {
        xl2: '1.1rem'
      }
    }
  },
  plugins: []
}
