// ==UserScript==
// @name         data-manager
// @namespace    Violentmonkey Scripts
// @version      1.31
// @license      MIT
// @description  handles loaded html, takes care of data, applying filters
// @author       smartacephale
// @match        *://*/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @downloadURL none
// ==/UserScript==

class DataManager {
    constructor(rules, state) {
        this.rules = rules;
        this.state = state;
        this.data = new Map();
        this.setupFilters();
        this.lazyImgLoader = new unsafeWindow.bhutils.LazyImgLoader((target) => !this.isFiltered(target));
    }

    dataFilters = {
        filterPublic: {
            tag: 'filtered-public',
            createFilter() {
                return (v) => [this.tag, !this.rules.IS_PRIVATE(v.element) && this.state.filterPublic];
            }
        },
        filterPrivate: {
            tag: 'filtered-private',
            createFilter() {
                return (v) => [this.tag, this.rules.IS_PRIVATE(v.element) && this.state.filterPrivate];
            }
        },
        filterDuration: {
            tag: 'filtered-duration',
            createFilter() {
                return (v) => {
                    const notInRange = v.duration < this.state.filterDurationFrom || v.duration > this.state.filterDurationTo;
                    return [this.tag, this.state.filterDuration && notInRange];
                }
            }
        },
        filterExclude: {
            tag: 'filtered-exclude',
            createFilter() {
                const tags = this.filterDSLToRegex(this.state.filterExcludeWords);
                return (v) => {
                    const containTags = tags.some(tag => tag.test(v.title));
                    return [this.tag, this.state.filterExclude && containTags];
                }
            }
        },
        filterInclude: {
            tag: 'filtered-include',
            createFilter() {
                const tags = this.filterDSLToRegex(this.state.filterIncludeWords);
                return (v) => {
                    const containTagsNot = tags.some(tag => !tag.test(v.title));
                    return [this.tag, this.state.filterInclude && containTagsNot];
                }
            }
        }
    }

    filterDSLToRegex(str) {
        const toFullWord = w => `(^|\ )${w}($|\ )`;
        const str_ = str.replace(/f\:(\w+)/g, (_, w) => toFullWord(w));
        return unsafeWindow.bhutils.stringToWords(str_).map(expr => new RegExp(expr, 'i'));
    }

    setupFilters() {
        Object.keys(this.dataFilters).forEach(k => {
            if (!Object.hasOwn(this.state, k)) {
                delete this.dataFilters[k];
            }
        });

        const tags = Object.keys(this.dataFilters).map(k => `.${this.dataFilters[k].tag}`).join(',');
        GM_addStyle(`${tags} { display: none !important; }`);

        Object.values(this.dataFilters).forEach(f => {
            f.state = this.state;
            f.rules = this.rules;
            f.filterDSLToRegex = this.filterDSLToRegex;
        });
    }

    isFiltered(el) {
        return el.className.includes('filtered');
    }

    applyFilters = (filters, offset = 0) => {
        const filtersToApply = Object.keys(filters)
            .filter(k => Object.hasOwn(this.dataFilters, k))
            .map(k => this.dataFilters[k].createFilter());

        if (filtersToApply.length === 0) return;

        let offset_counter = 1;
        for (const v of this.data.values()) {
            if (++offset_counter > offset) {
                for (const f of filtersToApply) {
                    const [tag, condition] = f(v);
                    v.element.classList.toggle(tag, condition);
                }
            }
        }
    }

    filterAll = (offset) => {
        const filters = Object.assign({}, ...Object.keys(this.dataFilters).map(f => ({ [f]: this.state[f] })));
        this.applyFilters(filters, offset);
    }

    handleLoadedHTML = (html, container, removeDuplicates = false, shouldLazify = true) => {
        const thumbs = this.rules.GET_THUMBS(html);
        const data_offset = this.data.size;

        for (const thumbElement of thumbs) {
            const url = this.rules.THUMB_URL(thumbElement);
            if (!url || this.data.has(url)) {
                if (removeDuplicates) thumbElement.remove();
                continue;
            }

            const { title, duration } = this.rules.THUMB_DATA(thumbElement);
            this.data.set(url, { element: thumbElement, duration, title });

            if (shouldLazify) {
                const { img, imgSrc } = this.rules.THUMB_IMG_DATA(thumbElement);
                this.lazyImgLoader.lazify(thumbElement, img, imgSrc);
            }

            const parent = container || this.rules.CONTAINER;
            if (!parent.contains(thumbElement)) parent.appendChild(thumbElement);
        }

        this.filterAll(data_offset);
    };
}
