const { copyFile, mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

async function publish() {
    const output = resolve('dist/compsci-talks/browser');
    const dryRun = process.argv.includes('--dry-run');
    if (dryRun) {
        await require('node:fs/promises').access(join(output, 'index.html'));
        console.log('Build verified. Dry run skipped publishing to gh-pages.');
        return;
    }

    const cache = await mkdtemp(join(tmpdir(), 'cst-pages-'));
    process.env.CACHE_DIR = cache;
    try {
        await copyFile(join(output, 'index.html'), join(output, '404.html'));
        const pages = require('gh-pages');
        await new Promise((done, fail) => {
            pages.publish(output, { nojekyll: true }, error => error ? fail(error) : done());
        });
        console.log('Published to gh-pages.');
    } finally {
        await rm(cache, { recursive: true, force: true });
    }
}

publish().catch(error => {
    console.error('GitHub Pages deploy failed:', error.message);
    process.exitCode = 1;
});
