# @rsbuild/plugin-type-check

An Rsbuild plugin to run TypeScript type checker in a separate process.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-type-check">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-type-check?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
</p>

## Introduction

This plugin internally integrates with [fork-ts-checker-webpack-plugin](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin).

The type checking logic of `fork-ts-checker-webpack-plugin` is similar to the native `tsc` command of TypeScript. It automatically reads the configuration options from `tsconfig.json` and can also be modified via the configuration options provided by the Type Check plugin.

The behavior of the plugin differs in the development and production builds:

- In development mode, type errors do not block the build process. They are only logged in the terminal.
- In production mode, type errors cause the build to fail in order to ensure the stability of the production code.

## Usage

Install:

```bash
npm add @rsbuild/plugin-type-check -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";

export default {
  plugins: [pluginTypeCheck()],
};
```

### Configuring tsconfig.json

The Type Check plugin by default performs checks based on the `tsconfig.json` file in the root directory of the current project. Below is an example of a `tsconfig.json` file, which you can also adjust according to the needs of your project.

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "ES2020"],
    "module": "ESNext",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
```

Please note that the fields in `tsconfig.json` will not affect the compilation behavior and output of Rsbuild, but will only affect the results of type checking.

## Options

### enable

Whether to enable TypeScript type checking.

- **Type:** `boolean`
- **Default:** `true`
- **Example:**

Disable TypeScript type checking:

```js
pluginTypeCheck({
  enable: false,
});
```

Enable type checking only in production mode:

```js
pluginTypeCheck({
  enable: process.env.NODE_ENV === "production",
});
```

Enable type checking only in development mode (it is not recommended to disable type checking in production mode, as it may reduce the stability of the production code):

```js
pluginTypeCheck({
  enable: process.env.NODE_ENV === "development",
});
```

### forkTsCheckerOptions

To modify the options of `fork-ts-checker-webpack-plugin`, please refer to [fork-ts-checker-webpack-plugin - README](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#readme) to learn about available options.

- **Type:** `Object | Function`
- **Default:**

```ts
const defaultOptions = {
  typescript: {
    // set 'readonly' to avoid emitting tsbuildinfo,
    // as the generated tsbuildinfo will break fork-ts-checker
    mode: "readonly",
    // enable build when using project reference
    build: useReference,
    // avoid OOM issue
    memoryLimit: 8192,
    // use tsconfig of user project
    configFile: tsconfigPath,
    // use typescript of user project
    typescriptPath: require.resolve("typescript"),
  },
  issue: {
    // ignore types errors from node_modules
    exclude: [({ file = "" }) => /[\\/]node_modules[\\/]/.test(file)],
  },
  logger: {
    log() {
      // do nothing
      // we only want to display error messages
    },
    error(message: string) {
      console.error(message.replace(/ERROR/g, "Type Error"));
    },
  },
};
```

#### Object Type

When the value of `forkTsCheckerOptions` is an object, it will be deeply merged with the default configuration.

```ts
pluginTypeCheck({
  forkTsCheckerOptions: {
    issue: {
      exclude: [({ file = "" }) => /[\\/]some-folder[\\/]/.test(file)],
    },
  },
});
```

#### Function Type

When the value of `forkTsCheckerOptions` is a function, the default configuration will be passed as the first argument. You can directly modify the configuration object or return an object as the final configuration.

```ts
pluginTypeCheck({
  forkTsCheckerOptions(options) {
    options.async = false;
    return options;
  },
});
```

#### exclude Example

The `exclude` option can filter based on the `code`, `message`, or `file` from TS errors.

For example, the type mismatch error can be excluded using `code: 'TS2345'`:

```ts
pluginTypeCheck({
  forkTsCheckerOptions: {
    issue: {
      // Ignore "Argument of type 'string' is not assignable to parameter of type 'number'.ts(2345)"
      exclude: [{ code: "TS2345" }],
    },
  },
});
```

Or exclude files under `/some-folder/` using `file`:

```ts
pluginTypeCheck({
  forkTsCheckerOptions: {
    issue: {
      exclude: [({ file = "" }) => /[\\/]some-folder[\\/]/.test(file)],
    },
  },
});
```

## Notes

- If you have enabled `ts-loader` in your project and manually configured `compileOnly: false`, please disable the Type Check plugin to avoid duplicate type checking.
- Some errors will be displayed as warnings in IDEs such as VS Code, but they will still be displayed as errors in the `fork-ts-checker-webpack-plugin` check. For details, please refer to: [Why are some errors reported as warnings?](https://code.visualstudio.com/docs/typescript/typescript-compiling#_why-are-some-errors-reported-as-warnings).

## Performance Optimization

Type checking has a significant performance overhead. You can refer to the [Performance Guide](https://github.com/microsoft/TypeScript/wiki/Performance) in the official TypeScript documentation for performance optimization.

For example, properly configuring the `include` and `exclude` scopes in `tsconfig.json` can significantly reduce unnecessary type checking and improve TypeScript performance:

```json title="tsconfig.json"
{
  "include": ["src"],
  "exclude": ["**/node_modules", "**/.*/"]
}
```

## Vue Components

`fork-ts-checker-webpack-plugin` does not support checking TypeScript code in `.vue` components. You can check for type issues in `.vue` files in the following ways:

1. Install the [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) package, which provides the ability to check types in `.vue` files.

<PackageManagerTabs command="add vue-tsc -D" />

2. Add the `vue-tsc --noEmit` command to the `build` script in package.json:

```diff title="package.json"
{
  "scripts": {
-   "build": "rsbuild build"
+   "build": "vue-tsc --noEmit && rsbuild build"
  }
}
```

3. Since the production build uses `vue-tsc` for type checking, you can disable the Type Check plugin in production mode to avoid redundant checks.

```js
pluginTypeCheck({
  enable: process.env.NODE_ENV === "development",
});
```

## License

[MIT](./LICENSE).
