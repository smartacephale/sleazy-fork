// ==UserScript==
// @name         NHentai Improved
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.2
// @description  Infinite scroll (optional). Filter by include/exclude phrases and languages. Search similar button
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.nhentai.net/*
// @match        https://*.nhentai.to/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nhentai.net
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js?version=1403631
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/menu-ui.user.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.meta.js
// ==/UserScript==
/* globals DataManager PaginationManager VueUI DefaultState parseDOM */

const LOGO = `⠡⠡⠡⠡⠡⠅⠅⢥⢡⢡⢠⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⠡⡥⠨⡨⠈⠌⠌⠌⠌⠌⠌⡐
⠡⢡⡃⡅⠅⠅⢅⢦⣂⡂⡒⡜⡈⡚⡂⡥⠡⠡⠡⠡⠡⠡⠡⠡⡡⠡⠡⠑⠅⠣⣕⠡⠡⡡⠡⠡⠡⠡⠡⠡⣡⣡⡡⠡⠡⡑⢑⠡⠡⠡⠡⠩⠩⠨⠩⢹⠨⠨⢐⢐
⠨⢐⠐⠅⠥⠡⠇⡂⡑⡐⡈⠢⠬⢑⢨⠨⠨⠨⠨⠨⢨⢘⠨⢑⠠⠡⠡⠡⠡⠡⠨⢈⠢⠨⠱⡡⠡⠡⠡⠡⣳⣳⡣⠡⢁⢓⠒⠄⢅⣱⠡⢩⡩⠩⢩⢉⠪⢌⢐⢐
⠌⡐⠨⠨⠨⠨⡒⣤⣌⡐⠠⢑⢑⢤⠃⠌⠌⠌⠌⢌⢂⢂⢂⠂⠌⠌⠌⠌⢌⠌⠌⡐⠨⠨⠢⡘⠌⠌⠌⢰⠒⡖⠢⢁⢂⠢⠑⠩⣐⢐⠨⠰⠠⡩⢐⠪⡊⠔⡁⡂
⠅⡂⢅⠇⠡⢑⠨⢐⠠⢑⠣⢌⠢⡂⠍⡪⠨⠨⠈⡆⡂⡂⡂⠌⠌⡪⠨⢈⢢⠃⠅⠌⠌⠨⠨⠨⢘⠨⠨⢘⣘⡚⡃⡂⢢⠡⢡⢁⠢⢸⠨⡈⠢⠨⢱⠠⡡⢁⢂⢂
⢐⢐⠠⢡⢑⠐⡨⢊⡱⢐⠨⡘⡐⡈⡊⠄⠅⠅⠅⢣⢃⢢⢱⢭⡢⣂⢑⢑⠢⠡⠡⡡⠡⠡⠱⠡⢱⢈⠨⢸⢅⣻⣇⢂⢂⠪⡠⡁⠍⠅⡄⠣⠡⡑⡁⡢⡑⡐⡐⡐
⢂⠂⠌⡐⠠⠩⡨⣈⡒⡔⠅⡂⡂⡂⡂⠅⠅⠅⠅⠌⡊⠢⠲⢙⢘⠨⠑⠕⡑⠕⡕⢄⢅⢃⢱⢱⠐⡐⠨⠰⡖⡶⠲⢐⢐⢐⢐⠠⢡⣑⢂⠱⠡⠨⠱⠰⢐⢐⢐⠠
⢐⠨⢐⠠⠡⠡⠱⡐⠠⠩⡩⡨⣁⢂⠂⠅⠅⠅⠅⠅⡂⠣⡁⢪⢐⠡⠡⠡⠨⠠⢁⢂⢂⢂⠆⡢⢂⠂⠅⣑⡑⣋⡊⡐⡐⡐⡅⣅⡂⠔⢔⠨⠬⡈⣊⢊⣒⡐⡐⠨
⡂⠌⡐⢨⠨⠈⡂⡃⠅⠅⠣⠰⠤⡂⠌⠌⠌⠌⠌⡐⠠⠡⠘⠔⢔⠌⠄⡕⡡⡁⢆⢲⢐⠜⡔⡁⡂⠌⡐⣸⢋⢟⢕⢐⢐⢐⢐⢒⠠⡩⡩⠨⢐⣐⢀⡂⡂⠇⡂⠅
⠂⠅⡂⡘⠬⣐⣘⢨⢨⡨⠜⡊⡒⠠⠡⠡⠡⠡⢁⠂⠅⠅⣌⢌⢂⡕⣙⢂⢑⢁⠂⡂⠄⠌⡐⠰⡀⠅⡂⡂⡂⡂⡂⡂⡂⡂⣂⠕⡁⠅⠍⠌⠌⡐⡐⢒⢨⢐⠠⠡
⠨⢐⠰⡠⢑⠒⡂⡂⠢⡂⢅⠆⠢⢡⠡⠡⠡⢁⢂⢌⠪⡑⡐⡐⡐⢌⠢⡈⡒⠬⢩⠩⠫⠩⠨⢡⠨⡲⠰⠰⡐⡐⡐⡐⠠⢐⢐⢀⠪⠬⠨⠨⡘⠨⢁⢒⢊⢐⠨⠨
⠨⢐⠠⢈⢂⠱⢁⢂⠸⠠⠝⡀⠅⣂⢍⠸⠨⣐⡑⢄⢑⢐⢐⢐⢌⠢⡑⡐⠌⢌⠢⠡⠡⢅⢃⠢⡑⠌⢌⢂⠢⡈⠢⡂⠅⡂⡂⣑⣊⠌⡊⡊⢰⢁⢑⢐⢐⠐⠨⠨
⠌⡐⠨⢐⢐⢘⠰⠔⠨⠨⠰⢐⢁⢂⠂⠌⡐⡨⠅⢕⢢⠢⡢⡑⡐⡑⡐⠌⢌⠢⠡⡁⡃⠢⠣⡑⠌⢌⢂⢢⢑⢌⠢⠨⡐⠐⠀⡇⢸⠰⠂⠌⠍⡐⠠⣁⡂⡅⠅⠅
⠅⡂⢅⢒⢒⢂⠊⠌⠌⠌⠌⡐⡐⡐⠌⡐⡐⡆⠅⠢⠱⡣⡊⡢⡃⠢⠨⡈⠢⠡⡑⡜⢌⢘⢐⢸⢈⢂⢂⠂⢇⢅⢅⢝⠠⠡⠁⡇⢸⠨⠩⠩⢁⠂⢅⢂⢂⠂⠅⠅
⢁⠂⢌⢂⠢⠢⠃⠅⠅⡑⡉⡃⡋⡊⢲⢀⢂⡣⠡⢑⢡⠋⣆⡎⠌⢌⠢⠨⡈⠢⣨⢊⠢⠨⡂⣺⢰⠐⠄⠅⢍⠦⠇⠱⠨⠨⠀⡇⠘⡈⠌⠨⡘⡐⠸⢐⢐⠨⠨⢐
⢐⠨⠸⠰⠨⡌⠌⠌⡐⠆⠢⠡⠡⠡⢁⠂⢎⠌⠌⡐⠌⠠⢱⠪⡈⠢⠡⡑⠌⡌⡎⠢⠡⡑⡐⢌⢎⢎⠌⠌⢜⠘⢌⢌⠌⠌⠄⠥⢑⠠⠡⠅⡑⡒⡁⡂⡂⠌⠌⡐
⡂⠌⠌⠌⡄⡑⠡⡑⡂⡓⣑⢑⢡⢁⠂⡌⡂⡂⢅⠊⠌⠌⢪⠢⠨⡈⡢⡨⡪⡪⠪⡈⡂⠆⢌⢂⢣⠱⡑⡅⢕⠨⡐⠢⡃⠅⠅⠅⡐⡈⢊⢂⢐⠐⡐⡐⠨⠨⡁⡂
⡂⠅⠅⠕⡐⠠⡡⠅⢦⠨⢐⠠⠨⢒⢰⢁⢂⠂⡌⠌⠌⠌⢌⢌⢆⠪⡪⡪⡪⡊⡂⡂⠪⡊⡂⡢⡑⡕⢕⢕⠔⢀⠃⠅⠅⠅⠅⠅⡂⡒⡲⢐⢐⢐⠢⡨⠨⠈⠅⡂
⠂⠅⠅⠅⠌⠠⠡⡡⠂⠌⡐⠜⠨⠠⠨⠐⡄⡂⡃⠅⠅⢅⢱⢱⢱⢱⢨⠪⠪⡊⡊⡊⠪⠢⠢⡘⡔⡘⢔⢕⠅⠄⠨⠨⢈⢊⠌⣐⢐⠨⢐⡐⡐⡢⡠⠨⠨⢌⢐⠠
⠨⠨⠨⡠⢃⠃⠍⡂⡃⡓⠬⠌⡎⠅⢱⢁⢢⠁⡎⠌⡐⡐⡌⣖⠵⡑⠅⢅⢑⡐⡔⡌⡌⡌⡂⡂⡊⠎⡆⡕⠌⠄⠅⡑⡐⠔⠔⡁⡂⡼⠡⢃⠂⠥⠨⡌⢌⠄⢱⠨
⠌⢌⠌⡐⣐⢘⢓⢑⢐⠠⠡⠡⡑⡑⡘⡐⡘⡀⡇⢅⢂⢢⢑⢅⢕⣬⡣⣣⢣⢣⢣⡣⡣⡓⣕⢕⢌⢌⢌⠢⠅⢅⠓⠌⠄⠅⡑⡊⡀⡃⡑⡆⠌⠌⠌⡐⡀⠅⡁⡂
⠅⡑⡐⡐⡁⡂⡢⢊⢐⠨⡨⢊⢐⢐⢐⢐⢐⢀⢃⢂⢘⢧⢣⢫⢣⢣⣑⡐⡑⡐⡑⢌⠪⠨⠢⡑⡙⡔⠧⢧⢑⢡⠡⠡⠡⢁⢂⣂⡂⣂⠂⡅⢅⢅⠅⠢⣢⢅⢂⢂
⢐⢐⢐⠔⡐⠤⢑⠂⠆⠍⡐⡐⡐⡐⡐⡐⡐⡐⣐⡰⢎⠚⠅⢍⠪⢣⠲⢨⢊⠪⠩⢣⠩⡓⡑⢔⢢⢝⠕⢗⢕⢔⢈⠎⠌⡐⠠⣱⠹⣀⠇⡇⢸⣸⠨⢀⢧⡻⢐⢐
⢐⠠⢑⠰⠄⢅⡢⢑⠡⣁⣂⠂⢆⢂⢂⡢⡒⡑⡐⢌⠢⠡⡑⢄⠑⠄⠅⠕⢌⢚⢬⡂⢣⠪⡨⡢⡣⡑⢅⢑⠐⠄⢅⢑⢑⠢⢅⢂⢂⢂⢂⢂⡂⡂⣌⣐⢐⠨⢐⢐
⢐⠨⠐⡬⠌⡒⠨⠨⢐⢐⡐⢬⢘⣰⢜⢜⢌⢂⢊⠢⠡⡑⢌⠢⠡⠡⠡⡑⡐⢌⠢⢫⢪⢪⢨⢊⠢⡈⡂⠢⠡⡑⡐⡐⠄⢅⠑⢕⢔⢐⠸⠸⡂⢌⢷⢫⠀⠌⡐⡐
⠂⠌⡐⡘⠔⠤⢑⢑⠡⢁⢂⢂⡺⡱⡱⡱⡑⡐⡐⢅⠑⢌⠢⠡⠡⠡⡑⡐⢌⠢⠡⠡⡣⡣⡃⠢⡑⡐⠌⢌⢂⢂⠢⠨⡈⠢⡑⡐⢌⢢⡨⠰⢀⢂⢂⠂⠌⡐⡐⠠
⠌⡐⡐⡐⠨⢈⢊⢐⠨⠐⡐⡌⡗⡕⡕⡕⡕⠔⢌⠢⡑⠄⠅⠅⢅⢑⠐⢌⠢⠡⠡⡑⢼⡘⢌⢂⠢⠨⡈⡂⡂⠢⠡⡑⢌⢂⠢⠨⠢⡑⡕⡅⡂⡂⠆⠌⡐⡐⠠⢁
⡐⡐⡐⠠⢁⢂⢐⢐⠨⢐⢀⢳⢏⢎⢎⢎⢎⢊⠢⡑⠌⠌⠌⢌⢂⠢⡑⠄⠅⢅⢑⢌⢺⡘⡐⠄⢅⢑⢐⠐⠌⢌⠢⡈⡂⠢⠡⠡⡑⡕⡕⡕⡐⠠⠑⠅⡂⡂⠅⡂
⡂⡂⡂⠅⠌⡐⡐⡐⠨⢐⠐⢜⡼⡸⡸⡸⡘⡔⢕⠌⠌⠌⢌⢂⠢⡑⠌⠌⢌⢂⢎⢂⢯⡊⡎⢌⢂⢂⠢⠡⡑⢄⢑⠐⠌⠌⢌⢌⢎⢎⡺⡘⡔⠨⢈⢂⢂⠂⠅⡂
⢂⢂⠂⠅⢅⢢⢂⠂⠅⡂⠌⢆⢣⢣⢣⢣⢣⠣⡣⡣⡑⡅⢕⢐⢑⠌⢌⢌⢂⢎⢎⢢⡻⡢⢣⠣⡂⡢⠡⡑⢌⢂⠢⡡⡑⡕⡕⡕⡕⡕⡕⡕⠌⠌⡐⡐⡐⠨⢐⠠
⡐⡐⠨⠨⢸⢐⠢⠨⢐⠠⠡⠈⢎⢣⡣⡣⡱⡱⡨⡪⡪⡪⡢⡑⡕⡕⡕⡕⡕⡕⡕⡕⡧⣣⢣⡣⡣⡪⡪⡪⡢⡣⡣⡪⡪⡪⡪⡪⡪⡪⡪⡪⠨⢐⠰⠰⠠⢁⠂⠌
⡐⠠⠡⠡⢸⠐⣼⣇⠂⠌⠌⠌⠄⠣⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡺⡸⣝⢜⢆⢇⢕⢕⢌⠪⡨⡊⡪⡨⡨⡊⡪⠪⡪⠪⠨⠠⢁⢢⠡⠡⢁⠂⠌⠌
⠠⠡⠡⠡⠨⢔⣿⣿⣧⡡⠡⠡⠡⢁⠂⠅⡃⠇⢎⠎⢎⢌⢎⢎⢎⢪⠪⠪⡪⣪⢝⡜⠮⣪⢇⢇⢕⢑⢕⢕⢌⢪⠨⡪⡪⡪⡪⡪⠊⠌⠌⠨⢰⣟⡇⡃⡂⠌⠌⠌
⠅⠅⠅⠅⠅⠸⣿⣿⣟⣿⣮⠨⠨⢐⠨⢐⠠⢁⠂⠅⠅⠅⠍⠍⠌⠄⠅⠅⠌⡐⡐⠠⢁⢂⠢⠨⢐⢐⠂⠅⠕⠕⠍⡊⡂⡂⠅⡂⠅⠅⠅⢅⣿⣿⠕⡐⠠⠡⠡⢁
⠄⠅⢅⠡⠡⠡⠘⢿⣿⣿⣿⣷⣅⠂⠌⡐⠨⢐⠨⠨⠨⠨⠨⠨⠨⠨⠨⠠⡁⡂⡂⠅⡂⡂⠌⠌⡐⡐⠨⠨⠨⠨⢐⢐⢐⠠⢁⠂⠅⢅⣱⡿⣿⢓⢁⠂⠅⠅⡁⡂
⠡⢁⠂⠌⠌⠌⢌⠠⢑⠫⠟⣿⢿⣿⣶⣤⣁⠂⠌⠌⠌⠌⠌⠌⠌⠌⠌⡐⡉⠢⠢⠕⠌⠄⠅⠅⡑⠄⡅⠅⠅⠅⡂⡂⡂⠌⡐⣨⣬⣾⡿⠏⡃⡂⡂⠌⠌⡐⢐⢐
⠨⢐⠨⠨⠨⠨⢐⠨⢐⠨⢐⠠⠙⠽⣿⣿⡇⠅⠅⠕⠡⢣⠱⢅⢹⢈⢂⠢⠨⠨⠨⠨⠨⠨⡈⡂⠢⡑⡜⡑⢕⢃⢒⢒⢂⢑⣿⢿⢛⠁⡂⠅⡂⡂⡂⡂⡁⡂⡐⡐
⡁⠢⠨⠨⠨⢐⢐⢌⢆⢅⠣⡡⡡⡑⡸⣿⡧⠡⡡⢡⢑⢂⢬⠸⡈⡂⠢⠡⠡⠡⡡⠡⡑⡑⡐⠌⢌⠢⡁⡢⡂⠆⠆⡂⡂⣢⡿⡑⠄⢕⠐⢕⢐⢔⢐⢐⢐⢐⢐⠐
⠄⠅⠅⠅⠅⡆⡇⡇⡇⡇⡇⡢⡂⡂⡪⣻⠡⢁⠂⠆⠌⡂⡌⢕⢐⢌⠌⢌⢊⠪⣨⢂⢂⢂⠪⠨⠢⡑⢔⢐⡠⡡⡱⡨⡐⢸⠗⠌⢌⠢⡡⡡⡑⠕⡕⢕⢕⢔⢐⢈
⠪⠨⢘⢈⠢⢉⠪⠪⡪⠎⡮⠮⢬⠪⢩⠪⠐⢠⠫⠣⢉⠢⠱⡐⢔⢐⢑⢑⢘⢌⢢⢱⠰⡐⡅⢅⢑⢌⠂⡆⡂⡑⡘⠄⠅⢸⠑⢅⠅⢕⢔⢕⢌⠪⡪⡢⡣⡣⢂⢂
⠨⠨⢐⢐⢐⢐⠨⢐⢈⠢⠨⡈⠖⠨⢘⠨⠨⡸⠌⢌⠢⢩⠡⠩⠠⢑⢐⢂⢃⠂⠅⡃⠣⠆⢕⢕⢕⡢⢙⢐⢐⠐⠌⠪⢨⠠⠡⠁⠇⠧⡪⠢⠱⢱⢸⢸⣘⢌⢐⢐
⠨⠨⢐⢐⢐⢐⠨⢐⠠⠡⡑⢌⠘⢌⠬⡨⢌⠪⣈⠢⡈⡊⠌⠌⠌⡐⡐⡐⡐⠨⠐⢄⡱⡝⡜⡬⠣⠨⠠⢑⠢⠡⢅⡑⡌⡊⠬⠨⡈⠢⠨⠨⡈⡂⡢⡂⡂⡐⡐⡘
⠡⢁⢂⢂⢂⠂⠌⡐⠨⢐⢈⠢⢑⠄⢍⠘⠌⢅⢂⢂⢂⠢⠡⠡⡁⡂⡂⠢⠨⠨⠨⣰⢣⡣⡋⠌⠌⠌⢌⠢⠨⠨⡐⡐⡐⠌⢌⠐⠌⠌⢌⢂⠢⢂⢂⢂⢐⢐⢐⢐`;

