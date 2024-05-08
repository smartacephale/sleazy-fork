// ==UserScript==
// @name         persistent-state
// @description  simple state manager based on Vue3.reactive and localStorage
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.1
// @match        *://*/*
// ==/UserScript==
/* globals reactive, watch */

class PersistentState {
    constructor(state, key = "state_acephale") {
        this.key = key;
        this.state = reactive(state);
        this.sync();
        this.watchPersistence();
    }

    sync() {
        this.trySetFromLocalStorage();
        window.addEventListener('focus', this.trySetFromLocalStorage);
    }

    watchPersistence() {
        watch(this.state, (value) => {
            this.saveToLocalStorage(this.key, value);
        });
    }

    saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    trySetFromLocalStorage = () => {
        const localStorageValue = localStorage.getItem(this.key);
        if (localStorageValue !== null) {
            const prevState = JSON.parse(localStorageValue);
            for (const prop of Object.keys(prevState)) {
                this.state[prop] = prevState[prop];
            }
        }
    }
}



class DefaultState {
    DEFAULT_STATE = {
        filterDurationFrom: 0,
        filterDurationTo: 600,
        filterDuration: false,
        filterExcludeWords: "",
        filterExclude: false,
        filterIncludeWords: "",
        filterInclude: false,
        infiniteScrollEnabled: true,
        uiEnabled: true,
    };

    DEFAAULT_STATE_PRIVATE_FILTERS = {
        filterPrivate: false,
        filterPublic: false
    }

    constructor(privateFilter = false) {
        if (privateFilter) {
            Object.assign(this.DEFAULT_STATE, this.DEFAAULT_STATE_PRIVATE_FILTERS);
        }

        const { state } = new PersistentState(this.DEFAULT_STATE);

        this.state = state;

        this.stateLocale = reactive({
            pagIndexLast: 1,
            pagIndexCur: 1,
        });
    }

    setWatchers(filter_) {
        const { state } = this;

        if (Object.hasOwn(state, 'filterPrivate')) {
            watch(() => state.filterPrivate, () => filter_({ filterPrivate: true }));
            watch(() => state.filterPublic, () => filter_({ filterPublic: true }));
        }

        watch([() => state.filterDurationFrom, () => state.filterDurationTo], (a, b) => {
            state.filterDurationFrom = parseIntegerOr(a[0], b[0]);
            state.filterDurationTo = parseIntegerOr(a[1], b[1]);
            if (state.filterDuration) filter_({ filterDuration: true });
        });
        watch(() => state.filterDuration, () => filter_({ filterDuration: true }));

        watch(() => state.filterExclude, () => filter_({ filterExclude: true }));
        watch(() => state.filterExcludeWords, () => {
            if (state.filterExclude) filter_({ filterExclude: true });
        }, { deep: true });

        watch(() => state.filterInclude, () => filter_({ filterInclude: true }));
        watch(() => state.filterIncludeWords, () => {
            if (state.filterInclude) filter_({ filterInclude: true });
        }, { deep: true });
    }
}

