// ==UserScript==
// @name         universal-rules
// @namespace    Violentmonkey Scripts
// @version      0.1
// @license      MIT
// @description  html parser
// @author       smartacephale
// @match        *://*/*
// @downloadURL none
// ==/UserScript==

class UNIVERSAL_RULES {
  static parsePagination(document) {
    const paginations = document.querySelectorAll('.pagination');
    return Array.from(paginations).pop();
  }

  static parsePaginationLast(pagination) {
    const el = pagination.querySelector('.last-page');
    return parseInt(el.innerText) || 1;
  }

  static parseThumbData(thumb, thumbCallback) {
    const uploader = bhutils.sanitizeStr(thumb.querySelector('[class*=name], .uploader')?.innerText);
    let title = bhutils.sanitizeStr(
      thumb.querySelector('[title]')?.getAttribute('title') ||
      thumb.querySelector('[class*=title], header')?.innerText);
    let duration = bhutils.sanitizeStr(thumb.querySelector('[class*=duration], .size')?.innerText);

    //   temp0.textContent.match(/\w+?h?\w+?m?\w+?s?|\w+:\w+:?\w+?/)[0]
    
    if (uploader && title !== uploader) {
      title = title.concat(` user:${uploader}`);
    }

    duration = bhutils.timeToSeconds(duration);

    if (thumbCallback) {
      thumbCallback();
    }

    return { title, duration }
  }
}
