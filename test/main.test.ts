import { describe, expect, it } from 'vitest';

import { buildArchiveUrl, flattenComments, mapPost, normalizePublicationUrl } from '../src/utils.js';

describe('normalizePublicationUrl', () => {
    it('should turn a handle into a substack.com origin', () => {
        expect(normalizePublicationUrl('lenny')).toBe('https://lenny.substack.com');
    });

    it('should add the scheme to a bare domain', () => {
        expect(normalizePublicationUrl('lenny.substack.com')).toBe('https://lenny.substack.com');
    });

    it('should keep only the origin of a post URL', () => {
        expect(normalizePublicationUrl('https://www.lennysnewsletter.com/p/some-post?utm=1')).toBe(
            'https://www.lennysnewsletter.com',
        );
    });

    it('should reject empty and malformed values', () => {
        expect(normalizePublicationUrl('   ')).toBeNull();
        expect(normalizePublicationUrl('https://')).toBeNull();
    });
});

describe('buildArchiveUrl', () => {
    it('should build a paginated archive URL', () => {
        expect(buildArchiveUrl('https://lenny.substack.com', 'top', 24)).toBe(
            'https://lenny.substack.com/api/v1/archive?sort=top&offset=24&limit=12',
        );
    });
});

describe('mapPost', () => {
    it('should map a raw post and fill defaults', () => {
        const item = mapPost(
            {
                id: 1,
                slug: 'hello',
                title: 'Hello',
                audience: 'only_paid',
                postTags: [{ name: 'ai' }, { name: null }],
                publishedBylines: [{ name: 'Jane', handle: 'jane' }],
            },
            'https://example.substack.com',
        );

        expect(item.url).toBe('https://example.substack.com/p/hello');
        expect(item.isPaid).toBe(true);
        expect(item.tags).toEqual(['ai']);
        expect(item.authors).toEqual([{ name: 'Jane', handle: 'jane' }]);
        expect(item.reactionCount).toBe(0);
        expect(item.bodyHtml).toBeNull();
    });
});

describe('flattenComments', () => {
    it('should flatten nested comments and respect the limit', () => {
        const comments = [
            { id: 1, body: 'a', children: [{ id: 2, body: 'b', children: [{ id: 3, body: 'c' }] }] },
            { id: 4, body: 'd' },
        ];

        expect(flattenComments(comments, 10).map(({ id, parentId }) => [id, parentId])).toEqual([
            [1, null],
            [2, 1],
            [3, 2],
            [4, null],
        ]);
        expect(flattenComments(comments, 2)).toHaveLength(2);
    });
});
