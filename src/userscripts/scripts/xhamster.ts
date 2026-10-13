import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';

export const meta: MonkeyUserScript = {
  name: 'Xhamster PervertMonkey',
  version: '5.0.24',
  description:
    'Infinite scroll [optional], Filter by Title, Duration and Watched/Unwatched. Sort by Duration and Views',
  match: ['https://*.xhamster.com/*', 'https://*.xhamster.*/*'],
  exclude: 'https://*.xhamster.com/embed*',
  grant: ['unsafeWindow'],
};

const TAG = '[XH-PM standalone]';
const STORAGE_KEY = 'xhpm-standalone-v6-state';
const THUMB_SELECTOR = '.video-thumb';
const HIDDEN_ATTR = 'data-xhpm-hidden';
const EXTRA_ATTR = 'data-xhpm-extra';
const uw = unsafeWindow as any;

const DEFAULT_STATE = {
  title: '',
  minMinutes: '',
  maxMinutes: '',
  hideWatched: false,
  hideUnwatched: false,
  sort: 'none',
  infiniteScroll: false,
  collapsed: false,
};

let state: any = loadState();
let panel: any;
let statusEl: any;
let sentinel: any;
let sentinelObserver: any;
let mutationObserver: any;
let applyTimer = 0;
let routeHref = location.href;
let loadingMore = false;
let loadingStage = '';
let lastLoadMessage = '';
let nextPageUrl = null;
let extraHost: any = null;
const loadedUrls = new Set([stripHash(location.href)]);
const knownVideoUrls = new Set();
let preferredThumbPath: any[] | null = null;
let cardTemplate: any = null;

if (window.top === window.self) {
  injectStyle();
  buildPanel();
  installObservers();
  scheduleApply(0);
  console.info(TAG, 'Loaded. The stock page is left untouched until a filter/sort is actually selected.');
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...DEFAULT_STATE, ...saved };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function stripHash(url: any) {
  try {
    const u = new URL(url, location.href);
    u.hash = '';
    return u.href;
  } catch {
    return String(url || '');
  }
}

function cssEscapeText(text: any) {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  return String(text || '').replace(/[&<>]/g, (c) => entities[c] || c);
}

function injectStyle() {
  const style = document.createElement('style');
  style.textContent = `
    [${HIDDEN_ATTR}="1"] { display: none !important; }

    #xhpm-panel {
      position: fixed;
      top: 74px;
      right: 14px;
      z-index: 2147483646;
      width: 292px;
      max-height: calc(100vh - 90px);
      overflow: auto;
      box-sizing: border-box;
      padding: 0;
      border: 1px solid rgba(255,255,255,.17);
      border-radius: 10px;
      background: rgba(22,22,25,.96);
      color: #f2f2f2;
      font: 13px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 8px 28px rgba(0,0,0,.42);
      backdrop-filter: blur(10px);
    }
    #xhpm-panel * { box-sizing: border-box; }
    #xhpm-panel .xhpm-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 11px;
      font-weight: 700;
      border-bottom: 1px solid rgba(255,255,255,.10);
    }
    #xhpm-panel .xhpm-head button,
    #xhpm-panel .xhpm-reset {
      appearance: none;
      border: 1px solid rgba(255,255,255,.16);
      background: rgba(255,255,255,.07);
      color: inherit;
      border-radius: 6px;
      padding: 4px 7px;
      cursor: pointer;
    }
    #xhpm-panel .xhpm-body { padding: 10px 11px 11px; }
    #xhpm-panel.xhpm-collapsed .xhpm-body { display: none; }
    #xhpm-panel label { display: block; margin: 0 0 9px; }
    #xhpm-panel .xhpm-label { display: block; margin-bottom: 4px; opacity: .88; }
    #xhpm-panel input[type="text"],
    #xhpm-panel input[type="number"],
    #xhpm-panel select {
      width: 100%;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 6px;
      background: #111216;
      color: #fff;
      padding: 6px 7px;
      outline: none;
    }
    #xhpm-panel .xhpm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    #xhpm-panel .xhpm-check {
      display: flex;
      gap: 9px;
      align-items: center;
      justify-content: space-between;
      margin: 8px 0;
      cursor: pointer;
      user-select: none;
    }
    #xhpm-panel .xhpm-check > input[type="checkbox"] {
      position: absolute !important;
      opacity: 0 !important;
      pointer-events: none !important;
      width: 1px !important;
      height: 1px !important;
    }
    #xhpm-panel .xhpm-toggle {
      position: relative;
      flex: 0 0 48px;
      height: 25px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.22);
      background: rgba(255,255,255,.09);
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.15);
      transition: background .14s ease, border-color .14s ease;
    }
    #xhpm-panel .xhpm-toggle::before {
      content: "";
      position: absolute;
      width: 19px;
      height: 19px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #ddd;
      box-shadow: 0 1px 3px rgba(0,0,0,.45);
      transition: transform .14s ease;
    }
    #xhpm-panel .xhpm-toggle::after {
      content: "OFF";
      position: absolute;
      right: 5px;
      top: 5px;
      font-size: 9px;
      font-weight: 800;
      opacity: .66;
    }
    #xhpm-panel .xhpm-check > input[type="checkbox"]:checked + .xhpm-toggle {
      background: #2d7d46;
      border-color: #4daf69;
    }
    #xhpm-panel .xhpm-check > input[type="checkbox"]:checked + .xhpm-toggle::before {
      transform: translateX(23px);
      background: #fff;
    }
    #xhpm-panel .xhpm-check > input[type="checkbox"]:checked + .xhpm-toggle::after {
      content: "ON";
      left: 6px;
      right: auto;
      color: #fff;
      opacity: .95;
    }
    #xhpm-panel .xhpm-check > input[type="checkbox"]:focus-visible + .xhpm-toggle {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
    #xhpm-panel .xhpm-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 10px;
      padding-top: 9px;
      border-top: 1px solid rgba(255,255,255,.10);
    }
    #xhpm-status { opacity: .78; font-size: 11px; line-height: 1.3; min-width: 0; }
    #xhpm-sentinel { height: 2px; width: 100%; pointer-events: none; }
    .xhpm-loading-note {
      text-align: center;
      padding: 14px 8px;
      opacity: .72;
      font: 12px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
  `;
  document.documentElement.appendChild(style);
}

