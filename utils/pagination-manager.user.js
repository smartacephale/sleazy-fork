// ==UserScript==
// @name         pagination-manager
// @description  infinite scroll
// @namespace    Violentmonkey Scripts
// @author       smartacephale
// @license      MIT
// @version      1.4
// @match        *://*/*
// @grant        unsafeWindow
// @downloadURL https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @updateURL https://update.greasyfork.org/scripts/494205/pagination-manager.meta.js
// ==/UserScript==

class PaginationManager {
    /**
     * @param {Vue.reactive} state
     * @param {Vue.reactive} stateLocale
     * @param {Rules} rules - WEBSITE_RULES class with methods:
     * - URL_DATA { iteratable_url, offset },
     * - PAGINATION_LAST
     * @param {Function} handleHtmlCallback
     * @param {number} delay - milliseconds
     * @param {Function} [alternativeGenerator] - Optional custom generator function
     */
    constructor(state, stateLocale, rules, handleHtmlCallback, delay, alternativeGenerator) {
        const { offset, iteratable_url } = rules.URL_DATA();
        Object.assign(this, { state, stateLocale, rules, handleHtmlCallback, delay });
        Object.assign(this, { pagIndexLast: rules.PAGINATION_LAST, pagIndexCur: offset });

        this.paginationGenerator = alternativeGenerator?.() ??
            PaginationManager.createPaginationGenerator(offset, rules.PAGINATION_LAST, iteratable_url);

        this.createPaginationObserver();
    }

    createPaginationObserver() {
        if (this.this.infscrlenbld !== undefined) paginationObserver?.disconnect();
        this.infscrlenbld = !!this.state.infiniteScrollEnabled;
        if (!this.infscrlenbld) return;
        const observable = this.rules.INTERSECTION_OBSERVABLE || this.rules.PAGINATION;
        this.paginationObserver = unsafeWindow.bhutils.Observer.observeWhile(observable, this.generatorConsumer, this.delay);
    }

    generatorConsumer = async () => {
        if (this.state.infiniteScrollEnabled !== this.infscrlenbld) this.createPaginationObserver();
        if (!this.state.infiniteScrollEnabled) return;
        const { value: { url, offset } = {}, done } = await this.paginationGenerator.next();
        if (!done) {
            console.log(url);
            const nextPageHTML = await unsafeWindow.bhutils.fetchHtml(url);
            const prevScrollPos = document.documentElement.scrollTop;
            this.handleHtmlCallback(nextPageHTML);
            this.stateLocale.pagIndexCur = offset;
            window.scrollTo(0, prevScrollPos);
        }
        return !done;
    }

    static * createPaginationGenerator(currentPage, totalPages, generateURL) {
        for (let p = currentPage + 1; p <= totalPages; p++) {
            const url = generateURL(p);
            yield { url, offset: p };
        }
    }
}
