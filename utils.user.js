// ==UserScript==
// @name         utils
// @description  helper functions, intersection & mutation observers, lazyloader
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.4.5
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

function fetchCustomUA(url, ua = MOBILE_UA) {
    const headers = new Headers({ "User-Agent": ua });
    return fetch(url, { headers });
}

function fetchMobHtml(url) { return fetchCustomUA(url).then((r) => r.text()).then((h) => parseDOM(h)); }

function fetchHtml(url) { return fetch(url).then((r) => r.text()).then((h) => parseDOM(h)); }

function fetchText(url) { return fetch(url).then((r) => r.text()); }

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function retryFetch(links, fetchCallback, interval = 250, batchSize = 12, batchPause = 20000) {
    const results = [];
    const total = links.length;

    const processlinks = async (links) => {
        const failed = links.slice(batchSize);
        const batch = links.slice(0, batchSize);
        if (links.length > 0) {
            await Promise.all(batch.map(async (l, i) => {
                await wait(i*interval);
                try {
                    const res = await fetchCallback(l);
                    const isResponse = res instanceof Response;
                    if (res.ok || !isResponse) {
                        if (typeof res.text === 'function') {
                            const t = await res.text();
                            console.log(l, t);
                        }
                        if (!isResponse) { console.log(l, res); }
                        results.push(res);
                    } else {
                        throw new Error(res.statusText);
                    }
                } catch (error) {
                    failed.push(l);
                }
            }));
            console.log(`progress: ${results.length}/${total}`);
            if (failed.length > 0) {
                const failedRatio = (1 - ((links.length-failed.length) / batchSize));
                const timeout = failedRatio * batchPause + batchPause / 3;
                await wait(timeout);
                return processlinks(failed);
            }
        }
    }

    await processlinks(links);
    return results;
}

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

function downloadBlob(url, filename) {
    return fetch(url).then(t => t.blob()).then(b => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.setAttribute("download", filename);
        a.click();
    });
}

function isMob() { return /iPhone|Android/i.test(navigator.userAgent); }

function objectToFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}
