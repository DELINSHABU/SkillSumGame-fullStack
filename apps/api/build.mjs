import { build } from 'esbuild';

// Precompile the API to a single JS file so Render runs `node dist/index.js` instead
// of transpiling TypeScript on every cold boot via tsx — shaving seconds off wake-up.
//
// We bundle our own source AND the raw-TypeScript `@skillsum/shared` workspace package
// (its `main` points at src/index.ts, so it can't be required as-is). Everything else —
// argon2 (native binary), pg, drizzle-orm, hono, zod — stays external and loads normally
// from node_modules at runtime.
const externalizeNodeModules = {
  name: 'externalize-node-modules',
  setup(pluginBuild) {
    // Bare specifiers (not starting with . or /) are external, except our shared package.
    pluginBuild.onResolve({ filter: /^[^./]/ }, (args) => {
      if (args.path === '@skillsum/shared' || args.path.startsWith('@skillsum/shared/')) return null;
      return { path: args.path, external: true };
    });
  },
};

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: 'dist/index.js',
  sourcemap: true,
  plugins: [externalizeNodeModules],
});
