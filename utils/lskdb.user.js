// ==UserScript==
// @name         lskdb
// @description  locale storage key database
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.1.2
// @match        *://*/*
// @downloadURL https://update.greasyfork.org/scripts/497286/lskdb.user.js
// @updateURL https://update.greasyfork.org/scripts/497286/lskdb.meta.js
// ==/UserScript==

/*
  raison d'etre for this insane degenerative garbage:
  if you have to store 1000+ unique keys,
  you don't have to parse whole json array to check one value
*/

class LSKDB {
    constructor(prefix = 'lsm-', lockKey = 'lsmngr-lock') {
        this.prefix = prefix;
        this.lockKey = lockKey;
        // migration
        const old = localStorage.getItem('lsmngr');
        if (!old) return;
        const list = JSON.parse(old);
        localStorage.removeItem('lsmngr');
        list.forEach(l => {
            const i = localStorage.getItem(l);
            if (i) {
                const v = JSON.parse(i);
                v.forEach(x => this.setKey(x));
            }
            localStorage.removeItem(l);
        });
    }

    getAllKeys() {
        const res = [];
        for (const key in localStorage) {
            if (key.startsWith(this.prefix)) {
                res.push(key);
            }
        }
        return res.map(r => r.slice(this.prefix.length));
    }

    getKeys(n = 12) {
        const res = [];
        for (const key in localStorage) {
            if (res.length >= n) break;
            if (key.startsWith(this.prefix)) {
                res.push(key);
            }
        }
        res.forEach(k => localStorage.removeItem(k));
        return res.map(r => r.slice(this.prefix.length));
    }

    hasKey(key) {
        return Object.hasOwn(localStorage, `${this.prefix}${key}`);
    }

    removeKey(key) {
        localStorage.removeItem(`${this.prefix}${key}`);
    }

    setKey(key) {
        localStorage.setItem(`${this.prefix}${key}`, '');
    }

    isLocked() {
        const lock = localStorage.getItem(this.lockKey);
        const locktime = 5 * 60 * 1000;
        return !(!lock || Date.now() - lock > locktime);
    }

    lock(value) {
        if (value) {
            localStorage.setItem(this.lockKey, Date.now());
        } else {
            localStorage.removeItem(this.lockKey);
        }
    }
}
