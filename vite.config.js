import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isSingleFile = mode === 'single'
  
  return {
    base: "/bip39-vue/",
    plugins: isSingleFile ? [
      vue(),
      viteSingleFile(),
      nodePolyfills()
    ] : [
      vue(),
      nodePolyfills()
    ],
    build: {
      outDir: isSingleFile ? "docs/singleHtml" : "docs"
    }
  }
})
