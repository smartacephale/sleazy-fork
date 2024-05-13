// ==UserScript==
// @name         ThisVid.com Improved
// @license      MIT
// @namespace    http://tampermonkey.net/
// @version      4.2.6
// @description  Infinite scroll (optional). Lazy loading. Preview for private videos. Filter: duration, public/private, include/exclude terms. Check access to private vids.  Mass friend request button. Sorts messages. Download button 📼
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.thisvid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thisvid.com
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.meta.js
// ==/UserScript==
/* globals jQuery, $, listenEvents, range, Tick, waitForElementExists, downloadBlob,
     timeToSeconds, parseDOM, fetchHtml, parseCSSUrl, circularShift, fetchText, replaceElementTag,
     DataManager, PaginationManager, VueUI, DefaultState */

const SponsaaLogo = `
      Kono bangumi ha(wa) goran no suponsaa no teikyou de okurishimasu⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡟⣟⢻⢛⢟⠿⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣾⣾⣵⣧⣷⢽⢮⢧⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣯⣭⣧⣯⣮⣧⣯⣧⣯⡮⣵⣱⢕⣕⢕⣕⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⡫⡻⣝⢯⡻⣝⡟⣟⢽⡫⡟⣏⢏⡏⡝⡭⡹⡩⣻⣿⣿⣿⣿⠟⠟⢟⡟⠟⠻⠛⠟⠻⠻⣿⣿⣿⡟⠟⠻⠛⠟⠻⠻⣿⣿
      ⣿⣿⣿⣿⡿⣻⣿⣿⣿⡿⣿⣿⡿⣿⣿⢿⢿⡻⢾⠽⡺⡞⣗⠷⣿⣿⣿⡏⠀⠀⠀⣣⣤⡄⠀⠠⣄⡆⠫⠋⠻⢕⣤⡄⠀ ⢀⣤⣔⣿⣿
      ⣿⣿⣿⣿⣷⣷⣷⣾⣶⣯⣶⣶⣷⣷⣾⣷⣳⣵⣧⣳⡵⣕⣮⣞⣾⣿⡟⠄⢀⣦⠀⢘⣽⡇⠀⠨⣿⡌⠀⠣⣠⠹⠿⡭⠀ ⠐⣿⣿⣿⣿
      ⣿⣿⣿⣿⣕⣵⣱⣫⣳⡯⣯⣫⣯⣞⣮⣎⣮⣪⣢⣣⣝⣜⡜⣜⣾⣿⠃⠀⠀⠑⠀⠀⢺⡇⠀ ⢘⣾⠀⢄⢄⠘⠀⢘⢎⠀⢈⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣙⣛⣛⢻⢛⢟⢟⣛⢻⢹⣙⢳⢹⢚⢕⣓⡓⡏⣗⣿⣓⣀⣀⣿⣿⣮⢀⣀⣇⣀⣐⣿⣔⣀⢁⢀⣀⣀⣅⣀⡠⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣾⡞⣞⢷⡻⡯⡷⣗⢯⢷⢞⢷⢻⢞⢷⡳⣻⣺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣷⣵⡵⣼⢼⢼⡴⣵⢵⡵⣵⢵⡵⣵⣪⣾⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣧⣫⣪⡪⡣⣫⣪⣣⣯⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`;

const haveAccessColor = 'linear-gradient(90deg, #31623b, #212144)';
const haveNoAccessColor = 'linear-gradient(90deg, #462525, #46464a)';
const succColor = 'linear-gradient(#2f6eb34f, #66666647)';
const failColor = 'linear-gradient(rgba(179, 47, 47, 0.31), rgba(102, 102, 102, 0.28))';
const friendProfileColor = 'radial-gradient(circle, rgb(28, 42, 50) 48%, rgb(0, 0, 0) 100%)';

function $(x, e = document.body) { return e.querySelector(x); }
function $$(x, e = document.body) { return e.querySelectorAll(x); }

