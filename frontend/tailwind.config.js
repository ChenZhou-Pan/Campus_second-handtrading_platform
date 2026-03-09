/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff', // 蓝色主题
        'primary-light': '#40a9ff',
        'primary-dark': '#096dd9',
        secondary: '#52c41a',
        'gray-bg': '#F5F7FA',
        'gray-text': '#666666',
        'gray-light': '#999999',
        'blue-light': '#E6F7FF',
        'blue-bg': '#F0F5FF',
      },
    },
  },
  plugins: [],
}
