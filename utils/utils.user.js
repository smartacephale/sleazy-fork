// ==UserScript==
// @name         utils
// @description  helper functions, intersection & mutation observers, lazyloader
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.8.3
// @match        *://*/*
// @downloadURL https://update.greasyfork.org/scripts/494206/utils.user.js
// @updateURL https://update.greasyfork.org/scripts/494206/utils.meta.js
// ==/UserScript==

function findNextSibling(el) {
    if (el.nextElementSibling) return el.nextElementSibling;
    if (el.parentElement) return findNextSibling(el.parentElement);
    return null;
}

function parseDOM(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html').body;
    return parsed.children.length > 1 ? parsed : parsed.firstElementChild;
}

const MOBILE_UA = [
    'Mozilla/5.0 (Linux; Android 10; K)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/114.0.0.0 Mobile Safari/537.36'].join(' ');

function fetchWith(url, options = { html: false, mobile: false }) {
    const reqOpts = {};
    if (options.mobile) Object.assign(reqOpts, { headers: new Headers({ "User-Agent": MOBILE_UA }) });
    return fetch(url, reqOpts).then((r) => r.text()).then(r => options.html ? parseDOM(r) : r);
}

const fetchHtml = (url) => fetchWith(url, { html: true });
const fetchText = (url) => fetchWith(url);

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// do async one at time
class SyncPull {
    pull = [];
    lock = false;

    getHighPriorityFirst(p = 0) {
        if (p > 3 || this.pull.length === 0) return undefined;
        const i = this.pull.findIndex(e => e.p === p);
        if (i >= 0) {
            const res = this.pull[i].v;
            this.pull = this.pull.slice(0,i).concat(this.pull.slice(i+1));
            return res;
        }
        else return this.getHighPriorityFirst(p+1);
    }

    *pullGenerator() {
        while(this.pull.length > 0) {
            yield this.getHighPriorityFirst();
        }
    }

    async processPull() {
        if (!this.lock) {
            this.lock = true;
            for await (const f of this.pullGenerator()) {
                await f();
            }
            this.lock = false;
        }
    }

    push(x) {
        this.pull.push(x);
        this.processPull();
    }
}

// https://2ality.com/2016/10/asynchronous-iteration.html
async function computeAsyncOneAtTime(iterable) {
    const res = [];
    for await (const f of iterable) {
        res.push(await f());
    }
    return res;
}

function timeToSeconds(t) {
    return (t?.match(/\d+/gm) || [0])
        .reverse()
        .map((s, i) => parseInt(s) * 60 ** i)
        .reduce((a, b) => a + b);
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

class LazyImgLoader {
    constructor(callback, attributeName = 'data-lazy-load', removeTagAfter = true) {
        this.attributeName = attributeName;
        this.removeTagAfter = removeTagAfter;
        this.lazyImgObserver = new Observer((target) => {
            callback(target, this.delazify);
        });
    }

    lazify(target, img, imgSrc) {
        if (!img || !imgSrc) return;
        img.setAttribute(this.attributeName, imgSrc);
        img.src = '';
        this.lazyImgObserver.observe(img);
    }

    delazify = (target) => {
        this.lazyImgObserver.observer.unobserve(target);
        target.src = target.getAttribute(this.attributeName);
        if (this.removeTagAfter) target.removeAttribute(this.attributeName);
    }

    static create(callback) {
        const lazyImgLoader = new LazyImgLoader((target, delazify) => {
            if (callback(target)) {
                delazify(target);
            }
        });
        return lazyImgLoader;
    }
}

function waitForElementExists(parent, selector, callback) {
    const observer = new MutationObserver((mutations) => {
        const el = parent.querySelector(selector);
        if (el) {
            observer.disconnect();
            callback(el);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function watchElementChildrenCount(element, callback) {
    let count = element.children.length;
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                if (count !== element.children.length) {
                    count = element.children.length;
                    callback(observer, count);
                }
            }
        }
    });
    observer.observe(element, { childList: true });
}

function watchDomChangesWithThrottle(element, callback, throttle = 1000, options = { childList: true, subtree: true, attributes: true }) {
    let lastMutationTime;
    let timeout;
    const observer = new MutationObserver((mutationList, observer) => {
        const now = Date.now();
        if (lastMutationTime && now - lastMutationTime < throttle) {
            timeout && clearTimeout(timeout);
        }
        timeout = setTimeout(callback, throttle);
        lastMutationTime = now;
    });
    observer.observe(element, options);
}

class Tick {
    constructor(delay, startImmediate = true) {
        this.tick = null;
        this.delay = delay;
        this.startImmediate = startImmediate;
    }

    start(callback, callbackFinal = null) {
        this.stop();
        this.callbackFinal = callbackFinal;
        if (this.startImmediate) callback();
        this.tick = setInterval(callback, this.delay);
    }

    stop() {
        if(this.tick !== null) {
            clearInterval(this.tick);
            this.tick = null;
        }
        if (this.callbackFinal) {
            this.callbackFinal();
            this.callbackFinal = null;
        }
    }
}

function copyAttributes(target, source) {
    for (const attr of source.attributes) {
        target.setAttribute(attr.nodeName, attr.nodeValue);
    }
}

function replaceElementTag(e, tagName) {
    const newTagElement = document.createElement(tagName);
    copyAttributes(newTagElement, e);
    newTagElement.innerHTML = e.innerHTML;
    e.parentNode.replaceChild(newTagElement, e);
    return newTagElement;
}

function getAllUniqueParents(elements) {
    return Array.from(elements).reduce((acc, v) => acc.includes(v.parentElement) ? acc : [...acc, v.parentElement], []);
}

function isMob() { return /iPhone|Android/i.test(navigator.userAgent); }

function objectToFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}

// "data:02;body+head:async;void:;zero:;"
function parseDataParams(str) {
    const params = str.split(';').flatMap(s => {
        const parsed = s.match(/([\+\w+]+):(\w+)?/);
        const value = parsed?.[2];
        if (value) return parsed[1].split('+').map(p => ({[p]: value}));
    }).filter(_ => _);
    return Object.assign({}, ...params);
}

function sanitizeStr(str) {
    return str?.replace(/\n|\t/, ' ').replace(/ {2,}/, ' ').trim().toLowerCase() || "";
}

function chunks(arr, n) {
    const res = [];
    for (let i = 0; i < arr.length; i += n) {
        res.push(arr.slice(i, i + n));
    }
    return res;
}

function downloader(options = { append: "", after: "", button: "", cbBefore: () => {} }) {
    const btn = parseDOM(options.button);

    if (options.append) document.querySelector(options.append).append(btn);
    if (options.after) document.querySelector(options.after).after(btn);

    btn.addEventListener('click', (e) => {
        e.preventDefault();

        if (options.cbBefore) options.cbBefore();

        waitForElementExists(document.body, 'video', (video) => {
            window.location.href = video.getAttribute('src');
        });
    });
}

