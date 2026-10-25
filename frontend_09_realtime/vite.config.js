import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
