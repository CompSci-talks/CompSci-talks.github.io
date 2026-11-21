const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { generatePublicPages } = require('./generate-public-pages.cjs');

async function publish() {
    const output = resolve('dist/compsci-talks/browser');
    const count = await generatePublicPages(output);
    console.log('Generated ' + count + ' public HTML pages and sitemap.');
    const dryRun = process.argv.includes('--dry-run');
    if (dryRun) {
        console.log('Build verified. Dry run skipped publishing to gh-pages.');
        return;
    }

    const cache = await mkdtemp(join(tmpdir(), 'cst-pages-'));
    process.env.CACHE_DIR = cache;
    try {
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
