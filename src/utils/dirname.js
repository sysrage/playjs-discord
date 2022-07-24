import url from 'node:url';

// ES Modules has no __dirname that is why we manually set it
globalThis.__dirname = url.fileURLToPath(
    new URL('..', import.meta.url)
);