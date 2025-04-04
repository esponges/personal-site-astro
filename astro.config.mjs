// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // integrations: [tailwind()],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      IMAGEKIT_URL: envField.string({ context: 'client', access: 'public' }),
    },
  },
});
