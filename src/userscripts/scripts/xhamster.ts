import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addStyle, unsafeWindow } from '$';
import {
  Observer,
  fetchText,
  parseHtml,
  parseNumericAbbreviation,
  parseUrl,
  querySelectorLast,
  querySelectorText,
  sanitizeStr,
  timeToSeconds,
  wait,
  watchDomChangesWithThrottle,
} from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Xhamster PervertMonkey',
  version: '5.0.25',
  description:
    'Infinite scroll [optional], Filter by Title, Duration and Watched/Unwatched. Sort by Duration and Views',
  match: ['https://*.xhamster.com/*', 'https://*.xhamster.*/*'],
  exclude: 'https://*.xhamster.com/embed*',
  grant: ['GM_addStyle', 'unsafeWindow'],
};

type State = {
  title: string;
  minMinutes: string;
  maxMinutes: string;
  hideWatched: boolean;
  hideUnwatched: boolean;
  sort: 'none' | 'duration-desc' | 'duration-asc' | 'views-desc' | 'views-asc';
  infiniteScroll: boolean;
  collapsed: boolean;
};

type ThumbPath = Array<string | number>;
type ThumbArray = { path: ThumbPath; items: Record<string, any>[] };
type NormalizedThumb = {
  url: string;
  id: string | number;
  title: string;
  duration: number | null;
  views: number | null;
  image: string;
  preview: string;
  previewFallback: string;
  sprite: string;
  watchedKnown: boolean;
  watched: boolean;
};
type PageResult = { cards: HTMLElement[]; nextUrl: string | null; mode: string };

const TAG = '[XH-PM]';
const STORAGE_KEY = 'xhpm-standalone-v6-state';
const THUMB_SELECTOR = '.video-thumb';
const HIDDEN_ATTR = 'data-xhpm-hidden';
const EXTRA_ATTR = 'data-xhpm-extra';
const uw = unsafeWindow as typeof window & { initials?: Record<string, any> };

const DEFAULT_STATE: State = {
  title: '',
  minMinutes: '',
  maxMinutes: '',
  hideWatched: false,
  hideUnwatched: false,
  sort: 'none',
  infiniteScroll: false,
  collapsed: false,
};

let state = loadState();
let panel: HTMLElement;
let statusEl: HTMLElement | null;
let sentinel: HTMLElement | null = null;
let sentinelObserver: Observer<HTMLElement> | null = null;
let domObserver: MutationObserver | null = null;
let applyTimer = 0;
let routeHref = location.href;
let loadingMore = false;
let loadingStage = '';
let lastLoadMessage = '';
let nextPageUrl: string | null = null;
let extraHost: HTMLElement | null = null;
const loadedUrls = new Set([stripHash(location.href)]);
const knownVideoUrls = new Set<string>();
let preferredThumbPath: ThumbPath | null = null;
let cardTemplate: HTMLElement | null = null;

if (window.top === window.self) {
  injectStyle();
  buildPanel();
  installObservers();
  scheduleApply(0);
}

