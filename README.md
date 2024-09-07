# @rsbuild/plugin-type-check

An Rsbuild plugin to run TypeScript type checker in a separate process.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-type-check">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-type-check?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
</p>

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

## Options

### foo

Some description.

- Type: `string`
- Default: `undefined`
- Example:

```js
pluginTypeCheck({
  foo: "bar",
});
```

## License

[MIT](./LICENSE).
