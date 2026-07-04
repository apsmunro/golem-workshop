/// <reference types="vitest/config" />
import mdx from '@mdx-js/rollup'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

// BASE_PATH is set by the Pages deploy workflow to "/<repo-name>/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
  },
})
