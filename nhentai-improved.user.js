// ==UserScript==
// @name         NHentai Improved
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.6
// @description  Infinite scroll (optional). Filter by include/exclude phrases and languages. Search similar button
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.nhentai.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nhentai.net
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js?version=1404894
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/menu-ui.user.js?version=1423690
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.meta.js
// ==/UserScript==
/* globals DataManager PaginationManager VueUI DefaultState parseDOM defaultScheme */

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
        this.IS_SEARCH_PAGE = /^\/search\//.test(pathname);

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

const DEFAULT_NHENTAI_STATE = {
    english: false,
    japanese: false,
    chinese: false,
    gay: false,
    fullColor: false
}

const filterDescriptors = {
    english: { query: 'english', name: '🇬🇧' },
    japanese: { query: 'japanese', name: '🇯🇵' },
    chinese: { query: 'chinese', name: '🇨🇳' },
    gay: { query: '-gay', name: 'Exclude Gay' },
    fullColor: { query: 'full+color', name: 'Full Color' }
}

function checkParamInQuery(param, state, url_) {
    let url = url_ || window.location.search;
    if (state && !url.includes(param)) {
        url += `+${param}`;
    }
    if (!state && url.includes(param)) {
        url = url.replace(`+${param}`, () => '');
    }
    return url;
}

function checkURL(url_) {
    let url = url_;
    Object.keys(filterDescriptors).forEach(k => {
        url = checkParamInQuery(filterDescriptors[k].query, state.custom[k], url);
    });
    return url;
}

function filtersUI(state) {
    const btnContainer = Array.from(document.querySelectorAll('.sort-type')).pop();
    const descs = Array.from(Object.keys(filterDescriptors));
    [descs.slice(0,3), [descs[3]], [descs[4]]].forEach(groupOfButtons => {
        console.log(groupOfButtons);
        const btns = parseDOM(`<div class="sort-type"></div>`);
        groupOfButtons.forEach(k => {
            const btn = parseDOM(`<a href="#" ${state.custom[k] ? 'style="background: rgba(59, 49, 70, 1)"' : ''}>${filterDescriptors[k].name}</a>`);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                state.custom[k] = !state.custom[k];
                window.location.href = checkURL(window.location.href);
            });
            btns.append(btn);
        });
        btnContainer.after(btns);
    });
}

function findSimilar(state) {
    let tags = Array.from(document.querySelectorAll('.tags .tag[href^="/tag/"] .name')).map(tag => tag.innerText).join(" ").split(" ");
    tags = Array.from(new Set(tags)).sort((a,b) => a.length < b.length);

    const urls = {
        searchSimilarVeryQuery: `/search/?q=${tags.join("+")}`,
        searchSimilarQuery: `/search/?q=${tags.slice(0,10).join("+")}`,
        searchSimilarLessQuery: `/search/?q=${tags.slice(0,5).join("+")}`,
        searchSimilarKindofQuery: `/search/?q=${tags.reverse().slice(0,5).join("+")}`
    }

    Object.keys(urls).forEach(url => {
        urls[url] = checkURL(urls[url]);
    });

    Array.from(document.links).filter(l => /\/(search|category|tag|character|artist|group|parody)\/\w+/.test(l.href)).forEach(l => {
        l.href = checkURL(l.href.replace(/(search|category|tag|character|artist|group|parody)\//, 'search/?q=').replace(/\/$/, ''));
    });

    document.querySelector('.buttons').append(
        parseDOM(`<a href="${urls.searchSimilarVeryQuery}" class="btn" style="background: rgba(59, 49, 70, 1)"><i class="fa fa-search"></i> Very Similar</a>`),
        parseDOM(`<a href="${urls.searchSimilarQuery}" class="btn" style="background: rgba(59, 49, 70, .9)"><i class="fa fa-search"></i> Similar</a>`),
        parseDOM(`<a href="${urls.searchSimilarLessQuery}" class="btn" style="background: rgba(59, 49, 70, .8)"><i class="fa fa-search"></i> Less Similar</a>`),
        parseDOM(`<a href="${urls.searchSimilarKindofQuery}" class="btn" style="background: rgba(59, 49, 70, .7)"><i class="fa fa-search"></i> Kindof Similar</a>`));
}

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const defaultState = new DefaultState({ DURATION_FILTER: false }, DEFAULT_NHENTAI_STATE);
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

if (RULES.IS_VIDEO_PAGE) {
    findSimilar(state);
}

if (RULES.CONTAINER) {
    handleLoadedHTML(RULES.CONTAINER);
}

if (RULES.IS_SEARCH_PAGE) {
    filtersUI(state);
}

if (RULES.PAGINATION) {
    const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
}

delete defaultScheme.durationFilter;
const ui = new VueUI(state, stateLocale, defaultScheme);


