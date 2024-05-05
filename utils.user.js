// ==UserScript==
// @name         utils
// @description  helper functions, intersection observer, mutation observer
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.0.3
// @match        *://*/*
// ==/UserScript==

function parseDOM(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html').body;
    return parsed.children.length > 1 ? parsed : parsed.firstElementChild;
}

function fetchHtml(url) { return fetch(url).then((r) => r.text()).then((h) => parseDOM(h)); }

function fetchText(url) { return fetch(url).then((r) => r.text()); }

function timeToSeconds(t) {
    return (t.match(/\d+/gm) || ['0'])
        .reverse()
        .map((s, i) => parseInt(s) * 60 ** i)
        .reduce((a, b) => a + b) || 0;
}

function parseIntegerOr(n, or) {
    return Number.isInteger(parseInt(n)) ? parseInt(n) : or;
}

function stringToWords(s) {
    return s.split(",").map(s => s.trim().toLowerCase()).filter(_ => _);
}

function parseCSSUrl(s) { return s.replace(/url\("|\"\).*/g, ''); }

function circularShift(n, c = 6, s = 1) { return (n + s) % c || c; }

function range(size, startAt = 1) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function listenEvents(dom, events, callback) {
    for (const e of events) {
        dom.addEventListener(e, callback, true);
    }
}

//====================================================================================================

class Observer {
    constructor(callback) {
        this.callback = callback;
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
    }

    observe(target) {
        this.observer.observe(target);
    }

    throttle(target, throttleTime) {
        this.observer.unobserve(target);
        setTimeout(() => this.observer.observe(target), throttleTime);
    }

    handleIntersection(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                this.callback(entry.target);
            }
        }
    }

    static observeWhile(target, callback, throttleTime) {
        const observer_ = new Observer(async (target) => {
            const condition = await callback();
            if (condition) observer_.throttle(target, throttleTime);
        });
        observer_.observe(target);
        return observer_;
    }
}

//====================================================================================================

function waitForElementExists(parent, selector, callback) {
    const observer = new MutationObserver((mutations) => {
        const el = parent.querySelector(selector);
        if (el) callback(el);
        observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