function buildPanel() {
  panel = document.createElement('div');
  panel.id = 'xhpm-panel';
  panel.innerHTML = `
    <div class="xhpm-head">
      <span>XH PervertMonkey Fix</span>
      <button type="button" data-action="collapse">${state.collapsed ? '+' : '−'}</button>
    </div>
    <div class="xhpm-body">
      <label>
        <span class="xhpm-label">Title contains</span>
        <input type="text" data-key="title" placeholder="leave blank for all">
      </label>
      <div class="xhpm-row">
        <label>
          <span class="xhpm-label">Min minutes</span>
          <input type="number" min="0" step="0.1" data-key="minMinutes" placeholder="0">
        </label>
        <label>
          <span class="xhpm-label">Max minutes</span>
          <input type="number" min="0" step="0.1" data-key="maxMinutes" placeholder="∞">
        </label>
      </div>
      <label class="xhpm-check"><span>Hide watched</span><input type="checkbox" data-key="hideWatched"><span class="xhpm-toggle" aria-hidden="true"></span></label>
      <label class="xhpm-check"><span>Hide unwatched</span><input type="checkbox" data-key="hideUnwatched"><span class="xhpm-toggle" aria-hidden="true"></span></label>
      <label>
        <span class="xhpm-label">Sort</span>
        <select data-key="sort">
          <option value="none">Site order</option>
          <option value="duration-desc">Duration — longest first</option>
          <option value="duration-asc">Duration — shortest first</option>
          <option value="views-desc">Views — most first</option>
          <option value="views-asc">Views — least first</option>
        </select>
      </label>
      <label class="xhpm-check"><span>Infinite scroll</span><input type="checkbox" data-key="infiniteScroll"><span class="xhpm-toggle" aria-hidden="true"></span></label>
      <div class="xhpm-footer">
        <span id="xhpm-status">Scanning…</span>
        <button class="xhpm-reset" type="button" data-action="reset">Reset</button>
      </div>
    </div>
  `;

  document.documentElement.appendChild(panel);
  panel.classList.toggle('xhpm-collapsed', state.collapsed);
  statusEl = panel.querySelector('#xhpm-status');

  for (const input of panel.querySelectorAll('[data-key]') as HTMLInputElement[]) {
    const key = input.getAttribute('data-key') as string;
    if (input.type === 'checkbox') input.checked = !!state[key];
    else input.value = state[key] ?? '';

    const eventName = input.tagName === 'SELECT' || input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(eventName, () => {
      state[key] = input.type === 'checkbox' ? input.checked : input.value;
      if (key === 'hideWatched' && input.checked && state.hideUnwatched) {
        state.hideUnwatched = false;
        panel.querySelector('[data-key="hideUnwatched"]').checked = false;
      }
      if (key === 'hideUnwatched' && input.checked && state.hideWatched) {
        state.hideWatched = false;
        panel.querySelector('[data-key="hideWatched"]').checked = false;
      }
      saveState();
      if (key === 'infiniteScroll') configureInfiniteScroll();
      scheduleApply(30);
    });
  }

  panel.querySelector('[data-action="collapse"]')?.addEventListener('click', (e: Event) => {
    state.collapsed = !state.collapsed;
    panel.classList.toggle('xhpm-collapsed', state.collapsed);
    (e.currentTarget as HTMLElement).textContent = state.collapsed ? '+' : '−';
    saveState();
  });

  panel.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    state = { ...DEFAULT_STATE, collapsed: state.collapsed };
    for (const input of panel.querySelectorAll('[data-key]') as HTMLInputElement[]) {
      const key = input.getAttribute('data-key') as string;
      if (input.type === 'checkbox') input.checked = !!state[key];
      else input.value = state[key] ?? '';
    }
    saveState();
    configureInfiniteScroll();
    clearAllMutations();
    scheduleApply(0);
  });
}

function installObservers() {
  mutationObserver = new MutationObserver((mutations) => {
    if (location.href !== routeHref) {
      handleRouteChange();
      return;
    }

    let relevant = false;
    for (const mutation of mutations) {
      for (const rawNode of mutation.addedNodes) {
        const node = rawNode as any;
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          (node.matches?.(THUMB_SELECTOR) || node.querySelector?.(THUMB_SELECTOR))
        ) {
          relevant = true;
          break;
        }
      }
      if (relevant) break;
    }
    if (relevant) scheduleApply(120);
  });
  mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
  configureInfiniteScroll();
}