class THISVID_RULES {
    constructor() {
        const { href, pathname } = window.location;

        this.PAGINATION_ALLOWED = [
            /\.com\/$/,
            /\/(categories|tags?)\//,
            /\/?q=.*/,
            /\/(\w+-)?(rated|popular|private|newest|winners|updates)\/(\d+\/)?$/,
            /\/members\/\d+\/\w+_videos\//,
            /\/playlist\/\d+\//,
            /\/my_(\w+)_videos\//
        ].some(r => r.test(href));

        this.IS_MEMBER_PAGE = /\/members\/\d+\/$/.test(pathname);
        this.IS_WATCHLATER_KIND = /^\/my_(\w+)_videos\//.test(pathname);
        this.IS_MESSAGES_PAGE = /\/my_messages\//.test(pathname);
        this.IS_PLAYLIST = /^\/playlist\/\d+\//.test(pathname);
        this.IS_VIDEO_PAGE = pathname.startsWith('/videos/');

        this.PAGE_HAS_VIDEO = !!document.querySelector('.tumbpu[title], .thumbs-items .thumb-holder');
        this.PAGINATION = $('.pagination');
        this.PAGINATION_LAST = this.PAGINATION ? parseInt($('.pagination-next')?.previousElementSibling?.innerText) : 1;

        this.CONTAINER = Array.from(document.querySelectorAll('.thumbs-items')).pop();

        this.IS_OTHER_MEMBER_PAGE = !$('.my-avatar') && this.IS_MEMBER_PAGE;

        // highlight friend page profile
        this.IS_MEMBER_FRIEND = this.IS_OTHER_MEMBER_PAGE && document.querySelector('.case-left')?.innerText.includes('is in your friends');
        if (this.IS_MEMBER_FRIEND) {
            document.querySelector('.profile').style.background = friendProfileColor;
        }

        // playlist page add link to video
        if (this.IS_PLAYLIST) {
            const videoUrl = this.PLAYLIST_THUMB_URL(pathname);
            const desc = document.querySelector('.tools-left > li:nth-child(4) > .title-description');
            const link = replaceElementTag(desc, 'a');
            link.href = videoUrl;
        }
    }

    GET_THUMBS(html) {
        if (this.IS_WATCHLATER_KIND) {
            return Array.from(html.querySelectorAll('.thumb-holder'));
        }
        let thumbs = Array.from($$('.tumbpu[title]', html));
        if (thumbs.length === 0 && html.classList.contains('tumbpu')) thumbs = [html];
        return thumbs.filter(thumb => !thumb.parentElement.classList.contains('thumbs-photo'));
    }

    PLAYLIST_THUMB_URL(src) {
        return src.replace(/playlist\/\d+\/video/, () => 'videos');
    }

    THUMB_URL(thumb) {
        if (this.IS_WATCHLATER_KIND) {
            return thumb.firstElementChild.href;
        }
        let url = thumb.getAttribute('href');
        if (this.IS_PLAYLIST) url = this.PLAYLIST_THUMB_URL(url);
        return url;
    }

    URL_DATA() {
        const { origin, pathname, search } = window.location;

        let offset = parseInt(pathname.split(/(\d+\/)$/)[1] || '1');

        let pathname_ = pathname.split(/(\d+\/)$/)[0];
        if (pathname === '/') pathname_ = '/latest-updates/';

        let iteratable_url = (n) => `${origin}${pathname_}${n}/${search}`;

        if (/^\/playlist\/\d+\/video\//.test(pathname)) {
            offset = 1;
            iteratable_url = n => `${origin}${pathname}?mode=async&function=get_block&block_id=playlist_view_playlist_view&sort_by=added2fav_date&from=${n}&_=${Date.now()}`;
        }

        return {
            offset,
            iteratable_url
        }
    }

    THUMB_IMG_DATA(thumb) {
        const img = $('img', thumb);
        const privateThumb = $('.private', thumb);
        let imgSrc = img?.getAttribute('data-original');
        if (privateThumb) {
            imgSrc = parseCSSUrl(privateThumb.style.background);
            privateThumb.removeAttribute('style');
        }
        const count = img.getAttribute('data-cnt');
        if (!count || count === "6") img.removeAttribute('data-cnt');
        img.classList.remove('lazy-load');
        img.classList.add('tracking');

        if (this.IS_PLAYLIST) {
            img.onmouseover = img.onmouseout = null;
            img.removeAttribute('onmouseover');
            img.removeAttribute('onmouseout');
        }

        return { img, imgSrc };
    }

