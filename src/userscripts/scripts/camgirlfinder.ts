import type { MonkeyUserScript } from 'vite-plugin-monkey';

export const meta: MonkeyUserScript = {
  name: 'CamGirlFinder PervertMonkey',
  version: '1.6.0',
  description:
    'Adds model links for CamWhores, webcamrecordings, recu.me, camvideos, privat-zapisi',
  match: ['https://camgirlfinder.net/*'],
  grant: 'none',
};

interface Website {
  name: string;
  url: (u: string) => string;
}

const websites: Website[] = [
  { name: 'camwhores.tv', url: (u) => `https://camwhores.tv/search/${u}/` },
  {
    name: 'webcamrecordings.com',
    url: (u) => `https://www.webcamrecordings.com/modelSearch/${u}/page/1/`,
  },
  { name: 'camvideos.me', url: (u) => `https://camvideos.me/search/${u}` },
  { name: 'recu.me', url: (u) => `https://recu.me/performer/${u}` },
  {
    name: 'privat-zapisi.info',
    url: (u) => `https://www.privat-zapisi.info/search/${u}/`,
  },
];

function createLinks(name: string) {
  return websites
    .map(
      (w) => `
      <a rel="nofollow" href="${w.url(name)}">
      <img class="platform-icon" title="${w.name}" src="https://www.google.com/s2/favicons?sz=64&domain=${w.name}"></a>`,
    )
    .join(' ');
}

function addRedirectButton() {
  if (!document.body.querySelector<HTMLElement>('.model-name')?.innerText.trim()) return;

  document.querySelectorAll('.result:not(.fucked)').forEach((e) => {
    const name = e.querySelector<HTMLElement>('.model-name')?.innerText.trim() as string;
    if (name?.length === 0) return;
    (e.querySelector('p:last-child') as HTMLElement).innerHTML += createLinks(name);
    e.classList.add('fucked');
  });
}

let timeout: ReturnType<typeof setTimeout>;

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    clearTimeout(timeout);
    timeout = setTimeout(addRedirectButton, 300);
  });
});

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});

addRedirectButton();