function handleRouteChange() {
  routeHref = location.href;
  console.info(TAG, 'Route changed:', routeHref);
  nextPageUrl = null;
  loadingMore = false;
  loadingStage = '';
  lastLoadMessage = '';
  loadedUrls.clear();
  loadedUrls.add(stripHash(routeHref));
  knownVideoUrls.clear();
  preferredThumbPath = null;
  cardTemplate = null;
  if (extraHost) extraHost.remove();
  extraHost = null;
  if (sentinel) sentinel.remove();
  sentinel = null;
  configureInfiniteScroll();
  scheduleApply(250);
}

function scheduleApply(delay: any = 80) {
  clearTimeout(applyTimer);
  applyTimer = window.setTimeout(applyFiltersAndSort, delay);
}

function getCards(root: any = document): any[] {
  return ([...root.querySelectorAll(THUMB_SELECTOR)] as any[]).filter((card: any) => !card.closest('#xhpm-panel'));
}

function getPrimaryCardParent(root: any = document) {
  const cards = getCards(root).filter((c) => !c.hasAttribute(EXTRA_ATTR));
  const counts = new Map();
  for (const card of cards) {
    if (!card.parentElement) continue;
    counts.set(card.parentElement, (counts.get(card.parentElement) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function cardTitle(card: any) {
  const stored = card?.getAttribute?.('data-xhpm-title');
  if (stored) return stored;
  const el = card.querySelector(
    '.video-thumb-info__name, .video-thumb-info__name-link, .video-thumb-info > a, a[title], [title]',
  );
  return (el?.getAttribute?.('title') || el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function parseDurationToSeconds(text: any) {
  const clean = String(text || '').trim();
  if (!clean) return null;

  const colon = clean.match(/\b(\d{1,3}):([0-5]?\d)(?::([0-5]?\d))?\b/);
  if (colon) {
    if (colon[3] != null) return Number(colon[1]) * 3600 + Number(colon[2]) * 60 + Number(colon[3]);
    return Number(colon[1]) * 60 + Number(colon[2]);
  }

  const h = clean.match(/(\d+(?:\.\d+)?)\s*h/i);
  const m = clean.match(/(\d+(?:\.\d+)?)\s*m/i);
  const sec = clean.match(/(\d+(?:\.\d+)?)\s*s/i);
  if (h || m || sec) {
    return (Number(h?.[1] || 0) * 3600) + (Number(m?.[1] || 0) * 60) + Number(sec?.[1] || 0);
  }

  return null;
}

function cardDuration(card: any) {
  const stored = Number(card?.getAttribute?.('data-xhpm-duration'));
  if (Number.isFinite(stored) && stored >= 0) return stored;
  const el = card.querySelector(
    '.thumb-image-container__duration, [data-role="video-duration"], [class*="duration"]',
  );
  return parseDurationToSeconds(el?.textContent || '');
}

function parseMetric(text: any) {
  const clean = String(text || '').replace(/,/g, '').trim();
  const match = clean.match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const mul = { K: 1e3, M: 1e6, B: 1e9 }[(match[2] || '').toUpperCase()] || 1;
  return value * mul;
}

function cardViews(card: any) {
  const stored = Number(card?.getAttribute?.('data-xhpm-views'));
  if (Number.isFinite(stored) && stored >= 0) return stored;
  const el = card.querySelector('.video-thumb-views, [class*="views"], [data-role*="views"]');
  return parseMetric(el?.textContent || '');
}

function cardUrl(card: any) {
  const stored = card?.getAttribute?.('data-xhpm-url');
  if (stored) return stripHash(stored);
  const a = card.matches('a[href]') ? card : card.querySelector('a[href]');
  return a?.href ? stripHash(a.href) : '';
}

function hasWatchedMarker(card: any) {
  if (card?.getAttribute?.('data-xhpm-watched-known') === '1') {
    return card.getAttribute('data-xhpm-watched') === '1';
  }
  return !!card.querySelector(
    '[data-role="video-watched"], [data-watched="true"], [aria-label*="watched" i], [title*="watched" i], .thumb-image-container__watched, [class~="watched"], [class*="watched-overlay"]',
  );
}

function activeFilters() {
  const title = String(state.title || '').trim().toLowerCase();
  const min = state.minMinutes === '' ? null : Number(state.minMinutes) * 60;
  const max = state.maxMinutes === '' ? null : Number(state.maxMinutes) * 60;
  return {
    title,
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
    hideWatched: !!state.hideWatched,
    hideUnwatched: !!state.hideUnwatched,
  };
}

function clearAllMutations() {
  for (const card of getCards()) {
    card.removeAttribute(HIDDEN_ATTR);
    card.style.removeProperty('order');
  }
  updateStatus();
}

function applyFiltersAndSort() {
  const cards = getCards();
  if (!cards.length) {
    if (statusEl) statusEl.textContent = 'No video cards yet';
    return;
  }

  const filters = activeFilters();
  const anyWatchedMarkers = cards.some((card: any) => hasWatchedMarker(card));

  knownVideoUrls.clear();
  for (const card of cards) {
    const url = cardUrl(card);
    if (url) knownVideoUrls.add(url);

    let hide = false;
    const title = cardTitle(card);
    const duration = cardDuration(card);
    const watched = hasWatchedMarker(card);

    // Conservative filtering: if xHamster stopped exposing a field we need,
    // leave the card visible instead of treating missing data as a match.
    if (filters.title && title && !title.toLowerCase().includes(filters.title)) hide = true;
    if (filters.min != null && duration != null && duration < filters.min) hide = true;
    if (filters.max != null && duration != null && duration > filters.max) hide = true;
    if (filters.hideWatched && watched) hide = true;
    if (filters.hideUnwatched && anyWatchedMarkers && !watched) hide = true;

    if (hide) card.setAttribute(HIDDEN_ATTR, '1');
    else card.removeAttribute(HIDDEN_ATTR);
  }

  applySort(cards);
  updateStatus(cards, anyWatchedMarkers);
  if (state.infiniteScroll) ensureSentinel();
}

function applySort(cards: any = getCards()) {
  if (state.sort === 'none') {
    for (const card of cards) card.style.removeProperty('order');
    return;
  }

  const [key, direction] = String(state.sort).split('-');
  const byParent = new Map();
  for (const card of cards) {
    const parent = card.parentElement;
    if (!parent) continue;
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(card);
  }

  for (const group of byParent.values()) {
    const decorated = group.map((card: any, index: number) => {
      const value = key === 'duration' ? cardDuration(card) : cardViews(card);
      return { card, index, value };
    });
    decorated.sort((a: any, b: any) => {
      const aMissing = a.value == null || !Number.isFinite(a.value);
      const bMissing = b.value == null || !Number.isFinite(b.value);
      if (aMissing && bMissing) return a.index - b.index;
      if (aMissing) return 1;
      if (bMissing) return -1;
      const cmp = a.value - b.value;
      return direction === 'asc' ? cmp : -cmp;
    });
    decorated.forEach(({ card }: any, index: number) => card.style.setProperty('order', String(index), 'important'));
  }
}

function updateStatus(cards: any = getCards(), anyWatchedMarkers = cards.some((card: any) => hasWatchedMarker(card))) {
  if (!statusEl) return;
  const visible = cards.filter((c: any) => !c.hasAttribute(HIDDEN_ATTR)).length;
  const extras = cards.filter((c: any) => c.hasAttribute(EXTRA_ATTR)).length;
  let text = `${visible}/${cards.length} visible`;
  if (extras) text += ` · +${extras} loaded`;
  if (state.hideUnwatched && !anyWatchedMarkers) text += ' · watched marker not found';
  if (state.infiniteScroll) text += ' · ∞ ON';
  if (loadingMore) text += ` · ${loadingStage || 'loading…'}`;
  else if (lastLoadMessage) text += ` · ${lastLoadMessage}`;
  statusEl.textContent = text;
}

function setLoading(stage: any) {
  loadingMore = true;
  loadingStage = stage || 'loading…';
  lastLoadMessage = '';
  updateStatus();
}

function finishLoading(message: any = '') {
  loadingMore = false;
  loadingStage = '';
  lastLoadMessage = message;
  updateStatus();
}

function configureInfiniteScroll() {
  if (sentinelObserver) {
    sentinelObserver.disconnect();
    sentinelObserver = null;
  }
  if (!state.infiniteScroll) {
    if (sentinel) sentinel.remove();
    sentinel = null;
    loadingMore = false;
    loadingStage = '';
    lastLoadMessage = '';
    updateStatus();
    return;
  }

  updateStatus();
  ensureSentinel();
  sentinelObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) maybeLoadMore();
  }, { rootMargin: '1400px 0px' });
  if (sentinel) sentinelObserver.observe(sentinel);
}

function ensureSentinel() {
  if (!state.infiniteScroll) return;
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'xhpm-sentinel';
  }

  const anchor = extraHost || getPrimaryCardParent();
  if (anchor?.parentElement) {
    anchor.insertAdjacentElement('afterend', sentinel);
    if (sentinelObserver) {
      sentinelObserver.disconnect();
      sentinelObserver.observe(sentinel);
    }
  }
}

function findVideoLoadMoreButton() {
  // Exact selector used by xHamster's video grids. Do not click generic
  // "show more" controls elsewhere on the page (comments, tags, text, etc.).
  const exact = document.querySelector(
    'button[data-role="show-more-next"]:not([disabled]), [data-role="show-more-next"] button:not([disabled])',
  );
  if (exact && !exact.closest('#xhpm-panel') && (exact as HTMLElement).dataset.xhpmFailed !== '1') return exact;

  // Conservative fallback: only consider a pagination-ish control physically
  // associated with the primary video grid.
  const grid = getPrimaryCardParent();
  if (!grid) return null;
  const section = grid.parentElement;
  if (!section) return null;

  const candidates = [...section.querySelectorAll('button:not([disabled]), a[href]')].filter((el) => {
    if (el.closest('#xhpm-panel') || (el as HTMLElement).dataset.xhpmFailed === '1') return false;
    const role = el.getAttribute('data-role') || '';
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const aria = el.getAttribute('aria-label') || '';
    return role === 'show-more-next' || /^(show\s*more|load\s*more|more\s*videos)$/i.test(text) || /more\s+videos/i.test(aria);
  });

  if (!candidates.length) return null;
  const gridRect = grid.getBoundingClientRect();
  return candidates
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.top >= gridRect.top + Math.max(40, gridRect.height * 0.65))
    .sort((a, b) => a.rect.top - b.rect.top)[0]?.el || null;
}

async function waitForNewCards(beforeUrls: any, beforeCount: any, timeoutMs: any = 9000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await sleep(180);
    const cards = getCards();
    if (cards.length > beforeCount) return true;
    for (const card of cards) {
      const url = cardUrl(card);
      if (url && !beforeUrls.has(url)) return true;
    }
  }
  return false;
}