function loadState(): State {
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function stripHash(value: string | URL) {
  try {
    const url = value instanceof URL ? new URL(value.href) : new URL(value, location.href);
    url.hash = '';
    return url.href;
  } catch {
    return String(value || '');
  }
}

function injectStyle() {
  GM_addStyle(`
    [${HIDDEN_ATTR}="1"] { display: none !important; }
    #xhpm-panel { position: fixed; top: 74px; right: 14px; z-index: 2147483646; width: 292px;
      max-height: calc(100vh - 90px); overflow: auto; border: 1px solid rgba(255,255,255,.17);
      border-radius: 10px; background: rgba(22,22,25,.96); color: #f2f2f2;
      font: 13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      box-shadow: 0 8px 28px rgba(0,0,0,.42); backdrop-filter: blur(10px); }
    #xhpm-panel * { box-sizing: border-box; }
    #xhpm-panel .xhpm-head { display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:10px 11px; font-weight:700; border-bottom:1px solid rgba(255,255,255,.10); }
    #xhpm-panel .xhpm-body { padding:10px 11px 11px; }
    #xhpm-panel.xhpm-collapsed .xhpm-body { display:none; }
    #xhpm-panel label { display:block; margin:0 0 9px; }
    #xhpm-panel .xhpm-label { display:block; margin-bottom:4px; opacity:.88; }
    #xhpm-panel input[type="text"], #xhpm-panel input[type="number"], #xhpm-panel select {
      width:100%; border:1px solid rgba(255,255,255,.16); border-radius:6px; background:#111216;
      color:#fff; padding:6px 7px; outline:none; }
    #xhpm-panel .xhpm-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    #xhpm-panel button { appearance:none; border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.07);
      color:inherit; border-radius:6px; padding:4px 7px; cursor:pointer; }
    #xhpm-panel .xhpm-check { display:flex; gap:9px; align-items:center; justify-content:space-between;
      margin:8px 0; cursor:pointer; user-select:none; }
    #xhpm-panel .xhpm-check > input { position:absolute!important; opacity:0!important; pointer-events:none!important;
      width:1px!important; height:1px!important; }
    #xhpm-panel .xhpm-toggle { position:relative; flex:0 0 48px; height:25px; border-radius:999px;
      border:1px solid rgba(255,255,255,.22); background:rgba(255,255,255,.09); }
    #xhpm-panel .xhpm-toggle::before { content:""; position:absolute; width:19px; height:19px; left:2px; top:2px;
      border-radius:50%; background:#ddd; transition:transform .14s ease; }
    #xhpm-panel .xhpm-toggle::after { content:"OFF"; position:absolute; right:5px; top:5px; font-size:9px; font-weight:800; opacity:.66; }
    #xhpm-panel input:checked + .xhpm-toggle { background:#2d7d46; border-color:#4daf69; }
    #xhpm-panel input:checked + .xhpm-toggle::before { transform:translateX(23px); background:#fff; }
    #xhpm-panel input:checked + .xhpm-toggle::after { content:"ON"; left:6px; right:auto; color:#fff; opacity:.95; }
    #xhpm-panel .xhpm-footer { display:flex; align-items:center; justify-content:space-between; gap:8px;
      margin-top:10px; padding-top:9px; border-top:1px solid rgba(255,255,255,.10); }
    #xhpm-status { opacity:.78; font-size:11px; line-height:1.3; min-width:0; }
    #xhpm-sentinel { height:2px; width:100%; pointer-events:none; }
  `);
}

function buildPanel() {
  panel = parseHtml(`
    <div id="xhpm-panel">
      <div class="xhpm-head">
        <span>XH PervertMonkey Fix</span>
        <button type="button" data-action="collapse">${state.collapsed ? '+' : '−'}</button>
      </div>
      <div class="xhpm-body">
        <label><span class="xhpm-label">Title contains</span><input type="text" data-key="title" placeholder="leave blank for all"></label>
        <div class="xhpm-row">
          <label><span class="xhpm-label">Min minutes</span><input type="number" min="0" step="0.1" data-key="minMinutes" placeholder="0"></label>
          <label><span class="xhpm-label">Max minutes</span><input type="number" min="0" step="0.1" data-key="maxMinutes" placeholder="∞"></label>
        </div>
        <label class="xhpm-check"><span>Hide watched</span><input type="checkbox" data-key="hideWatched"><span class="xhpm-toggle"></span></label>
        <label class="xhpm-check"><span>Hide unwatched</span><input type="checkbox" data-key="hideUnwatched"><span class="xhpm-toggle"></span></label>
        <label><span class="xhpm-label">Sort</span>
          <select data-key="sort">
            <option value="none">Site order</option><option value="duration-desc">Duration — longest first</option>
            <option value="duration-asc">Duration — shortest first</option><option value="views-desc">Views — most first</option>
            <option value="views-asc">Views — least first</option>
          </select>
        </label>
        <label class="xhpm-check"><span>Infinite scroll</span><input type="checkbox" data-key="infiniteScroll"><span class="xhpm-toggle"></span></label>
        <div class="xhpm-footer"><span id="xhpm-status">Scanning…</span><button type="button" data-action="reset">Reset</button></div>
      </div>
    </div>`);

  document.documentElement.append(panel);
  panel.classList.toggle('xhpm-collapsed', state.collapsed);
  statusEl = panel.querySelector('#xhpm-status');

  for (const input of panel.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-key]')) {
    const key = input.dataset.key as keyof State;
    if (input instanceof HTMLInputElement && input.type === 'checkbox') input.checked = Boolean(state[key]);
    else input.value = String(state[key] ?? '');

    const event = input instanceof HTMLSelectElement || (input instanceof HTMLInputElement && input.type === 'checkbox') ? 'change' : 'input';
    input.addEventListener(event, () => {
      const value = input instanceof HTMLInputElement && input.type === 'checkbox' ? input.checked : input.value;
      (state as any)[key] = value;

      if (key === 'hideWatched' && value && state.hideUnwatched) {
        state.hideUnwatched = false;
        (panel.querySelector('[data-key="hideUnwatched"]') as HTMLInputElement).checked = false;
      }
      if (key === 'hideUnwatched' && value && state.hideWatched) {
        state.hideWatched = false;
        (panel.querySelector('[data-key="hideWatched"]') as HTMLInputElement).checked = false;
      }

      saveState();
      if (key === 'infiniteScroll') configureInfiniteScroll();
      scheduleApply(30);
    });
  }

  panel.querySelector('[data-action="collapse"]')?.addEventListener('click', (event) => {
    state.collapsed = !state.collapsed;
    panel.classList.toggle('xhpm-collapsed', state.collapsed);
    (event.currentTarget as HTMLElement).textContent = state.collapsed ? '+' : '−';
    saveState();
  });

  panel.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    state = { ...DEFAULT_STATE, collapsed: state.collapsed };
    for (const input of panel.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-key]')) {
      const key = input.dataset.key as keyof State;
      if (input instanceof HTMLInputElement && input.type === 'checkbox') input.checked = Boolean(state[key]);
      else input.value = String(state[key] ?? '');
    }
    saveState();
    clearAllMutations();
    configureInfiniteScroll();
    scheduleApply(0);
  });
}