class NHENTAI_RULES {
    constructor() {
        const { pathname } = window.location;

        this.IS_VIDEO_PAGE = /^\/g\/\d+/.test(pathname);

        this.PAGINATION = document.querySelector('.pagination');
        this.PAGINATION_LAST = parseInt(document.querySelector('.pagination .last')?.href.match(/\d+/)[0]) || 1;
        this.CONTAINER = Array.from(document.querySelectorAll('.index-container, .container')).pop();
    }

    THUMB_URL(thumb) {
        return thumb.querySelector('.cover').href;
    }

    GET_THUMBS(html) {
        return html.querySelectorAll('.gallery');
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('.cover img');
        const imgSrc = img.getAttribute('data-src') || img.getAttribute('src');
        if ((img.complete && img.getAttribute('src') && !img.src.includes('data:image'))) { return ({}); }
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const title = thumb.querySelector('.caption').innerText.toLowerCase();
        const duration = 0;
        return {
            title,
            duration,
        };
    }

    URL_DATA() {
        const { origin, pathname, href } = window.location;
        const url = new URL(window.location.href);
        const offset = parseInt(url.searchParams.get('page')) || 1;
        const iteratable_url = n => {
            url.searchParams.set('page', n);
            return url.href;
        }
        return {
            offset,
            iteratable_url
        }
    }
}

