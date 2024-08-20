// ==UserScript==
// @name         pagination-manager
// @description  infinite scroll
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.2
// @match        *://*/*
// @downloadURL https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @updateURL https://update.greasyfork.org/scripts/494205/pagination-manager.meta.js
// ==/UserScript==
/* globals Observer fetchHtml */

class PaginationManager {
    /**
     * @param {Vue.reactive} state
     * @param {Vue.reactive} stateLocale
     * @param {Rules} rules - WEBSITE_RULES class which have to implement methods:
     * - URL_DATA { iteratable_url, offset },
     * - PAGINATION_LAST
     * @param {Function} handleHtmlCallback
     * @param {number} delay - milliseconds
     */
    constructor(state, stateLocale, rules, handleHtmlCallback, delay, alternativeGenerator) {
        this.state = state;
        this.stateLocale = stateLocale;
        this.handleHtmlCallback = handleHtmlCallback;

        const { offset, iteratable_url } = rules.URL_DATA();

        this.stateLocale.pagIndexLast = rules.PAGINATION_LAST;
        this.stateLocale.pagIndexCur = offset;

        this.paginationGenerator = alternativeGenerator ? alternativeGenerator() :
          PaginationManager.createPaginationGenerator(offset, rules.PAGINATION_LAST, iteratable_url);

        this.paginationObserver = Observer.observeWhile(
            rules.INTERSECTION_OBSERVABLE || rules.PAGINATION, this.generatorConsume, delay);
    }

    generatorConsume = async () => {
        if (!this.state.infiniteScrollEnabled) return;
        const { value: { url, offset } = {}, done } = await this.paginationGenerator.next();
        if (!done) {
            console.log(url);
            const nextPageHTML = await fetchHtml(url);
            const prevScrollPos = document.documentElement.scrollTop;
            this.handleHtmlCallback(nextPageHTML);
            this.stateLocale.pagIndexCur = offset;
            window.scrollTo(0, prevScrollPos);
        }
        return !done;
    }

    static createPaginationGenerator(currentPage, totalPages, generateURL) {
        function* nextPageGenerator() {
            for (let p = currentPage + 1; p <= totalPages; p++) {
                const url = generateURL(p);
                yield { url, offset: p };
            }
        }
        return nextPageGenerator();
    }
}
