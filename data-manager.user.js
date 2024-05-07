// ==UserScript==
// @name         data-manager
// @description  handles loaded html, takes care of data, applying filters
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.0
// @match        *://*/*
// ==/UserScript==
/* globals */

/** Manages thumbs, applying filters, lazy loading, keep list unique */
class DataManager {
  /**
  * @param {Rules} rules - WEBSITE_RULES class which have to implement methods:
  * GET_THUMBS,
  * THUMB_URL,
  * THUMB_DATA,
  * THUMB_IMG_DATA (required for lazy loading, return undefined if no need it)
  * IS_PRIVATE * optional
  *
  * @param {Object} state - object with props:
  * filterDuration
  * filterDurationFrom
  * filterDurationTo
  * filterExclude
  * filterExcludeWords
  * filterInclude
  * filterIncludeWords
  * filterPublic * optional
  * filterPrivate * optional
  */
  constructor(rules, state) {
    this.rules = rules;
    this.state = state;
    this.data = new Map();
    this.setupFilters();
    this.lazyImgLoader = LazyImgLoader.create((target) => !this.isFiltered(target));
  }

  dataFilters = {
    filterPublic: new class {
      tag = 'filtered-public';
      createFilter = () => {
        return (v) => [this.tag, !this.rules.IS_PRIVATE(v.element) && this.state.filterPublic]
      }
    },
    filterPrivate: new class {
      tag = 'filtered-private';
      createFilter = () => {
        return (v) => [this.tag, this.rules.IS_PRIVATE(v.element) && this.state.filterPrivate]
      }
    },
    filterDuration: new class {
      tag = 'filtered-duration';
      createFilter = () => {
        return (v) => {
          const notInRange = v.duration < this.state.filterDurationFrom || v.duration > this.state.filterDurationTo;
          return [this.tag, this.state.filterDuration && notInRange];
        }
      }
    },
    filterExclude: new class {
      tag = 'filtered-exclude';
      createFilter = () => {
        const tags = stringToWords(this.state.filterExcludeWords);
        return (v) => {
          const containTags = tags.some(tag => v.title.includes(tag));
          return [this.tag, this.state.filterExclude && containTags];
        }
      }
    },
    filterInclude: new class {
      tag = 'filtered-include';
      createFilter = () => {
        const tags = stringToWords(this.state.filterIncludeWords);
        return (v) => {
          const containTagsNot = tags.some(tag => !v.title.includes(tag));
          return [this.tag, this.state.filterInclude && containTagsNot];
        }
      }
    }
  }

  setupFilters() {
    // select through state jfc it's just wrong but fuck it fuck my ass 
    Object.keys(this.dataFilters).forEach(k => {
      if (!Object.hasOwn(this.state, k)) {
        delete this.dataFilters[k];
      }
    });

    // add filters style
    const tags = Object.keys(this.dataFilters).map(k => `.${this.dataFilters[k].tag}`).join(',');
    GM_addStyle(`${tags} { display: none !important; }`);

    // bind state
    Object.values(this.dataFilters).forEach(f => {
      f.state = this.state;
      f.rules = this.rules;
    });
  }

  isFiltered(el) {
    return el.className.includes('filtered');
  }

  filter_ = (filters, offset = 0) => {
    const runFilters = [];

    for (const f of Object.keys(filters)) {
      runFilters.push(this.dataFilters[f].createFilter());
    }

    let offset_counter = 1;
    for (const v of this.data.values()) {
      offset_counter++;
      if (offset_counter > offset) {
        for (const rf of runFilters) {
          const [tag, condition] = rf(v);
          v.element.classList.toggle(tag, condition);
        }
      }
    }
  }

  filterAll = (offset) => {
    const applyFilters = Object.assign({}, ...Object.keys(this.dataFilters).map(f => ({ [f]: state[f] })));
    this.filter_(applyFilters, offset);
  }

  handleLoadedHTML = (html, container) => {
    const thumbs = this.rules.GET_THUMBS(html);

    const data_offset = this.data.size;

    for (const thumbElement of thumbs) {
      const url = this.rules.THUMB_URL(thumbElement);
      if (!url || this.data.has(url)) continue;

      const { title, duration } = this.rules.THUMB_DATA(thumbElement);

      this.data.set(url, { element: thumbElement, duration, title });

      const { img, imgSrc } = this.rules.THUMB_IMG_DATA(thumbElement);
      this.lazyImgLoader.lazify(thumbElement, img, imgSrc);

      const parent = container || this.rules.CONTAINER;
      if (!parent.contains(thumbElement)) parent.appendChild(thumbElement);
      // fuck know what to except...
      // (container || this.rules.CONTAINER).appendChild(thumbElement);
    }

    this.filterAll(data_offset);
  };
}

