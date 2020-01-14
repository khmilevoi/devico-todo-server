module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'linebreak-style': 0,
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 0,
    'no-shadow': 0,
    'no-console': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'no-plusplus': 0,
    'class-methods-use-this': 0,
    'no-return-assign': 0,
    'no-debugger': 0,
    'import/named': 0,
    'flowtype/no-types-missing-file-annotation': 0,
    'no-return-await': 0
  }
};
