// ==UserScript==
// @name         persistent-state
// @description  simple state manager based on Vue3.reactive and localStorage
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.0
// @match        *://*/*
// ==/UserScript==
/* globals reactive, watch */

class PersistentState {
    key = "state_acephale";

    constructor(state) {
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
