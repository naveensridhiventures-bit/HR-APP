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
        },
        sky: {
          DEFAULT: '#2C6FB0',
          50: '#E9F1FA',
          100: '#CCE0F2',
          600: '#235A8C',
          700: '#1B4569'
        },
        amber: {
          DEFAULT: '#C99A1F',
          50: '#FBF3DD',
          100: '#F5E6B8',
          600: '#A77E16',
          700: '#7E5F10'
        },
        violet: {
          DEFAULT: '#7451B3',
          50: '#F1ECFA',
          100: '#E1D5F3',
          600: '#5E3F94',
          700: '#4A3175'
        },
        teal: {
          DEFAULT: '#1E8A82',
          50: '#E4F4F2',
          100: '#C3E7E3',
          600: '#186E67',
          700: '#125651'
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
