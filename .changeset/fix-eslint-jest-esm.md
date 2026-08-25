---
'setup': patch
---

Fix `npm run check` failures: install missing `@eslint/js` dependency, add a dedicated test tsconfig so Jest globals type-check correctly, and run Jest with `--experimental-vm-modules` (with `@jest/globals` imports and `jest.unstable_mockModule`) to support the ESM-only `@actions/*` packages.
