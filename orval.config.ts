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
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/lib/api/client.ts',
          name: 'accountsClient',
        }
      }
    },
  },
  auth: {
    input: {
      target: 'https://auth.mandacode.com/api/swagger/doc.json',
    },
    output: {
      target: './src/lib/api/auth.ts',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/lib/api/client.ts',
          name: 'authClient',
        }
      }
    },
  },
});
