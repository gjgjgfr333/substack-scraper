import type { ArchiveSort, PostComment, PostItem, RawComment, RawPost } from './types.js';

// Substack returns fewer posts than requested for larger page sizes
export const ARCHIVE_PAGE_SIZE = 12;

export const LABELS = {
    ARCHIVE: 'ARCHIVE',
    POST: 'POST',
    COMMENTS: 'COMMENTS',
} as const;

/**
 * Accepts a publication handle ("lenny"), a domain ("lenny.substack.com")
 * or any URL on the publication and returns its origin.
 */
export const normalizePublicationUrl = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const hasScheme = /^https?:\/\//i.test(trimmed);
    const isHandle = !hasScheme && !/[./]/.test(trimmed);
    let candidate = hasScheme ? trimmed : `https://${trimmed}`;
    if (isHandle) candidate = `https://${trimmed}.substack.com`;

    try {
        const { origin, hostname } = new URL(candidate);
        return hostname.includes('.') ? origin : null;
    } catch {
        return null;
    }
};

export const buildArchiveUrl = (baseUrl: string, sort: ArchiveSort, offset: number): string =>
    `${baseUrl}/api/v1/archive?sort=${sort}&offset=${offset}&limit=${ARCHIVE_PAGE_SIZE}`;

export const buildPostUrl = (baseUrl: string, slug: string): string =>
    `${baseUrl}/api/v1/posts/${encodeURIComponent(slug)}`;

export const buildCommentsUrl = (baseUrl: string, postId: number): string =>
    `${baseUrl}/api/v1/post/${postId}/comments?all_comments=true&sort=best_first`;

export const mapPost = (post: RawPost, publicationUrl: string): PostItem => ({
    publicationUrl,
    postId: post.id,
    url: post.canonical_url ?? `${publicationUrl}/p/${post.slug}`,
    slug: post.slug,
    title: post.title ?? null,
    subtitle: post.subtitle ?? null,
    description: post.description ?? null,
    type: post.type ?? null,
    audience: post.audience ?? null,
    isPaid: Boolean(post.audience) && post.audience !== 'everyone',
    postDate: post.post_date ?? null,
    wordCount: post.wordcount ?? null,
    reactionCount: post.reaction_count ?? 0,
    commentCount: post.comment_count ?? 0,
    restackCount: post.restacks ?? 0,
    coverImage: post.cover_image ?? null,
    section: post.section_name ?? null,
    tags: (post.postTags ?? []).map((tag) => tag.name).filter((name): name is string => Boolean(name)),
    authors: (post.publishedBylines ?? []).map((byline) => ({
        name: byline.name ?? null,
        handle: byline.handle ?? null,
    })),
    podcastUrl: post.podcast_url ?? null,
    previewText: post.truncated_body_text ?? null,
    bodyHtml: post.body_html ?? null,
});

/**
 * Flattens the comment tree depth-first, keeping the parent reference, up to `limit` comments.
 */
export const flattenComments = (comments: RawComment[], limit: number): PostComment[] => {
    const result: PostComment[] = [];

    const visit = (comment: RawComment, parentId: number | null): void => {
        if (result.length >= limit) return;
        result.push({
            id: comment.id,
            parentId,
            body: comment.body ?? null,
            date: comment.date ?? null,
            authorName: comment.name ?? null,
            authorHandle: comment.handle ?? null,
            reactionCount: comment.reaction_count ?? 0,
        });
        for (const child of comment.children ?? []) visit(child, comment.id);
    };

    for (const comment of comments) visit(comment, null);
    return result;
};
