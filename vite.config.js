import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            // Explicitly define all HTML entry points for the MPA build
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                contact: resolve(__dirname, 'contact.html'),
                cookies: resolve(__dirname, 'cookies.html'),
                faq: resolve(__dirname, 'faq.html'),
                legalNotice: resolve(__dirname, 'legal-notice.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                productDetail: resolve(__dirname, 'product-detail.html'),
                shipping: resolve(__dirname, 'shipping.html'),
                shop: resolve(__dirname, 'shop.html'),
                terms: resolve(__dirname, 'terms.html'),
            }
        }
    }
});
