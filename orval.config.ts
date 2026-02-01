// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  accounts: {
    input: {
      target: 'https://accounts.mandacode.com/api/swagger/doc.json',
    },
    output: {
      target: './src/services/accounts/generated.ts',
      client: 'react-query',
    },
  },
});
