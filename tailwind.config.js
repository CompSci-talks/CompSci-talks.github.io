/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
                display: ['Poppins', 'sans-serif'],
            },
            colors: {
                // ─── Brand / Action ───────────────────────────────────────────
                primary: {
                    DEFAULT: '#2563eb', // text-primary, bg-primary
                    hover: '#1d4ed8',   // text-primary-hover
                    light: '#eff6ff',   // bg-primary-light
                },
                accent: {
                    DEFAULT: '#0ea5e9', // text-accent, bg-accent
                    hover: '#0284c7',
                },

                // ─── Surfaces ─────────────────────────────────────────────────
                surface: {
                    DEFAULT: '#ffffff',
                    muted: '#f8fafc',
                    card: '#ffffff',
                    elevated: '#f1f5f9', // admin form sections, input backgrounds
                },

                // ─── Text ─────────────────────────────────────────────────────
                text: {
                    main: '#0f172a',
                    muted: '#64748b',
                    faint: '#94a3b8',          // very light helper/placeholder text
                    inverse: '#ffffff',
                    'inverse-muted': '#9ca3af', // text-text-inverse-muted (footer)
                    'inverse-heading': '#e5e7eb' // text-text-inverse-heading (footer)
                },

                // ─── Borders ──────────────────────────────────────────────────
                border: {
                    DEFAULT: '#e2e8f0',
                    light: '#f1f5f9',
                },

                // ─── Status / Semantic ────────────────────────────────────────
                status: {
                    error: '#ef4444',
                    success: '#10b981',
                    warning: '#f59e0b', // "STARTING SOON" badge, amber states
                    info: '#3b82f6',    // edit action links, informational
                },

                // ─── Admin / Moderator ────────────────────────────────────────
                admin: {
                    DEFAULT: '#2563eb', // blue-600 (was violet-600)
                    hover: '#1d4ed8',   // blue-700 (was violet-700)
                    light: '#eff6ff',   // blue-50 (was violet-50)
                },

                // ─── Admin Sidebar ────────────────────────────────────────────
                sidebar: {
                    bg: '#0f172a',         // slate-900
                    border: '#1e293b',     // slate-800
                    text: '#94a3b8',       // slate-400
                    'text-active': '#ffffff',
                    'bg-active': '#1e293b',  // slate-800
                    'bg-hover': '#1e293b',   // slate-800
                    'top-bar-bg': '#ffffff',
                    'top-bar-border': '#e2e8f0',
                    'top-bar-text': '#94a3b8',
                },

                // ─── Role Badges ──────────────────────────────────────────────
                // Used in navbar dropdown and user management
                role: {
                    'admin-bg': '#fee2e2',     // red-100
                    'admin-text': '#b91c1c',   // red-700
                    'moderator-bg': '#f3e8ff', // purple-100
                    'moderator-text': '#7e22ce', // purple-700
                    'user-bg': '#dcfce7',      // green-100
                    'user-text': '#15803d',    // green-700
                },

                // ─── Skeleton Loading ─────────────────────────────────────────
                skeleton: {
                    DEFAULT: '#e2e8f0', // slate-200
                    dark: '#cbd5e1',    // slate-300
                },

                // ─── Footer ───────────────────────────────────────────────────
                footer: {
                    DEFAULT: '#1f2937', // bg-footer (gray-800)
                    border: '#374151',  // border-footer-border (gray-700)
                },

                // ─── Gallery Admin / Inquiry Theme ────────────────────────────
                gallery: {
                    primary: "#0053da",
                    "primary-container": "#346df5",
                    "on-primary-container": "#ffffff",
                    secondary: "#565e74",
                    "secondary-container": "#dae2fd",
                    "on-secondary-container": "#5c647a",
                    tertiary: "#006c49",
                    "tertiary-container": "#00885d",
                    surface: "#f7f9fb",
                    "surface-container": "#eceef0",
                    "surface-container-low": "#f2f4f6",
                    "surface-container-high": "#e6e8ea",
                    "surface-container-highest": "#e0e3e5",
                    "surface-container-lowest": "#ffffff",
                    "on-surface": "#191c1e",
                    "on-surface-variant": "#414754",
                    outline: "#727785",
                    "outline-variant": "#c1c6d6",
                    error: "#ba1a1a",
                    "error-container": "#ffdad6",
                    "on-error-container": "#93000a",
                }
            },

            // ─── Keyframes ────────────────────────────────────────────────────
            keyframes: {
                'progress-indeterminate': {
                    '0%': { transform: 'translateX(-100%) scaleX(0.2)' },
                    '50%': { transform: 'translateX(0%) scaleX(0.5)' },
                    '100%': { transform: 'translateX(100%) scaleX(0.2)' },
                },
                'pulse-skeleton': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(-4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'progress-indeterminate': 'progress-indeterminate 2s infinite ease-in-out',
                'pulse-skeleton': 'pulse-skeleton 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fade-in 0.2s ease-out',
            },

            // ─── Misc ─────────────────────────────────────────────────────────
            height: {
                'progress': '0.25rem', // 4px
            },
            zIndex: {
                'progress': '60',
            },
            boxShadow: {
                'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'premium-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                'admin-glow': '0 0 20px -5px rgba(37, 99, 235, 0.2)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