function installObservers() {
  domObserver = watchDomChangesWithThrottle(
    document.body,
    () => {
      if (location.href !== routeHref) handleRouteChange();
      scheduleApply(0);
    },
    120,
    Infinity,
    { childList: true, subtree: true },
  );
  configureInfiniteScroll();
}

function handleRouteChange() {
  routeHref = location.href;
  nextPageUrl = null;
  loadingMore = false;
  loadingStage = '';
  lastLoadMessage = '';
  loadedUrls.clear();
  loadedUrls.add(stripHash(routeHref));
  knownVideoUrls.clear();
  preferredThumbPath = null;
  cardTemplate = null;
  extraHost?.remove();
  extraHost = null;
  sentinel?.remove();
  sentinel = null;
  configureInfiniteScroll();
}

function scheduleApply(delay = 80) {
  clearTimeout(applyTimer);
  applyTimer = window.setTimeout(applyFiltersAndSort, delay);
}

function getCards(root: ParentNode = document) {
  return [...root.querySelectorAll<HTMLElement>(THUMB_SELECTOR)].filter((card) => !card.closest('#xhpm-panel'));
}

function getPrimaryCardParent() {
  const thumbList = querySelectorLast<HTMLElement>(document, '.thumb-list');
  if (thumbList?.querySelector(THUMB_SELECTOR)) return thumbList;
  return getCards().find((card) => !card.hasAttribute(EXTRA_ATTR))?.parentElement || null;
}

function cardTitle(card: HTMLElement) {
  return card.dataset.xhpmTitle || sanitizeStr(querySelectorText(card, '.video-thumb-info__name,.video-thumb-info__name-link,.video-thumb-info>a,a[title]'));
}

function cardDuration(card: HTMLElement): number | null {
  const stored = Number(card.dataset.xhpmDuration);
  if (Number.isFinite(stored) && stored >= 0) return stored;
  const text = querySelectorText(card, '.thumb-image-container__duration,[data-role="video-duration"],[class*="duration"]');
  if (!text) return null;
  const seconds = timeToSeconds(text);
  return Number.isFinite(seconds) ? seconds : null;
}

function cardViews(card: HTMLElement): number | null {
  const stored = Number(card.dataset.xhpmViews);
  if (Number.isFinite(stored) && stored >= 0) return stored;
  const text = querySelectorText(card, '.video-thumb-views,[class*="views"],[data-role*="views"]');
  return text ? parseNumericAbbreviation(text) : null;
}