function deriveLikelyNextPageUrl(baseUrl: any = location.href) {
  const u = new URL(baseUrl, location.href);
  const current = pageNumberFromUrl(u) || activePageNumber(document) || 1;
  u.searchParams.set('page', String(current + 1));
  return u.href;
}

async function maybeLoadMore() {
  if (!state.infiniteScroll || loadingMore) return;

  const moreButton = findVideoLoadMoreButton() as any;
  if (moreButton) {
    const beforeCards = getCards();
    const beforeCount = beforeCards.length;
    const beforeUrls = new Set(beforeCards.map(cardUrl).filter(Boolean));
    setLoading('asking site for more…');

    try {
      moreButton.click();
      const added = await waitForNewCards(beforeUrls, beforeCount, 9000);
      if (added) {
        finishLoading('site loaded more');
        scheduleApply(40);
        ensureSentinel();
        return;
      }

      // Don't get trapped clicking an unrelated/dead control forever.
      moreButton.dataset.xhpmFailed = '1';
      console.warn(TAG, 'Video load-more control produced no new cards; falling back to pagination.', moreButton);
      finishLoading('site button failed; trying page');
    } catch (error) {
      moreButton.dataset.xhpmFailed = '1';
      console.warn(TAG, 'Video load-more click failed; falling back to pagination.', error);
      finishLoading('site button failed; trying page');
    }
  }

  nextPageUrl ||= findNextPageUrl(document, location.href) || deriveLikelyNextPageUrl(location.href);
  const targetUrl = nextPageUrl ? stripHash(nextPageUrl) : '';
  if (!targetUrl || loadedUrls.has(targetUrl)) {
    finishLoading('no next page found');
    console.info(TAG, 'No additional pagination page found.');
    return;
  }

  setLoading(`loading page ${pageNumberFromUrl(targetUrl) || '?'}…`);

  try {
    const result = await loadBestAvailablePage(targetUrl);
    const added = appendPreparedCards(result.cards, targetUrl);
    loadedUrls.add(targetUrl);
    nextPageUrl = result.nextUrl || deriveNextUrlFromLoaded(targetUrl);
    if (added > 0) {
      finishLoading(`loaded ${added}`);
      console.info(TAG, 'Infinite scroll loaded:', targetUrl, 'cards:', added, 'next:', nextPageUrl, 'mode:', result.mode);
    } else {
      // If our guessed ?page=N URL simply returned page 1 again, stop retrying it.
      finishLoading('page had no new videos');
      console.warn(TAG, 'Pagination page contained no new unique video cards:', targetUrl);
      nextPageUrl = null;
    }
  } catch (error) {
    console.error(TAG, 'Infinite-scroll page load failed:', targetUrl, error);
    nextPageUrl = null;
    finishLoading(`load failed: ${String((error as Error)?.message || error).slice(0, 55)}`);
  } finally {
    scheduleApply(30);
    ensureSentinel();
  }
}

