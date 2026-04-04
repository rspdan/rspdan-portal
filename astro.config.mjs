import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://rspdan.com',
  output: 'hybrid',
  adapter: vercel(),
});
