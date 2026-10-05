import type { CheerioCrawler } from '@crawlee/cheerio';
import { Actor, log } from 'apify';

import type { PostItem } from './types.js';

// Pay-per-event names, they have to match the events configured for the Actor in Apify Console
export const CHARGE_EVENTS = {
    POST: 'post',
    POST_WITH_CONTENT: 'post-with-content',
    COMMENT: 'comment',
} as const;

let budgetWarningPrinted = false;

/**
 * Pushes posts to the dataset and charges for what is actually delivered: one post event per item
 * (the more expensive one when the body was loaded) and one event per comment.
 * Stops the crawler once the maximum cost set by the user is reached.
 */
export const pushPosts = async (items: PostItem[], crawler: Pick<CheerioCrawler, 'autoscaledPool'>) => {
    const chargingManager = Actor.getChargingManager();
    const { isPayPerEvent } = chargingManager.getPricingInfo();
    const affordable = (eventName: string) => chargingManager.calculateMaxEventChargeCountWithinLimit(eventName);

    for (const item of items) {
        const eventName = item.bodyHtml === null ? CHARGE_EVENTS.POST : CHARGE_EVENTS.POST_WITH_CONTENT;

        if (affordable(eventName) < 1) {
            if (!budgetWarningPrinted) {
                budgetWarningPrinted = true;
                log.warning('The maximum cost of the run was reached, stopping the crawler');
            }
            await crawler.autoscaledPool?.abort();
            return;
        }

        // Keep only the comments the remaining budget can pay for
        if (item.comments) item.comments = item.comments.slice(0, affordable(CHARGE_EVENTS.COMMENT));

        await Actor.pushData(item, eventName);

        // The post itself was charged in the meantime, so the count is checked against the budget again
        const commentCount = Math.min(item.comments?.length ?? 0, affordable(CHARGE_EVENTS.COMMENT));
        if (isPayPerEvent && commentCount > 0)
            await Actor.charge({ eventName: CHARGE_EVENTS.COMMENT, count: commentCount });
    }
};
