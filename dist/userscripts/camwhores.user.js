// ==UserScript==
// @name         CamWhores PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.3
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title, Duration and Private/Public. Mass friend request button. Download button
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=3hentai.net
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.camwhores.*/*
// @match        https://*.camwhores.tv
// @exclude      https://*.camwhores.tv/*mode=async*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.6/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  class LSKDB {
    constructor(prefix = "lsm-", lockKey = "lsmngr-lock") {
      this.prefix = prefix;
      this.lockKey = lockKey;
    }
    prefixedKey(key) {
      return `${this.prefix}${key}`;
    }
    getAllKeys() {
      const res = [];
      for (const key in localStorage) {
        if (key.startsWith(this.prefix)) {
          res.push(key.slice(this.prefix.length));
        }
      }
      return res;
    }
    getKeys(n = 12, remove = true) {
      const res = [];
      for (const key in localStorage) {
        if (res.length >= n) break;
        if (key.startsWith(this.prefix)) {
          res.push(key.slice(this.prefix.length));
        }
      }
      if (remove) {
        res.forEach((k) => this.removeKey(k));
      }
      return res;
    }
    hasKey(key) {
      return localStorage.getItem(this.prefixedKey(key)) !== null;
    }
    removeKey(key) {
      localStorage.removeItem(this.prefixedKey(key));
    }
    setKey(key) {
      localStorage.setItem(this.prefixedKey(key), "");
    }
    isLocked() {
      const lock = parseInt(localStorage.getItem(this.lockKey));
      const locktime = 5 * 60 * 1e3;
      return !(!lock || Date.now() - lock > locktime);
    }
    lock(value) {
      if (value) {
        localStorage.setItem(this.lockKey, JSON.stringify(Date.now()));
      } else {
        localStorage.removeItem(this.lockKey);
      }
    }
  }

  var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : undefined)();
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const $ = _unsafeWindow.$;
  _GM_addStyle(`
.item.private .thumb, .item .thumb.private { opacity: 1 !important; }
.haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
.haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
.friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
`);
  const IS_MEMBER_PAGE = /^(\/members\/\d+\/|\/my\/)$/.test(location.pathname);
  const IS_MESSAGES = /^\/my\/messages\//.test(location.pathname);
  const IS_COMMUNITY_LIST = /\/members\/$/.test(location.pathname);
  const IS_VIDEO_PAGE = /^(\/videos)?\/\d+\//.test(location.pathname);
  const IS_LOGGED_IN = document.cookie.includes("kt_member");
  const rules = new core.RulesGlobal({
    containerSelector: '[id*="playlist"]:has(> .item .title),[id*="videos"]:has(> .item .title),form:has(>.item .title)',
    paginationStrategyOptions: {
      paginationSelector: ".pagination:not([id *= member])",
      overwritePaginationLast: IS_MEMBER_PAGE ? () => 1 : (x) => x === 9 ? 9999 : x
    },
    getThumbImgDataAttrSelector: "data-original",
    getThumbImgDataStrategy: "auto",
    thumbsSelector: ".list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)",
    gropeStrategy: "all-in-all",
    getThumbDataStrategy: "auto-select",
    customThumbDataSelectors: {
      private: { type: "boolean", selector: "[class*=private]" }
    },
    customDataSelectorFns: [
      "filterInclude",
      "filterExclude",
      "filterDuration",
      {
        filterPrivate: (e, state) => state.filterPrivate && e.private
      },
      {
        filterPublic: (e, state) => state.filterPublic && !e.private
      }
    ],
    schemeOptions: [
      "Text Filter",
      "Duration Filter",
      "Privacy Filter",
      "Badge",
      {
        title: "Advanced",
        content: [
          {
            autoRequestAccess: false,
            label: "auto send friend request on check access"
          }
        ]
      }
    ],
    animatePreview
  });
  function animatePreview(container) {
    const tick = new utils.Tick(500);
    function killjquery(n = 10) {
      if (n > 0) {
        n--;
        $("img[data-cnt]").off();
        setTimeout(() => killjquery(n), 250);
      }
    }
    killjquery();
    function rotateImg(src, count) {
      return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${utils.circularShift(parseInt(n), count)}`);
    }
    utils.onPointerOverAndLeave(
      container,
      (target) => target.tagName === "IMG" && target.classList.contains("thumb") && !!target.getAttribute("src") && !/data:image|avatar/.test(target.getAttribute("src")),
      (_target) => {
        const target = _target;
        const origin = target.src;
        const count = parseInt(target.getAttribute("data-cnt")) || 5;
        tick.start(
          () => {
            target.src = rotateImg(target.src, count);
          },
          () => {
            target.src = origin;
          }
        );
        return {
          leaveTarget: target.closest(".item")
        };
      },
      () => tick.stop()
    );
  }
  const createDownloadButton = () => utils.downloader({
    append: ".tabs-menu > ul",
    after: "",
    button: '<li><a href="#tab_comments" class="toggle-button" style="text-decoration: none;">download 📼</a></li>',
    cbBefore: () => $(".fp-ui").click()
  });
  const DEFAULT_FRIEND_REQUEST_FORMDATA = utils.objectToFormData({
    message: "",
    action: "add_to_friends_complete",
    function: "get_block",
    block_id: "member_profile_view_view_profile",
    format: "json",
    mode: "async"
  });
  const lskdb = new LSKDB();
  async function friendRequest(id) {
    const url = Number.isInteger(id) ? `${location.origin}/members/${id}/` : id;
    await fetch(url, { body: DEFAULT_FRIEND_REQUEST_FORMDATA, method: "post" });
  }
  function getMemberLinks(e) {
    return Array.from(
      e?.querySelectorAll(".item > a") || [],
      (l) => l.href
    ).filter((l) => /\/members\/\d+\/$/.test(l));
  }
  async function getMemberFriends(id) {
    const url = new URL(
      IS_COMMUNITY_LIST ? "/members/" : `/members/${id}/friends/`,
      location.origin
    );
    const doc = await utils.fetchHtml(url.href);
    const paginationStrategy = core.getPaginationStrategy({
      doc,
      url,
      overwritePaginationLast: (x) => x === 9 ? 999 : x
    });
    const gen = core.InfiniteScroller.generatorForPaginationStrategy(paginationStrategy);
    for (const url2 in gen) {
      const doc2 = await utils.fetchHtml(url2);
      getMemberLinks(doc2).forEach((a) => {
        const id2 = a.match(/\d+/)?.[0];
        lskdb.setKey(id2);
      });
    }
    await processFriendship();
  }
  let processFriendshipStarted = false;
  async function processFriendship(batchSize = 1, interval = 5e3) {
    if (lskdb.isLocked()) return;
    const friendlist = lskdb.getKeys(batchSize);
    if (friendlist?.length < 1) return;
    if (!processFriendshipStarted) {
      processFriendshipStarted = true;
      console.log("processFriendshipStarted");
    }
    lskdb.lock(true);
    const urls = friendlist.map((id) => `${location.origin}/members/${id}/`);
    for (const url of urls) {
      await utils.wait(interval);
      await friendRequest(url);
    }
    lskdb.lock(false);
    await processFriendship();
  }
  function createPrivateVideoFriendButton() {
    if (!document.querySelector(".no-player")) return;
    const member = document.querySelector(".no-player a")?.href;
    const button = utils.parseHtml(
      '<button class="friend-button"><span>Friend Request</span></button>'
    );
    document.querySelector(".no-player .message")?.append(button);
    button.addEventListener("click", () => friendRequest(member), { once: true });
  }
  function createFriendButton() {
    const button = utils.parseHtml(
      '<a href="#friend_everyone" class="button friend-button"><span>Friend Everyone</span></a>'
    );
    document.querySelector(".main-container-user > .headline, .headline")?.append(button);
    const memberid = location.pathname.match(/\d+/)?.[0];
    button.addEventListener(
      "click",
      () => {
        button.style.background = "radial-gradient(#ff6114, #5babc4)";
        button.innerText = "processing requests";
        getMemberFriends(memberid).then(() => {
          button.style.background = "radial-gradient(blue, lightgreen)";
          button.innerText = "friend requests sent";
        });
      },
      { once: true }
    );
  }
  async function requestAccess() {
    checkPrivateVidsAccess();
    setTimeout(processFriendship, 5e3);
  }
  async function checkPrivateVidsAccess() {
    const checkAccess = async (item) => {
      const videoURL = item.firstElementChild.href;
      const doc = await utils.fetchHtml(videoURL);
      if (!doc.querySelector(".player")) return;
      const haveAccess = !doc.querySelector(".no-player");
      if (!haveAccess && rules.store.state.autoRequestAccess) {
        const anchor = doc.querySelector(".message a");
        const uid = anchor?.href.match(/\d+/)?.at(-1);
        lskdb.setKey(uid);
      }
      item.classList.add(haveAccess ? "haveAccess" : "haveNoAccess");
    };
    const thumbs = document.querySelectorAll(
      ".item.private:not(.haveAccess,.haveNoAccess)"
    );
    for (const thumb of thumbs) {
      await checkAccess(thumb);
    }
  }
  function getUserInfo(e) {
    const uploadedCount = utils.querySelectorLastNumber("#list_videos_uploaded_videos strong", e);
    const friendsCount = utils.querySelectorLastNumber("#list_members_friends .headline", e);
    return { uploadedCount, friendsCount };
  }
  async function acceptFriendRequest(id) {
    const url = new URL(`/my/messages/${id}/`, location.origin);
    const memberUrl = new URL(`/members/${id}/`, location.origin);
    await fetch(url, {
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `action=confirm_add_to_friends&message_from_user_id=${id}&function=get_block&block_id=list_messages_my_conversation_messages&confirm=Confirm&format=json&mode=async`,
      method: "POST"
    });
    await utils.fetchHtml(memberUrl).then(
      (doc) => console.log("userInfo", memberUrl.href, getUserInfo(doc))
    );
  }
  async function clearMessages() {
    const pages = core.InfiniteScroller.generatorForPaginationStrategy(
      core.getPaginationStrategy({
        overwritePaginationLast: (x) => x === 9 ? 999 : x
      })
    );
    for await (const p of pages) {
      const doc = await utils.fetchHtml(p.url);
      const messages = Array.from(
        doc.querySelectorAll(
          "#list_members_my_conversations_items .item > a"
        ) || []
      ).map((a) => a.href);
      for (const m of messages) {
        await checkMessageHistory(m);
      }
    }
    async function deleteMessage(url, id) {
      const deleteURL = `${url}?mode=async&format=json&function=get_block&block_id=list_messages_my_conversation_messages&action=delete_conversation&conversation_user_id=${id}`;
      await fetch(deleteURL);
    }
    async function getConversation(url) {
      const doc = await utils.fetchHtml(url);
      const hasFriendRequest = !!doc.querySelector("input[value=confirm_add_to_friends]");
      const originalText = utils.querySelectorText(doc, ".original-text");
      const id = url.match(/\d+/)?.[0];
      const messages = utils.querySelectorText(doc, ".list-messages");
      return {
        id,
        hasFriendRequest,
        originalText,
        messages
      };
    }
    async function checkMessageHistory(url) {
      const { originalText, hasFriendRequest, id, messages } = await getConversation(url);
      if (!(originalText || hasFriendRequest)) {
        await deleteMessage(url, id);
      } else {
        console.log({ originalText, url, messages });
        if (hasFriendRequest) {
          await acceptFriendRequest(id);
        }
      }
    }
  }
  const FRIEND_REQUEST_INTERVAL = 5e3;
  if (IS_LOGGED_IN) {
    setTimeout(processFriendship, FRIEND_REQUEST_INTERVAL);
    if (IS_MEMBER_PAGE || IS_COMMUNITY_LIST) {
      createFriendButton();
    }
  }
  if (IS_VIDEO_PAGE) {
    createDownloadButton();
    createPrivateVideoFriendButton();
  }
  if (IS_MESSAGES) {
    const button = utils.parseHtml("<button>clear messages</button>");
    document.querySelector(".headline")?.append(button);
    button.addEventListener("click", clearMessages);
  }
  rules.store.eventSubject.subscribe((event) => {
    if (event.includes("check access")) {
      requestAccess();
    }
  });

})(core, utils);