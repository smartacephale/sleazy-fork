// ==UserScript==
// @name         missav.com Improved
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.missav.*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=missav.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.1/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.meta.js
// ==/UserScript==

const { timeToSeconds, sanitizeStr, DataManager, InfiniteScroller } = window.bhutils;
Object.assign(unsafeWindow, { bhutils: window.bhutils });
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

const LOGO = `
⢆⠕⡡⡑⢌⠢⡑⢌⠢⡑⠔⢌⠪⡐⢌⢊⠢⡑⢌⠢⡑⡡⡑⢌⡊⡆⣕⡱⣌⣦⣎⣦⣧⣎⡆⢕⠐⢔⠨⡨⢂⠅⢕⠨⡂⡅⡢⢡⠢⡑⢌⠢⡢⢱⠰⡨⢢⢑⠌⡆
⠕⡨⢂⠪⡐⡑⢌⠢⡑⢌⢌⠢⡡⢊⠔⡐⢅⠪⡐⢌⢢⡲⣜⡵⣽⣽⣾⣿⣿⣿⣿⣿⣿⣿⣿⡎⡜⢔⢱⠨⡢⠱⡡⠱⠨⠢⠱⡑⠜⠌⢆⠣⡊⡢⢃⠣⡃⡣⢃⠣
⢇⢪⠸⡨⢌⠜⢌⠜⠌⢆⢕⠱⡘⢔⢑⠜⡐⢕⠸⡸⡷⣿⣻⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⡿⣄⢕⣐⢅⢆⡕⣌⢎⢬⢕⢕⢜⢜⢜⢆⢗⢜⡔⣇⢧⢳⢸⢪⡣
⢱⢐⢕⢔⣑⢌⢆⡕⡕⡥⡢⡕⡬⡲⡰⡱⡪⡲⣱⣻⣯⣷⣿⣻⣽⣿⣿⢿⣿⣟⣯⣷⣿⣿⣻⣿⡝⣜⢜⢜⡜⣜⢜⢜⢕⢕⢕⢜⢜⢜⢎⢎⢇⢇⡇⡧⡳⡹⡜⡮
⢸⢱⢕⢇⢇⢗⢕⢵⢱⢣⢳⢱⢕⢵⢹⢜⢎⢞⢼⣽⡾⣷⣻⣟⣞⣷⣿⣿⣿⣿⢿⣟⣿⣟⣿⣿⢸⢱⡣⡣⡣⡣⡣⡳⡱⡹⡌⢜⢜⢕⢕⢵⢹⢸⡸⡜⡜⡎⡮⡺
⡕⡕⣕⢕⢇⢏⢎⢇⢗⢕⢇⢧⢳⢱⢱⡱⡱⡕⡵⣿⣽⢿⣽⡯⣿⣻⣿⣟⣷⣻⡿⣯⣿⢯⢷⣻⢇⢇⢧⢣⢣⢣⡣⡣⡣⡣⡣⢱⢱⢱⢱⢕⢕⢕⢕⢕⢝⢜⢎⢎
⢜⢜⢜⢜⢎⢎⢇⢗⢕⢕⢇⢇⢧⢳⢱⢱⢱⢕⢽⢷⣟⣿⢾⣟⣿⢽⣿⣿⣽⣿⡿⡯⡯⣟⡵⣗⢕⢕⢝⡜⡜⡜⡜⡜⡜⡜⡬⢸⢸⢸⢸⢸⢸⢱⢱⢹⢸⢱⡱⡹
⡇⡏⡎⡎⡎⡮⡪⣪⢪⢣⡣⡳⡱⡱⡱⡱⡕⣕⣽⢿⣯⡿⣿⡿⣾⣻⡿⣿⣳⣿⢯⣿⣽⣗⣿⣳⣵⢵⢹⢸⢸⢸⢸⢸⢸⢸⢂⠕⡕⡕⡕⡕⡕⡕⣕⢕⢇⢇⢇⢏
⢪⢪⡪⡪⣪⢪⡪⡪⡪⡣⡺⡸⡸⡸⡪⡪⡪⡲⣽⣻⡷⣿⣿⣿⣿⣾⢿⣿⣵⣿⣽⣿⣿⣻⣿⣿⡮⡣⡣⣣⡣⡣⡣⡣⡣⡣⡃⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡣⡳
⢸⢸⢸⢸⢸⢸⢸⢸⢱⡱⡕⡕⡝⡜⡜⡎⡮⡪⡺⣽⣟⣯⣿⡿⣟⡿⣿⣿⣻⡽⣟⢟⢞⡕⡗⣕⣝⣾⣽⣿⣿⡿⣷⣕⢕⢕⠕⡸⡸⡘⡬⡪⡪⡪⡪⡪⡪⡣⣓⢝
⢸⢸⢸⢸⢸⢸⢜⡪⡪⡪⡪⡪⡪⣪⢪⡪⣪⣮⢿⣺⣯⣿⣷⣟⡞⡞⡮⡹⡕⡏⡮⡳⡱⣕⢽⣺⣾⣿⢿⣻⡿⣿⣿⣿⢜⢔⠕⡅⡇⢇⢇⢎⢎⢎⢎⢎⢎⢎⢎⢮
⡘⡜⡜⡜⡜⡜⡆⡇⡇⡇⡇⡇⡇⡇⡧⣳⣿⣽⣿⣻⣿⣿⣿⣿⣿⣎⣗⢝⡜⣜⢵⢝⣜⣾⣿⣿⣿⣻⣽⣿⣿⣿⣿⣿⢱⢱⠡⡃⡎⡎⢎⢪⢸⢸⢘⢜⢜⢜⢜⢜
⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⣺⡿⣷⢿⣿⣽⣿⣾⣻⣿⣿⣿⣿⣷⣧⣧⣳⣷⢟⣟⣽⣿⣳⣟⣾⣿⣿⣿⣿⣿⢸⢰⠱⡡⢣⢣⢣⢣⢣⠣⡣⡣⡣⡣⡣⡣
⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡺⣟⣿⣻⣿⣿⣿⣿⣾⣻⣿⣿⣽⣿⣽⣿⣿⣽⣝⣞⢟⣗⢽⣻⣿⣿⣿⣿⣾⡇⡇⡕⢕⠅⡣⡣⡣⡕⡜⡜⡜⡜⢜⢜⢜⢜
⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⣿⣯⣿⣻⣿⣷⣿⣿⣻⣿⡿⣿⣿⣿⣿⣾⣿⣿⣞⣗⢗⣯⣻⣿⣿⣿⣽⣿⡇⡕⡜⡌⡂⡇⡏⣣⢣⢪⠪⡢⡣⡣⡣⡣⡣
⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢗⡿⣾⣯⣿⣿⣿⣿⣿⣷⡽⡿⡿⣿⣻⣻⣿⢿⣿⣟⡿⣿⢽⣾⣿⣿⣽⣿⣿⢕⠕⡜⢌⠢⡱⣱⡪⡊⡆⡇⢇⢣⢣⠣⡣⡣
⠱⡱⡱⡱⡑⡕⡕⢕⢱⢑⢕⢕⢕⢕⢕⣿⣻⣾⣻⣿⣟⣟⣿⣿⣽⣿⡿⣿⣻⣿⣾⣿⡿⡿⣿⣿⣿⣿⣫⣿⣻⣽⣾⡇⡇⢎⢎⠢⡱⡸⡸⡨⢪⢸⠸⡸⡸⡸⡸⡸
⢱⢱⢱⢸⢸⢸⢸⢸⢸⢸⢸⢰⢱⢑⢕⣯⣿⢾⣻⣿⣽⣿⣻⣿⣯⣷⣿⣿⣿⡷⡿⡿⣿⣿⣷⣻⣽⣷⣿⣿⣿⣿⣿⣇⢇⢣⠪⡐⡱⡸⣆⢇⠕⡅⢇⢇⢎⢪⢸⢸
⡨⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⣺⣿⣽⢿⣿⣿⣿⣿⣿⣿⡿⣟⡿⣽⣺⣝⡯⡿⣽⣺⢯⢿⣻⣿⣿⣿⣿⣿⢿⣿⠰⡑⡕⡨⢌⢗⢕⢱⢑⠕⡕⡜⢜⢜⢜⢜
⡸⡸⣘⠬⡪⡪⡪⢪⠪⡪⡪⢪⢪⢪⣿⢷⣟⣿⣿⣿⣿⣻⣿⣟⣞⣗⣯⢷⣳⣗⡿⣽⣳⣽⡽⣿⢽⣿⣿⣿⣽⣾⣿⡗⢕⢱⢑⢌⢢⠣⡪⢢⢃⢇⢕⢜⢜⢔⢕⢜
⣊⢎⢆⢇⢇⢇⢎⢎⢎⢎⢎⢎⢎⣾⣟⣿⣽⢿⣿⣷⣿⣿⣿⢽⡾⣵⣭⣽⣼⣼⣼⣼⣴⣵⡾⡾⡫⢽⣷⣿⣿⣿⣿⡏⡪⡢⢣⢊⢢⠣⡣⢣⢱⢡⢣⢱⢡⢣⢱⢑
⢆⢇⢇⢣⢣⢣⢣⢣⢣⢣⠣⡣⡱⣷⣟⣿⢾⣿⣿⣿⣿⣿⡳⡱⡑⠝⢯⡿⣿⣽⣟⣿⠯⡣⡃⢎⠜⢜⣿⣿⣿⣿⣿⢚⣎⢞⣧⡪⠢⡣⡃⡇⡕⡜⢔⠕⡅⡇⡣⡣
⡇⡇⡣⡣⡣⡱⡸⡸⡨⡒⡕⡕⡕⣿⣽⣟⣿⣻⡿⡻⣯⣗⢇⢇⢊⢊⠢⡙⣿⣯⡿⢡⢑⠔⢌⠢⡑⢕⢻⢏⢛⠾⣿⠪⡒⡵⡨⡷⡕⡅⡇⢎⠆⡇⡣⡣⢣⢱⢑⢅
⡜⢜⢜⢌⢎⠎⡎⡪⡪⢪⠪⡪⣺⡿⣷⣟⣯⢗⢕⠡⡹⡱⡑⢔⠡⢂⢑⢐⢹⡗⢕⢅⠢⢊⢐⠐⢌⠢⡹⡨⠂⢕⢜⢕⠱⡱⡹⣾⢮⣮⣪⡸⡘⡌⡎⡜⢜⢌⢎⢎
⢪⢪⢢⢣⠣⡣⡣⡣⢣⢣⠣⣝⣿⣻⣽⡾⣿⢱⢂⠕⡨⠊⡌⡢⠨⢂⠂⡂⣹⢑⠕⢄⠕⡐⠄⡑⡰⢑⠡⢂⠅⡑⡜⡐⢕⢱⢹⡺⣟⣾⣽⣻⢷⣧⠪⡊⡎⡪⡢⡣
⡣⡱⡑⡕⢕⢕⢜⢜⠜⡌⡎⡎⣾⣿⣽⣟⣯⣳⢜⠔⡌⢌⢂⡊⡪⡐⡐⡐⣾⢐⢕⠡⡂⡢⢡⢘⢐⢐⠨⡐⡨⡂⢧⢑⢕⢱⢱⢝⣿⣳⣟⣾⣻⢾⣿⡨⡪⡊⡆⡇
⡕⡕⢕⠕⡕⡅⡇⡎⢎⢪⢊⢎⢿⣞⣷⣿⣗⡵⣣⢳⢘⢔⠡⡊⡢⡱⡰⣸⡗⡜⡼⡸⡐⣔⠪⡐⢅⠢⡑⠔⡌⡌⢆⢕⢜⢜⢜⢮⣷⣻⣞⢾⣺⣟⡾⣷⢱⠸⡘⡌
⡱⡸⡸⡸⡘⡌⡎⡪⡪⡪⢪⢮⣿⢯⣿⢾⣿⡮⣇⠇⢧⡣⡓⣌⡒⡌⡮⡺⡪⡪⣇⢯⢪⢎⢎⢊⠎⡎⡢⡱⡱⡑⡌⡎⡎⡮⣺⣽⣞⡷⣽⢻⡺⡮⣟⣟⠜⡜⢜⢜
⢸⢨⢪⢢⠣⡣⡣⢣⠣⡪⣺⢿⣽⣿⡽⡯⣞⡿⣾⣕⡕⣪⡪⣢⡱⡱⡱⣼⣮⣯⡪⣾⢵⣝⢎⡎⡎⡎⡪⡪⡪⡪⡪⣪⣣⣯⡷⣟⡾⣝⢮⣳⢽⢽⡽⡇⡣⡣⢣⢱
⢜⢜⢔⢕⢕⢕⢜⢜⢜⠜⣜⣿⣽⡾⣟⣯⢷⢯⣟⣗⣿⢶⣝⣼⡸⠼⡸⡸⡱⡫⡹⡙⡝⡝⡟⡞⡽⡜⡮⡺⡪⡮⣯⡾⣾⢷⣿⢿⢽⢽⢵⣫⣯⢿⢋⢎⢜⢌⢎⢎
⢸⢰⠱⡱⡸⡰⡱⡱⡸⡘⡬⣷⣟⣿⣻⣽⣻⡽⣷⣻⡾⣓⢢⠲⡨⡣⡱⡸⡨⡊⡆⢇⢣⢱⢑⢕⠱⡑⡕⢅⢇⢮⣷⢿⣻⣟⣯⢯⢯⢾⢽⡾⡙⡅⢇⢪⠢⡣⡱⡸
⢕⠕⡕⢕⢜⢌⢆⢇⢎⢎⢪⢺⣯⣯⡿⣯⡷⣿⢽⡿⡨⡢⢣⠣⡣⡱⢱⢘⢌⢎⢜⢜⢸⠰⡑⡅⢇⠇⡎⡪⣪⣿⡽⣟⣿⣽⣳⢯⢿⣽⡛⡅⢇⢕⢱⢡⢣⢱⢸⢨
⠀⢣⠣⡣⡱⡑⡅⡇⢎⢪⠸⡼⣟⣾⣻⣯⢿⢽⢯⡗⢜⢌⢆⢇⢣⠪⡊⡎⡢⢣⠪⡂⡇⡕⢕⠱⡑⢕⢅⢷⣻⣾⣻⢿⣽⡺⡺⣽⢿⠪⡂⢇⠕⡜⡰⡑⡜⢔⢕⠱
⢂⠀⠣⢑⠡⢃⢑⢘⢘⠘⠌⣟⣯⣟⣾⢽⣯⢿⣽⣻⠨⢂⢃⢊⢂⢃⠣⢑⠡⢃⢑⠑⢌⢘⢈⠪⢘⠨⣪⣿⣽⣳⣿⣻⢾⣝⣝⣾⢃⠡⠁⢅⠡⢁⢊⠨⠨⠨⠈⡊
⠐⡡⠀⠡⢐⠐⡐⡀⡂⠌⣸⡺⣳⣻⣞⣿⢽⣽⢾⣯⠈⡐⠠⠁⡂⠡⠨⠠⠁⠅⠌⠨⠠⢁⠂⠡⠁⠌⡉⡞⡾⡽⣞⣯⡿⣯⣷⣟⣆⠈⡈⠠⠐⠀⠄⠂⠀⠁⡂⠔
⠂⠌⠠⠁⢐⠐⢀⠂⠠⠁⡳⣳⢯⢷⣻⡾⣟⣾⣻⣞⠀⠄⢈⠠⠀⢁⠀⡁⢈⠀⡁⢈⠠⠀⢈⠀⠡⠀⠠⢈⢂⢻⣯⢷⣻⣽⢾⣽⢾⡀⠠⠐⠀⠐⠀⠄⠁⠡⠀⢂
⠄⠈⠌⢂⠀⢂⢂⠄⠅⡂⡾⡽⣝⣯⡿⡯⣿⣺⢷⣻⡄⠂⢀⠠⠈⠀⠠⠀⠂⠀⠄⠀⠄⠈⠀⠐⠀⠈⠀⠀⠂⢱⠍⢿⢽⢾⢻⢽⣯⢷⣄⡀⠄⠂⠁⠀⡁⠨⠀⠄
⢁⠐⠊⠠⠀⠂⠢⠨⢂⢂⢯⡯⣗⣯⣟⢸⡯⡢⣟⣷⡃⠠⠀⠄⡀⠂⠄⢂⠐⡀⡂⢐⠀⡂⠌⡀⢂⠡⠈⠠⠐⡸⡧⣿⢽⢧⠱⡐⢝⣯⢿⡦⢀⠠⠀⡁⠀⢐⠀⠂
⣖⠀⡊⠨⡂⠨⣨⡪⠦⠖⡫⣏⢯⢞⡦⡽⡪⡌⣗⣯⠡⠈⡀⢁⠠⠈⡀⠄⠠⠀⠠⠀⠄⠠⠀⠄⠠⠀⡈⠀⠄⢸⠅⣪⡯⣻⠬⡬⡢⡹⡽⡉⠀⠀⡀⠂⡁⢐⠀⡁
⠳⠑⡂⡑⠉⡐⠄⡂⡂⡡⣺⡪⣯⣫⡇⢾⡜⠬⣞⡮⡇⠠⠐⡀⠄⢂⢀⠂⡂⢁⠂⠡⠐⢐⠐⢈⠠⠐⡀⡐⢌⢜⡵⣜⢧⡻⡜⢔⢜⢼⣝⢗⠈⡀⠄⡁⡐⢐⠄⢂
⡠⠡⡐⠄⡁⠆⠕⢌⠔⠔⠜⡞⠷⢽⠽⡜⡯⡇⡿⢝⠇⡨⢐⠠⠨⠠⢐⠠⠂⡂⠌⠄⠅⡂⠌⡐⠄⠅⠄⠪⠆⠯⠺⠝⠝⠣⠃⡓⠚⢙⠊⢃⠁⡂⠅⡂⢢⢑⢕⠁`;

