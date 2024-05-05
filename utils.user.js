// ==UserScript==
// @name         utils
// @description  utils
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.0.1
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

function stringToTags(s) {
    return s.split(",").map(s => s.trim().toLowerCase()).filter(_ => _);
}