function deriveNextUrlFromLoaded(loadedUrl: any) {
  const u = new URL(loadedUrl, location.href);
  const current = pageNumberFromUrl(u);
  if (!current) return null;
  u.searchParams.set('page', String(current + 1));
  return u.href;
}

function findNextPageUrl(doc: any = document, baseUrl: any = location.href) {
  const base = new URL(baseUrl, location.href);

  const relNext = doc.querySelector('a[rel="next"][href]');
  if (relNext) return new URL(relNext.getAttribute('href'), base).href;

  const semantic = [...doc.querySelectorAll('a[href]')].find((a: any) => {
    const text = (a.textContent || '').trim();
    const aria = a.getAttribute('aria-label') || '';
    const title = a.getAttribute('title') || '';
    return /^(next|next page|›|»|→)$/i.test(text) || /next/i.test(`${aria} ${title}`);
  }) as any;
  if (semantic) return new URL(semantic.getAttribute('href'), base).href;

  const currentPage = pageNumberFromUrl(base) || activePageNumber(doc) || 1;
  const candidates = [...doc.querySelectorAll('nav a[href], [class*="pagination"] a[href], .prev-next-list a[href], .test-pager a[href]')]
    .map((a: any) => {
      const url = new URL(a.getAttribute('href'), base);
      const number = Number((a.textContent || '').trim()) || pageNumberFromUrl(url);
      return { url, number };
    })
    .filter((x: any) => Number.isFinite(x.number) && Number(x.number) > currentPage)
    .sort((a: any, b: any) => Number(a.number) - Number(b.number));
  if (candidates.length) return candidates[0].url.href;

  // Playlist fallback. This avoids the private playlist API entirely; we ask
  // xHamster for the normal page and read the embedded data instead.
  try {
    const paging = uw?.initials?.favoritesVideoPaging;
    const active = Number(paging?.active);
    const max = Number(paging?.maxPages);
    if (doc === document && Number.isFinite(active) && Number.isFinite(max) && active < max) {
      const url = new URL(base);
      url.searchParams.set('page', String(active + 1));
      return url.href;
    }
  } catch {}

  return null;
}