GM_addStyle(`#tapermonkey-app input[type=checkbox] { all: revert-layer; }`);

class MISSAV_RULES {
    delay = 300;

    constructor() {
        this.paginationElement = document.querySelector('a[href^="https://missav."][aria-label]')?.parentElement;
        this.paginationLast = Math.max(
          ...Array.from(document.querySelectorAll('a[href^="https://missav."][aria-label]'), (a) => parseInt(a.href.match(/\d+/g)?.pop() || 1)));
        Object.assign(this, this.URL_DATA());
        this.CONTAINER = this.GET_THUMBS(document.body)?.[0].parentElement;
    }

    THUMB_URL(thumb) {
      return thumb.querySelector('a').href;
    }

    GET_THUMBS(html) {
        return Array.from(html.querySelectorAll('div > .thumbnail.group'), (e) => e.parentElement);
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('img.w-full');
        const imgSrc = img?.getAttribute('data-src');
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const title = sanitizeStr(thumb.querySelector('div > div > a.text-secondary')?.innerText);
        const duration = timeToSeconds(thumb.querySelector('div > a > span.text-xs')?.innerText);
        return { title, duration };
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const paginationOffset = parseInt(url.searchParams.get('page')) || 1;

        const paginationUrlGenerator = n => {
            url.searchParams.set('page', n);
            return url.href;
        }

        return { paginationOffset, paginationUrlGenerator }
    }
}

const RULES = new MISSAV_RULES();

//====================================================================================================

function createInfiniteScroller() {
  const iscroller = new InfiniteScroller({
    enabled: state.infiniteScrollEnabled,
    handleHtmlCallback: handleLoadedHTML,
    ...RULES,
  }).onScroll(({paginationLast, paginationOffset}) => {
    stateLocale.pagIndexLast = paginationLast;
    stateLocale.pagIndexCur = paginationOffset;
  }, true);

  store.subscribe(() => {
    iscroller.enabled = state.infiniteScrollEnabled;
  });
}

//====================================================================================================

function route() {
  if (RULES.CONTAINER) {
      handleLoadedHTML(RULES.CONTAINER);
  }

  if (RULES.paginationElement) {
    createInfiniteScroller();
  }

  new JabroniOutfitUI(store);
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);
route();
