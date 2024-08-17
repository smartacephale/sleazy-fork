// ==UserScript==
// @name         Erome Improved
// @namespace    http://tampermonkey.net/
// @version      2.2.8
// @license      MIT
// @description  Infinite scroll. Filter photo albums. Filter photos in albums. Skips 18+ dialog
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        *://*.erome.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erome.com
// @run-at       document-idle
// @grant        none
// @downloadURL https://update.sleazyfork.org/scripts/492883/Erome%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/492883/Erome%20Improved.meta.js
// ==/UserScript==
/* globals $ LazyLoad */

const LOGO = `
⡝⣝⢝⢝⢝⢝⢝⢝⢍⠭⡩⢍⠭⡩⡍⡭⢍⠭⡍⡭⡙⡍⢏⢝⠩⡩⡋⡍⡏⡝⡝⡽⡹⡹⡹⡙⡝⡙⡝⢍⠭⡩⢍⠭⡩⡩⡩⡩⡩⡍⡭⡩⡍⣍⢫⡩⡹⡩⡹⡩
⡱⡱⡕⡇⣏⢎⢮⣪⢪⡪⣪⢪⡪⣪⢪⡪⣪⡪⡪⡢⡣⢪⢢⡣⡑⢌⠆⡪⡪⡪⡚⡜⢜⢸⠨⡊⡎⢎⢮⢣⠯⢮⠳⡝⡼⡪⢮⢣⠳⡕⠵⡕⠧⡳⢕⠧⡫⠮⡳⡹
⢕⢝⡜⡎⣎⢧⢓⢎⠇⠕⢅⠣⡩⡘⡌⡎⡆⢇⠕⡕⢅⢇⢷⢱⢘⢔⢅⢇⢕⢅⠇⡪⢨⢂⠣⡱⡘⢜⢌⢎⢎⠢⡃⠕⡌⢌⢢⠡⡱⢘⠌⡢⢃⢊⢢⢑⢌⢊⢆⠪
⢳⢱⢕⢝⢜⢜⢎⢇⢇⠣⡡⢱⢐⢅⢇⠎⢜⠰⡑⡜⢜⠜⡜⡜⡌⡺⡵⡣⢣⢑⢌⠢⡑⡐⡑⠔⢅⠣⡊⡆⢇⡳⡘⢌⠌⢆⠆⡃⡊⡢⡑⢌⠢⡑⢅⠆⡕⢌⢢⠱
⡱⡣⡳⡹⡸⡱⡕⣕⢅⠕⢌⢆⢇⠣⢅⠣⡑⢅⢊⠌⡢⡑⡕⡕⡧⡣⣏⠎⢜⠰⡐⡡⠂⢌⠢⢑⠅⢕⢑⠜⡌⡎⢎⢇⢕⢑⢌⠪⡐⡌⢌⠆⡣⢡⠱⡨⡂⡣⠪⡘
⡝⣜⢕⢝⡜⣕⢕⢕⢢⢑⢕⠜⡌⢎⠪⡨⠨⢂⠢⠨⡐⢌⠆⡇⡯⣺⠸⡈⢎⢪⢐⢐⠡⠡⡈⠢⠡⡑⢌⢪⢘⢌⢎⢎⢎⢆⠥⡑⡌⡌⠆⢕⢌⠢⡑⢔⢌⢪⢘⢌
⢪⢎⢮⢣⡣⡇⡗⡝⢔⢅⢇⢕⢑⢅⠕⠌⢌⠢⠨⢂⠪⡐⢕⢕⢝⢜⠅⡊⢜⢔⢕⢐⢅⢑⠨⡈⡊⢌⢢⢑⢅⢣⠪⡢⡣⡳⡹⡸⡲⣘⢌⠢⡂⡣⢊⠢⡱⢨⠢⡱
⡣⡳⣱⢣⡣⡳⣱⢹⠸⡰⡑⡌⣊⠢⡡⠃⠅⠌⢌⢂⠕⢌⢪⢢⢣⡓⡨⠨⡸⡸⡐⢅⠢⡂⠕⡐⢌⠢⡑⢌⢆⢣⠱⡑⡕⡕⡵⡱⡱⡱⡕⣕⡑⢌⠢⡱⡘⠔⡅⢕
⢎⢧⢳⡱⡕⣝⢜⢜⢜⢔⠱⡨⠢⡑⢌⠌⡊⢌⢂⠢⡡⡑⡱⢸⢸⡐⠌⠌⢜⠔⢅⠅⢕⠨⠨⡂⢅⢊⢌⠢⡱⡘⢜⢸⢸⢸⢸⡪⡪⡎⣎⢎⢮⢐⠡⢂⠪⡨⠢⡡
⢫⡪⣣⢣⡫⡪⡎⡇⡇⢎⢪⠨⡊⡌⡢⢑⠨⡐⡐⡡⢂⠪⠨⡊⡆⡇⠌⠌⡆⡣⢡⠡⡑⢌⢊⠔⠡⡂⢆⠣⡪⢸⢘⠬⡒⡕⡵⡱⣣⢣⢇⢗⡕⢔⠡⡡⡑⢌⠪⡰
⣕⢝⡜⣎⢞⢜⢎⢎⢎⠪⡢⢱⠨⡂⡪⢐⠡⢂⢊⠄⢕⠨⢊⠢⡑⢮⢨⢨⢢⢑⠅⡊⢔⠡⢂⠪⡨⢌⠢⡃⢎⢪⠸⡸⡸⡸⡸⣕⢕⢧⡫⡇⡇⢕⠨⣂⢪⢂⢇⢎
⡎⡧⡳⡱⣕⢝⢎⢇⢇⢣⠪⡢⡃⡪⢂⠕⢌⠢⠡⡊⢔⠡⡡⡑⢕⢕⢵⡱⣑⢢⠱⠨⡂⢅⢅⠕⡐⢅⠕⡜⡸⡨⡪⡪⡪⡪⡳⣕⢝⡵⣝⢜⢬⢲⢹⢸⢜⣞⢜⢕
⡮⣚⢎⢧⡣⣫⢺⢸⢸⠰⡱⡨⢢⢑⢅⠪⡂⢕⢑⠌⡢⢑⠰⡘⢔⢱⢱⡣⡪⢢⢃⢇⠪⠢⡑⢌⢊⢆⠣⡊⡆⢇⢎⢆⢇⢗⢽⢜⡵⡝⣜⢜⡜⡜⡜⡜⣝⢜⢜⢌
⣞⢜⡕⣇⢏⢮⢺⢸⢸⢸⠰⡡⢣⢑⢌⢪⠨⡢⠢⡑⡌⡢⠣⡑⢕⢱⠱⡕⡕⢕⠱⡐⢕⢑⢅⠕⢅⠆⡇⡣⡱⡱⡱⡱⡱⣝⢕⢧⡳⡱⢕⢗⢕⢵⡱⡣⡣⣣⢣⢃
⡪⣇⢯⢪⢎⡗⡵⡱⡑⡕⡕⢕⢅⢕⢜⠰⡑⡌⢎⢢⠱⡘⢜⠸⡘⡜⡜⡵⡱⡱⡱⡑⢕⠱⡨⡊⡪⡸⡨⡪⡪⡊⡎⣎⢞⣎⢗⡵⣳⢕⡝⡜⡕⡕⡜⡜⡵⣳⢣⡳
⢽⡸⣪⢳⢕⢽⢜⢜⢌⢎⢎⢎⢆⢣⢊⢎⠜⡌⢆⢕⢱⠸⡘⡜⡜⡜⡜⡵⡣⡣⡪⡪⢪⠪⡢⢣⢱⢸⢘⢌⢎⢎⢎⢮⡳⡵⣝⡾⣵⢝⣮⣺⡸⡜⡜⣎⢞⡵⡫⣫
⡞⡮⡮⡳⣝⢮⢳⠱⡑⢕⢱⢱⢱⢑⢅⢇⢕⠕⡕⡅⡇⡇⡇⡇⡇⡇⡗⣝⡎⡎⡎⡎⡎⡎⢎⢎⢪⢪⢪⢪⡪⣪⢳⢝⡽⣝⣗⢿⣕⡝⣞⣞⢾⢽⣺⢺⢽⡪⡣⡣
⢏⢇⢏⢎⢎⠪⡂⢇⢃⢣⠱⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡜⡎⣞⢎⢮⢪⢪⢪⢪⢪⢪⢪⡪⡪⡣⣣⢣⢏⣗⢽⢜⣮⡳⣕⢝⢎⢮⢪⢳⢸⢪⡳⣝⣞⣮
⠔⡅⢕⢅⢣⠱⡸⢨⢪⠢⡣⢢⢪⢪⢪⠪⡪⠸⡘⢜⢜⢜⡜⡎⡮⡪⡺⡸⡕⡇⡗⡕⣕⢵⢱⢣⡣⡇⡯⡺⡸⣪⡳⢕⢝⢜⢔⢕⢕⢣⢳⢱⢱⢱⢱⠱⣹⡪⡎⡎
⡑⢌⠢⠢⡑⢌⢌⡢⡡⣃⠪⠪⡘⡜⢌⠪⡨⢊⠜⡨⡊⡧⡳⣝⢼⣪⡳⡭⣳⡹⡸⡜⡜⣜⢜⢕⡕⣝⢜⢎⢧⢳⡱⡱⡑⡕⢕⠕⡕⢕⢕⢕⢕⢕⢅⢇⢇⢯⢪⠨
⡪⡢⠣⢣⢡⡑⡔⡑⢍⢆⠇⡏⢎⠌⠆⢕⠨⡐⠌⡢⢱⢹⢝⡾⣽⣺⢮⡫⣞⠎⡎⡪⢪⠢⡣⡳⣹⢜⡵⣹⣪⢳⡑⢅⠕⡜⡰⢑⠜⢌⢊⠢⡑⢅⠣⡑⢅⠣⡑⠕
⢕⠬⡩⠪⡒⡜⡬⡪⡜⡔⡥⡣⡣⣑⢅⢅⢂⢂⠑⢌⠪⡪⡯⣞⣞⢮⡻⣾⢑⠕⢅⠣⡑⢕⢱⢱⢱⣻⣺⡵⣳⣇⢧⢣⠣⣊⢢⠱⡘⡔⢕⠱⡘⣌⢎⢌⠆⡇⡣⠣
⣷⣵⣮⣧⣧⣷⣾⣾⣾⣯⣯⣯⣯⣷⣿⣾⣷⣷⣵⣶⣵⣵⣿⣾⣾⣷⣯⣿⣼⣼⣼⣼⣼⣼⣶⣷⣿⣽⣾⣿⣷⣷⣷⣯⣷⣾⣾⣾⣾⣾⣾⣾⣾⣮⣾⣶⣵⣵⣮⣷`;
console.log(LOGO);

