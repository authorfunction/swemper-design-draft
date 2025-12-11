/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./script.js"],
    theme: {
        extend: {
            colors: {
                background: "#f5f4f2",
                "fg-grey": "rgba(158, 148, 128, 0.29)",
                "bg-blend": "rgba(245, 244, 242, 0.5)",
                "hover-highlight": "rgb(200 201 177 / 15%)",
            },
            fontFamily: {
                mono: ['"IBM Plex Mono"', "monospace"],
                serif: ['"IBM Plex Serif"', "serif"],
                sans: ['"IBM Plex Sans"', "sans-serif"],
            },
            fontSize: {
                "text-6xl-custom": "6.0em", // Matching .large
            },
        },
    },
    plugins: [],
};
