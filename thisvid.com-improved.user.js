// ==UserScript==
// @name         ThisVid.com Improved
// @license      MIT
// @namespace    http://tampermonkey.net/
// @version      4.4.3
// @description  Infinite scroll (optional). Preview for private videos. Filter: duration, public/private, include/exclude terms. Check access to private vids.  Mass friend request button. Sorts messages. Download button 📼
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.thisvid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thisvid.com
// @grant        GM_addStyle
// @grant        GM_download
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1378559
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js?version=1390557
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @require      https://update.greasyfork.org/scripts/497286/lskdb.user.js?version=1391030
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.meta.js
// ==/UserScript==
/* globals $ listenEvents range Tick waitForElementExists downloadBlob isMob
     timeToSeconds parseDOM fetchHtml parseCSSUrl circularShift fetchText replaceElementTag
     DataManager PaginationManager VueUI DefaultState LSKDB */

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

        this.MY_ID = document.querySelector('[target="_self"]')?.href.match(/\/(\d+)\//)[1] || null;
        this.LOGGED_IN = this.MY_ID !== null;

        this.PAGE_HAS_VIDEO = !!document.querySelector('.tumbpu[title], .thumbs-items .thumb-holder');
        this.PAGINATION = document.querySelector('.pagination');
        this.PAGINATION_LAST = this.GET_PAGINATION_LAST();

        this.CONTAINER = Array.from(document.querySelectorAll('.thumbs-items')).pop();

        this.IS_MY_MEMBER_PAGE = !!document.querySelector('.my-avatar');
        this.IS_OTHER_MEMBER_PAGE = !this.IS_MY_MEMBER_PAGE && this.IS_MEMBER_PAGE;

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

    GET_PAGINATION_LAST(doc) {
        return parseInt((doc || document).querySelector('.pagination-next')?.previousElementSibling?.innerText) || 1;
    }

    GET_THUMBS(html) {
        if (this.IS_WATCHLATER_KIND) {
            return Array.from(html.querySelectorAll('.thumb-holder'));
        }
        let thumbs = Array.from(html.querySelectorAll('.tumbpu[title]'));
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

    URL_DATA(proxyLocation) {
        const { origin, pathname, search } = proxyLocation || window.location;

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
        const img = thumb.querySelector('img');
        const privateThumb = thumb.querySelector('.private');
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
    return fetchText(FRIEND_REQUEST_URL(id)).then((text) => console.log(`#${i} * ${id}`, text));
}

const FRIEND_REQUEST_URL = (id) => `${window.location.origin}/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=`;

const USERS_PER_PAGE = 24;

async function getMemberFriends(memberId) {
    const doc = await fetchHtml(`${window.location.origin}/members/${memberId}/`);
    let friendsEl = doc.querySelector('#list_members_friends');
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
    return friends;
}

function getUsers(el) {
    const friendsList = el.querySelector('#list_members_friends_items');
    if (!friendsList) return [];
    return Array.from(friendsList.querySelectorAll('.tumbpu'))
        .map(e => e.href.match(/\d+/)?.[0]).filter(_ => _);
}

async function friendMemberFriends() {
    const memberId = window.location.pathname.match(/\d+/)[0];
    friend(memberId);
    const friends = await getMemberFriends(memberId);
    await Promise.all(friends.map((fid, i) => friend(fid, i)));
}

function initFriendship() {
    createFriendButton();

    function createFriendButton() {
        GM_addStyle('.buttons {display: flex; flex-wrap: wrap} .buttons * {align-self: center; padding: 3px; margin: 1px;}');
        const button = parseDOM('<button style="background: radial-gradient(red, blueviolet);">friend everyone</button>');
        document.querySelector('.buttons').appendChild(button);
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
    function getVideoAndDownload() {
        unsafeWindow.$('.fp-ui').click();
        waitForElementExists(document.body, 'video', (video) => {
            const url = video.getAttribute('src');
            const name = `${document.querySelector('.headline').innerText}.mp4`;
            const onprogress = (e) => {
                const p = 100 * (e.loaded / e.total);
                btn.css('background', `linear-gradient(90deg, #636f5d, transparent ${p}%)`);
            }
            if (!isMob()) {
                GM_download({ url, name, saveAs: true, onprogress });
            } else {
                downloadBlob(url, name);
            }
        });
    }

    const btn = unsafeWindow.$('<li><a href="#" style="text-decoration: none;font-size: 2rem;">📼</a></li>');
    unsafeWindow.$('.share_btn').after(btn);
    btn.on('click', getVideoAndDownload);
}

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

function highlightMessages() {
    for (const member of document.querySelectorAll('.user-avatar > a')) {
        getUserData(member.href).then(({ publicVideosCount, privateVideosCount }) => {
            if (privateVideosCount > 0) {
                const success = !member.parentElement.nextElementSibling.innerText.includes('declined');
                member.parentElement.parentElement.style.background = success ? succColor : failColor;
            }
            member.parentElement.parentElement.querySelector('.user-comment p').innerText +=
                `  |  videos: ${publicVideosCount} public, ${privateVideosCount} private`;
        });
    }
}

//====================================================================================================

const lskdb = new LSKDB();
const PRIVATE_FEED_KEY = 'prv-feed';

async function getMemberVideos(Id, type = 'private') {
    const url = `${window.location.origin}/members/${Id}/${type}_videos/`;
    const doc = await fetchHtml(url);
    let name = doc.querySelector('.headline').innerText.trim();
    const videosCount = parseInt(name.match(/(\d+) videos/)?.[1]) || 0;
    name = name.match(/\w+/)[0];
    const paginationLast = RULES.GET_PAGINATION_LAST(doc);
    const pageIterator = n => `${url}${n}/`;
    function* pageGenerator() {
        for (let c = 1; c <= paginationLast; c++) {
            const url = pageIterator(c);
            yield { url, offset: c };
        }
    }
    return {
        name,
        videosCount,
        pageGenerator: pageGenerator()
    }
}

function getMembersVideos(membersIds, memberGeneratorCallback, type = 'private') {
    let skipFlag = false;
    let skipN = 1;
    const skipCurrentMemberGenerator = (n = 1) => { skipFlag = true; skipN = n; }

    async function* pageGenerator() {
        let c = 0;
        let currentGenerator;
        while (c < membersIds.length - 1) {
            if (lskdb.hasKey(membersIds[c])) { c++; continue; }
            if (!currentGenerator) {
                const { pageGenerator, name, videosCount } = await getMemberVideos(membersIds[c], type);
                if (pageGenerator && videosCount > 0) {
                    currentGenerator = pageGenerator;
                    memberGeneratorCallback(name, videosCount, membersIds[c]);
                } else {
                    c++;
                }
            } else {
                const { value: { url } = {}, done } = currentGenerator.next();
                if (done || skipFlag) {
                    c += skipN;
                    skipN = 1;
                    currentGenerator = null;
                    skipFlag = false;
                } else {
                    yield { url, offset: c };
                }
            }
        }
    }

    return {
        pageGenerator: () => pageGenerator(membersIds, type),
        skipCurrentMemberGenerator
    };
}

function createPrivateFeedButton() {
    const container = document.querySelectorAll('.sidebar ul')[1];
    const button = parseDOM(`<li><a href="https://thisvid.com/my_wall/" class="selective"><i class="ico-arrow"></i>My Friends Private Videos</a></li>`);
    button.addEventListener('click', () => lskdb.setKey(PRIVATE_FEED_KEY));
    container.append(button);
};

async function createPrivateFeed() {
    createPrivateFeedButton();
    if (!lskdb.hasKey(PRIVATE_FEED_KEY)) return;
    lskdb.removeKey(PRIVATE_FEED_KEY);
    if (!window.location.pathname.includes('my_wall')) return;
    const container = parseDOM('<div class="thumbs-items"></div>');
    const ignored = parseDOM('<div class="ignored"><h2>IGNORED:</h2></div>');
    const controls = parseDOM('<div class="ignored"><button onClick="skip(event, 10)">skip 10</button><button onClick="skip(event, 100)">skip 100</button><button onClick="skip(event, 1000)">skip 1000</button></div>');
    const containerParent = document.querySelector('.main > .container > .content');
    containerParent.innerHTML = '';
    containerParent.nextElementSibling.remove()
    containerParent.append(container);
    container.before(ignored);
    ignored.after(controls);
    GM_addStyle(`.content { width: auto; }
    .member-videos, .ignored { background: #b3b3b324; min-height: 3rem; margin: 1rem 0px; color: #fff; font-size: 1.24rem; display: flex; flex-wrap: wrap; justify-content: center;
      padding: 10px; width: 100%; }
    .member-videos * {  padding: 5px; margin: 4px; }
    .ignored * {  padding: 4px; margin: 5px; }
    .member-videos button { }
    .thumbs-items { display: flex; flex-wrap: wrap; }`);

    const friends = await getMemberFriends(RULES.MY_ID);

    RULES.INTERSECTION_OBSERVABLE = document.querySelector('.footer');
    RULES.PAGINATION_LAST = friends.length;
    RULES.CONTAINER = container;

    const { pageGenerator, skipCurrentMemberGenerator } = getMembersVideos(friends, (name, videosCount, id) => {
        container.append(parseDOM(`
        <div class="member-videos" id="mem-${id}">
          <h2>${name} ${videosCount} videos</h2>
          <button onClick="hideMemberVideos(event)">ignore 🗡</button>
          <button onClick="hideMemberVideos(event, false)">skip</button>
        </div>`));
    });

    const ignoredMembers = lskdb.getAllKeys();
    ignoredMembers.forEach(im => {
        document.querySelector('.ignored').append(parseDOM(`<button id="#ir-${im}" onClick="unignore(event)">${im} 🗡</button>`));
    });

    unsafeWindow.skip = (e, n) => {
        skipCurrentMemberGenerator(n);
        document.querySelector('.thumbs-items').innerHTML = '';
    }

    unsafeWindow.hideMemberVideos = (e, ignore = true) => {
        let id = e.target.parentElement.id;
        if (!document.querySelector(`#${id} ~ div`)) {
            skipCurrentMemberGenerator();
        }
        const box = document.getElementById(id);
        const toDelete = [box];
        let curr = box.nextElementSibling;
        while (curr?.classList.contains('tumbpu')) {
            toDelete.push(curr);
            curr = curr.nextElementSibling;
        }
        toDelete.forEach(e => e.remove());
        id = id.slice(4)
        document.querySelector('.ignored').append(parseDOM(`<button id="irm-${id}" onClick="unignore(event)">${id} X</button>`));
        if (ignore) lskdb.setKey(id);
    }

    unsafeWindow.unignore = (e) => {
        const id = e.target.id.slice(4);
        lskdb.removeKey(id);
        e.target.remove();
    }

    PaginationManager.prototype.createNextPageGenerator = () => pageGenerator();
    new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    new PreviewAnimation(document.body);
    new VueUI(state, stateLocale, true, false);
}

//====================================================================================================

function route() {
    if (RULES.IS_MY_MEMBER_PAGE) {
        createPrivateFeed();
    }

    if (RULES.IS_MESSAGES_PAGE) {
        highlightMessages();
    }

    if (RULES.IS_VIDEO_PAGE) downloader();

    if (!RULES.PAGE_HAS_VIDEO) return;

    const containers = Array.from(RULES.IS_WATCHLATER_KIND ? [RULES.CONTAINER] : document.querySelectorAll('.thumbs-items:not(.thumbs-members)'));
    if (containers.length > 1 && !RULES.IS_MEMBER_PAGE) RULES.CONTAINER = containers[0];
    containers.forEach(c => {
        handleLoadedHTML(c, RULES.IS_MEMBER_PAGE ? c : RULES.CONTAINER, true);
    });

    new PreviewAnimation(document.body);
    new VueUI(state, stateLocale, true, RULES.LOGGED_IN ? checkPrivateVidsAccess : false);


    if (RULES.IS_OTHER_MEMBER_PAGE) {
        initFriendship();
    }

    if (RULES.PAGINATION_ALLOWED) {
        stateLocale.pagIndexLast = RULES.PAGINATION_LAST;
        if (!RULES.PAGINATION) return;
        this.paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    }
}

//====================================================================================================

const SCROLL_RESET_DELAY = 350;
const ANIMATION_DELAY = 750;

const defaultState = new DefaultState(true);
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

route();