function cardUrl(card: HTMLElement) {
  const stored = card.dataset.xhpmUrl;
  if (stored) return stripHash(stored);
  const anchor = (card.matches('a[href]') ? card : card.querySelector('a[href]')) as HTMLAnchorElement | null;
  return anchor ? stripHash(parseUrl(anchor)) : '';
}

function hasWatchedMarker(card: HTMLElement) {
  if (card.dataset.xhpmWatchedKnown === '1') return card.dataset.xhpmWatched === '1';
  return Boolean(card.querySelector(
    '[data-role="video-watched"],[data-watched="true"],[aria-label*="watched" i],[title*="watched" i],.thumb-image-container__watched,[class~="watched"],[class*="watched-overlay"]',
  ));
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

  knownVideoUrls.clear();
  const titleFilter = sanitizeStr(state.title).toLowerCase();
  const min = state.minMinutes === '' ? null : Number(state.minMinutes) * 60;
  const max = state.maxMinutes === '' ? null : Number(state.maxMinutes) * 60;
  const anyWatchedMarkers = cards.some(hasWatchedMarker);

  for (const card of cards) {
    const url = cardUrl(card);
    if (url) knownVideoUrls.add(url);
    const title = cardTitle(card);
    const duration = cardDuration(card);
    const watched = hasWatchedMarker(card);
    let hide = false;

    if (titleFilter && title && !title.toLowerCase().includes(titleFilter)) hide = true;
    if (min != null && Number.isFinite(min) && duration != null && duration < min) hide = true;
    if (max != null && Number.isFinite(max) && duration != null && duration > max) hide = true;
    if (state.hideWatched && watched) hide = true;
    if (state.hideUnwatched && anyWatchedMarkers && !watched) hide = true;

    card.toggleAttribute(HIDDEN_ATTR, hide);
    if (hide) card.setAttribute(HIDDEN_ATTR, '1');
  }

  applySort(cards);
  updateStatus(cards, anyWatchedMarkers);
  if (state.infiniteScroll) ensureSentinel();
}

function applySort(cards = getCards()) {
  if (state.sort === 'none') {
    cards.forEach((card) => card.style.removeProperty('order'));
    return;
  }

  const [key, direction] = state.sort.split('-');
  const byParent = Map.groupBy(cards.filter((card) => card.parentElement), (card) => card.parentElement as HTMLElement);

  for (const group of byParent.values()) {
    group
      .map((card, index) => ({ card, index, value: key === 'duration' ? cardDuration(card) : cardViews(card) }))
      .sort((a, b) => {
        if (a.value == null && b.value == null) return a.index - b.index;
        if (a.value == null) return 1;
        if (b.value == null) return -1;
        return (a.value - b.value) * (direction === 'asc' ? 1 : -1);
      })
      .forEach(({ card }, index) => card.style.setProperty('order', String(index), 'important'));
  }
}

function updateStatus(cards = getCards(), anyWatchedMarkers = cards.some(hasWatchedMarker)) {
  if (!statusEl) return;
  const visible = cards.filter((card) => !card.hasAttribute(HIDDEN_ATTR)).length;
  const extras = cards.filter((card) => card.hasAttribute(EXTRA_ATTR)).length;
  const parts = [`${visible}/${cards.length} visible`];
  if (extras) parts.push(`+${extras} loaded`);
  if (state.hideUnwatched && !anyWatchedMarkers) parts.push('watched marker not found');
  if (state.infiniteScroll) parts.push('∞ ON');
  if (loadingMore) parts.push(loadingStage || 'loading…');
  else if (lastLoadMessage) parts.push(lastLoadMessage);
  statusEl.textContent = parts.join(' · ');
}

function setLoading(stage: string) {
  loadingMore = true;
  loadingStage = stage;
  lastLoadMessage = '';
  updateStatus();
}

function finishLoading(message = '') {
  loadingMore = false;
  loadingStage = '';
  lastLoadMessage = message;
  updateStatus();
}

function configureInfiniteScroll() {
  sentinelObserver?.dispose();
  sentinelObserver = null;

  if (!state.infiniteScroll) {
    sentinel?.remove();
    sentinel = null;
    loadingMore = false;
    loadingStage = '';
    lastLoadMessage = '';
    updateStatus();
    return;
  }

  ensureSentinel();
  sentinelObserver = new Observer(() => void maybeLoadMore());
  if (sentinel) sentinelObserver.observe(sentinel);
  updateStatus();
}

