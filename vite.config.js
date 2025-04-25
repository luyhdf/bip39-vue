import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
  base: "/bip39-vue/",
  plugins: [
    vue(),
    viteSingleFile()
  ],
  build: {
    outDir: "docs",
    minify: false
  }
})
