import { defineConfig } from 'vite'
import { resolve } from 'path'

const root = import.meta.dirname

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:        resolve(root, 'index.html'),
        properties:  resolve(root, 'properties.html'),
        amenities:   resolve(root, 'amenities.html'),
        about:       resolve(root, 'about.html'),
        book:        resolve(root, 'book.html'),
        fortune:     resolve(root, 'fortune.html'),
        elite:       resolve(root, 'elite.html'),
        grandeur:    resolve(root, 'grandeur.html'),
        goldennest:  resolve(root, 'goldennest.html'),
        palaceview:  resolve(root, 'palaceview.html'),
      }
    }
  }
})