(function disableDisclaimer() {
    if ($('#disclaimer').length === 0) return;
    $.ajax({ type: 'POST', url: '/user/disclaimer', async: true });
    $('#disclaimer').remove();
    $('body').css('overflow', 'visible');
})();

const PINK = '#eb6395';
const GREY = '#a09f9d';

function isActiveColor(condition) { return condition ? PINK : GREY; };

function togglePhotoElements() {
    document.querySelectorAll('.media-group > div:last-child:not(.video)').forEach(a => {
        $(a.parentElement).toggle(config.showPhotos);
    });
    $('#togglePhotos').css('backgroundColor', isActiveColor(config.showPhotos));
    $('#togglePhotos').text(!config.showPhotos ? 'show photos' : 'hide photos');
}

function hidePhotoOnlyAlbums() {
    document.querySelectorAll('div[id^=album]:not(:has(.album-videos))').forEach(a => {
        $(a).toggle(config.showPhotoAlbums);
    });
    $('#togglePhotoAlbums').css('color', isActiveColor(!config.showPhotoAlbums));
    window.dispatchEvent(new Event('scroll'));
}

function infiniteScrollAndLazyLoading() {
    if (!document.querySelector('.pagination')) return;
    const url = new URL(window.location.href);
    let next_page = parseInt(url.searchParams.get('page')) || 2;
    const nextPageUrl = () => {
        url.searchParams.set('page', next_page);
        return url.href;
    }
    const limit = parseInt($('.pagination li:last-child()').prev().text()) || 50;

    const infinite = $('#page').infiniteScroll({ path: nextPageUrl, append: '.page-content', scrollThreshold: 800 });

    $('#page').on('append.infiniteScroll', (event, body, path, items, response) => {
        hidePhotoOnlyAlbums();
        new LazyLoad();
        next_page++;
        if (next_page > limit) {
            infinite.destroy();
        }
    });
}