function ensureSentinel() {
  if (!state.infiniteScroll) return;
  sentinel ||= parseHtml('<div id="xhpm-sentinel"></div>');
  const target = sentinel;
  const anchor = extraHost || getPrimaryCardParent();
  if (target && anchor?.parentElement && target.previousElementSibling !== anchor) {
    anchor.insertAdjacentElement('afterend', target);
  }
}

function findVideoLoadMoreButton() {
  const exact = document.querySelector<HTMLElement>(
    'button[data-role="show-more-next"]:not([disabled]),[data-role="show-more-next"] button:not([disabled])',
  );
  if (exact && !exact.closest('#xhpm-panel') && exact.dataset.xhpmFailed !== '1') return exact;
  return null;
}

async function waitForNewCards(beforeUrls: Set<string>, beforeCount: number, timeoutMs = 9000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await wait(180);
    const cards = getCards();
    if (cards.length > beforeCount || cards.some((card) => {
      const url = cardUrl(card);
      return Boolean(url && !beforeUrls.has(url));
    })) return true;
  }
  return false;
}

function pageNumberFromUrl(input: string | URL) {
  const url = input instanceof URL ? input : new URL(input, location.href);
  const queryPage = Number(url.searchParams.get('page'));
  if (Number.isFinite(queryPage) && queryPage > 0) return queryPage;
  return Number(url.pathname.match(/\/(?:page\/)?(\d+)\/?$/)?.[1] || 0) || null;
}

