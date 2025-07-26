import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// https://vite.dev/config/
export default defineConfig({
  root: process.cwd(),
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      output: {
        // 自定义静态资源路径
        chunkFileNames: 'static/assets/js/[name]-[hash].js',
        entryFileNames: 'static/assets/js/[name]-[hash].js',
        assetFileNames: 'static/assets/[ext]/[name]-[hash].[ext]',
        manualChunks: (id: string) => {
          // 过滤掉 Vue DevTools 相关的空文件
          if (
            id.includes('@vue/devtools') ||
            id.includes('birpc') ||
            id.includes('hookable') ||
            id.includes('perfect-debounce') ||
            id.includes('date-fns-tz')
          ) {
            return 'devtools'
          }

          if (id.includes('node_modules')) {
            if (id.includes('.pnpm')) {
              return id
                .toString()
                .split('node_modules/.pnpm/')[1]
                .split('/')[0]
                .toString()
            }
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          } else {
            if (id.includes(__dirname)) {
              return id
                .toString()
                .split(__dirname)[1]
                .split('?')[0]
                .toString()
                .replace(/\//g, `_`)
            }
            return `app`
          }
        },
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
          ],
        },
      ],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
    }),
  ],
  base: `/`,
  resolve: {
    alias: {
      '@': '/src',
      '~': '/src',
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'dev.eefenmc.eu.org',
      '192.168.100.101',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:8081/uploads',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, ''),
      },
    },
  },
})
