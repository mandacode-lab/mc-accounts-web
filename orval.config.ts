// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  accounts: {
    input: {
      target: 'https://accounts.mandacode.com/api/swagger/doc.json',
    },
    output: {
      target: './src/lib/api/accounts.ts',
      client: 'react-query',
    },
  },
});
