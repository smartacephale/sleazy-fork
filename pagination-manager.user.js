// ==UserScript==
// @name         pagination-manager
// @description  infinite scroll
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.0
// @match        *://*/*
// ==/UserScript==
/* globals Observer */

class PaginationManager {
  /**
 * @param {Vue.reactive} state
 * @param {Vue.reactive} stateLocale
 * @param {Rules} rules - WEBSITE_RULES class which have to implement methods:
 * URL_DATA { iteratable_url, offset },
 * PAGINATION_LAST
 * @param {Function} handleHtmlCallback
 * @param {number} delay - milliseconds
 */
  constructor(state, stateLocale, rules, handleHtmlCallback, delay) {
    this.state = state;
    this.stateLocale = stateLocale;
    this.rules = rules;
    this.handleHtmlCallback = handleHtmlCallback;

    this.stateLocale.pagIndexLast = this.rules.PAGINATION_LAST;
    this.paginationGenerator = this.createNextPageGenerator();
    this.paginationObserver = Observer.observeWhile(RULES.INTERSECTION_OBSERVABLE || 
                                                    RULES.PAGINATION, this.generatorConsume, delay);
  }

  generatorConsume = async () => {
    if (!this.state.infiniteScrollEnabled) return;
    const {
      value: { url, offset } = {},
      done,
    } = this.paginationGenerator.next();
    if (!done) {
      console.log(url);
      const nextPageHTML = await fetchHtml(url);
      const prevScrollPos = document.documentElement.scrollTop;
      this.handleHtmlCallback(nextPageHTML);
      this.stateLocale.pagIndexCur = offset;
      window.scrollTo(0, prevScrollPos);
    }
    return !this.generatorDone;
  }

  createNextPageGenerator() {
    const { offset, iteratable_url } = this.rules.URL_DATA();
    const offsetLast = this.rules.PAGINATION_LAST;
    this.stateLocale.pagIndexCur = offset;
    function* nextPageGenerator() {
      for (let c = offset + 1; c <= offsetLast; c++) {
        const url = iteratable_url(c);
        yield { url, offset: c };
      }
    }
    return nextPageGenerator();
  }
}


