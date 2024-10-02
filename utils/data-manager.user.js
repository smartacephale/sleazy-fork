// ==UserScript==
// @name         data-manager
// @namespace    Violentmonkey Scripts
// @version      1.5
// @license      MIT
// @description  process html, store and filter data
// @author       smartacephale
// @match        *://*/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @downloadURL none
// ==/UserScript==

class DataFilter {
    constructor(rules, state) {
        this.state = state;
        this.rules = rules;

        const methods = Object.getOwnPropertyNames(this);
        this.filters = methods.reduce((acc, k) => {
            if (k in this.state) {
                acc[k] = this[k];
                GM_addStyle(`.filter-${k.toLowerCase().slice(6)} { display: none !important; }`);
            }
            return acc;
        }, {});
    }

    filterPublic = () => {
        return (v) => {
            const isPublic = !this.rules.IS_PRIVATE(v.element);
            return {
                tag: 'filter-public',
                condition: this.state.filterPublic && isPublic
            };
        }
    }

    filterPrivate = () => {
        return (v) => {
            const isPrivate = this.rules.IS_PRIVATE(v.element);
            return {
                tag: 'filter-private',
                condition: this.state.filterPrivate && isPrivate
            };
        }
    }

    filterDuration = () => {
        return (v) => {
            const notInRange = v.duration < this.state.filterDurationFrom || v.duration > this.state.filterDurationTo;
            return {
                tag: 'filter-duration',
                condition: this.state.filterDuration && notInRange
            };
        }
    }

    filterExclude = () => {
        const tags = DataManager.filterDSLToRegex(this.state.filterExcludeWords);
        return (v) => {
            const containTags = tags.some(tag => tag.test(v.title));
            return {
                tag: 'filter-exclude',
                condition: this.state.filterExclude && containTags
            };
        }
    }

    filterInclude = () => {
        const tags = DataManager.filterDSLToRegex(this.state.filterIncludeWords);
        return (v) => {
            const containTagsNot = tags.some(tag => !tag.test(v.title));
            return {
                tag: 'filter-include',
                condition: this.state.filterInclude && containTagsNot
            };
        }
    }
}

class DataManager {
    constructor(rules, state) {
        this.rules = rules;
        this.state = state;
        this.data = new Map();
        this.lazyImgLoader = new unsafeWindow.bhutils.LazyImgLoader((target) => !this.isFiltered(target));
        this.dataFilters = new DataFilter(rules, state).filters;
    }

    static filterDSLToRegex(str) {
        const toFullWord = w => `(^|\ )${w}($|\ )`;
        const str_ = str.replace(/f\:(\w+)/g, (_, w) => toFullWord(w));
        return unsafeWindow.bhutils.stringToWords(str_).map(expr => new RegExp(expr, 'i'));
    }

    isFiltered(el) {
        return el.className.includes('filtered');
    }

    applyFilters = (filters, offset = 0) => {
        const filtersToApply = Object.keys(filters)
            .filter(k => Object.hasOwn(this.dataFilters, k))
            .map(k => this.dataFilters[k]());

        if (filtersToApply.length === 0) return;

        let updates = [];
        let offset_counter = 1;
        for (const v of this.data.values()) {
            if (++offset_counter > offset) {
                for (const f of filtersToApply) {
                    const {tag, condition} = f(v);
                    updates.push(() => v.element.classList.toggle(tag, condition));
                }
            }
        }

        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
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
