import type { ProxyConfigurationOptions } from 'apify';

export type ArchiveSort = 'new' | 'top';

export interface Input {
    publications: string[];
    maxPostsPerPublication?: number;
    sort?: ArchiveSort;
    includeBody?: boolean;
    includeComments?: boolean;
    maxCommentsPerPost?: number;
    proxyConfiguration?: ProxyConfigurationOptions & { useApifyProxy?: boolean };
}

export interface ScrapeOptions {
    maxPostsPerPublication: number;
    sort: ArchiveSort;
    includeBody: boolean;
    includeComments: boolean;
    maxCommentsPerPost: number;
}

export interface RawByline {
    name?: string | null;
    handle?: string | null;
}

export interface RawTag {
    name?: string | null;
}

// Subset of the fields returned by the Substack archive and post endpoints
export interface RawPost {
    id: number;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    slug: string;
    canonical_url?: string | null;
    post_date?: string | null;
    type?: string | null;
    audience?: string | null;
    wordcount?: number | null;
    reaction_count?: number | null;
    comment_count?: number | null;
    restacks?: number | null;
    cover_image?: string | null;
    section_name?: string | null;
    podcast_url?: string | null;
    truncated_body_text?: string | null;
    body_html?: string | null;
    postTags?: RawTag[] | null;
    publishedBylines?: RawByline[] | null;
}

export interface RawComment {
    id: number;
    body?: string | null;
    date?: string | null;
    name?: string | null;
    handle?: string | null;
    reaction_count?: number | null;
    children?: RawComment[] | null;
}

export interface PostAuthor {
    name: string | null;
    handle: string | null;
}

export interface PostComment {
    id: number;
    parentId: number | null;
    body: string | null;
    date: string | null;
    authorName: string | null;
    authorHandle: string | null;
    reactionCount: number;
}

export interface PostItem {
    publicationUrl: string;
    postId: number;
    url: string;
    slug: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    type: string | null;
    audience: string | null;
    isPaid: boolean;
    postDate: string | null;
    wordCount: number | null;
    reactionCount: number;
    commentCount: number;
    restackCount: number;
    coverImage: string | null;
    section: string | null;
    tags: string[];
    authors: PostAuthor[];
    podcastUrl: string | null;
    previewText: string | null;
    bodyHtml: string | null;
    comments?: PostComment[];
}

export interface ArchiveUserData {
    publicationUrl: string;
    offset: number;
}

export interface PostUserData {
    item: PostItem;
    apiBaseUrl: string;
}

export interface CrawlState {
    postsPerPublication: Record<string, number>;
}
