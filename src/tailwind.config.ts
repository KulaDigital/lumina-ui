// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  
   content: ["./src/**/*.{js,ts,jsx,tsx}"],
  
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#635BFF',
          hover: '#5448E0',
          light: 'rgba(99, 91, 255, 0.1)',
        },
        secondary: {
          DEFAULT: '#0A2540'
        },
        // Background Colors
        bg: {
          dark: '#0A2540',
          light: '#F6F9FC',
          white: '#FFFFFF',
        },
        // Text Colors
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          light: '#E3E8EF',
        },
        // Border & Dividers
        border: '#E2E8F0',
        divider: '#E2E8F0',
        // Status Colors
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config;