import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { proxyConsole } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should show "Type checker is enabled" message by default in production', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTypeCheck()],
    },
  });

  await rsbuild.build();

  expect(
    logs.find((log) =>
      log.includes('Type checker is enabled. It may take some time.'),
    ),
  ).toBeTruthy();

  restore();
});

test('should not show "Type checker is enabled" message when suppressEnabledInfo is true', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTypeCheck({
          suppressEnabledInfo: true,
        }),
      ],
    },
  });

  await rsbuild.build();

  expect(
    logs.find((log) =>
      log.includes('Type checker is enabled. It may take some time.'),
    ),
  ).toBeFalsy();

  restore();
});

test('should show "Type checker is enabled" message when suppressEnabledInfo is false', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTypeCheck({
          suppressEnabledInfo: false,
        }),
      ],
    },
  });

  await rsbuild.build();

  expect(
    logs.find((log) =>
      log.includes('Type checker is enabled. It may take some time.'),
    ),
  ).toBeTruthy();

  restore();
});
