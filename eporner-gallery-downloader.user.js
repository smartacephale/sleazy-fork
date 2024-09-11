// ==UserScript==
// @name        eporner gallery downloader
// @description downloads gallery zip archive
// @namespace   Violentmonkey Scripts
// @license     MIT
// @match       https://*.eporner.com/gallery/*
// @grant       GM_addStyle
// @version     1.1
// @author      smartacephale
// @supportURL  https://github.com/smartacephale/sleazy-fork
// @run-at      document-idle
// @icon        https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @require     https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// ==/UserScript==

// https://getcssscan.com/css-buttons-examples
GM_addStyle(`
.button-85 {
  padding: 0.6em 2em;
  border: none;
  outline: none;
  color: rgb(255, 255, 255);
  background: #111;
  cursor: pointer;
  position: relative;
  z-index: 0;
  border-radius: 10px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-85:before {
  content: "";
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00c8,
    #ff0000
  );
  position: absolute;
  top: -2px;
  left: -2px;
  background-size: 400%;
  z-index: -1;
  filter: blur(5px);
  -webkit-filter: blur(5px);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  animation: glowing-button-85 20s linear infinite;
  transition: opacity 0.3s ease-in-out;
  border-radius: 10px;
}

@keyframes glowing-button-85 {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

.button-85:after {
  z-index: -1;
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #222;
  left: 0;
  top: 0;
  border-radius: 10px;
}
`);

(function addDownloadBtn() {
    const btn = document.createElement("button");
    btn.innerText = "Download all images";
    btn.classList.add('button-85');
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
