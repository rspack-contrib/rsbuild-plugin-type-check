import fs from 'node:fs';
import { createRequire } from 'node:module';
import { type RsbuildPlugin, logger } from '@rsbuild/core';
import deepmerge from 'deepmerge';
import ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import json5 from 'json5';
import { type ConfigChain, reduceConfigs } from 'reduce-configs';

const require = createRequire(import.meta.url);

type ForkTsCheckerOptions = NonNullable<
  ConstructorParameters<typeof ForkTSCheckerPlugin>[0]
>;

export type PluginTypeCheckerOptions = {
  /**
   * Whether to enable TypeScript type checking.
   * @default true
   */
  enable?: boolean;
  /**
   * To modify the options of `fork-ts-checker-webpack-plugin`.
   * @see https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#readme
   */
  forkTsCheckerOptions?: ConfigChain<ForkTsCheckerOptions>;
};

export const PLUGIN_TYPE_CHECK_NAME = 'rsbuild:type-check';

export const pluginTypeCheck = (
  options: PluginTypeCheckerOptions = {},
): RsbuildPlugin => {
  return {
    name: PLUGIN_TYPE_CHECK_NAME,

    setup(api) {
      const NODE_MODULES_REGEX: RegExp = /[\\/]node_modules[\\/]/;
      const checkedTsconfig = new Map<
        // tsconfig path
        string,
        // environment
        string
      >();

      api.modifyBundlerChain(
        async (chain, { isProd, environment, CHAIN_ID }) => {
          const { enable = true, forkTsCheckerOptions } = options;
          const { tsconfigPath } = environment;

          if (!tsconfigPath || enable === false) {
            return;
          }

          // If there are identical tsconfig.json files,
          // apply type checker only once to avoid duplicate checks.
          if (
            checkedTsconfig.has(tsconfigPath) &&
            checkedTsconfig.get(tsconfigPath) !== environment.name
          ) {
            return;
          }
          checkedTsconfig.set(tsconfigPath, environment.name);

          // use typescript of user project
          let typescriptPath: string;
          try {
            typescriptPath = require.resolve('typescript', {
              paths: [api.context.rootPath],
            });
          } catch (err) {
            logger.warn(
              '"typescript" is not found in current project, Type checker will not work.',
            );
            return;
          }

          const { references } = json5.parse(
            fs.readFileSync(tsconfigPath, 'utf-8'),
          );
          const useReference =
            Array.isArray(references) && references.length > 0;

          const defaultOptions: ForkTsCheckerOptions = {
            typescript: {
              // set 'readonly' to avoid emitting tsbuildinfo,
              // as the generated tsbuildinfo will break fork-ts-checker
              mode: 'readonly',
              // enable build when using project reference
              build: useReference,
              // avoid OOM issue
              memoryLimit: 8192,
              // use tsconfig of user project
              configFile: tsconfigPath,
              // use typescript of user project
              typescriptPath,
            },
            issue: {
              // ignore types errors from node_modules
              exclude: [({ file = '' }) => NODE_MODULES_REGEX.test(file)],
            },
            logger: {
              log() {
                // do nothing
                // we only want to display error messages
              },
              error(message: string) {
                console.error(message.replace(/ERROR/g, 'Type Error'));
              },
            },
          };

          const typeCheckerOptions = reduceConfigs({
            initial: defaultOptions,
            config: forkTsCheckerOptions,
            mergeFn: deepmerge,
          });

          if (isProd) {
            logger.info('Type checker is enabled. It may take some time.');
          }

          chain
            .plugin(CHAIN_ID.PLUGIN.TS_CHECKER)
            .use(ForkTSCheckerPlugin, [typeCheckerOptions]);
        },
      );
    },
  };
};
