import { build } from 'esbuild';
await build({ entryPoints: ['scripts/team-heads.js'], bundle: true, minify: true, format: 'esm', target: 'es2022', outfile: 'js/team-heads.js' });