const RULES = new NHENTAI_RULES();

//====================================================================================================

const EN = 2049;
const CN = 2061;
const JP = 1225;

const langState = { filter: undefined }

function filterByLang(lang) {
    if (!lang && !langState.filter) return;
    if (lang) langState.filter = lang;
    if (!langState.filter) langState.filter = lang;
    console.log('langState.filter ', langState.filter);
    document.querySelectorAll('.cover .caption').forEach(e => {
        const styles = window.getComputedStyle(e,':before');
        e.closest('.gallery').style.display = styles.background.length !== langState.filter ? 'none' : 'inline-block';
    });
}

function filterByLanguageUI() {
    const btnContainer = Array.from(document.querySelectorAll('.sort-type, .menu')).pop();
    const btn = parseDOM(`<div class="sort-type"><a id="jp_l" href="#">🇯🇵</a> <a id="cn_l" href="#">🇨🇳</a> <a id="en_l" href="#">🇬🇧</a></div>`);
    btnContainer.after(btn);
    btn.querySelector('#jp_l').addEventListener('click', () => filterByLang(JP));
    btn.querySelector('#cn_l').addEventListener('click', () => filterByLang(CN));
    btn.querySelector('#en_l').addEventListener('click', () => filterByLang(EN));
}

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const defaultState = new DefaultState({ DURATION_FILTER: false });
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

