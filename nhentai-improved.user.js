// ==UserScript==
// @name         NHentai Improved
// @namespace    http://tampermonkey.net/
// @version      1.82
// @license      MIT
// @description  Infinite scroll (optional). Filter by include/exclude phrases and languages. Search similar button
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.nhentai.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nhentai.net
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.1.4/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1442661
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js?version=1434103
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.meta.js
// ==/UserScript==
/* globals $ DataManager PaginationManager */

const { parseDom, sanitizeStr } = window.bhutils;
Object.assign(unsafeWindow, { bhutils: window.bhutils });
const { JabroniOutfitStore, defaultStateInclExclMiscPagination, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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
        let imgSrc = img.getAttribute('data-src') || img.getAttribute('src');
        if (!this.IS_VIDEO_PAGE) imgSrc = imgSrc?.replace('t5', 't3');
        img.classList.remove('lazyload');
        if ((img.complete && img.getAttribute('src') && !img.src.includes('data:image'))) { return ({}); }
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const title = sanitizeStr(thumb.querySelector('.caption').innerText);
        const duration = 0;
        return { title, duration };
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const offset = parseInt(url.searchParams.get('page')) || 1;
        const iteratable_url = n => {
            url.searchParams.set('page', n);
            return url.href;
        }
        return { offset, iteratable_url }
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
    [descs.slice(0, 3), [descs[3]], [descs[4]]].forEach(groupOfButtons => {
        const btns = parseDom(`<div class="sort-type"></div>`);
        groupOfButtons.forEach(k => {
            const btn = parseDom(`<a href="#" ${state.custom[k] ? 'style="background: rgba(59, 49, 70, 1)"' : ''}>${filterDescriptors[k].name}</a>`);
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
    tags = Array.from(new Set(tags)).sort((a, b) => a.length < b.length);

    const urls = {
        searchSimilarVeryQuery: `/search/?q=${tags.join("+")}`,
        searchSimilarQuery: `/search/?q=${tags.slice(0, 10).join("+")}`,
        searchSimilarLessQuery: `/search/?q=${tags.slice(0, 5).join("+")}`,
        searchSimilarKindofQuery: `/search/?q=${tags.reverse().slice(0, 5).join("+")}`
    }

    Object.keys(urls).forEach(url => {
        urls[url] = checkURL(urls[url]);
    });

    Array.from(document.links).filter(l => /\/(search|category|tag|character|artist|group|parody)\/\w+/.test(l.href)).forEach(l => {
        l.href = checkURL(l.href.replace(/(search|category|tag|character|artist|group|parody)\//, 'search/?q=').replace(/\/$/, ''));
    });

    document.querySelector('.buttons').append(
        parseDom(`<a href="${urls.searchSimilarVeryQuery}" class="btn" style="background: rgba(59, 49, 70, 1)"><i class="fa fa-search"></i> Very Similar</a>`),
        parseDom(`<a href="${urls.searchSimilarQuery}" class="btn" style="background: rgba(59, 49, 70, .9)"><i class="fa fa-search"></i> Similar</a>`),
        parseDom(`<a href="${urls.searchSimilarLessQuery}" class="btn" style="background: rgba(59, 49, 70, .8)"><i class="fa fa-search"></i> Less Similar</a>`),
        parseDom(`<a href="${urls.searchSimilarKindofQuery}" class="btn" style="background: rgba(59, 49, 70, .7)"><i class="fa fa-search"></i> Kindof Similar</a>`));
}

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const store = new JabroniOutfitStore(defaultStateInclExclMiscPagination);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);

if (!state.custom) {
    Object.assign(state, { custom: DEFAULT_NHENTAI_STATE });
}

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
    new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
}

DefaultScheme.durationFilter = undefined;
new JabroniOutfitUI(store, DefaultScheme);
