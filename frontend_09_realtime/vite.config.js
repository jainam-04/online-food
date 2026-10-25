import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function copyStaticAssetsPlugin() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const distAssetsDir = resolve(distDir, 'assets');
      const srcAssetsDir = resolve(__dirname, 'assets');
      const publicDir = resolve(__dirname, 'public');

      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      if (!fs.existsSync(distAssetsDir)) {
        fs.mkdirSync(distAssetsDir, { recursive: true });
      }

      // 1. Copy everything from assets/ to dist/assets/
      if (fs.existsSync(srcAssetsDir)) {
        const files = fs.readdirSync(srcAssetsDir);
        for (const file of files) {
          const src = resolve(srcAssetsDir, file);
          const dest = resolve(distAssetsDir, file);
          if (fs.statSync(src).isFile()) {
            fs.copyFileSync(src, dest);
          }
        }
      }

      // 2. Copy everything from public/ recursively to dist/
      if (fs.existsSync(publicDir)) {
        const copyFolder = (from, to) => {
          if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
          const entries = fs.readdirSync(from, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = resolve(from, entry.name);
            const destPath = resolve(to, entry.name);
            if (entry.isDirectory()) {
              copyFolder(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        };
        copyFolder(publicDir, distDir);
      }
    }
  };
}

export default defineConfig({
  publicDir: 'public',
  plugins: [copyStaticAssetsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        adminlogin: resolve(__dirname, 'adminlogin.html'),
        admindashbord: resolve(__dirname, 'admindashbord.html'),
        admindashbordcatering: resolve(__dirname, 'admindashbordcatering.html'),
        adminfeedback: resolve(__dirname, 'adminfeedback.html'),
        cart: resolve(__dirname, 'cart.html'),
        catering: resolve(__dirname, 'catering.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        feedback: resolve(__dirname, 'feedback.html'),
        history: resolve(__dirname, 'history.html'),
        login: resolve(__dirname, 'login.html'),
        logout: resolve(__dirname, 'logout.html'),
        menu: resolve(__dirname, 'menu.html'),
        orders: resolve(__dirname, 'orders.html'),
        products: resolve(__dirname, 'products.html'),
        profile: resolve(__dirname, 'profile.html'),
        register: resolve(__dirname, 'register.html'),
        suggestItem: resolve(__dirname, 'suggest item.html'),
        users: resolve(__dirname, 'users.html')
      }
    }
  }
});

