// ==UserScript==
// @name        eporner gallery downloader
// @description downloads gallery zip archive
// @namespace   Violentmonkey Scripts
// @license     MIT
// @match       https://*.eporner.com/gallery/*
// @grant       GM_addStyle
// @version     1.0
// @author      smartacephale
// @supportURL  https://github.com/smartacephale/sleazy-fork
// @run-at      document-idle
// @icon        https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @require     https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// ==/UserScript==

GM_addStyle(`.download-button { font-size: 1rem; }`);

(function addDownloadBtn() {
    const btn = document.createElement("button");
    btn.innerText = "Download all images";
    btn.classList.add('download-button');
    btn.addEventListener("click", downloadZip);
    document.querySelector('#galleryheader').append(btn);
})();

function downloadZip() {
  const galleryURLs = Array.from(document.querySelectorAll('#container img')).map(e => e.src.replace(/_\d+x\d+/, ''));
  const zip = new JSZip();

  Promise.all(galleryURLs.map(async (url) => {
    const response = await fetch(url);
    const data = await response.blob();
    const imgName = url.split('/').reverse()[0];
    zip.file(imgName, data);
  })).then(() => {
    zip.generateAsync({ type:"blob" }).then((content) => {
        saveAs(content, `${document.title}.zip`);
    });
  });
}