/******************************************* STATE ***********************************************/

const config = {
    showPhotos: false,
    showPhotoAlbums: false
}

function sync() {
    Object.assign(config, { ...JSON.parse(localStorage.getItem("config")) });
}

function save() {
    localStorage.setItem("config", JSON.stringify(config));
}

//=================================================================================================

const IS_ALBUM_PAGE = /^\/a\//.test(window.location.pathname);

function pageAction() {
    sync();
    if (IS_ALBUM_PAGE) {
        togglePhotoElements();
    } else {
        hidePhotoOnlyAlbums();
    }
}

if (IS_ALBUM_PAGE) {
    $('#user_name').parent().append('<button id="togglePhotos" class="btn btn-pink">show/hide photos</button>');
    $('#togglePhotos').on('click', () => {
        config.showPhotos = !config.showPhotos;
        togglePhotoElements();
        save();
    });
} else {
    infiniteScrollAndLazyLoading();
    $('.navbar-nav').append('<li><a href="#" id="togglePhotoAlbums">video only</span></a></li>');
    $('#togglePhotoAlbums').on('click', () => {
        config.showPhotoAlbums = !config.showPhotoAlbums;
        hidePhotoOnlyAlbums();
        save();
    });
}

window.addEventListener('focus', pageAction);
pageAction();
