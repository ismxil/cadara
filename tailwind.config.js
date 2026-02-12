tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    black: 'var(--brand-black, #FFF3DE)',
                    red: 'var(--brand-red, #2660A4)',
                    white: '#FFFFFF',
                }
            },
            fontFamily: {
                serif: ['"Midnight Sans Regular"', 'sans-serif'],
                display: ['"Midnight Sans Bold"', 'sans-serif'],
                mono: ['"Space Mono"', 'monospace'],
            }
        }
    }
}