function activePageNumber(doc: any) {
  const el = doc.querySelector('[aria-current="page"], nav [class*="active"], [class*="pagination"] [class*="active"]');
  const n = Number((el?.textContent || '').trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

function pageNumberFromUrl(url: any) {
  const u = url instanceof URL ? url : new URL(url, location.href);
  const q = Number(u.searchParams.get('page'));
  if (Number.isFinite(q) && q > 0) return q;
  const path = u.pathname.match(/\/(?:page\/)?(\d+)\/?$/);
  return path ? Number(path[1]) : null;
}

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseFetchedHtml(html: any, url: any) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const base = doc.createElement('base');
  base.href = url;
  doc.head?.prepend(base);
  return doc;
}

function parseInitialsFromDocument(doc: any) {
  const script = doc.querySelector('#initials-script');
  let text = script?.textContent || '';
  if (!text) return null;
  text = text.replace(/^\s*window\.initials\s*=\s*/, '').replace(/;\s*$/, '').trim();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn(TAG, 'Found #initials-script but could not parse it as JSON.', error);
    return null;
  }
}

function getCurrentInitials() {
  try {
    if (uw?.initials && typeof uw.initials === 'object') return uw.initials;
  } catch {}
  return parseInitialsFromDocument(document);
}

function thumbUrlFromData(v: any) {
  const value = v?.pageURL || v?.pageUrl || v?.url || v?.link || '';
  try {
    return value ? stripHash(new URL(value, location.origin).href) : '';
  } catch {
    return value ? stripHash(value) : '';
  }
}

function looksLikeThumbData(v: any) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const url = thumbUrlFromData(v);
  if (!url || !/\/videos\/|\/moments\//i.test(url)) return false;
  return Boolean(v.title || v.imageURL || v.thumbURL || v.image || v.duration != null);
}

function findThumbArrays(root: any) {
  const found: any[] = [];
  const seen = new WeakSet();
  const walk = (value: any, path: any[], depth: number) => {
    if (!value || typeof value !== 'object' || depth > 12 || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      const items = value.filter(looksLikeThumbData);
      if (items.length) found.push({ path: [...path], items });
      // Some xHamster structures wrap thumb arrays inside array entries.
      for (let i = 0; i < Math.min(value.length, 100); i++) walk(value[i], [...path, i], depth + 1);
      return;
    }
    for (const [key, child] of Object.entries(value)) walk(child, [...path, key], depth + 1);
  };
  walk(root, [], 0);
  return found;
}

function getAtPath(root: any, path: any[]) {
  let value = root;
  for (const key of path || []) {
    if (value == null) return null;
    value = value[key];
  }
  return value;
}

function pathLabel(path: any[]) {
  return (path || []).filter((p) => typeof p !== 'number').join('.');
}

function choosePreferredThumbPath() {
  if (preferredThumbPath) return preferredThumbPath;
  const initials = getCurrentInitials();
  if (!initials) return null;
  const arrays = findThumbArrays(initials);
  if (!arrays.length) return null;

  const liveUrls = new Set(getCards(document).filter((c) => !c.hasAttribute(EXTRA_ATTR)).map(cardUrl).filter(Boolean));
  const liveCount = liveUrls.size;
  const ranked = arrays.map((entry: any) => {
    const urls = entry.items.map(thumbUrlFromData).filter(Boolean);
    const overlap = urls.filter((u: any) => liveUrls.has(u)).length;
    const label = pathLabel(entry.path);
    const nameBonus = /videoThumbProps|videoThumb|searchResult|favorite|playlist|videos/i.test(label) ? 20 : 0;
    const sizePenalty = liveCount ? Math.abs(urls.length - liveCount) * 0.03 : 0;
    return { ...entry, overlap, score: overlap * 1000 + nameBonus + urls.length - sizePenalty };
  }).sort((a, b) => b.score - a.score);

  preferredThumbPath = ranked[0].path;
  console.info(TAG, 'Using embedded xHamster thumbnail data:', pathLabel(preferredThumbPath || []),
    `(${ranked[0].items.length} items, ${ranked[0].overlap} matched live cards)`);
  return preferredThumbPath;
}

function selectThumbData(initials: any) {
  const preferred = choosePreferredThumbPath();
  if (preferred) {
    const exact = getAtPath(initials, preferred);
    if (Array.isArray(exact)) {
      const items = exact.filter(looksLikeThumbData);
      if (items.length) return { items, path: preferred };
    }
  }

  const arrays = findThumbArrays(initials);
  if (!arrays.length) return { items: [], path: null };
  arrays.sort((a: any, b: any) => {
    const aName = /videoThumbProps|videoThumb|searchResult|favorite|playlist|videos/i.test(pathLabel(a.path)) ? 1 : 0;
    const bName = /videoThumbProps|videoThumb|searchResult|favorite|playlist|videos/i.test(pathLabel(b.path)) ? 1 : 0;
    return (bName - aName) || (b.items.length - a.items.length);
  });
  // If the site changed the path between pages, follow the new best path from now on.
  preferredThumbPath = arrays[0].path;
  return { items: arrays[0].items, path: arrays[0].path };
}