    ITERATE_PREVIEW_IMG(img) {
        const count = parseInt(img.getAttribute('data-cnt')) || 6;
        img.src = img.getAttribute('src').replace(/(\d+)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
    }

    THUMB_DATA(thumb) {
        const title = thumb.querySelector('.title').innerText.toLowerCase();
        const duration = timeToSeconds(thumb.querySelector('.thumb > .duration').textContent);
        return {
            title,
            duration
        }
    }

    IS_PRIVATE(thumbElement) {
        return thumbElement.firstElementChild.classList.contains('private');
    }
}

const RULES = new THISVID_RULES();

//====================================================================================================

function friend(id, i = 0) {
    return fetchText(FRIEND_REQUEST_URL(id))
        .then((text) => console.log(`friend request #${i} with /members/662717/${id}/`, text));
}

const FRIEND_REQUEST_URL = (id) => `${window.location.origin}/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=`;

function initFriendship() {
    if (!RULES.IS_OTHER_MEMBER_PAGE) return;

    createFriendButton();

    function getUsers(el) {
        const friendsList = el.querySelector('#list_members_friends_items');
        if (!friendsList) return [];
        return Array.from(friendsList.querySelectorAll('.tumbpu'))
            .map(e => e.href.match(/\d+/)?.[0]).filter(_ => _);
    }

    const USERS_PER_PAGE = 24;

    async function friendMemberFriends() {
        const memberId = window.location.pathname.match(/\d+/)[0];
        friend(memberId);
        let friendsEl = $('#list_members_friends');
        if (!friendsEl) return;
        friendsEl = friendsEl.firstElementChild.innerText.match(/\d+/g);
        const friendsCount = parseInt(friendsEl[friendsEl.length - 1]);
        let friends;
        if (friendsCount > 12) {
            const offset = Math.ceil(friendsCount / USERS_PER_PAGE);
            const pages = range(offset).map(o => `${window.location.origin}/members/${memberId}/friends/${o}/`);
            const pagesFetched = pages.map(p => fetchHtml(p));
            friends = (await Promise.all(pagesFetched)).flatMap(getUsers);
        } else {
            friends = getUsers(document.body);
        }
        await Promise.all(friends.map((fid, i) => friend(fid, i)));
    }

    function createFriendButton() {
        GM_addStyle('.buttons {display: flex; flex-wrap: wrap} .buttons * {align-self: center; padding: 3px; margin: 1px;}');
        const button = parseDOM('<button style="background: radial-gradient(red, blueviolet);">friend everyone</button>');
        $('.buttons').appendChild(button);
        button.addEventListener('click', () => {
            button.style.background = 'radial-gradient(#ff6114, #5babc4)';
            button.innerText = 'processing requests';
            friendMemberFriends().then(() => {
                button.style.background = 'radial-gradient(blue, lightgreen)';
                button.innerText = 'friend requests sent';
            });
        }, { once: true });
    }
}

//====================================================================================================

async function getUserData(id) {
    const url = id.includes('member') ? id : `/members/${id}/`;
    return fetchHtml(url).then(html => {
        const memberVideos = unsafeWindow.$(html).find("span:contains('Videos uploaded')").children();
        const privateVideosCount = parseInt(memberVideos[1].innerText);
        const publicVideosCount = parseInt(memberVideos[0].innerText);
        return {
            publicVideosCount,
            privateVideosCount
        };
    });
}

//====================================================================================================

function requestPrivateAccess(e, memberid) {
    e.preventDefault();
    friend(memberid);
    e.target.innerText = e.target.innerText.replace('🚑', '🍆');
}

unsafeWindow.requestPrivateAccess = requestPrivateAccess;

function checkPrivateVidsAccess() {
    document.querySelectorAll('.tumbpu > .private').forEach(t => {
        const thumb = t.parentElement;
        const url = thumb.href;
        fetchHtml(url).then(html => {
            const holder = html.querySelector('.video-holder > p');
            const haveAccess = !holder;
            thumb.style.background = haveAccess ? haveAccessColor : haveNoAccessColor;
            thumb.querySelector('.title').innerText += haveAccess ? '✅' : '❌';
            const uploaderEl = holder ? holder.querySelector('a') : html.querySelector('a.author');
            const uploader = uploaderEl.href.replace(/.*\/(\d+)\/$/, (a, b) => b);
            thumb.querySelector('.title').appendChild(parseDOM(holder ?
                                                               `<span onclick="requestPrivateAccess(event, ${uploader});"> 🚑 ${uploaderEl.innerText}</span>` :
                                                               `<span> 💅🏿 ${uploaderEl.innerText}</span>`));
        });
    });
}

//====================================================================================================

function downloader() {
    if (!RULES.IS_VIDEO_PAGE) return;
    function helper() {
        unsafeWindow.$('.fp-ui').click();
        waitForElementExists(document.body, 'video', (video) => {
            const url = video.getAttribute('src');
            const name = document.querySelector('.headline').innerText + '.mp4';
            downloadBlob(url, name);
        });
    }

    const btn = unsafeWindow.$('<li><a href="#" style="text-decoration: none;font-size: 2rem;">📼</a></li>');
    unsafeWindow.$('.share_btn').after(btn);
    btn.on('click', helper);
}

unsafeWindow.$(document).ready(downloader);

//====================================================================================================

class PreviewAnimation {
    constructor(element, delay = ANIMATION_DELAY) {
        unsafeWindow.$('img[alt!="Private"]').off();
        this.tick = new Tick(delay);
        listenEvents(element, ['mouseout', 'mouseover', 'touchstart', 'touchend'], this.animatePreview);
    }

