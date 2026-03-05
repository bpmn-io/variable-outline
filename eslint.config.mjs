import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'dist'
  ],
  jsx: [
    '**/*.jsx'
  ],
  build: [
    '*.js',
    '*.mjs'
  ],
  test: [
    '**/__test__/**/*.{js,jsx}'
  ]
};

export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: files.build
    };
  }),
  {
    languageOptions: {
      ecmaVersion: 2022
    },
    files: files.build
  },

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {

    return {
      ...config,
      ignores: files.build
    };
  }),

  // jsx
  ...bpmnIoPlugin.configs.jsx.map(config => {

    return {
      ...config,
      files: files.jsx
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {

    return {
      ...config,
      files: files.test,
    };
  })
];