// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  accounts: {
    input: {
      target: 'https://accounts.mandacode.com/api/swagger/doc.json',
    },
    output: {
      target: './src/lib/api/accounts.ts',
      schemas: './src/lib/api/schemas/accounts',
      client: 'react-query',
      baseUrl: 'https://accounts.mandacode.com/api',
    },
  },
  auth: {
    input: {
      target: 'https://auth.mandacode.com/api/swagger/doc.json',
    },
    output: {
      target: './src/lib/api/auth.ts',
      schemas: './src/lib/api/schemas/auth',
      client: 'react-query',
      baseUrl: 'https://auth.mandacode.com/api',
    },
  },
});
