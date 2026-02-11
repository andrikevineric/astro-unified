import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fire: '#E85D04',
        earth: '#606C38',
        air: '#90E0EF',
        water: '#023E8A',
        metal: '#6C757D',
        wood: '#2D6A4F',
      },
    },
  },
  plugins: [],
};

export default config;
