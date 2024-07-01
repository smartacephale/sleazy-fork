// ==UserScript==
// @name         ThisVid.com Improved
// @license      MIT
// @namespace    http://tampermonkey.net/
// @version      4.6
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
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js?version=1403631
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1378559
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js?version=1390557
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js?version=1403633
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

        this.IS_MEMBER_PAGE = /^\/members\/\d+\/$/.test(pathname);
        this.IS_WATCHLATER_KIND = /^\/my_(\w+)_videos\//.test(pathname);
        this.IS_MESSAGES_PAGE = /^\/my_messages\//.test(pathname);
        this.IS_PLAYLIST = /^\/playlist\/\d+\//.test(pathname);
        this.IS_VIDEO_PAGE = /^\/videos\//.test(pathname);

        this.PAGE_HAS_VIDEO = this.GET_THUMBS(document).length > 0;

        this.PAGINATION = document.querySelector('.pagination');
        this.PAGINATION_LAST = this.GET_PAGINATION_LAST();

        this.CONTAINER = Array.from(document.querySelectorAll('.thumbs-items')).pop();

        this.MY_ID = document.querySelector('[target="_self"]')?.href.match(/\/(\d+)\//)[1] || null;
        this.LOGGED_IN = !!this.MY_ID;
        this.IS_MY_MEMBER_PAGE = this.LOGGED_IN && !!document.querySelector('.my-avatar');
        this.IS_OTHER_MEMBER_PAGE = !this.IS_MY_MEMBER_PAGE && this.IS_MEMBER_PAGE;
        this.IS_MEMBER_FRIEND = this.IS_OTHER_MEMBER_PAGE && document.querySelector('.case-left')?.innerText.includes('is in your friends');

        // highlight friend page profile
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
        if (thumbs.length === 0 && html?.classList?.contains('tumbpu')) thumbs = [html];
        return thumbs.filter(thumb => !thumb?.parentElement.classList.contains('thumbs-photo'));
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

const FRIEND_REQUEST_URL = (id) => `https://thisvid.com/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=`;

const USERS_PER_PAGE = 24;

async function getMemberFriends(memberId) {
    const { friendsCount } = await getMemberData(memberId);
    const offset = Math.ceil(friendsCount / USERS_PER_PAGE);
    const pages = range(offset).map(o => `https://thisvid.com/members/${memberId}/friends/${o}/`);
    const pagesFetched = pages.map(p => fetchHtml(p));
    const friends = (await Promise.all(pagesFetched)).flatMap(getMembers);
    return friends;
}

function getMembers(el) {
    const friendsList = el.querySelector('#list_members_friends_items');
    return Array.from(friendsList?.querySelectorAll('.tumbpu') || [])
        .map(e => e.href.match(/\d+/)?.[0]).filter(_ => _);
}

async function friendMemberFriends(orientationFilter) {
    const memberId = window.location.pathname.match(/\d+/)[0];
    friend(memberId);
    const friends = await getMemberFriends(memberId);
    let count = 0;
    await Promise.all(friends.map((fid, i) => {
        if (!orientationFilter) {
            return friend(fid, i);
        } else {
            return getMemberData(fid).then(({ orientation, uploadedPrivate }) => {
                if (orientation === orientationFilter && uploadedPrivate > 0) {
                    count++;
                    return friend(fid, i);
                }
            });
        }
    }));
    console.log(count, '/', friends.length);
}

function initFriendship() {
    GM_addStyle('.buttons {display: flex; flex-wrap: wrap} .buttons button, .buttons a {align-self: center; padding: 4px; margin: 5px;}');

    const buttonAll = parseDOM('<button style="background: radial-gradient(red, blueviolet);">friend everyone</button>');
    const buttonStraightOnly = parseDOM('<button style="background: radial-gradient(red, #a18cb5);">friend straights</button>');
    const buttonGayOnly = parseDOM('<button style="background: radial-gradient(red, #46baff);">friend gays</button>');
    const buttonBisexualOnly = parseDOM('<button style="background: radial-gradient(red, #4ebaaf);">friend bisexuals</button>');

    document.querySelector('.buttons').append(buttonAll, buttonStraightOnly, buttonGayOnly, buttonBisexualOnly);

    buttonAll.addEventListener('click', (e) => handleClick(e), { once: true });
    buttonStraightOnly.addEventListener('click', (e) => handleClick(e, 'Straight'), { once: true });
    buttonGayOnly.addEventListener('click', (e) => handleClick(e, 'Gay'), { once: true });
    buttonBisexualOnly.addEventListener('click', (e) => handleClick(e, 'Bisexual'), { once: true });

    function handleClick(e, orientationFilter) {
        const button = e.target;
        button.style.background = 'radial-gradient(#ff6114, #5babc4)';
        button.innerText = 'processing requests';
        friendMemberFriends(orientationFilter).then(() => {
            button.style.background = 'radial-gradient(blue, lightgreen)';
            button.innerText = 'friend requests sent';
        });
    }
}

//====================================================================================================

async function getMemberData(id) {
    const url = id.includes('member') ? id : `/members/${id}/`;
    const doc = await fetchHtml(url);
    const data = {};

    doc.querySelectorAll('.profile span').forEach(s => {
        if (s.innerText.includes('Name:')) {
            data.name = s.firstElementChild.innerText.trim();
        }
        if (s.innerText.includes('Orientation:')) {
            data.orientation = s.firstElementChild.innerText.trim();
        }
        if (s.innerText.includes('Videos uploaded:')) {
            data.uploadedPublic = parseInt(s.children[0].innerText);
            data.uploadedPrivate = parseInt(s.children[1].innerText);
        }
    });

    data.friendsCount = parseInt(doc.querySelector('#list_members_friends')?.firstElementChild.innerText.match(/\d+/g).pop()) || 0;

    return data;
}

//====================================================================================================

unsafeWindow.requestPrivateAccess = function (e, memberid) {
    e.preventDefault();
    friend(memberid);
    e.target.innerText = e.target.innerText.replace('🚑', '🍆');
}

async function checkPrivateVideoAccess(url) {
    const html = await fetchHtml(url);
    const holder = html.querySelector('.video-holder > p');

    const access = !holder;

    const uploaderEl = holder ? holder.querySelector('a') : html.querySelector('a.author');
    const uploaderURL = uploaderEl.href.replace(/.*\/(\d+)\/$/, (a, b) => b);
    const uploaderName = uploaderEl.innerText;

    return {
        access,
        uploaderURL,
        uploaderName
    }
}

function checkPrivateVidsAccess() {
    document.querySelectorAll('.tumbpu > .private').forEach(async t => {
        const thumb = t.parentElement;
        const { access, uploaderURL, uploaderName } = await checkPrivateVideoAccess(thumb.href);

        thumb.style.background = access ? haveAccessColor : haveNoAccessColor;
        thumb.querySelector('.title').innerText += access ? ' ✅ ' : ' ❌ ';
        thumb.querySelector('.title').appendChild(parseDOM(access ? `<span>${uploaderName}</span>` :
                                                           `<span onclick="requestPrivateAccess(event, ${uploaderURL});"> 🚑 ${uploaderName}</span>`));
    });
}

//====================================================================================================

function downloader() {
    function getVideoAndDownload() {
        $('.fp-ui').click();
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

    const btn = $('<li><a href="#" style="text-decoration: none;font-size: 2rem;">📼</a></li>');
    $('.share_btn').after(btn);
    btn.on('click', getVideoAndDownload);
}

//====================================================================================================

class PreviewAnimation {
    constructor(element, delay = ANIMATION_DELAY) {
        $('img[alt!="Private"]').off();
        this.tick = new Tick(delay);
        listenEvents(element, ['mouseover', 'touchstart'], this.animatePreview);
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
            el.addEventListener(type === 'mouseover' ? 'mouseleave' : 'touchend', () => this.tick.stop(), { once: true });
        }
    };
}

//====================================================================================================

function highlightMessages() {
    for (const member of document.querySelectorAll('.user-avatar > a')) {
        getMemberData(member.href).then(({ uploadedPublic, uploadedPrivate }) => {
            if (uploadedPrivate > 0) {
                const success = !member.parentElement.nextElementSibling.innerText.includes('declined');
                member.parentElement.parentElement.style.background = success ? succColor : failColor;
            }
            member.parentElement.parentElement.querySelector('.user-comment p').innerText +=
                `  |  videos: ${uploadedPublic} public, ${uploadedPrivate} private`;
        });
    }
}

//====================================================================================================

const lskdb = new LSKDB();
const PRIVATE_FEED_KEY = 'prv-feed';
const PUBLIC_FEED_KEY = 'pub-feed';

async function getMemberVideos(id, type = 'private') {
    const url = `https://thisvid.com/members/${id}/${type}_videos/`;
    const { uploadedPrivate, uploadedPublic, name } = await getMemberData(id);
    const videosCount = type === 'private' ? uploadedPrivate : uploadedPublic;
    const paginationLast = Math.ceil(videosCount / 48);
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
    let skipCount = 1;
    let minVideosCount = 1;

    const skipCurrentMember = (n = 1) => { skipFlag = true; skipCount = n; }
    const filterVideosCount = (n = 1) => { minVideosCount = n; }

    async function* pageGenerator() {
        let c = 0;
        let currentGenerator;
        while (c < membersIds.length - 1) {
            if (lskdb.hasKey(membersIds[c])) { c++; continue; }
            if (!currentGenerator) {
                const { pageGenerator, name, videosCount } = await getMemberVideos(membersIds[c], type);
                if (pageGenerator && videosCount >= minVideosCount) {
                    currentGenerator = pageGenerator;
                    memberGeneratorCallback(name, videosCount, membersIds[c]);
                } else {
                    c++;
                }
            } else {
                const { value: { url } = {}, done } = currentGenerator.next();
                if (done || skipFlag) {
                    c += skipCount;
                    skipCount = 1;
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
        skipCurrentMember,
        filterVideosCount
    };
}

function createPrivateFeedButton() {
    const container = document.querySelectorAll('.sidebar ul')[1];
    const buttonPrv = parseDOM(`<li><a href="https://thisvid.com/my_wall/" class="selective"><i class="ico-arrow"></i>My Friends Private Videos</a></li>`);
    const buttonPub = parseDOM(`<li><a href="https://thisvid.com/my_wall/" class="selective"><i class="ico-arrow"></i>My Friends Public Videos</a></li>`);
    buttonPrv.addEventListener('click', () => lskdb.setKey(PRIVATE_FEED_KEY));
    buttonPub.addEventListener('click', () => lskdb.setKey(PUBLIC_FEED_KEY));
    container.append(buttonPub, buttonPrv);
};

async function createPrivateFeed() {
    createPrivateFeedButton();
    const key = lskdb.hasKey(PRIVATE_FEED_KEY) || lskdb.hasKey(PUBLIC_FEED_KEY);
    if (!key) return;
    const isPubKey = !!lskdb.hasKey(PUBLIC_FEED_KEY);
    lskdb.removeKey(PRIVATE_FEED_KEY);
    lskdb.removeKey(PUBLIC_FEED_KEY);

    if (!window.location.pathname.includes('my_wall')) return;
    const container = parseDOM('<div class="thumbs-items"></div>');
    const ignored = parseDOM('<div class="ignored"><h2>IGNORED:</h2></div>');
    const controls = parseDOM(`<div class="ignored">
         <button onClick="skip(event, 10)">skip 10</button>
         <button onClick="skip(event, 100)">skip 100</button>
         <button onClick="skip(event, 1000)">skip 1000</button>
         <button onClick="filterVidsCount(event, 10)">filter >10 videos</button>
         <button onClick="filterVidsCount(event, 50)">filter >50 videos</button>
         <button onClick="filterVidsCount(event, 100)">filter >100 videos</button>
         </div>`);
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
    .member-videos h2 a { font-size: 1.24rem; margin: 0; padding: 0; display: inline; }
    .ignored * {  padding: 4px; margin: 5px; }
    .thumbs-items { display: flex; flex-wrap: wrap; }`);

    const friends = await getMemberFriends(RULES.MY_ID);

    RULES.INTERSECTION_OBSERVABLE = document.querySelector('.footer');
    RULES.PAGINATION_LAST = friends.length;
    RULES.CONTAINER = container;

    const { pageGenerator, skipCurrentMember, filterVideosCount } = getMembersVideos(friends, (name, videosCount, id) => {
        container.append(parseDOM(`
        <div class="member-videos" id="mem-${id}">
          <h2><a href="/members/${id}/">${name}</a> ${videosCount} videos</h2>
          <button onClick="hideMemberVideos(event)">ignore 🗡</button>
          <button onClick="hideMemberVideos(event, false)">skip</button>
        </div>`));
    }, isPubKey ? 'public' : 'private');

    const ignoredMembers = lskdb.getAllKeys();
    ignoredMembers.forEach(im => {
        document.querySelector('.ignored').append(parseDOM(`<button id="#ir-${im}" onClick="unignore(event)">${im} 🗡</button>`));
    });

    unsafeWindow.skip = (e, n) => {
        skipCurrentMember(n);
        document.querySelector('.thumbs-items').innerHTML = '';
    }

    unsafeWindow.hideMemberVideos = (e, ignore = true) => {
        let id = e.target.parentElement.id;
        if (!document.querySelector(`#${id} ~ div`)) {
            skipCurrentMember();
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

    unsafeWindow.filterVidsCount = (e, count) => {
        filterVideosCount(count);
    }

    PaginationManager.prototype.createNextPageGenerator = () => pageGenerator();
    new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    new PreviewAnimation(document.body);
    new VueUI(state, stateLocale);
}

//====================================================================================================

async function clearMessages() {
    const last = RULES.PAGINATION_LAST;
    const confirmed = [];

    function chunks(arr, n) {
        const res = [];
        for (let i = 0; i < arr.length; i += n) {
            res.push(arr.slice(i, i + n));
        }
        return res;
    }

    let c = 0;
    const sortMsgs = (doc) => {
        doc.querySelectorAll('.entry').forEach(e => {
            const id = e.querySelector('input[name="delete[]"]').value;
            const msg = e.querySelector('.user-comment').innerText;
            if (msg.includes('has confirmed your invitation') || msg.includes('has removed you from his')) {
                confirmed.push(id);
            }
            if (msg.includes('declined your invitation')) {
                const mid = e.querySelector('a').href;
                getMemberData(mid).then(({ orientation, uploadedPrivate }) => {
                    if (orientation === 'Straight' && uploadedPrivate > 0) {
                        c++;
                        friend(mid.match(/\d+/)[0], c);
                    }});
                confirmed.push(id);
            }
        });
    }

    const deleteMsg = ids => {
        let url = `https://thisvid.com/my_messages/inbox/2/?mode=async&format=json&action=delete&function=get_block&block_id=list_messages_my_conversation_messages`;
        ids.forEach(id => { url += `&delete[]=${id}` });
        fetch(url).then(res => console.log(url, res?.status, ';___;'));
    }

    await Promise.all([...Array(last)].map((_, i) => fetchHtml(`https://thisvid.com/my_messages/inbox/${i+1}/`).then(html => sortMsgs(html))));
    chunks(confirmed, 10).forEach((c,i) => deleteMsg(c));
}

function clearMessagesButton() {
    const btn = parseDOM('<button>clear messages</button>');
    btn.addEventListener('click', clearMessages);
    document.querySelector('.headline').append(btn);
}

//====================================================================================================

function route() {
    console.log(SponsaaLogo);

    if (RULES.LOGGED_IN) {
        unsafeWindow.checkAccess = checkPrivateVidsAccess;
    }

    if (RULES.IS_MY_MEMBER_PAGE) {
        createPrivateFeed();
    }

    if (RULES.IS_MESSAGES_PAGE) {
        clearMessagesButton();
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
    new VueUI(state, stateLocale, true);


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

const defaultState = new DefaultState({ PRIVACY_FILTER: true });
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

route();