function normalizeDurationValue(value: any) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && /^\d+(?:\.\d+)?$/.test(value.trim())) return asNumber;
    return parseDurationToSeconds(value);
  }
  return null;
}

function normalizeViewsValue(value: any) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') return parseMetric(value);
  return null;
}

function normalizeThumbData(raw: any) {
  const url = thumbUrlFromData(raw);
  const duration = normalizeDurationValue(raw?.duration ?? raw?.durationSeconds ?? raw?.length);
  const views = normalizeViewsValue(raw?.views ?? raw?.viewsCount ?? raw?.viewCount);
  const watchedRaw = raw?.watched ?? raw?.isWatched ?? raw?.viewed ?? raw?.isViewed;
  const watchedKnown = typeof watchedRaw === 'boolean' || watchedRaw === 0 || watchedRaw === 1;
  return {
    url,
    id: raw?.id ?? raw?.videoId ?? '',
    title: String(raw?.title ?? raw?.name ?? '').trim(),
    duration,
    views,
    image: raw?.imageURL || raw?.thumbURL || raw?.image || raw?.posterURL || raw?.previewImage || '',
    thumb: raw?.thumbURL || raw?.imageURL || raw?.image || '',
    preview: raw?.trailerURL || raw?.trailerUrl || raw?.previewVideo || '',
    previewFallback: raw?.trailerFallbackUrl || raw?.trailerFallbackURL || '',
    sprite: raw?.spriteURL || raw?.spriteUrl || '',
    watchedKnown,
    watched: watchedKnown ? Boolean(watchedRaw) : false,
  };
}

function formatDuration(seconds: any) {
  if (!Number.isFinite(seconds)) return '';
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: any) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function formatViews(value: any) {
  if (!Number.isFinite(value)) return '';
  if (value >= 1e9) return `${(value / 1e9).toFixed(value >= 10e9 ? 0 : 1)}B views`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 10e6 ? 0 : 1)}M views`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 10e3 ? 0 : 1)}K views`;
  return `${Math.round(value)} views`;
}

function getCardTemplate() {
  if (cardTemplate?.isConnected || cardTemplate) return cardTemplate;
  const cards = getCards(document).filter((c) => !c.hasAttribute(EXTRA_ATTR));
  cardTemplate = cards.find((c: any) => !hasWatchedMarker(c) && cardTitle(c) && cardDuration(c) != null) ||
    cards.find((c: any) => cardTitle(c) && cardDuration(c) != null) || cards[0] || null;
  return cardTemplate;
}

function setElementText(el: any, text: any) {
  if (!el || text === '') return;
  const leaf = [...el.querySelectorAll('*')].find((child: any) => child.children.length === 0 && /\S/.test(child.textContent || ''));
  (leaf || el).textContent = text;
}

