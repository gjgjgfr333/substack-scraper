# Substack Scraper

## What does Substack Scraper do?

Substack Scraper extracts posts from any [Substack](https://substack.com) publication. Give it a list of newsletters and it returns one clean record per post: title, subtitle, publication date, authors, tags, likes, restacks, comment count, the full post body in HTML and, optionally, the public comments with their reply structure.

- **No login, cookies or API key.** The Actor reads only what Substack shows to any visitor.
- **Works with any publication**, on `*.substack.com` or on a custom domain such as `www.lennysnewsletter.com`.
- **Several publications in one run**, with a separate post limit for each.
- **Newest or most popular posts first**, so you can take the latest issues or the all-time top ones.
- **You pay per result**, not for run time, and you can cap the cost of every run.

Results can be downloaded as JSON, CSV, Excel or HTML, or read through the Apify API.

## What can you use Substack data for?

- **Competitor and market research.** See what other newsletters in your niche publish, how often, and which topics get the most likes, restacks and comments.
- **Content analysis.** Compare titles, post length and posting frequency against engagement to find out what works.
- **AI and RAG pipelines.** Load the full text of a newsletter archive into a vector database or use it as context for an LLM.
- **Archiving and monitoring.** Keep a copy of a publication's archive, or schedule the Actor and collect new posts as they come out.
- **Audience research.** Read what subscribers say in the comments and which comments other readers react to.

## What data can you extract from Substack?

| Data | Fields |
| --- | --- |
| Post | `postId`, `url`, `slug`, `title`, `subtitle`, `description`, `type`, `postDate`, `wordCount` |
| Access | `audience`, `isPaid` |
| Engagement | `reactionCount`, `commentCount`, `restackCount` |
| Content | `bodyHtml`, `previewText`, `coverImage`, `podcastUrl` |
| Classification | `section`, `tags`, `authors` (name and handle) |
| Comments | `id`, `parentId`, `body`, `date`, `authorName`, `authorHandle`, `reactionCount` |
| Source | `publicationUrl` |

## How to scrape Substack posts

1. Open the Actor in Apify Console and go to the **Input** tab.
2. Add one or more publications. A full URL, a domain or just the handle all work.
3. Set how many posts you want from each publication and whether to take the newest or the most popular ones.
4. Choose whether you need the post body and the comments. Each of them adds one request per post, so turn off what you do not need.
5. Click **Start**. When the run finishes, open the **Output** tab and export the data in the format you need.

## How much does it cost to scrape Substack?

The Actor uses pay-per-event pricing. You pay only for the data that lands in the dataset:

| Event | Charged for | Price | Per 1,000 |
| --- | --- | --- | --- |
| `post` | A post without the body (`includeBody` off, or the body could not be loaded) | $0.001 | $1.00 |
| `post-with-content` | A post with `bodyHtml` | $0.002 | $2.00 |
| `comment` | Each comment returned in `comments` | $0.0005 | $0.50 |
| `apify-actor-start` | Each run, per GB of memory ($0.0002 at the default 4 GB) | $0.00005 | — |

A post is charged as either `post` or `post-with-content`, never both.

Examples:

| Run | Cost |
| --- | --- |
| 50 newest posts of one publication, with the body | about $0.10 |
| 1,000 posts, metadata only | about $1.00 |
| 1,000 posts with the body | about $2.00 |
| 100 posts with the body and 2,000 comments in total | about $1.20 |

To keep a run within a budget, set the maximum cost per run in the run options. When the limit is reached, the Actor stops and keeps everything it has already saved.

## Input

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `publications` | array | required | Publications to scrape. A full URL (`https://www.lennysnewsletter.com`), a domain (`example.substack.com`) or a handle (`example`). |
| `maxPostsPerPublication` | integer | `50` | Maximum number of posts returned for each publication. |
| `sort` | string | `new` | `new` for newest first, `top` for most popular first. |
| `includeBody` | boolean | `true` | Fetch the HTML body of each post. Turn off for faster runs. |
| `includeComments` | boolean | `false` | Fetch public comments for each post. |
| `maxCommentsPerPost` | integer | `100` | Maximum number of comments per post. |
| `proxyConfiguration` | object | no proxy | Proxy settings. Substack usually works without a proxy. |

Example:

```json
{
    "publications": ["https://www.lennysnewsletter.com", "platformer"],
    "maxPostsPerPublication": 20,
    "sort": "new",
    "includeBody": true,
    "includeComments": false
}
```

## Output

One dataset item per post:

```json
{
    "publicationUrl": "https://www.lennysnewsletter.com",
    "postId": 215694124,
    "url": "https://www.lennysnewsletter.com/p/all-of-the-lenny-and-friends-summit",
    "slug": "all-of-the-lenny-and-friends-summit",
    "title": "All of the Lenny & Friends Summit talks are now online!",
    "subtitle": "Plus, some reflections and takeaways from the day",
    "description": "Plus, some reflections and takeaways from the day",
    "type": "newsletter",
    "audience": "everyone",
    "isPaid": false,
    "postDate": "2026-09-29T13:15:57.512Z",
    "wordCount": 1276,
    "reactionCount": 263,
    "commentCount": 5,
    "restackCount": 4,
    "coverImage": "https://substack-post-media.s3.amazonaws.com/public/images/example.jpeg",
    "section": null,
    "tags": [],
    "authors": [{ "name": "Lenny Rachitsky", "handle": "lenny" }],
    "podcastUrl": null,
    "previewText": "Hey there, I'm Lenny...",
    "bodyHtml": "<p>...</p>",
    "comments": [
        {
            "id": 348735847,
            "parentId": null,
            "body": "thank you for existing",
            "date": "2026-09-29T15:30:12.240Z",
            "authorName": "Justin Wormley",
            "authorHandle": "justinwormley",
            "reactionCount": 3
        }
    ]
}
```

`comments` is present only when `includeComments` is on. Comments come as a flat list, and each reply points to the comment it answers through `parentId`. `bodyHtml` is `null` when the body was not requested or could not be loaded.

## Tips

- **Start small.** Run one publication with 10–20 posts first to check that the output has what you need.
- **Turn off the body for metadata-only tasks.** Engagement tracking and posting-frequency analysis do not need `bodyHtml`; without it posts cost half as much and the run is faster.
- **Use `top` to find the best content.** With `sort` set to `top`, a small `maxPostsPerPublication` gives you the most popular posts of a publication without going through the whole archive.
- **Watch the comment count on popular newsletters.** Comments are charged individually, so set `maxCommentsPerPost` to what you really need.
- **Schedule it.** To follow a newsletter, schedule a run with `sort` set to `new` and a small post limit.

## Integrations and API

Substack Scraper runs on the Apify platform, so you can start it from the [Apify API](https://docs.apify.com/api/v2), the JavaScript and Python clients or the CLI, run it on a [schedule](https://docs.apify.com/platform/schedules), and send the results on with [webhooks](https://docs.apify.com/platform/integrations/webhooks) or the ready-made [integrations](https://docs.apify.com/platform/integrations) for Make, Zapier, n8n, Google Sheets and others. AI agents can call it through the [Apify MCP server](https://mcp.apify.com).

## FAQ

### Do I need a Substack account or an API key?

No. The Actor does not log in and needs no cookies or keys.

### Can it scrape paid posts?

Only the part that Substack shows without a subscription. Paid posts are returned with all their metadata and `isPaid: true`, `bodyHtml` holds the free preview, and their comments come back empty.

### Does it work with publications on a custom domain?

Yes. You can enter the custom domain directly, and a `*.substack.com` address that redirects to a custom domain is followed automatically.

### What happens if a publication does not exist?

It is skipped with a warning in the log, and the other publications in the run are scraped as usual.

### What if the body or the comments of a post fail to load?

The post is saved anyway with the data that was loaded, and it is charged as a `post` without content.

### Do I need a proxy?

Usually not. If Substack starts to block requests on large runs, turn on Apify Proxy in the `proxyConfiguration` field.

### Is it legal to scrape Substack?

The Actor collects only publicly available content. Posts are protected by copyright, and comments contain personal data (the names and handles of the people who wrote them), which is protected by GDPR and similar laws. Make sure you have a legitimate reason to collect and use this data, and consult a lawyer if you are not sure.

## Support

Found a bug or miss a field? Open an issue in the **Issues** tab of the Actor and describe the input you used.
