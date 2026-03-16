/** @type {import("syncpack").RcFile} */
export default {
  versionGroups: [
    {
      label: 'Workspace packages - flexible versions',
      packages: ['**'],
      dependencies: ['@kotrip/**'],
      dependencyTypes: ['prod', 'dev'],
      pinVersion: '0.0.0',
    },
    {
      label: 'Shared dependencies - exact versions',
      packages: ['**'],
      dependencies: ['**'],
      dependencyTypes: ['prod', 'dev', 'peer'],
      isIgnored: false,
    },
  ],
  semverGroups: [
    {
      label: 'Use exact versions for production dependencies',
      packages: ['**'],
      dependencies: ['**'],
      dependencyTypes: ['prod'],
      range: '',
    },
    {
      label: 'Allow caret range for dev dependencies',
      packages: ['**'],
      dependencies: ['**'],
      dependencyTypes: ['dev'],
      range: '^',
    },
  ],
};
