// ==UserScript==
// @name         NHentai Improved
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by include/exclude phrases and languages. Search similar button
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.nhentai.*/*
// @match        https://*.nhentai.net/*
// @match        https://*.3hentai.net/*
// @match        https://*.e-hentai.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nhentai.net
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/499435/NHentai%20Improved.meta.js
// ==/UserScript==

const {
  parseDom,
  fetchHtml,
  sanitizeStr,
  DataManager,
  createInfiniteScroller,
  getPaginationStrategy,
} = window.bhutils;
const { JabroniOutfitStore, defaultStateInclExclMiscPagination, JabroniOutfitUI, DefaultScheme } =
  window.jabronioutfit;

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
  IS_VIDEO_PAGE = /^\/g\/\d+/.test(location.pathname);
  IS_SEARCH_PAGE = /^\/search\//.test(location.pathname);

  paginationStrategy = getPaginationStrategy({});

  container = Array.from(document.querySelectorAll('.index-container, .container')).pop();

  getThumbUrl(thumb) {
    return thumb.querySelector('.cover').href;
  }

  getThumbs(html) {
    return html.querySelectorAll('.gallery');
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('.cover img');
    let imgSrc = img.getAttribute('data-src') || img.getAttribute('src');
    if (!this.IS_VIDEO_PAGE) imgSrc = imgSrc?.replace('t5', 't3');
    img.classList.remove('lazyload');
    if (img.complete && img.getAttribute('src') && !img.src.includes('data:image')) {
      return {};
    }
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('.caption').innerText);
    const duration = 0;
    return { title, duration };
  }
}

class _3HENTAI_RULES {
  IS_VIDEO_PAGE = /^\/d\/\d+/.test(location.pathname);
  IS_SEARCH_PAGE = /^\/search/.test(location.pathname);

  paginationStrategy = getPaginationStrategy({});

  container = [...document.querySelectorAll('.listing-container')].pop();

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbs(html) {
    return html.querySelectorAll('.doujin-col');
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    let imgSrc = img.getAttribute('data-src') || img.getAttribute('src');
    if (!this.IS_VIDEO_PAGE) imgSrc = imgSrc?.replace('t5', 't3');
    img.classList.remove('lazyload');
    if (img.complete && img.getAttribute('src') && !img.src.includes('data:image')) {
      return {};
    }
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('.title').innerText);
    const duration = 0;
    return { title, duration };
  }
}

class EHENTAI_RULES {
  IS_VIDEO_PAGE = /^\/g\/\d+/.test(location.pathname);
  IS_SEARCH_PAGE = /f_search/.test(location.search) || /^\/tag\//.test(location.pathname);

  container = [...document.querySelectorAll('.itg.gld')].pop();

  constructor() {
    if (this.IS_SEARCH_PAGE) {
      this.setThumbnailMode();
    }

    const eHentaiNext = async () => {
      if (!unsafeWindow.PAGINATION_NEXT_) {
        unsafeWindow.PAGINATION_NEXT_ = [...document.querySelectorAll('a#dnext[href]')].pop().href;
      }
      const doc = await fetchHtml(unsafeWindow.PAGINATION_NEXT_);
      unsafeWindow.PAGINATION_NEXT_ = [...doc.querySelectorAll('a#dnext[href]')].pop().href;
    };

    const paginationUrlGenerator = () => {
      eHentaiNext();
      return unsafeWindow.PAGINATION_NEXT_;
    };

    this.paginationStrategy = getPaginationStrategy({});

    Object.assign(this.paginationStrategy, {
      getPaginationElement: () => document.querySelector('.searchnav + div + .searchnav'),
      getPaginationLast: () => 99999999,
      getPaginationOffset: () => 1,
      getPaginationUrlGenerator: () => paginationUrlGenerator
    });

    eHentaiNext();
  }

  setThumbnailMode() {
    const selectInputT = document.querySelector('option[value=t]');
    if (selectInputT) {
      const select = selectInputT.parentElement;
      if (select.value === 't') return;
      select.value = 't';
      select.dispatchEvent(new Event('change'));
    }
  }

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbs(html) {
    return html.querySelectorAll('.gl1t');
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    const imgSrc = img.getAttribute('data-lazy-load') || img.getAttribute('src');
    if (!img.getAttribute('data-lazy-load')) return {};
    if (img.complete && img.getAttribute('src') && !img.src.includes('data:image')) {
      return {};
    }
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('.glname').innerText);
    const duration = 0;
    return { title, duration };
  }
}

const isNHENTAI = window.location.href.includes('nhentai');
const is3HENTAI = window.location.href.includes('3hentai');
const isEHENTAI = window.location.href.includes('e-henta');

let RULES;
if (is3HENTAI) RULES = new _3HENTAI_RULES();
if (isNHENTAI) RULES = new NHENTAI_RULES();
if (isEHENTAI) RULES = new EHENTAI_RULES();

//====================================================================================================

const filterDescriptors = {
  english: { query: 'english', name: '🇬🇧' },
  japanese: { query: 'japanese', name: '🇯🇵' },
  chinese: { query: 'chinese', name: '🇨🇳' },
  gay: { query: '-gay', name: 'Exclude Gay' },
  fullColor: { query: 'color', name: 'Full Color' },
};

function checkURL(url_) {
  return Object.keys(filterDescriptors).reduce((url, k) => {
    const q = filterDescriptors[k].query;
    return state.custom[k]
      ? url.includes(q)
        ? url
        : `${url}+${q}`
      : url.replace(`+${q}`, () => '');
  }, url_);
}

function filtersUI(state) {
  const btnContainer = Array.from(document.querySelectorAll('.sort-type')).pop();
  const descs = Array.from(Object.keys(filterDescriptors));
  [descs.slice(0, 3), [descs[3]], [descs[4]]].forEach((groupOfButtons) => {
    const btns = parseDom(`<div class="sort-type"></div>`);
    groupOfButtons.forEach((k) => {
      const btn = parseDom(
        `<a href="#" ${state.custom[k] ? 'style="background: rgba(59, 49, 70, 1)"' : ''}>${filterDescriptors[k].name}</a>`,
      );
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        state.custom[k] = !state.custom[k];
        window.location.href = checkURL(window.location.href);
      });
      btns.append(btn);
    });
    btnContainer?.after(btns);
  });
  const fixedURL = checkURL(window.location.href);
  if (window.location.href !== fixedURL) window.location.href = checkURL(window.location.href);
}

function findSimilar(state) {
  let tags = Array.from(document.querySelectorAll('.tags .tag[href^="/tag/"] .name'))
    .map((tag) => tag.innerText)
    .join(' ')
    .split(' ');
  tags = Array.from(new Set(tags)).sort((a, b) => a.length < b.length);

  const urls = {
    searchSimilar: `/search/?q=${tags.slice(0, 5).join('+')}`,
    searchSimilarLess: `/search/?q=${tags.reverse().slice(0, 5).join('+')}`,
  };

  Object.keys(urls).forEach((url) => {
    urls[url] = checkURL(urls[url]);
  });

  Array.from(document.links)
    .filter((l) => /\/(search|category|tag|character|artist|group|parody)\/\w+/.test(l.href))
    .forEach((l) => {
      l.href = checkURL(
        l.href
          .replace(/(search|category|tag|character|artist|group|parody)\//, 'search/?q=')
          .replace(/\/$/, ''),
      );
    });

  document
    .querySelector('.buttons')
    .append(
      parseDom(
        `<a href="${urls.searchSimilar}" class="btn" style="background: rgba(59, 49, 70, 1)"><i class="fa fa-search"></i> Similar</a>`,
      ),
      parseDom(
        `<a href="${urls.searchSimilarLess}" class="btn" style="background: rgba(59, 49, 70, .9)"><i class="fa fa-search"></i> Less Similar</a>`,
      ),
    );
}

//====================================================================================================

function route() {
  if (!state.custom && isNHENTAI) {
    const custom = Object.entries(filterDescriptors).reduce((acc, [k, _]) => {
      acc[k] = false;
      return acc;
    }, {});
    Object.assign(state, { custom });
  }

  if (RULES.IS_VIDEO_PAGE) {
    if (isNHENTAI) findSimilar(state);
  }

  if (RULES.container) {
    parseData(RULES.container);
  }

  if (RULES.IS_SEARCH_PAGE && isNHENTAI) {
    filtersUI(state);
  }

  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  delete DefaultScheme.durationFilter;
  new JabroniOutfitUI(store, DefaultScheme);
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateInclExclMiscPagination);
const { state } = store;
const { applyFilters, parseData } = new DataManager(RULES, state);
store.subscribe(applyFilters);

route();