const proxyHTMLHandle = new Proxy(handleLoadedHTML, {
    apply(target, ctx, args) {
        setTimeout(filterByLang, 100);
        return Reflect.apply(...arguments)
    }
});

if (RULES.IS_VIDEO_PAGE) {
    let tags = Array.from(document.querySelectorAll('.tags .tag[href^="/tag/"] .name')).map(tag => tag.innerText).join(" ").split(" ");
    tags = Array.from(new Set(tags)).sort((a,b) => a.length < b.length);
    const searchSimilarVeryQuery = `/search/?q=${tags.join("+")}`;
    const searchSimilarQuery = `/search/?q=${tags.slice(0,10).join("+")}`;
    const searchSimilarLessQuery = `/search/?q=${tags.slice(0,5).join("+")}`;
    document.querySelector('.buttons').append(
        parseDOM(`<a href="${searchSimilarVeryQuery}" class="btn" style="background: #3b3146"><i class="fa fa-search"></i> Very Similar</a>`),
        parseDOM(`<a href="${searchSimilarQuery}" class="btn" style="background: #3b3146"><i class="fa fa-search"></i> Similar</a>`),
        parseDOM(`<a href="${searchSimilarLessQuery}" class="btn" style="background: #3b3146"><i class="fa fa-search"></i> Less Similar</a>`));
}

if (RULES.CONTAINER) {
    proxyHTMLHandle(RULES.CONTAINER);
}

if (RULES.PAGINATION) {
    filterByLanguageUI();
    const paginationManager = new PaginationManager(state, stateLocale, RULES, proxyHTMLHandle, SCROLL_RESET_DELAY);
}

const ui = new VueUI(state, stateLocale);