function activePageNumber(root: ParentNode) {
  const el = root.querySelector('[aria-current="page"],nav [class*="active"],[class*="pagination"] [class*="active"]');
  const number = Number(sanitizeStr(el?.textContent || ''));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function deriveLikelyNextPageUrl(baseUrl = location.href) {
  const url = new URL(baseUrl, location.href);
  const current = pageNumberFromUrl(url) || activePageNumber(document) || 1;
  url.searchParams.set('page', String(current + 1));
  return url.href;
}

function deriveNextUrlFromLoaded(loadedUrl: string) {
  const url = new URL(loadedUrl, location.href);
  const current = pageNumberFromUrl(url);
  if (!current) return null;
  url.searchParams.set('page', String(current + 1));
  return url.href;
}

function findNextPageUrl(root: ParentNode = document, baseUrl = location.href) {
  const base = new URL(baseUrl, location.href);
  const relNext = root.querySelector<HTMLAnchorElement>('a[rel="next"][href]');
  if (relNext) return new URL(relNext.getAttribute('href') || '', base).href;

  const semantic = [...root.querySelectorAll<HTMLAnchorElement>('a[href]')].find((anchor) => {
    const label = `${sanitizeStr(anchor.textContent || '')} ${anchor.getAttribute('aria-label') || ''} ${anchor.title || ''}`;
    return /^(next|next page|›|»|→)\b/i.test(label) || /\bnext\b/i.test(label);
  });
  if (semantic) return new URL(semantic.getAttribute('href') || '', base).href;

  const current = pageNumberFromUrl(base) || activePageNumber(root) || 1;
  const candidate = [...root.querySelectorAll<HTMLAnchorElement>('nav a[href],[class*="pagination"] a[href],.prev-next-list a[href],.test-pager a[href]')]
    .map((anchor) => {
      const url = new URL(anchor.getAttribute('href') || '', base);
      return { url, number: Number(sanitizeStr(anchor.textContent || '')) || pageNumberFromUrl(url) || 0 };
    })
    .filter(({ number }) => number > current)
    .sort((a, b) => a.number - b.number)[0];
  return candidate?.url.href || null;
}

async function maybeLoadMore() {
  if (!state.infiniteScroll || loadingMore) return;

  const moreButton = findVideoLoadMoreButton();
  if (moreButton) {
    const beforeCards = getCards();
    const beforeUrls = new Set(beforeCards.map(cardUrl).filter(Boolean));
    setLoading('asking site for more…');
    moreButton.click();

    if (await waitForNewCards(beforeUrls, beforeCards.length)) {
      finishLoading('site loaded more');
      scheduleApply(40);
      return;
    }

    moreButton.dataset.xhpmFailed = '1';
    finishLoading('site button failed; trying page');
  }

  nextPageUrl ||= findNextPageUrl() || deriveLikelyNextPageUrl();
  const targetUrl = nextPageUrl ? stripHash(nextPageUrl) : '';
  if (!targetUrl || loadedUrls.has(targetUrl)) {
    finishLoading('no next page found');
    return;
  }

  setLoading(`loading page ${pageNumberFromUrl(targetUrl) || '?'}…`);
  try {
    const result = await loadInitialsPage(targetUrl);
    const added = appendPreparedCards(result.cards);
    loadedUrls.add(targetUrl);
    nextPageUrl = result.nextUrl || deriveNextUrlFromLoaded(targetUrl);
    finishLoading(added ? `loaded ${added}` : 'page had no new videos');
    if (!added) nextPageUrl = null;
  } catch (error) {
    console.error(TAG, 'Infinite-scroll page load failed:', error);
    nextPageUrl = null;
    finishLoading(`load failed: ${String((error as Error)?.message || error).slice(0, 55)}`);
  } finally {
    scheduleApply(30);
    ensureSentinel();
  }
}

function parseInitials(root: ParentNode) {
  let text = root.querySelector('#initials-script')?.textContent || '';
  if (!text) return null;
  text = text.replace(/^\s*window\.initials\s*=\s*/, '').replace(/;\s*$/, '').trim();
  try {
    return JSON.parse(text) as Record<string, any>;
  } catch (error) {
    console.warn(TAG, 'Could not parse #initials-script', error);
    return null;
  }
}

function getCurrentInitials() {
  return uw.initials || parseInitials(document);
}

function thumbUrlFromData(value: Record<string, any>) {
  const raw = value.pageURL || value.pageUrl || value.url || value.link || '';
  return raw ? stripHash(new URL(raw, location.origin)) : '';
}

function looksLikeThumbData(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const thumb = value as Record<string, any>;
  return /\/videos\/|\/moments\//i.test(thumbUrlFromData(thumb)) && Boolean(thumb.title || thumb.imageURL || thumb.thumbURL || thumb.duration != null);
}

function findThumbArrays(root: unknown) {
  const found: ThumbArray[] = [];
  const seen = new WeakSet<object>();

  const walk = (value: unknown, path: ThumbPath, depth: number) => {
    if (!value || typeof value !== 'object' || depth > 12 || seen.has(value)) return;
    seen.add(value);

    if (Array.isArray(value)) {
      const items = value.filter(looksLikeThumbData);
      if (items.length) found.push({ path: [...path], items });
      value.slice(0, 100).forEach((child, index) => walk(child, [...path, index], depth + 1));
      return;
    }

    Object.entries(value).forEach(([key, child]) => walk(child, [...path, key], depth + 1));
  };

  walk(root, [], 0);
  return found;
}

function getAtPath(root: any, path: ThumbPath) {
  return path.reduce((value, key) => value?.[key], root);
}

function pathLabel(path: ThumbPath) {
  return path.filter((part) => typeof part !== 'number').join('.');
}

function choosePreferredThumbPath() {
  if (preferredThumbPath) return preferredThumbPath;
  const initials = getCurrentInitials();
  if (!initials) return null;

  const liveUrls = new Set(getCards().filter((card) => !card.hasAttribute(EXTRA_ATTR)).map(cardUrl).filter(Boolean));
  const ranked = findThumbArrays(initials).map((entry) => {
    const urls = entry.items.map(thumbUrlFromData).filter(Boolean);
    const overlap = urls.filter((url) => liveUrls.has(url)).length;
    const nameBonus = /videoThumbProps|videoThumb|searchResult|favorite|playlist|videos/i.test(pathLabel(entry.path)) ? 20 : 0;
    return { ...entry, score: overlap * 1000 + nameBonus + urls.length };
  }).sort((a, b) => b.score - a.score);

  preferredThumbPath = ranked[0]?.path || null;
  return preferredThumbPath;
}

function selectThumbData(initials: Record<string, any>) {
  const preferred = choosePreferredThumbPath();
  if (preferred) {
    const exact = getAtPath(initials, preferred);
    if (Array.isArray(exact)) {
      const items = exact.filter(looksLikeThumbData);
      if (items.length) return { items, path: preferred };
    }
  }

  const arrays = findThumbArrays(initials).sort((a, b) => {
    const aBonus = /videoThumbProps|videoThumb|searchResult|favorite|playlist|videos/i.test(pathLabel(a.path)) ? 1 : 0;
    const bBonus = /videoThumbProps|videoThumb|searchResult|favorite|playlist|videos/i.test(pathLabel(b.path)) ? 1 : 0;
    return (bBonus - aBonus) || (b.items.length - a.items.length);
  });
  preferredThumbPath = arrays[0]?.path || null;
  return arrays[0] || { items: [], path: [] };
}

function normalizeDuration(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  if (/^\d+(?:\.\d+)?$/.test(value.trim())) return Number(value);
  const seconds = timeToSeconds(value);
  return Number.isFinite(seconds) ? seconds : null;
}

function normalizeViews(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return typeof value === 'string' && value.trim() ? parseNumericAbbreviation(value) : null;
}

function normalizeThumb(raw: Record<string, any>): NormalizedThumb {
  const watchedRaw = raw.watched ?? raw.isWatched ?? raw.viewed ?? raw.isViewed;
  const watchedKnown = typeof watchedRaw === 'boolean' || watchedRaw === 0 || watchedRaw === 1;
  return {
    url: thumbUrlFromData(raw),
    id: raw.id ?? raw.videoId ?? '',
    title: sanitizeStr(String(raw.title ?? raw.name ?? '')),
    duration: normalizeDuration(raw.duration ?? raw.durationSeconds ?? raw.length),
    views: normalizeViews(raw.views ?? raw.viewsCount ?? raw.viewCount),
    image: raw.imageURL || raw.thumbURL || raw.image || raw.posterURL || raw.previewImage || '',
    preview: raw.trailerURL || raw.trailerUrl || raw.previewVideo || '',
    previewFallback: raw.trailerFallbackUrl || raw.trailerFallbackURL || '',
    sprite: raw.spriteURL || raw.spriteUrl || '',
    watchedKnown,
    watched: watchedKnown ? Boolean(watchedRaw) : false,
  };
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatViews(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(value >= 1e10 ? 0 : 1)}B views`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 0 : 1)}M views`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}K views`;
  return `${Math.round(value)} views`;
}

function getCardTemplate() {
  cardTemplate ||= getCards().find((card) => !card.hasAttribute(EXTRA_ATTR) && cardTitle(card) && cardDuration(card) != null) || null;
  return cardTemplate;
}

function setElementText(element: Element | null, text: string) {
  if (!element || !text) return;
  const leaf = [...element.querySelectorAll('*')].find((child) => child.children.length === 0 && sanitizeStr(child.textContent || ''));
  (leaf || element).textContent = text;
}

function buildCardFromThumbData(raw: Record<string, any>) {
  const data = normalizeThumb(raw);
  const template = getCardTemplate();
  if (!template || !data.url || !data.title || data.duration == null) return null;

  const clone = parseHtml(template.outerHTML);
  clone.setAttribute(EXTRA_ATTR, '1');
  clone.dataset.xhpmUrl = data.url;
  clone.dataset.xhpmTitle = data.title;
  clone.dataset.xhpmDuration = String(data.duration);
  if (data.views != null) clone.dataset.xhpmViews = String(data.views);
  clone.dataset.xhpmWatchedKnown = data.watchedKnown ? '1' : '0';
  if (data.watchedKnown) clone.dataset.xhpmWatched = data.watched ? '1' : '0';
  if (data.id !== '') clone.dataset.videoId = String(data.id);
  if (data.preview) clone.dataset.previewvideo = data.preview;
  if (data.previewFallback) clone.dataset.previewvideoFallback = data.previewFallback;
  if (data.sprite) clone.dataset.sprite = data.sprite;

  for (const anchor of clone.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = new URL(anchor.getAttribute('href') || '', location.origin);
    if (/\/videos\/|\/moments\//i.test(href.pathname)) anchor.href = data.url;
  }

  const titleEl = clone.querySelector<HTMLElement>('.video-thumb-info__name,.video-thumb-info__name-link,.video-thumb-info>a,a[title]');
  if (titleEl) {
    titleEl.textContent = data.title;
    titleEl.setAttribute('title', data.title);
  }
  setElementText(clone.querySelector('.thumb-image-container__duration,[data-role="video-duration"] div,[data-role="video-duration"]'), formatDuration(data.duration));
  if (data.views != null) setElementText(clone.querySelector('.video-thumb-views,[class*="views"]'), formatViews(data.views));

  const img = clone.querySelector<HTMLImageElement>('img');
  if (img && data.image) {
    img.src = data.image;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    ['data-src', 'data-original', 'data-lazy-src', 'data-srcset', 'data-lazy-srcset'].forEach((attr) => img.removeAttribute(attr));
  }
  clone.removeAttribute('aria-busy');
  return clone;
}

function findPagingInfo(root: unknown, wantedPage: number | null) {
  const candidates: Array<{ active: number; max: number; score: number }> = [];
  const seen = new WeakSet<object>();

  const walk = (value: unknown, path: ThumbPath, depth: number) => {
    if (!value || typeof value !== 'object' || depth > 10 || seen.has(value)) return;
    seen.add(value);

    if (!Array.isArray(value)) {
      const object = value as Record<string, any>;
      const max = Number(object.maxPages ?? object.totalPages ?? object.pageCount ?? object.pages);
      const active = Number(object.active ?? object.currentPage ?? object.page ?? object.current);
      if (Number.isFinite(max) && Number.isFinite(active) && active >= 1 && max >= active) {
        let score = /paging|pagination|page/i.test(pathLabel(path)) ? 20 : 0;
        if (wantedPage != null && active === wantedPage) score += 100;
        candidates.push({ active, max, score });
      }
      Object.entries(object).forEach(([key, child]) => walk(child, [...path, key], depth + 1));
      return;
    }

    value.slice(0, 30).forEach((child, index) => walk(child, [...path, index], depth + 1));
  };

  walk(root, [], 0);
  return candidates.sort((a, b) => b.score - a.score)[0] || null;
}

function nextUrlFromPaging(initials: Record<string, any>, currentUrl: string) {
  const paging = findPagingInfo(initials, pageNumberFromUrl(currentUrl));
  if (!paging || paging.active >= paging.max) return null;
  const url = new URL(currentUrl, location.href);
  url.searchParams.set('page', String(paging.active + 1));
  return url.href;
}

async function loadInitialsPage(url: string): Promise<PageResult> {
  setLoading(`fetching page ${pageNumberFromUrl(url) || '?'} data…`);
  const html = await fetchText(url);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const initials = parseInitials(doc);
  if (!initials) throw new Error('page had no parseable #initials-script data');

  const selected = selectThumbData(initials);
  if (!selected.items.length) throw new Error('embedded page data contained no video thumbnails');

  loadingStage = `building ${selected.items.length} cards from page data…`;
  updateStatus();
  const cards = selected.items.map(buildCardFromThumbData).filter((card): card is HTMLElement => Boolean(card));
  if (!cards.length) throw new Error('video records found, but no cards could be built');

  return {
    cards,
    nextUrl: findNextPageUrl(doc, url) || nextUrlFromPaging(initials, url) || (cards.length >= 20 ? deriveNextUrlFromLoaded(url) : null),
    mode: `embedded data: ${pathLabel(selected.path) || 'unknown path'}`,
  };
}

function appendPreparedCards(cards: HTMLElement[]) {
  if (!cards.length) return 0;
  if (!extraHost) {
    const primary = getPrimaryCardParent();
    if (!primary?.parentElement) throw new Error('Could not locate the live video-card container');
    extraHost = document.createElement(primary.tagName.toLowerCase());
    extraHost.className = primary.className;
    extraHost.id = 'xhpm-extra-pages';
    primary.insertAdjacentElement('afterend', extraHost);
  }

  const host = extraHost;
  if (!host) throw new Error('Could not create the pagination card container');

  let added = 0;
  for (const card of cards) {
    const url = cardUrl(card);
    if (!url || knownVideoUrls.has(url) || !cardTitle(card) || cardDuration(card) == null) continue;
    host.append(card);
    knownVideoUrls.add(url);
    added++;
  }
  return added;
}
