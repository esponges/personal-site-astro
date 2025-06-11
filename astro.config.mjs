import { defineConfig, envField } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  env: {
    schema: {
      IMAGEKIT_URL: envField.string({ context: 'client', access: 'public' }),
    },
  },
});
