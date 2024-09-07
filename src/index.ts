import type { RsbuildPlugin } from '@rsbuild/core';

export type pluginTypeCheckOptions = {
  foo?: string;
  bar?: boolean;
};

export const pluginTypeCheck = (
  options: pluginTypeCheckOptions = {},
): RsbuildPlugin => ({
  name: 'plugin-example',

  setup() {
    console.log('Hello Rsbuild!', options);
  },
});
