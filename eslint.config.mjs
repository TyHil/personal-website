import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/.cache',
      '**/.config',
      '**/.local',
      'src/set-operations-for-spotify/',
      'src/typewriter-formatting/',
      'src/cah-maker/',
      'src/response-display/',
      'src/password-generator/',
      'src/recipes/',
      'src/dvd/'
    ]
  },
  {
    ignores: ['stats/'],
    languageOptions: {
      ecmaVersion: 6
    }
  },
  {
    files: ['stats/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020
    }
  },
  eslintConfigPrettier
];
