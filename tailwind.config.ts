import type { Config } from 'tailwindcss';

// NOTE: The existing UrbanServe UI is built almost entirely with inline
// `style={{}}` objects (see app/page.tsx, app/gigs/page.tsx, etc.), not
// Tailwind utility classes. Tailwind is still wired up here because
// globals.css expects it and any new/refactored components can opt into
// utility classes without breaking the current inline-style components.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#16A34A',
          dark: '#0B1F17',
          light: '#DCFCE7',
        },
        bg: '#F7FAF8',
        border: '#E5E7EB',
        text: {
          primary: '#111827',
          secondary: '#667085',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
