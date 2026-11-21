const { mkdir, readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const origin = 'https://compsci-talks.github.io';
const project = 'compsci-b5aa2';
const collection = `projects/${project}/databases/(default)/documents`;
const siteName = 'CompSci Talks';
const links = '<nav aria-label="Public pages"><a href="/">Home</a> · <a href="/schedule/">Schedule</a> · <a href="/archive/">Archive</a></nav>';
const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Cairo' });

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function fetchPublicTalks() {
    // Use anonymous reads and a field projection. Private drafts and member data never enter the build.
    const response = await fetch(`https://firestore.googleapis.com/v1/${collection}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({ structuredQuery: {
            from: [{ collectionId: 'seminars' }],
            where: { fieldFilter: { field: { fieldPath: 'is_hidden' }, op: 'EQUAL', value: { booleanValue: false } } },
            select: { fields: ['is_hidden', 'title', 'date_time', 'abstract', 'location'].map(fieldPath => ({ fieldPath })) }
        } })
    });
    if (!response.ok) throw new Error(`Could not load public seminars from Firestore (HTTP ${response.status}).`);
    return (await response.json()).flatMap(({ document }) => {
        if (!document) return [];
        const id = document.name.split('/').at(-1);
        const fields = document.fields;
        const title = fields.title?.stringValue?.trim();
        const date = new Date(fields.date_time?.timestampValue);
        if (fields.is_hidden?.booleanValue !== false || !/^[a-zA-Z0-9_-]+$/.test(id)
            || !title || !Number.isFinite(date.getTime())) return [];
        return [{ id, title, date, abstract: fields.abstract?.stringValue || '', location: fields.location?.stringValue || '' }];
    }).sort((a, b) => a.date - b.date);
}

function pathFor(talk) {
    return `/seminar/${talk.id}/`;
}

function talkList(talks, empty) {
    if (!talks.length) return `<p>${escapeHtml(empty)}</p>`;
    return '<ul>' + talks.map(talk =>
        `<li><a href="${pathFor(talk)}">${escapeHtml(talk.title)}</a> · ${escapeHtml(dateFormat.format(talk.date))}</li>`
    ).join('') + '</ul>';
}

function render(shell, page) {
    const metadata = `<meta name="description" content="${escapeHtml(page.description)}"><link rel="canonical" href="${origin}${page.path}">`;
    return shell.replace(/<title>.*?<\/title>/is, () => `<title>${escapeHtml(page.title)}</title>${metadata}`)
        .replace(/<app-root[^>]*>\s*<\/app-root>/i, () =>
            `<app-root><main class="container-main section-padding">${links}<h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p>${page.content || ''}</main></app-root>`);
}

async function generatePublicPages(output, loadTalks = fetchPublicTalks, now = Date.now()) {
    const shell = await readFile(join(output, 'index.html'), 'utf8');
    if (!/<app-root[^>]*>\s*<\/app-root>/i.test(shell) || !/<title>.*?<\/title>/is.test(shell)) {
        throw new Error('Expected a fresh Angular build with an empty app root and a title.');
    }
    const talks = await loadTalks();
    const upcoming = talks.filter(talk => talk.date.getTime() > now);
    const past = talks.filter(talk => talk.date.getTime() <= now).reverse();
    const pages = [
        { path: '/', title: `${siteName} | Computer Science Seminars`, heading: 'The Future Decoded',
            description: 'CompSci Talks is a computer science seminar series. Explore upcoming talks and browse past sessions from researchers and other guest speakers.' },
        { path: '/schedule/', title: `Seminar Schedule | ${siteName}`, heading: 'Seminar Schedule',
            description: 'Find upcoming computer science seminars from CompSci Talks.',
            content: talkList(upcoming, 'There are no upcoming talks currently listed.') },
        { path: '/archive/', title: `Talks Archive | ${siteName}`, heading: 'Talks Archive',
            description: 'Explore past computer science seminars from CompSci Talks.',
            content: talkList(past, 'There are no past talks currently listed.') },
        ...talks.map(talk => ({
            path: pathFor(talk), title: `${talk.title} | ${siteName}`, heading: talk.title,
            description: `A CompSci Talks seminar on ${dateFormat.format(talk.date)}.`,
            content: (talk.location ? `<p>${escapeHtml(talk.location)}</p>` : '')
                + (talk.abstract ? `<h2>Abstract</h2><p>${escapeHtml(talk.abstract)}</p>` : '')
        }))
    ];

    for (const page of pages) {
        const directory = join(output, page.path.slice(1));
        await mkdir(directory, { recursive: true });
        await writeFile(join(directory, 'index.html'), render(shell, page), 'utf8');
    }
    const urls = pages.map(page => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n');
    await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    await writeFile(join(output, 'robots.txt'), `User-agent: *\nSitemap: ${origin}/sitemap.xml\n`);
    // Preserve deep links into the client app. Unknown URLs keep the host's 404 status.
    await writeFile(join(output, '404.html'), shell.replace('</head>', '<meta name="robots" content="noindex"></head>'));
    return pages.length;
}

module.exports = { generatePublicPages };
