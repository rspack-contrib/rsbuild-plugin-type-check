import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '../src';

export default defineConfig({
  plugins: [pluginTypeCheck()],
});