    animatePreview = (e) => {
        const { target: el, type } = e;
        if (!el.classList.contains('tracking') || !el.getAttribute("src")) return;
        this.tick.stop();
        if (type === 'mouseover' || type === 'touchstart') {
            const orig = el.getAttribute("src");
            this.tick.start(
                () => { RULES.ITERATE_PREVIEW_IMG(el); },
                () => { el.src = orig; });
        }
    };
}

//====================================================================================================

class Router {
    constructor() {
        this.route();
    }

    route() {
        this.handleMessages();

        if (!RULES.PAGE_HAS_VIDEO) return;

        const containers = Array.from(RULES.IS_WATCHLATER_KIND ? [RULES.CONTAINER] : document.querySelectorAll('.thumbs-items:not(.thumbs-members)'));
        if (containers.length > 1 && !RULES.IS_MEMBER_PAGE) RULES.CONTAINER = containers[0];
        containers.forEach(c => {
            handleLoadedHTML(c, RULES.IS_MEMBER_PAGE ? c : RULES.CONTAINER);
        });

        new PreviewAnimation(document.body);
        new VueUI(state, stateLocale, true, checkPrivateVidsAccess);

        this.handleMemberPage();
        this.handlePaginationPage();
    }

    handlePaginationPage() {
        if (!RULES.PAGINATION_ALLOWED) return;
        stateLocale.pagIndexLast = RULES.PAGINATION_LAST;
        if (!RULES.PAGINATION) return;
        this.paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    }

    handleMemberPage() {
        if (!RULES.IS_MEMBER_PAGE) return;
        initFriendship();
    }

    handleMessages() {
        if (!RULES.IS_MESSAGES_PAGE) return;
        for (const member of $$('.user-avatar > a')) {
            getUserData(member.href).then(({ publicVideosCount, privateVideosCount }) => {
                if (privateVideosCount > 0) {
                    const success = !member.parentElement.nextElementSibling.innerText.includes('declined');
                    member.parentElement.parentElement.style.background = success ? succColor : failColor;
                }
                $('.user-comment p', member.parentElement.parentElement).innerText += `  |  videos: ${publicVideosCount} public, ${privateVideosCount} private`;
            })
        }
    }
}

//====================================================================================================

const SCROLL_RESET_DELAY = 350;
const ANIMATION_DELAY = 750;

const defaultState = new DefaultState(true);
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

const router = new Router();
