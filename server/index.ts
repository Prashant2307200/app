import app from './app.ts';

Bun.serve({
    fetch: app.fetch
});

console.log("Server running... on http://localhost:3000");
