import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f7f7f3',
        'bg-alt': '#111110',
        text: '#111110',
        'text-muted': '#888884',
        border: '#ddddd8',
        accent: '#132b1f',
        'accent-light': '#d4ede4',
        'border-dark': '#1e1e1c',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.1em',
      },
    },
  },
  plugins: [],
}

export default config
