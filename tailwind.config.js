/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // デフォルトのフォントカラーをカスタマイズ
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        customTheme: {
          pink: {
            primary: '#FFB6C1',
            secondary: '#FFE5EC',
            accent: '#FF8DA1'
          },
          blue: {
            primary: '#B6E0FF',
            secondary: '#E5F3FF',
            accent: '#8DCAFF'
          },
          yellow: {
            primary: '#FFDFA3',
            secondary: '#FFF8E5',
            accent: '#FFD28D'
          },
          green: {
            primary: '#A5F5AD',
            secondary: '#E5FFE8',
            accent: '#8DFF98'
          },
          orange: {
            primary: '#FFCBB6',
            secondary: '#FFE8E5',
            accent: '#FFAD8D'
          },
          purple: {
            primary: '#E6B6FF',
            secondary: '#F5E5FF',
            accent: '#D18DFF'
          },
          black: {
            primary: '#1D2129',
            secondary: '#333333',
            accent: '#666666'
          }
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    {
      pattern: /^(bg|border|text)-customTheme-(pink|blue|yellow|green|orange|purple)-(primary|secondary|accent)$/,
      variants: ['hover'],
    }
  ],
}
