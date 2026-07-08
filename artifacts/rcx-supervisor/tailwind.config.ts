module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        actiongraylight: "var(--actiongraylight)",
        headertext: "var(--headertext)",
        headertexthint: "var(--headertexthint)",
        "navb-02": "var(--navb-02)",
        "navf-04": "var(--navf-04)",
        navline: "var(--navline)",
        "neutralf-06": "var(--neutralf-06)",
        tabdefault: "var(--tabdefault)",
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
      },
      fontFamily: {
        "body-1": "var(--body-1-font-family)",
        button: "var(--button-font-family)",
        "caption-1": "var(--caption-1-font-family)",
        "caption-2": "var(--caption-2-font-family)",
        descriptor: "var(--descriptor-font-family)",
        "descriptor-mini": "var(--descriptor-mini-font-family)",
        "descriptor-mini-semi-bold":
          "var(--descriptor-mini-semi-bold-font-family)",
        detail: "var(--detail-font-family)",
        "headline-2": "var(--headline-2-font-family)",
        "main-text": "var(--main-text-font-family)",
        "mobile-descriptorminisemibold":
          "var(--mobile-descriptorminisemibold-font-family)",
        "subtitle-mini": "var(--subtitle-mini-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      boxShadow: {
        "shadow-1": "var(--shadow-1)",
        "shadow-4": "var(--shadow-4)",
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
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  darkMode: ["class"],
};