function buildCardFromThumbData(raw: any) {
  const data = normalizeThumbData(raw);
  if (!data.url || !data.title || data.duration == null) return null;
  const template = getCardTemplate();
  if (!template) return null;

  const clone = document.importNode(template, true) as any;
  clone.setAttribute(EXTRA_ATTR, '1');
  clone.removeAttribute(HIDDEN_ATTR);
  clone.style.removeProperty('order');
  clone.setAttribute('data-xhpm-url', data.url);
  clone.setAttribute('data-xhpm-title', data.title);
  clone.setAttribute('data-xhpm-duration', String(data.duration));
  if (Number.isFinite(data.views)) clone.setAttribute('data-xhpm-views', String(data.views));
  if (data.watchedKnown) {
    clone.setAttribute('data-xhpm-watched-known', '1');
    clone.setAttribute('data-xhpm-watched', data.watched ? '1' : '0');
  } else {
    clone.setAttribute('data-xhpm-watched-known', '0');
    clone.removeAttribute('data-xhpm-watched');
  }
  if (data.id !== '') clone.setAttribute('data-video-id', String(data.id));
  if (data.preview) clone.setAttribute('data-previewvideo', data.preview);
  if (data.previewFallback) clone.setAttribute('data-previewvideo-fallback', data.previewFallback);
  if (data.sprite) clone.setAttribute('data-sprite', data.sprite);

  // Point every video-link within the cloned card at the new video. This keeps
  // xHamster's existing card markup/CSS while replacing only its metadata.
  for (const a of clone.querySelectorAll('a[href]') as HTMLAnchorElement[]) {
    try {
      const href = new URL(a.getAttribute('href') || '', location.origin);
      if (/\/videos\/|\/moments\//i.test(href.pathname)) a.href = data.url;
    } catch {}
  }
  if (clone.matches('a[href]')) clone.href = data.url;

  const titleEl = clone.querySelector('.video-thumb-info__name, .video-thumb-info__name-link, .video-thumb-info > a, a[title]') as any;
  if (titleEl) {
    titleEl.textContent = data.title;
    titleEl.setAttribute('title', data.title);
    if (titleEl.matches('a')) titleEl.href = data.url;
  }

  const durationText = formatDuration(data.duration);
  const durationEl = clone.querySelector('.thumb-image-container__duration, [data-role="video-duration"] div, [data-role="video-duration"], [class*="duration"]');
  setElementText(durationEl, durationText);

  if (Number.isFinite(data.views)) {
    const viewsEl = clone.querySelector('.video-thumb-views, [class*="views"], [data-role*="views"]');
    setElementText(viewsEl, formatViews(data.views));
  }

  const img = clone.querySelector('img') as HTMLImageElement | null;
  if (img && (data.image || data.thumb)) {
    const src = data.image || data.thumb;
    img.src = src;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    for (const attr of ['data-src', 'data-original', 'data-lazy-src', 'data-srcset', 'data-lazy-srcset']) img.removeAttribute(attr);
    img.style.removeProperty('opacity');
    img.style.removeProperty('visibility');
  }

  clone.removeAttribute('aria-busy');
  return clone;
}

function findPagingInfo(root: any, wantedPage: any = null) {
  const candidates: any[] = [];
  const seen = new WeakSet();
  const walk = (value: any, path: any[], depth: number) => {
    if (!value || typeof value !== 'object' || depth > 10 || seen.has(value)) return;
    seen.add(value);
    if (!Array.isArray(value)) {
      const max = Number(value.maxPages ?? value.totalPages ?? value.pageCount ?? value.pages);
      const active = Number(value.active ?? value.currentPage ?? value.page ?? value.current);
      if (Number.isFinite(max) && max >= 1 && Number.isFinite(active) && active >= 1) {
        const label = pathLabel(path);
        const preferredLabel = pathLabel(preferredThumbPath || []);
        let score = /paging|pagination|page/i.test(label) ? 20 : 0;
        if (wantedPage != null && active === wantedPage) score += 100;
        if (preferredLabel && label.split('.')[0] === preferredLabel.split('.')[0]) score += 15;
        candidates.push({ active, max, path, score });
      }
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < Math.min(value.length, 30); i++) walk(value[i], [...path, i], depth + 1);
    } else {
      for (const [key, child] of Object.entries(value)) walk(child, [...path, key], depth + 1);
    }
  };
  walk(root, [], 0);
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

function nextUrlFromPaging(initials: any, currentUrl: any) {
  const wantedPage = pageNumberFromUrl(currentUrl);
  const paging = findPagingInfo(initials, wantedPage);
  if (!paging || paging.active >= paging.max) return null;
  const u = new URL(currentUrl, location.href);
  u.searchParams.set('page', String(paging.active + 1));
  return u.href;
}

async function loadInitialsPage(url: any) {
  setLoading(`fetching page ${pageNumberFromUrl(url) || '?'} data…`);
  const response = await fetch(url, {
    credentials: 'include',
    redirect: 'follow',
    headers: { Accept: 'text/html,application/xhtml+xml' },
  });
  if (!response.ok) throw new Error(`page request returned HTTP ${response.status}`);
  const finalUrl = response.url || url;
  const doc = parseFetchedHtml(await response.text(), finalUrl);
  const initials = parseInitialsFromDocument(doc);
  if (!initials) throw new Error('page had no parseable #initials-script data');

  const selected = selectThumbData(initials);
  if (!selected.items.length) throw new Error('embedded page data contained no video thumbnails');

  loadingStage = `building ${selected.items.length} cards from page data…`;
  updateStatus();
  const cards = selected.items.map(buildCardFromThumbData).filter(Boolean);
  if (!cards.length) throw new Error(`found ${selected.items.length} video records but could not build any cards`);

  const nextUrl = findNextPageUrl(doc, finalUrl) || nextUrlFromPaging(initials, finalUrl) ||
    (cards.length >= 20 ? deriveNextUrlFromLoaded(finalUrl) : null);
  return { cards, nextUrl, mode: `embedded data: ${pathLabel(selected.path || []) || 'unknown path'}` };
}

async function loadBestAvailablePage(url: any) {
  // xHamster's HTML currently carries the real video metadata in window.initials
  // even when the rendered markup is only gray skeletons. Use that data directly
  // instead of trying to make an invisible page hydrate every thumbnail.
  return loadInitialsPage(url);
}

function appendPreparedCards(cards: any, sourceUrl: any) {
  if (!cards?.length) return 0;

  if (!extraHost) {
    const primaryParent = getPrimaryCardParent();
    if (!primaryParent?.parentElement) throw new Error('Could not locate the live video-card container');
    extraHost = document.createElement(primaryParent.tagName.toLowerCase());
    extraHost.className = primaryParent.className;
    extraHost.id = 'xhpm-extra-pages';
    extraHost.setAttribute('data-xhpm-host', '1');
    primaryParent.insertAdjacentElement('afterend', extraHost);
  }

  let added = 0;
  for (const card of cards) {
    const url = cardUrl(card);
    if (!url || knownVideoUrls.has(url)) continue;
    // Generated cards carry normalized metadata in data-xhpm-* attributes, so
    // they never depend on xHamster's skeleton/lazy-image DOM state.
    if (cardDuration(card) == null || !cardTitle(card)) continue;

    extraHost.appendChild(card);
    knownVideoUrls.add(url);
    added++;
  }

  if (added === 0) console.info(TAG, 'Pagination page contained no new fully-hydrated cards:', sourceUrl);
  return added;
}
