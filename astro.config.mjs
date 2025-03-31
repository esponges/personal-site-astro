// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  env: {
    schema: {
      IMAGEKIT_URL: envField.string({ context: 'client', access: 'public' }),
    },
  },
});
