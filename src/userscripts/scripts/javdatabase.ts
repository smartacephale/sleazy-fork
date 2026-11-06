import type { MonkeyUserScript } from 'vite-plugin-monkey';

export const meta: MonkeyUserScript = {
  name: 'JavDatabase PervertMonkey',
  version: '1.0.1',
  description: 'Adds search movie links',
  match: ['https://www.javdatabase.com/*'],
  grant: 'none',
};

interface Website {
  name: string;
  url: (u: string) => string;
}

const websites: Website[] = [
  { name: 'missav.ws', url: (u) => `https://missav.ws/en/search/${u}` },
  { name: 'javhdporn.net', url: (u) => `https://www.javhdporn.net/search/${u}/` },
  { name: 'javxxx.me', url: (u) => `https://www.javxxx.me/search/${u}/` },
];

function createLinks(name: string) {
  const websitesLinks = websites.map(
    (w) => `
      <a target="_blank" style='padding: 2px;' href="${w.url(name)}">
        <img class='wp-postratings-item' src="https://www.google.com/s2/favicons?sz=64&domain=${w.name}">
      </a>`,
  ).join(' ');

  return `<div style='display: flex;' >${websitesLinks}</div>`;
}

document.querySelectorAll('.card').forEach((e) => {
  const title = e.querySelector<HTMLElement>('.cut-text')?.innerText.trim() || "";
  console.log({ title });
  if (title?.length === 0) return;
  e.innerHTML += createLinks(title);
});
