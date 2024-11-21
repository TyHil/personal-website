import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/.cache',
      '**/.config',
      '**/.local',
      'src/set-operations-for-spotify',
      'src/typewriter-formatting',
      'src/cah-maker',
      'src/response-display',
      'src/password-generator',
      'src/recipes',
      'src/dvd'
    ],
    languageOptions: {
      ecmaVersion: 6
    }
  },
  eslintConfigPrettier
];
