# Substack Scraper

Scrape posts from any Substack publication. Give the Actor a list of publications and get back a clean dataset of posts with titles, dates, authors, tags, engagement numbers, the post body and, optionally, public comments.

## What you can use it for

- Monitor competitors' newsletters and see which topics get the most reactions.
- Build a dataset of posts for research, content analysis or AI/RAG pipelines.
- Track posting frequency and engagement of a publication over time.

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

`comments` is present only when `includeComments` is on. Replies keep a reference to the parent comment in `parentId`.

## Pricing

The Actor uses pay-per-event pricing. You pay only for the data that lands in the dataset:

| Event | Charged for | Price | Per 1,000 |
| --- | --- | --- | --- |
| `post` | A post without the body (`includeBody` off, or the body could not be loaded) | $0.001 | $1.00 |
| `post-with-content` | A post with `bodyHtml` | $0.002 | $2.00 |
| `comment` | Each comment returned in `comments` | $0.0005 | $0.50 |
| `apify-actor-start` | Each run, once | $0.00005 | — |

A post is charged as either `post` or `post-with-content`, never both. When the maximum cost per run that you set is reached, the Actor stops and keeps what it has already saved.

## Limitations

- Only publicly available content is returned. For paid posts (`isPaid: true`) the body contains just the part Substack shows without a subscription.
- A publication that does not exist is skipped with a warning in the log.

## Local development

```bash
apify run       # run with the input from storage/key_value_stores/default/INPUT.json
npm run lint
npm test
```
