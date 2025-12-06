/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'sky-bg': '#f8fafc', // Light background (Slate-50 equivalent)
                'sky-card': '#ffffff', // White card
                'sky-nav': '#ffffff', // White sidebar
                'sky-accent': '#6d6aff', // Keep the blurple
                'sky-text': '#0f172a', // Slate-900 for text
                'sky-text-secondary': '#64748b', // Slate-500 for secondary text
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                // This `extend: {}` was in the provided snippet.
                // If you intended to extend animation properties,
                // you might want to define keyframes or specific animation utilities here.
                // For example: 'spin-slow': 'spin 3s linear infinite',
                extend: {},
            },
        },
    },
    plugins: [],
}
