// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler } from '@crawlee/cheerio';
// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor, log } from 'apify';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// note that we need to use `.js` even when inside TS files
import { pushPosts } from './charging.js';
import { createRouter } from './routes.js';
import type { ArchiveUserData, Input, PostUserData } from './types.js';
import { buildArchiveUrl, LABELS, normalizePublicationUrl } from './utils.js';

await Actor.init();

// Structure of input is defined in input_schema.json
const {
    publications = [],
    maxPostsPerPublication = 50,
    sort = 'new',
    includeBody = true,
    includeComments = false,
    maxCommentsPerPost = 100,
    proxyConfiguration: proxyInput,
} = (await Actor.getInput<Input>()) ?? ({} as Input);

const publicationUrls = [
    ...new Set(publications.map(normalizePublicationUrl).filter((url): url is string => url !== null)),
];

if (publicationUrls.length === 0) {
    await Actor.fail('No valid publications provided. Add at least one Substack publication URL or handle.');
}

const proxyConfiguration = proxyInput ? await Actor.createProxyConfiguration(proxyInput) : undefined;

const crawler = new CheerioCrawler({
    proxyConfiguration,
    // The Substack API responds with JSON
    additionalMimeTypes: ['application/json'],
    maxConcurrency: 10,
    requestHandler: createRouter({ maxPostsPerPublication, sort, includeBody, includeComments, maxCommentsPerPost }),
    failedRequestHandler: async ({ request, crawler: failedCrawler }, error) => {
        if (request.label === LABELS.ARCHIVE) {
            const { publicationUrl } = request.userData as ArchiveUserData;
            log.warning('Could not load the publication archive, check that the publication exists', {
                publicationUrl,
                error: error.message,
            });
            return;
        }

        // Keep the post even when its body or comments could not be loaded
        const { item } = request.userData as PostUserData;
        log.warning('Could not load post details, saving the post without them', { url: item.url });
        await pushPosts([item], failedCrawler);
    },
});

Actor.on('aborting', async () => {
    log.info('Actor is aborting, stopping the crawler');
    await crawler.autoscaledPool?.abort();
    await Actor.exit();
});

await crawler.run(
    publicationUrls.map((publicationUrl) => ({
        url: buildArchiveUrl(publicationUrl, sort, 0),
        label: LABELS.ARCHIVE,
        userData: { publicationUrl, offset: 0 } satisfies ArchiveUserData,
    })),
);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
