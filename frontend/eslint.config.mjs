import next from 'eslint-config-next';

const eslintConfig = [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**', '_legacy/**'],
  },
];

export default eslintConfig;
