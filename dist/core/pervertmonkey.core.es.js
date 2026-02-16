var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _i2, _n, _t, _e2, _s2, _l2, _o2, _d, _p2, _g, _C_instances, r_fn, R_fn, b_fn, u_fn, m_fn, a_fn, P_fn, E_fn, S_fn, O_fn, k_fn, x_fn, h_fn, f_fn, T_fn, A_fn, y_fn, w_fn, c_fn, C_fn, _a2, _i3, _n2, _t2, _e3, _s3, _l3, _b;
import { GM_addStyle } from "vite-plugin-monkey/dist/client";
function chunks(arr, size) {
  return Array.from(
    { length: Math.ceil(arr.length / size) },
    (_2, i) => arr.slice(i * size, i * size + size)
  );
}
function* irange(start = 1, step = 1) {
  for (let i = start; ; i += step) {
    yield i;
  }
}
function range(size, start = 1, step = 1) {
  return irange(start, step).take(size).toArray();
}
function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
function splitWith(s, c = ",") {
  return s.split(c).map((s2) => s2.trim()).filter(Boolean);
}
function sanitizeStr(s) {
  return (s == null ? void 0 : s.replace(/\n|\t/g, " ").replace(/ {2,}/g, " ").trim()) || "";
}
function waitForElementToAppear(parent, selector, callback) {
  const observer = new MutationObserver((_mutations) => {
    const el2 = parent.querySelector(selector);
    if (el2) {
      observer.disconnect();
      callback(el2);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
function waitForElementToDisappear(observable, callback) {
  const observer = new MutationObserver((_mutations) => {
    if (!observable.isConnected) {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
function watchElementChildrenCount(element, callback) {
  let count = element.children.length;
  const observer = new MutationObserver((mutationList, observer2) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if (count !== element.children.length) {
          count = element.children.length;
          callback(observer2, count);
        }
      }
    }
  });
  observer.observe(element, { childList: true });
  return observer;
}
function watchDomChangesWithThrottle(element, callback, throttle = 1e3, times = Infinity, options = { childList: true, subtree: true, attributes: true }) {
  let lastMutationTime;
  let timeout;
  let times_ = times;
  const observer = new MutationObserver((_mutationList, _observer) => {
    if (times_ !== Infinity && times_ < 1) {
      observer.disconnect();
      return;
    }
    times_--;
    const now = Date.now();
    if (lastMutationTime && now - lastMutationTime < throttle) {
      timeout && clearTimeout(timeout);
    }
    timeout = window.setTimeout(callback, throttle);
    lastMutationTime = now;
  });
  observer.observe(element, options);
  return observer;
}
function querySelectorLast(root = document, selector) {
  const nodes = root.querySelectorAll(selector);
  return nodes.length > 0 ? nodes[nodes.length - 1] : void 0;
}
function querySelectorLastNumber(selector, e = document) {
  var _a3;
  const text = querySelectorText(e, selector);
  return Number(((_a3 = text.match(/\d+/g)) == null ? void 0 : _a3.pop()) || 0);
}
function querySelectorText(e, selector) {
  var _a3;
  if (typeof selector !== "string") return "";
  const text = ((_a3 = e.querySelector(selector)) == null ? void 0 : _a3.innerText) || "";
  return sanitizeStr(text);
}
function parseHtml(html) {
  const parsed = new DOMParser().parseFromString(html, "text/html").body;
  if (parsed.children.length > 1) return parsed;
  return parsed.firstElementChild;
}
function copyAttributes(target, source) {
  for (const attr of source.attributes) {
    if (attr.nodeValue) {
      target.setAttribute(attr.nodeName, attr.nodeValue);
    }
  }
}
function replaceElementTag(e, tagName) {
  var _a3;
  const newTagElement = document.createElement(tagName);
  copyAttributes(newTagElement, e);
  newTagElement.innerHTML = e.innerHTML;
  (_a3 = e.parentNode) == null ? void 0 : _a3.replaceChild(newTagElement, e);
  return newTagElement;
}
function removeClassesAndDataAttributes(element, keyword) {
  Array.from(element.classList).forEach((className) => {
    if (className.includes(keyword)) {
      element.classList.remove(className);
    }
  });
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith("data-") && attr.name.includes(keyword)) {
      element.removeAttribute(attr.name);
    }
  });
}
function getCommonParents(elements) {
  const parents = Array.from(elements).map((el2) => el2.parentElement).filter((parent) => parent !== null);
  return [...new Set(parents)];
}
function findNextSibling(e) {
  if (e.nextElementSibling) return e.nextElementSibling;
  if (e.parentElement) return findNextSibling(e.parentElement);
  return null;
}
function checkHomogenity(a2, b2, options) {
  if (!a2 || !b2) return false;
  if (options.id) {
    if (a2.id !== b2.id) return false;
  }
  if (options.className) {
    const ca2 = a2.className;
    const cb = b2.className;
    if (!(ca2.length > cb.length ? ca2.includes(cb) : cb.includes(ca2))) {
      return false;
    }
  }
  return true;
}
function instantiateTemplate(sourceSelector, attributeUpdates, contentUpdates) {
  const source = document.querySelector(sourceSelector);
  const wrapper = document.createElement("div");
  const clone = source.cloneNode(true);
  wrapper.append(clone);
  Object.entries(attributeUpdates).forEach(([attrName, attrValue]) => {
    wrapper.querySelectorAll(`[${attrName}]`).forEach((element) => {
      element.setAttribute(attrName, attrValue);
    });
  });
  Object.entries(contentUpdates).forEach(([childSelector, textValue]) => {
    wrapper.querySelectorAll(childSelector).forEach((element) => {
      element.innerText = textValue;
    });
  });
  return wrapper.innerHTML;
}
function exterminateVideo(video) {
  video.removeAttribute("src");
  video.load();
  video.remove();
}
function downloader(options = { append: "", after: "", button: "", cbBefore: () => {
} }) {
  var _a3, _b2;
  const btn = parseHtml(options.button);
  if (options.append) (_a3 = document.querySelector(options.append)) == null ? void 0 : _a3.append(btn);
  if (options.after) (_b2 = document.querySelector(options.after)) == null ? void 0 : _b2.after(btn);
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (options.cbBefore) options.cbBefore();
    waitForElementToAppear(document.body, "video", (video) => {
      window.location.href = video.getAttribute("src");
    });
  });
}
function onPointerOverAndLeave(container, subjectSelector, onOver, onLeave) {
  let target;
  let onOverFinally;
  function handleLeaveEvent() {
    onLeave == null ? void 0 : onLeave(target);
    onOverFinally == null ? void 0 : onOverFinally();
    target = void 0;
  }
  function handleEvent(e) {
    const currentTarget = e.target;
    if (!subjectSelector(currentTarget) || target === currentTarget) return;
    target = currentTarget;
    const result = onOver(target);
    onOverFinally = result == null ? void 0 : result.onOverCallback;
    const leaveSubject = (result == null ? void 0 : result.leaveTarget) || target;
    leaveSubject.addEventListener("pointerleave", handleLeaveEvent, {
      once: true
    });
  }
  container.addEventListener("pointerover", handleEvent);
}
class Tick {
  constructor(delay, startImmediate = true) {
    __publicField(this, "tick");
    __publicField(this, "callbackFinal");
    this.delay = delay;
    this.startImmediate = startImmediate;
  }
  start(callback, callbackFinal) {
    this.stop();
    this.callbackFinal = callbackFinal;
    if (this.startImmediate) callback();
    this.tick = window.setInterval(callback, this.delay);
  }
  stop() {
    if (this.tick !== void 0) {
      clearInterval(this.tick);
      this.tick = void 0;
    }
    if (this.callbackFinal) {
      this.callbackFinal();
      this.callbackFinal = void 0;
    }
  }
}
const MOBILE_UA = {
  "User-Agent": [
    "Mozilla/5.0 (Linux; Android 10; K)",
    "AppleWebKit/537.36 (KHTML, like Gecko)",
    "Chrome/114.0.0.0 Mobile Safari/537.36"
  ].join(" ")
};
async function fetchWith(input, options) {
  const requestInit = options.init || {};
  if (options.mobile) {
    Object.assign(requestInit, { headers: new Headers(MOBILE_UA) });
  }
  const r = await fetch(input, requestInit).then((r2) => r2);
  if (options.type === "json") return await r.json();
  if (options.type === "html") return parseHtml(await r.text());
  return await r.text();
}
const fetchJson = (input) => fetchWith(input, { type: "json" });
const fetchHtml = (input) => fetchWith(input, { type: "html" });
const fetchText = (input) => fetchWith(input, { type: "text" });
function circularShift(n, c = 6, s = 1) {
  return (n + s) % c || c;
}
function memoize(fn2) {
  const cache = /* @__PURE__ */ new Map();
  const memoizedFunction = ((...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn2(...args);
    cache.set(key, result);
    return result;
  });
  return memoizedFunction;
}
function objectToFormData(obj) {
  const formData = new FormData();
  Object.entries(obj).forEach(([k2, v2]) => {
    formData.append(k2, v2);
  });
  return formData;
}
class LazyImgLoader {
  constructor(shouldDelazify) {
    __publicField(this, "lazyImgObserver");
    __publicField(this, "attributeName", "data-lazy-load");
    __publicField(this, "delazify", (target) => {
      this.lazyImgObserver.observer.unobserve(target);
      target.src = target.getAttribute(this.attributeName);
      target.removeAttribute(this.attributeName);
    });
    this.lazyImgObserver = new Observer((target) => {
      if (shouldDelazify(target)) {
        this.delazify(target);
      }
    });
  }
  lazify(_target, img, imgSrc) {
    if (!img || !imgSrc) return;
    img.setAttribute(this.attributeName, imgSrc);
    img.src = "";
    this.lazyImgObserver.observe(img);
  }
}
class Observer {
  constructor(callback) {
    __publicField(this, "observer");
    __publicField(this, "timeout");
    this.callback = callback;
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }
  observe(target) {
    this.observer.observe(target);
  }
  throttle(target, throttleTime) {
    this.observer.unobserve(target);
    this.timeout = window.setTimeout(() => this.observer.observe(target), throttleTime);
  }
  handleIntersection(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.callback(entry.target);
      }
    }
  }
  dispose() {
    if (this.timeout) clearTimeout(this.timeout);
    this.observer.disconnect();
  }
  static observeWhile(target, callback, throttleTime) {
    const observer_ = new Observer(async (target2) => {
      const condition = await callback();
      if (condition) observer_.throttle(target2, throttleTime);
    });
    observer_.observe(target);
    return observer_;
  }
}
function formatTimeToHHMMSS(timeStr) {
  var _a3, _b2, _c2;
  const pad = (num) => num.toString().padStart(2, "0");
  const h = ((_a3 = timeStr.match(/(\d+)\s*h/)) == null ? void 0 : _a3[1]) || "0";
  const m = ((_b2 = timeStr.match(/(\d+)\s*mi?n/)) == null ? void 0 : _b2[1]) || "0";
  const s = ((_c2 = timeStr.match(/(\d+)\s*sec/)) == null ? void 0 : _c2[1]) || "0";
  return `${pad(+h)}:${pad(+m)}:${pad(+s)}`;
}
function timeToSeconds(timeStr) {
  const normalized = /[a-zA-Z]/.test(timeStr) ? formatTimeToHHMMSS(timeStr) : timeStr;
  return normalized.split(":").reverse().reduce((total, unit, index) => total + parseInt(unit, 10) * 60 ** index, 0);
}
function parseIntegerOr(n, or2) {
  const num = Number(n);
  return Number.isSafeInteger(num) ? num : or2;
}
function parseDataParams(str) {
  const paramsStr = decodeURI(str.trim()).split(";");
  return paramsStr.reduce(
    (acc, s) => {
      const parsed = s.match(/([+\w]+):([\w\- ]+)?/);
      if (parsed) {
        const [, key, value] = parsed;
        if (value) {
          key.split("+").forEach((p) => {
            acc[p] = value;
          });
        }
      }
      return acc;
    },
    {}
  );
}
function parseCssUrl(s) {
  return s.replace(/url\("|"\).*/g, "");
}
class RegexFilter {
  constructor(str, flags = "gi") {
    __publicField(this, "regexes");
    this.regexes = memoize(this.compileSearchRegex)(str, flags);
  }
  // 'dog,bog,f:girl' or r:dog|bog... => [r/dog/i, r/bog/i, r/(^|\ )girl($|\ )/i]
  compileSearchRegex(str, flags) {
    try {
      if (str.startsWith("r:")) return [new RegExp(str.slice(2), flags)];
      const regexes = splitWith(str).map(
        (s) => s.replace(/f:(\w+)/g, (_2, w2) => `(^|\\ |,)${w2}($|\\ |,)`)
        // full word
      ).map((_2) => new RegExp(_2, flags));
      return regexes;
    } catch (_2) {
      return [];
    }
  }
  hasEvery(str) {
    return this.regexes.every((r) => r.test(str));
  }
  hasNone(str) {
    return this.regexes.every((r) => !r.test(str));
  }
}
const _DataFilter = class _DataFilter {
  constructor(rules) {
    __publicField(this, "filters", /* @__PURE__ */ new Map());
    __publicField(this, "customDataSelectorFns", {});
    __publicField(this, "filterMapping", {});
    this.rules = rules;
    this.registerFilters(rules.customDataSelectorFns);
    this.applyCSSFilters();
  }
  static isFiltered(el2) {
    return el2.className.includes("filter-");
  }
  applyCSSFilters(wrapper) {
    this.filters.forEach((_2, name) => {
      const cssRule = `.filter-${name} { display: none !important; }`;
      if (wrapper) {
        GM_addStyle(wrapper(cssRule));
      } else {
        GM_addStyle(cssRule);
      }
    });
  }
  registerFilters(customFilters) {
    customFilters.forEach((o) => {
      if (typeof o === "string") {
        this.customDataSelectorFns[o] = _DataFilter.customDataSelectorFnsDefault[o];
        this.registerFilter(o);
      } else {
        const k2 = Object.keys(o)[0];
        this.customDataSelectorFns[k2] = o[k2];
        this.registerFilter(k2);
      }
    });
  }
  customSelectorParser(name, selector) {
    if ("handle" in selector) {
      return selector;
    } else {
      return { handle: selector, deps: [name] };
    }
  }
  registerFilter(customSelectorName) {
    var _a3;
    const handler = this.customSelectorParser(
      customSelectorName,
      this.customDataSelectorFns[customSelectorName]
    );
    const tag = `filter-${customSelectorName}`;
    (_a3 = [customSelectorName, ...handler.deps || []]) == null ? void 0 : _a3.forEach((name) => {
      Object.assign(this.filterMapping, { [name]: customSelectorName });
    });
    const fn2 = () => {
      var _a4;
      const preDefined = (_a4 = handler.$preDefine) == null ? void 0 : _a4.call(handler, this.rules.store.state);
      return (v2) => {
        const condition = handler.handle(v2, this.rules.store.state, preDefined);
        return {
          condition,
          tag
        };
      };
    };
    this.filters.set(customSelectorName, fn2);
  }
  selectFilters(filters) {
    const selectedFilters = Object.keys(filters).filter((k2) => k2 in this.filterMapping).map((k2) => this.filterMapping[k2]).map((k2) => this.filters.get(k2));
    return selectedFilters;
  }
};
__publicField(_DataFilter, "customDataSelectorFnsDefault", {
  filterDuration: {
    handle(el2, state, notInRange) {
      return state.filterDuration && notInRange(el2.duration);
    },
    $preDefine: (state) => {
      const from = state.filterDurationFrom;
      const to2 = state.filterDurationTo;
      function notInRange(d2) {
        return d2 < from || d2 > to2;
      }
      return notInRange;
    },
    deps: ["filterDurationFrom", "filterDurationTo"]
  },
  filterExclude: {
    handle(el2, state, searchFilter) {
      if (!state.filterExclude) return false;
      return !searchFilter.hasNone(el2.title);
    },
    $preDefine: (state) => new RegexFilter(state.filterExcludeWords),
    deps: ["filterExcludeWords"]
  },
  filterInclude: {
    handle(el2, state, searchFilter) {
      if (!state.filterInclude) return false;
      return !searchFilter.hasEvery(el2.title);
    },
    $preDefine: (state) => new RegexFilter(state.filterIncludeWords),
    deps: ["filterIncludeWords"]
  }
});
let DataFilter = _DataFilter;
class DataManager {
  constructor(rules) {
    __publicField(this, "data", /* @__PURE__ */ new Map());
    __publicField(this, "lazyImgLoader", new LazyImgLoader(
      (target) => !DataFilter.isFiltered(target)
    ));
    __publicField(this, "dataFilter");
    __publicField(this, "applyFilters", async (filters = {}, offset = 0) => {
      const filtersToApply = this.dataFilter.selectFilters(filters);
      if (filtersToApply.length === 0) return;
      const iterator = this.data.values().drop(offset);
      let finished = false;
      await new Promise((resolve) => {
        function runBatch(deadline) {
          const updates = [];
          while (deadline.timeRemaining() > 0) {
            const { value, done } = iterator.next();
            finished = !!done;
            if (done) break;
            for (const f of filtersToApply) {
              const { tag, condition } = f()(value);
              updates.push({ e: value.element, tag, condition });
            }
          }
          if (updates.length > 0) {
            requestAnimationFrame(() => {
              updates.forEach((u) => {
                u.e.classList.toggle(u.tag, u.condition);
              });
            });
          }
          if (!finished) {
            requestIdleCallback(runBatch);
          } else {
            resolve(true);
          }
        }
        requestIdleCallback(runBatch);
      });
    });
    __publicField(this, "filterAll", async (offset) => {
      const keys = Array.from(this.dataFilter.filters.keys());
      const filters = Object.fromEntries(
        keys.map((k2) => [k2, this.rules.store.state[k2]])
      );
      await this.applyFilters(filters, offset);
    });
    __publicField(this, "parseDataParentHomogenity");
    __publicField(this, "parseData", (html, container, removeDuplicates = false, shouldLazify = true) => {
      const thumbs = this.rules.getThumbs(html);
      const dataOffset = this.data.size;
      const fragment = document.createDocumentFragment();
      const parent = container || this.rules.container;
      const homogenity = !!this.parseDataParentHomogenity;
      for (const thumbElement of thumbs) {
        const url = this.rules.getThumbUrl(thumbElement);
        if (!url || this.data.has(url) || parent !== container && (parent == null ? void 0 : parent.contains(thumbElement)) || homogenity && !checkHomogenity(
          parent,
          thumbElement.parentElement,
          this.parseDataParentHomogenity
        )) {
          if (removeDuplicates) thumbElement.remove();
          continue;
        }
        const data = this.rules.getThumbData(thumbElement);
        this.data.set(url, { element: thumbElement, ...data });
        if (shouldLazify) {
          const { img, imgSrc } = this.rules.getThumbImgData(thumbElement);
          this.lazyImgLoader.lazify(thumbElement, img, imgSrc);
        }
        fragment.append(thumbElement);
      }
      this.filterAll(dataOffset).then(() => {
        requestAnimationFrame(() => {
          parent.appendChild(fragment);
        });
      });
    });
    this.rules = rules;
    this.dataFilter = new DataFilter(this.rules);
  }
  sortBy(key, direction = true) {
    if (this.data.size < 2) return;
    let sorted = this.data.values().toArray().sort((a2, b2) => {
      return a2[key] - b2[key];
    });
    if (!direction) sorted = sorted.reverse();
    const container = sorted[0].element.parentElement;
    container.style.visibility = "hidden";
    sorted.forEach((s) => {
      container.append(s.element);
    });
    container.style.visibility = "visible";
  }
}
class InfiniteScroller {
  constructor(options) {
    __publicField(this, "enabled", true);
    __publicField(this, "paginationOffset", 1);
    __publicField(this, "parseData");
    __publicField(this, "rules");
    __publicField(this, "observer");
    __publicField(this, "paginationGenerator");
    __publicField(this, "onScrollCBs", []);
    __publicField(this, "generatorConsumer", async () => {
      if (!this.enabled) return false;
      const {
        value: { url, offset },
        done
      } = await this.paginationGenerator.next();
      if (!done && url) {
        await this.doScroll(url, offset);
      }
      return !done;
    });
    this.rules = options.rules;
    this.paginationOffset = this.rules.paginationStrategy.getPaginationOffset();
    Object.assign(this, options);
    if (this.rules.getPaginationData) {
      this.getPaginationData = this.rules.getPaginationData;
    }
    this.paginationGenerator = this.rules.customGenerator || InfiniteScroller.generatorForPaginationStrategy(this.rules.paginationStrategy);
    this.setObserver(this.rules.observable);
    this.setAutoScroll();
  }
  dispose() {
    if (this.observer) this.observer.dispose();
  }
  setObserver(observable) {
    if (this.observer) this.observer.dispose();
    this.observer = Observer.observeWhile(
      observable,
      this.generatorConsumer,
      this.rules.store.state.delay
    );
    return this;
  }
  onScroll(callback, initCall = false) {
    if (initCall) callback(this);
    this.onScrollCBs.push(callback);
    return this;
  }
  _onScroll() {
    this.onScrollCBs.forEach((cb) => {
      cb(this);
    });
  }
  setAutoScroll() {
    const autoScrollWrapper = async () => {
      if (this.rules.store.state.autoScroll) {
        await wait(this.rules.store.state.delay);
        await this.generatorConsumer();
        await autoScrollWrapper();
      }
    };
    autoScrollWrapper();
    this.rules.store.stateSubject.subscribe((type) => {
      if (type == null ? void 0 : type.autoScroll) {
        autoScrollWrapper();
      }
    });
  }
  // consume api strategy
  async getPaginationData(url) {
    return await fetchHtml(url);
  }
  async doScroll(url, offset) {
    var _a3;
    const nextPageHtml = await this.getPaginationData(url);
    const prevScrollPos = document.documentElement.scrollTop;
    this.paginationOffset = Math.max(this.paginationOffset, offset);
    (_a3 = this.parseData) == null ? void 0 : _a3.call(this, nextPageHtml);
    this._onScroll();
    window.scrollTo(0, prevScrollPos);
    if (this.rules.store.state.writeHistory) {
      history.replaceState({}, "", url);
    }
  }
  static async *generatorForPaginationStrategy(pstrategy) {
    const _offset = pstrategy.getPaginationOffset();
    const end = pstrategy.getPaginationLast();
    const urlGenerator = pstrategy.getPaginationUrlGenerator();
    for (let offset = _offset; offset <= end; offset++) {
      const url = await urlGenerator(offset);
      yield { url, offset };
    }
  }
  static create(rules) {
    const enabled = rules.store.state.infiniteScrollEnabled;
    rules.store.state.$paginationLast = rules.paginationStrategy.getPaginationLast();
    const infiniteScroller = new InfiniteScroller({
      enabled,
      parseData: rules.dataManager.parseData,
      rules
    }).onScroll(({ paginationOffset }) => {
      rules.store.state.$paginationOffset = paginationOffset;
    }, true);
    rules.store.stateSubject.subscribe(() => {
      infiniteScroller.enabled = rules.store.state.infiniteScrollEnabled;
    });
    return infiniteScroller;
  }
}
var Pe$1 = Object.defineProperty;
var a = (e, t) => Pe$1(e, "name", { value: t, configurable: true });
var P = class {
  constructor(t, r, n, c, l, f) {
    __publicField(this, "type", 3);
    __publicField(this, "name", "");
    __publicField(this, "prefix", "");
    __publicField(this, "value", "");
    __publicField(this, "suffix", "");
    __publicField(this, "modifier", 3);
    this.type = t, this.name = r, this.prefix = n, this.value = c, this.suffix = l, this.modifier = f;
  }
  hasCustomName() {
    return this.name !== "" && typeof this.name != "number";
  }
};
a(P, "Part");
var Re$1 = /[$_\p{ID_Start}]/u, Ee$1 = /[$_\u200C\u200D\p{ID_Continue}]/u, v = ".*";
function Oe(e, t) {
  return (t ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(e);
}
a(Oe, "isASCII");
function D$1(e, t = false) {
  let r = [], n = 0;
  for (; n < e.length; ) {
    let c = e[n], l = a(function(f) {
      if (!t) throw new TypeError(f);
      r.push({ type: "INVALID_CHAR", index: n, value: e[n++] });
    }, "ErrorOrInvalid");
    if (c === "*") {
      r.push({ type: "ASTERISK", index: n, value: e[n++] });
      continue;
    }
    if (c === "+" || c === "?") {
      r.push({ type: "OTHER_MODIFIER", index: n, value: e[n++] });
      continue;
    }
    if (c === "\\") {
      r.push({ type: "ESCAPED_CHAR", index: n++, value: e[n++] });
      continue;
    }
    if (c === "{") {
      r.push({ type: "OPEN", index: n, value: e[n++] });
      continue;
    }
    if (c === "}") {
      r.push({ type: "CLOSE", index: n, value: e[n++] });
      continue;
    }
    if (c === ":") {
      let f = "", s = n + 1;
      for (; s < e.length; ) {
        let i = e.substr(s, 1);
        if (s === n + 1 && Re$1.test(i) || s !== n + 1 && Ee$1.test(i)) {
          f += e[s++];
          continue;
        }
        break;
      }
      if (!f) {
        l(`Missing parameter name at ${n}`);
        continue;
      }
      r.push({ type: "NAME", index: n, value: f }), n = s;
      continue;
    }
    if (c === "(") {
      let f = 1, s = "", i = n + 1, o = false;
      if (e[i] === "?") {
        l(`Pattern cannot start with "?" at ${i}`);
        continue;
      }
      for (; i < e.length; ) {
        if (!Oe(e[i], false)) {
          l(`Invalid character '${e[i]}' at ${i}.`), o = true;
          break;
        }
        if (e[i] === "\\") {
          s += e[i++] + e[i++];
          continue;
        }
        if (e[i] === ")") {
          if (f--, f === 0) {
            i++;
            break;
          }
        } else if (e[i] === "(" && (f++, e[i + 1] !== "?")) {
          l(`Capturing groups are not allowed at ${i}`), o = true;
          break;
        }
        s += e[i++];
      }
      if (o) continue;
      if (f) {
        l(`Unbalanced pattern at ${n}`);
        continue;
      }
      if (!s) {
        l(`Missing pattern at ${n}`);
        continue;
      }
      r.push({ type: "REGEX", index: n, value: s }), n = i;
      continue;
    }
    r.push({ type: "CHAR", index: n, value: e[n++] });
  }
  return r.push({ type: "END", index: n, value: "" }), r;
}
a(D$1, "lexer");
function F(e, t = {}) {
  let r = D$1(e);
  t.delimiter ?? (t.delimiter = "/#?"), t.prefixes ?? (t.prefixes = "./");
  let n = `[^${x(t.delimiter)}]+?`, c = [], l = 0, f = 0, i = /* @__PURE__ */ new Set(), o = a((u) => {
    if (f < r.length && r[f].type === u) return r[f++].value;
  }, "tryConsume"), h = a(() => o("OTHER_MODIFIER") ?? o("ASTERISK"), "tryConsumeModifier"), p = a((u) => {
    let d2 = o(u);
    if (d2 !== void 0) return d2;
    let { type: g, index: y } = r[f];
    throw new TypeError(`Unexpected ${g} at ${y}, expected ${u}`);
  }, "mustConsume"), A = a(() => {
    let u = "", d2;
    for (; d2 = o("CHAR") ?? o("ESCAPED_CHAR"); ) u += d2;
    return u;
  }, "consumeText"), xe2 = a((u) => u, "DefaultEncodePart"), N = t.encodePart || xe2, H2 = "", $2 = a((u) => {
    H2 += u;
  }, "appendToPendingFixedValue"), M = a(() => {
    H2.length && (c.push(new P(3, "", "", N(H2), "", 3)), H2 = "");
  }, "maybeAddPartFromPendingFixedValue"), X2 = a((u, d2, g, y, Z2) => {
    let m = 3;
    switch (Z2) {
      case "?":
        m = 1;
        break;
      case "*":
        m = 0;
        break;
      case "+":
        m = 2;
        break;
    }
    if (!d2 && !g && m === 3) {
      $2(u);
      return;
    }
    if (M(), !d2 && !g) {
      if (!u) return;
      c.push(new P(3, "", "", N(u), "", m));
      return;
    }
    let S;
    g ? g === "*" ? S = v : S = g : S = n;
    let k2 = 2;
    S === n ? (k2 = 1, S = "") : S === v && (k2 = 0, S = "");
    let E;
    if (d2 ? E = d2 : g && (E = l++), i.has(E)) throw new TypeError(`Duplicate name '${E}'.`);
    i.add(E), c.push(new P(k2, E, N(u), S, N(y), m));
  }, "addPart");
  for (; f < r.length; ) {
    let u = o("CHAR"), d2 = o("NAME"), g = o("REGEX");
    if (!d2 && !g && (g = o("ASTERISK")), d2 || g) {
      let m = u ?? "";
      t.prefixes.indexOf(m) === -1 && ($2(m), m = ""), M();
      let S = h();
      X2(m, d2, g, "", S);
      continue;
    }
    let y = u ?? o("ESCAPED_CHAR");
    if (y) {
      $2(y);
      continue;
    }
    if (o("OPEN")) {
      let m = A(), S = o("NAME"), k2 = o("REGEX");
      !S && !k2 && (k2 = o("ASTERISK"));
      let E = A();
      p("CLOSE");
      let be2 = h();
      X2(m, S, k2, E, be2);
      continue;
    }
    M(), p("END");
  }
  return c;
}
a(F, "parse");
function x(e) {
  return e.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
}
a(x, "escapeString");
function B$1(e) {
  return e && e.ignoreCase ? "ui" : "u";
}
a(B$1, "flags");
function q$1(e, t, r) {
  return W$1(F(e, r), t, r);
}
a(q$1, "stringToRegexp");
function T$1(e) {
  switch (e) {
    case 0:
      return "*";
    case 1:
      return "?";
    case 2:
      return "+";
    case 3:
      return "";
  }
}
a(T$1, "modifierToString");
function W$1(e, t, r = {}) {
  r.delimiter ?? (r.delimiter = "/#?"), r.prefixes ?? (r.prefixes = "./"), r.sensitive ?? (r.sensitive = false), r.strict ?? (r.strict = false), r.end ?? (r.end = true), r.start ?? (r.start = true), r.endsWith = "";
  let n = r.start ? "^" : "";
  for (let s of e) {
    if (s.type === 3) {
      s.modifier === 3 ? n += x(s.value) : n += `(?:${x(s.value)})${T$1(s.modifier)}`;
      continue;
    }
    t && t.push(s.name);
    let i = `[^${x(r.delimiter)}]+?`, o = s.value;
    if (s.type === 1 ? o = i : s.type === 0 && (o = v), !s.prefix.length && !s.suffix.length) {
      s.modifier === 3 || s.modifier === 1 ? n += `(${o})${T$1(s.modifier)}` : n += `((?:${o})${T$1(s.modifier)})`;
      continue;
    }
    if (s.modifier === 3 || s.modifier === 1) {
      n += `(?:${x(s.prefix)}(${o})${x(s.suffix)})`, n += T$1(s.modifier);
      continue;
    }
    n += `(?:${x(s.prefix)}`, n += `((?:${o})(?:`, n += x(s.suffix), n += x(s.prefix), n += `(?:${o}))*)${x(s.suffix)})`, s.modifier === 0 && (n += "?");
  }
  let c = `[${x(r.endsWith)}]|$`, l = `[${x(r.delimiter)}]`;
  if (r.end) return r.strict || (n += `${l}?`), r.endsWith.length ? n += `(?=${c})` : n += "$", new RegExp(n, B$1(r));
  r.strict || (n += `(?:${l}(?=${c}))?`);
  let f = false;
  if (e.length) {
    let s = e[e.length - 1];
    s.type === 3 && s.modifier === 3 && (f = r.delimiter.indexOf(s) > -1);
  }
  return f || (n += `(?=${l}|${c})`), new RegExp(n, B$1(r));
}
a(W$1, "partsToRegexp");
var b = { delimiter: "", prefixes: "", sensitive: true, strict: true }, J$1 = { delimiter: ".", prefixes: "", sensitive: true, strict: true }, Q$1 = { delimiter: "/", prefixes: "/", sensitive: true, strict: true };
function ee$1(e, t) {
  return e.length ? e[0] === "/" ? true : !t || e.length < 2 ? false : (e[0] == "\\" || e[0] == "{") && e[1] == "/" : false;
}
a(ee$1, "isAbsolutePathname");
function te$1(e, t) {
  return e.startsWith(t) ? e.substring(t.length, e.length) : e;
}
a(te$1, "maybeStripPrefix");
function ke$1(e, t) {
  return e.endsWith(t) ? e.substr(0, e.length - t.length) : e;
}
a(ke$1, "maybeStripSuffix");
function _(e) {
  return !e || e.length < 2 ? false : e[0] === "[" || (e[0] === "\\" || e[0] === "{") && e[1] === "[";
}
a(_, "treatAsIPv6Hostname");
var re$1 = ["ftp", "file", "http", "https", "ws", "wss"];
function U$1(e) {
  if (!e) return true;
  for (let t of re$1) if (e.test(t)) return true;
  return false;
}
a(U$1, "isSpecialScheme");
function ne$1(e, t) {
  if (e = te$1(e, "#"), t || e === "") return e;
  let r = new URL("https://example.com");
  return r.hash = e, r.hash ? r.hash.substring(1, r.hash.length) : "";
}
a(ne$1, "canonicalizeHash");
function se(e, t) {
  if (e = te$1(e, "?"), t || e === "") return e;
  let r = new URL("https://example.com");
  return r.search = e, r.search ? r.search.substring(1, r.search.length) : "";
}
a(se, "canonicalizeSearch");
function ie(e, t) {
  return t || e === "" ? e : _(e) ? K(e) : j(e);
}
a(ie, "canonicalizeHostname");
function ae(e, t) {
  if (t || e === "") return e;
  let r = new URL("https://example.com");
  return r.password = e, r.password;
}
a(ae, "canonicalizePassword");
function oe$1(e, t) {
  if (t || e === "") return e;
  let r = new URL("https://example.com");
  return r.username = e, r.username;
}
a(oe$1, "canonicalizeUsername");
function ce$1(e, t, r) {
  if (r || e === "") return e;
  if (t && !re$1.includes(t)) return new URL(`${t}:${e}`).pathname;
  let n = e[0] == "/";
  return e = new URL(n ? e : "/-" + e, "https://example.com").pathname, n || (e = e.substring(2, e.length)), e;
}
a(ce$1, "canonicalizePathname");
function le$1(e, t, r) {
  return z(t) === e && (e = ""), r || e === "" ? e : G(e);
}
a(le$1, "canonicalizePort");
function fe$1(e, t) {
  return e = ke$1(e, ":"), t || e === "" ? e : w(e);
}
a(fe$1, "canonicalizeProtocol");
function z(e) {
  switch (e) {
    case "ws":
    case "http":
      return "80";
    case "wws":
    case "https":
      return "443";
    case "ftp":
      return "21";
    default:
      return "";
  }
}
a(z, "defaultPortForProtocol");
function w(e) {
  if (e === "") return e;
  if (/^[-+.A-Za-z0-9]*$/.test(e)) return e.toLowerCase();
  throw new TypeError(`Invalid protocol '${e}'.`);
}
a(w, "protocolEncodeCallback");
function he$1(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.username = e, t.username;
}
a(he$1, "usernameEncodeCallback");
function ue$1(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.password = e, t.password;
}
a(ue$1, "passwordEncodeCallback");
function j(e) {
  if (e === "") return e;
  if (/[\t\n\r #%/:<>?@[\]^\\|]/g.test(e)) throw new TypeError(`Invalid hostname '${e}'`);
  let t = new URL("https://example.com");
  return t.hostname = e, t.hostname;
}
a(j, "hostnameEncodeCallback");
function K(e) {
  if (e === "") return e;
  if (/[^0-9a-fA-F[\]:]/g.test(e)) throw new TypeError(`Invalid IPv6 hostname '${e}'`);
  return e.toLowerCase();
}
a(K, "ipv6HostnameEncodeCallback");
function G(e) {
  if (e === "" || /^[0-9]*$/.test(e) && parseInt(e) <= 65535) return e;
  throw new TypeError(`Invalid port '${e}'.`);
}
a(G, "portEncodeCallback");
function de$1(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.pathname = e[0] !== "/" ? "/-" + e : e, e[0] !== "/" ? t.pathname.substring(2, t.pathname.length) : t.pathname;
}
a(de$1, "standardURLPathnameEncodeCallback");
function pe$1(e) {
  return e === "" ? e : new URL(`data:${e}`).pathname;
}
a(pe$1, "pathURLPathnameEncodeCallback");
function ge$1(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.search = e, t.search.substring(1, t.search.length);
}
a(ge$1, "searchEncodeCallback");
function me$1(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.hash = e, t.hash.substring(1, t.hash.length);
}
a(me$1, "hashEncodeCallback");
var C = (_a2 = class {
  constructor(t) {
    __privateAdd(this, _C_instances);
    __privateAdd(this, _i2);
    __privateAdd(this, _n, []);
    __privateAdd(this, _t, {});
    __privateAdd(this, _e2, 0);
    __privateAdd(this, _s2, 1);
    __privateAdd(this, _l2, 0);
    __privateAdd(this, _o2, 0);
    __privateAdd(this, _d, 0);
    __privateAdd(this, _p2, 0);
    __privateAdd(this, _g, false);
    __privateSet(this, _i2, t);
  }
  get result() {
    return __privateGet(this, _t);
  }
  parse() {
    for (__privateSet(this, _n, D$1(__privateGet(this, _i2), true)); __privateGet(this, _e2) < __privateGet(this, _n).length; __privateSet(this, _e2, __privateGet(this, _e2) + __privateGet(this, _s2))) {
      if (__privateSet(this, _s2, 1), __privateGet(this, _n)[__privateGet(this, _e2)].type === "END") {
        if (__privateGet(this, _o2) === 0) {
          __privateMethod(this, _C_instances, b_fn).call(this), __privateMethod(this, _C_instances, f_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 9, 1) : __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, r_fn).call(this, 7, 0);
          continue;
        } else if (__privateGet(this, _o2) === 2) {
          __privateMethod(this, _C_instances, u_fn).call(this, 5);
          continue;
        }
        __privateMethod(this, _C_instances, r_fn).call(this, 10, 0);
        break;
      }
      if (__privateGet(this, _d) > 0) if (__privateMethod(this, _C_instances, A_fn).call(this)) __privateSet(this, _d, __privateGet(this, _d) - 1);
      else continue;
      if (__privateMethod(this, _C_instances, T_fn).call(this)) {
        __privateSet(this, _d, __privateGet(this, _d) + 1);
        continue;
      }
      switch (__privateGet(this, _o2)) {
        case 0:
          __privateMethod(this, _C_instances, P_fn).call(this) && __privateMethod(this, _C_instances, u_fn).call(this, 1);
          break;
        case 1:
          if (__privateMethod(this, _C_instances, P_fn).call(this)) {
            __privateMethod(this, _C_instances, C_fn).call(this);
            let t = 7, r = 1;
            __privateMethod(this, _C_instances, E_fn).call(this) ? (t = 2, r = 3) : __privateGet(this, _g) && (t = 2), __privateMethod(this, _C_instances, r_fn).call(this, t, r);
          }
          break;
        case 2:
          __privateMethod(this, _C_instances, S_fn).call(this) ? __privateMethod(this, _C_instances, u_fn).call(this, 3) : (__privateMethod(this, _C_instances, x_fn).call(this) || __privateMethod(this, _C_instances, h_fn).call(this) || __privateMethod(this, _C_instances, f_fn).call(this)) && __privateMethod(this, _C_instances, u_fn).call(this, 5);
          break;
        case 3:
          __privateMethod(this, _C_instances, O_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 4, 1) : __privateMethod(this, _C_instances, S_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 5, 1);
          break;
        case 4:
          __privateMethod(this, _C_instances, S_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 5, 1);
          break;
        case 5:
          __privateMethod(this, _C_instances, y_fn).call(this) ? __privateSet(this, _p2, __privateGet(this, _p2) + 1) : __privateMethod(this, _C_instances, w_fn).call(this) && __privateSet(this, _p2, __privateGet(this, _p2) - 1), __privateMethod(this, _C_instances, k_fn).call(this) && !__privateGet(this, _p2) ? __privateMethod(this, _C_instances, r_fn).call(this, 6, 1) : __privateMethod(this, _C_instances, x_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 7, 0) : __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
          break;
        case 6:
          __privateMethod(this, _C_instances, x_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 7, 0) : __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
          break;
        case 7:
          __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
          break;
        case 8:
          __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
          break;
      }
    }
    __privateGet(this, _t).hostname !== void 0 && __privateGet(this, _t).port === void 0 && (__privateGet(this, _t).port = "");
  }
}, _i2 = new WeakMap(), _n = new WeakMap(), _t = new WeakMap(), _e2 = new WeakMap(), _s2 = new WeakMap(), _l2 = new WeakMap(), _o2 = new WeakMap(), _d = new WeakMap(), _p2 = new WeakMap(), _g = new WeakMap(), _C_instances = new WeakSet(), r_fn = function(t, r) {
  var _a3, _b2, _c2;
  switch (__privateGet(this, _o2)) {
    case 0:
      break;
    case 1:
      __privateGet(this, _t).protocol = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 2:
      break;
    case 3:
      __privateGet(this, _t).username = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 4:
      __privateGet(this, _t).password = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 5:
      __privateGet(this, _t).hostname = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 6:
      __privateGet(this, _t).port = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 7:
      __privateGet(this, _t).pathname = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 8:
      __privateGet(this, _t).search = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
    case 9:
      __privateGet(this, _t).hash = __privateMethod(this, _C_instances, c_fn).call(this);
      break;
  }
  __privateGet(this, _o2) !== 0 && t !== 10 && ([1, 2, 3, 4].includes(__privateGet(this, _o2)) && [6, 7, 8, 9].includes(t) && ((_a3 = __privateGet(this, _t)).hostname ?? (_a3.hostname = "")), [1, 2, 3, 4, 5, 6].includes(__privateGet(this, _o2)) && [8, 9].includes(t) && ((_b2 = __privateGet(this, _t)).pathname ?? (_b2.pathname = __privateGet(this, _g) ? "/" : "")), [1, 2, 3, 4, 5, 6, 7].includes(__privateGet(this, _o2)) && t === 9 && ((_c2 = __privateGet(this, _t)).search ?? (_c2.search = ""))), __privateMethod(this, _C_instances, R_fn).call(this, t, r);
}, R_fn = function(t, r) {
  __privateSet(this, _o2, t), __privateSet(this, _l2, __privateGet(this, _e2) + r), __privateSet(this, _e2, __privateGet(this, _e2) + r), __privateSet(this, _s2, 0);
}, b_fn = function() {
  __privateSet(this, _e2, __privateGet(this, _l2)), __privateSet(this, _s2, 0);
}, u_fn = function(t) {
  __privateMethod(this, _C_instances, b_fn).call(this), __privateSet(this, _o2, t);
}, m_fn = function(t) {
  return t < 0 && (t = __privateGet(this, _n).length - t), t < __privateGet(this, _n).length ? __privateGet(this, _n)[t] : __privateGet(this, _n)[__privateGet(this, _n).length - 1];
}, a_fn = function(t, r) {
  let n = __privateMethod(this, _C_instances, m_fn).call(this, t);
  return n.value === r && (n.type === "CHAR" || n.type === "ESCAPED_CHAR" || n.type === "INVALID_CHAR");
}, P_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), ":");
}, E_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2) + 1, "/") && __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2) + 2, "/");
}, S_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "@");
}, O_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), ":");
}, k_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), ":");
}, x_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "/");
}, h_fn = function() {
  if (__privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "?")) return true;
  if (__privateGet(this, _n)[__privateGet(this, _e2)].value !== "?") return false;
  let t = __privateMethod(this, _C_instances, m_fn).call(this, __privateGet(this, _e2) - 1);
  return t.type !== "NAME" && t.type !== "REGEX" && t.type !== "CLOSE" && t.type !== "ASTERISK";
}, f_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "#");
}, T_fn = function() {
  return __privateGet(this, _n)[__privateGet(this, _e2)].type == "OPEN";
}, A_fn = function() {
  return __privateGet(this, _n)[__privateGet(this, _e2)].type == "CLOSE";
}, y_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "[");
}, w_fn = function() {
  return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "]");
}, c_fn = function() {
  let t = __privateGet(this, _n)[__privateGet(this, _e2)], r = __privateMethod(this, _C_instances, m_fn).call(this, __privateGet(this, _l2)).index;
  return __privateGet(this, _i2).substring(r, t.index);
}, C_fn = function() {
  let t = {};
  Object.assign(t, b), t.encodePart = w;
  let r = q$1(__privateMethod(this, _C_instances, c_fn).call(this), void 0, t);
  __privateSet(this, _g, U$1(r));
}, _a2);
a(C, "Parser");
var V = ["protocol", "username", "password", "hostname", "port", "pathname", "search", "hash"], O = "*";
function Se$1(e, t) {
  if (typeof e != "string") throw new TypeError("parameter 1 is not of type 'string'.");
  let r = new URL(e, t);
  return { protocol: r.protocol.substring(0, r.protocol.length - 1), username: r.username, password: r.password, hostname: r.hostname, port: r.port, pathname: r.pathname, search: r.search !== "" ? r.search.substring(1, r.search.length) : void 0, hash: r.hash !== "" ? r.hash.substring(1, r.hash.length) : void 0 };
}
a(Se$1, "extractValues");
function R(e, t) {
  return t ? I$1(e) : e;
}
a(R, "processBaseURLString");
function L(e, t, r) {
  let n;
  if (typeof t.baseURL == "string") try {
    n = new URL(t.baseURL), t.protocol === void 0 && (e.protocol = R(n.protocol.substring(0, n.protocol.length - 1), r)), !r && t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.username === void 0 && (e.username = R(n.username, r)), !r && t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.username === void 0 && t.password === void 0 && (e.password = R(n.password, r)), t.protocol === void 0 && t.hostname === void 0 && (e.hostname = R(n.hostname, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && (e.port = R(n.port, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && (e.pathname = R(n.pathname, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && t.search === void 0 && (e.search = R(n.search.substring(1, n.search.length), r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && t.search === void 0 && t.hash === void 0 && (e.hash = R(n.hash.substring(1, n.hash.length), r));
  } catch {
    throw new TypeError(`invalid baseURL '${t.baseURL}'.`);
  }
  if (typeof t.protocol == "string" && (e.protocol = fe$1(t.protocol, r)), typeof t.username == "string" && (e.username = oe$1(t.username, r)), typeof t.password == "string" && (e.password = ae(t.password, r)), typeof t.hostname == "string" && (e.hostname = ie(t.hostname, r)), typeof t.port == "string" && (e.port = le$1(t.port, e.protocol, r)), typeof t.pathname == "string") {
    if (e.pathname = t.pathname, n && !ee$1(e.pathname, r)) {
      let c = n.pathname.lastIndexOf("/");
      c >= 0 && (e.pathname = R(n.pathname.substring(0, c + 1), r) + e.pathname);
    }
    e.pathname = ce$1(e.pathname, e.protocol, r);
  }
  return typeof t.search == "string" && (e.search = se(t.search, r)), typeof t.hash == "string" && (e.hash = ne$1(t.hash, r)), e;
}
a(L, "applyInit");
function I$1(e) {
  return e.replace(/([+*?:{}()\\])/g, "\\$1");
}
a(I$1, "escapePatternString");
function Te$1(e) {
  return e.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
}
a(Te$1, "escapeRegexpString");
function Ae$1(e, t) {
  t.delimiter ?? (t.delimiter = "/#?"), t.prefixes ?? (t.prefixes = "./"), t.sensitive ?? (t.sensitive = false), t.strict ?? (t.strict = false), t.end ?? (t.end = true), t.start ?? (t.start = true), t.endsWith = "";
  let r = ".*", n = `[^${Te$1(t.delimiter)}]+?`, c = /[$_\u200C\u200D\p{ID_Continue}]/u, l = "";
  for (let f = 0; f < e.length; ++f) {
    let s = e[f];
    if (s.type === 3) {
      if (s.modifier === 3) {
        l += I$1(s.value);
        continue;
      }
      l += `{${I$1(s.value)}}${T$1(s.modifier)}`;
      continue;
    }
    let i = s.hasCustomName(), o = !!s.suffix.length || !!s.prefix.length && (s.prefix.length !== 1 || !t.prefixes.includes(s.prefix)), h = f > 0 ? e[f - 1] : null, p = f < e.length - 1 ? e[f + 1] : null;
    if (!o && i && s.type === 1 && s.modifier === 3 && p && !p.prefix.length && !p.suffix.length) if (p.type === 3) {
      let A = p.value.length > 0 ? p.value[0] : "";
      o = c.test(A);
    } else o = !p.hasCustomName();
    if (!o && !s.prefix.length && h && h.type === 3) {
      let A = h.value[h.value.length - 1];
      o = t.prefixes.includes(A);
    }
    o && (l += "{"), l += I$1(s.prefix), i && (l += `:${s.name}`), s.type === 2 ? l += `(${s.value})` : s.type === 1 ? i || (l += `(${n})`) : s.type === 0 && (!i && (!h || h.type === 3 || h.modifier !== 3 || o || s.prefix !== "") ? l += "*" : l += `(${r})`), s.type === 1 && i && s.suffix.length && c.test(s.suffix[0]) && (l += "\\"), l += I$1(s.suffix), o && (l += "}"), s.modifier !== 3 && (l += T$1(s.modifier));
  }
  return l;
}
a(Ae$1, "partsToPattern");
var Y = (_b = class {
  constructor(t = {}, r, n) {
    __privateAdd(this, _i3);
    __privateAdd(this, _n2, {});
    __privateAdd(this, _t2, {});
    __privateAdd(this, _e3, {});
    __privateAdd(this, _s3, {});
    __privateAdd(this, _l3, false);
    try {
      let c;
      if (typeof r == "string" ? c = r : n = r, typeof t == "string") {
        let i = new C(t);
        if (i.parse(), t = i.result, c === void 0 && typeof t.protocol != "string") throw new TypeError("A base URL must be provided for a relative constructor string.");
        t.baseURL = c;
      } else {
        if (!t || typeof t != "object") throw new TypeError("parameter 1 is not of type 'string' and cannot convert to dictionary.");
        if (c) throw new TypeError("parameter 1 is not of type 'string'.");
      }
      typeof n > "u" && (n = { ignoreCase: false });
      let l = { ignoreCase: n.ignoreCase === true }, f = { pathname: O, protocol: O, username: O, password: O, hostname: O, port: O, search: O, hash: O };
      __privateSet(this, _i3, L(f, t, true)), z(__privateGet(this, _i3).protocol) === __privateGet(this, _i3).port && (__privateGet(this, _i3).port = "");
      let s;
      for (s of V) {
        if (!(s in __privateGet(this, _i3))) continue;
        let i = {}, o = __privateGet(this, _i3)[s];
        switch (__privateGet(this, _t2)[s] = [], s) {
          case "protocol":
            Object.assign(i, b), i.encodePart = w;
            break;
          case "username":
            Object.assign(i, b), i.encodePart = he$1;
            break;
          case "password":
            Object.assign(i, b), i.encodePart = ue$1;
            break;
          case "hostname":
            Object.assign(i, J$1), _(o) ? i.encodePart = K : i.encodePart = j;
            break;
          case "port":
            Object.assign(i, b), i.encodePart = G;
            break;
          case "pathname":
            U$1(__privateGet(this, _n2).protocol) ? (Object.assign(i, Q$1, l), i.encodePart = de$1) : (Object.assign(i, b, l), i.encodePart = pe$1);
            break;
          case "search":
            Object.assign(i, b, l), i.encodePart = ge$1;
            break;
          case "hash":
            Object.assign(i, b, l), i.encodePart = me$1;
            break;
        }
        try {
          __privateGet(this, _s3)[s] = F(o, i), __privateGet(this, _n2)[s] = W$1(__privateGet(this, _s3)[s], __privateGet(this, _t2)[s], i), __privateGet(this, _e3)[s] = Ae$1(__privateGet(this, _s3)[s], i), __privateSet(this, _l3, __privateGet(this, _l3) || __privateGet(this, _s3)[s].some((h) => h.type === 2));
        } catch {
          throw new TypeError(`invalid ${s} pattern '${__privateGet(this, _i3)[s]}'.`);
        }
      }
    } catch (c) {
      throw new TypeError(`Failed to construct 'URLPattern': ${c.message}`);
    }
  }
  get [Symbol.toStringTag]() {
    return "URLPattern";
  }
  test(t = {}, r) {
    let n = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
    if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
    if (typeof t > "u") return false;
    try {
      typeof t == "object" ? n = L(n, t, false) : n = L(n, Se$1(t, r), false);
    } catch {
      return false;
    }
    let c;
    for (c of V) if (!__privateGet(this, _n2)[c].exec(n[c])) return false;
    return true;
  }
  exec(t = {}, r) {
    let n = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
    if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
    if (typeof t > "u") return;
    try {
      typeof t == "object" ? n = L(n, t, false) : n = L(n, Se$1(t, r), false);
    } catch {
      return null;
    }
    let c = {};
    r ? c.inputs = [t, r] : c.inputs = [t];
    let l;
    for (l of V) {
      let f = __privateGet(this, _n2)[l].exec(n[l]);
      if (!f) return null;
      let s = {};
      for (let [i, o] of __privateGet(this, _t2)[l].entries()) if (typeof o == "string" || typeof o == "number") {
        let h = f[i + 1];
        s[o] = h;
      }
      c[l] = { input: n[l] ?? "", groups: s };
    }
    return c;
  }
  static compareComponent(t, r, n) {
    let c = a((i, o) => {
      for (let h of ["type", "modifier", "prefix", "value", "suffix"]) {
        if (i[h] < o[h]) return -1;
        if (i[h] === o[h]) continue;
        return 1;
      }
      return 0;
    }, "comparePart"), l = new P(3, "", "", "", "", 3), f = new P(0, "", "", "", "", 3), s = a((i, o) => {
      let h = 0;
      for (; h < Math.min(i.length, o.length); ++h) {
        let p = c(i[h], o[h]);
        if (p) return p;
      }
      return i.length === o.length ? 0 : c(i[h] ?? l, o[h] ?? l);
    }, "comparePartList");
    return !__privateGet(r, _e3)[t] && !__privateGet(n, _e3)[t] ? 0 : __privateGet(r, _e3)[t] && !__privateGet(n, _e3)[t] ? s(__privateGet(r, _s3)[t], [f]) : !__privateGet(r, _e3)[t] && __privateGet(n, _e3)[t] ? s([f], __privateGet(n, _s3)[t]) : s(__privateGet(r, _s3)[t], __privateGet(n, _s3)[t]);
  }
  get protocol() {
    return __privateGet(this, _e3).protocol;
  }
  get username() {
    return __privateGet(this, _e3).username;
  }
  get password() {
    return __privateGet(this, _e3).password;
  }
  get hostname() {
    return __privateGet(this, _e3).hostname;
  }
  get port() {
    return __privateGet(this, _e3).port;
  }
  get pathname() {
    return __privateGet(this, _e3).pathname;
  }
  get search() {
    return __privateGet(this, _e3).search;
  }
  get hash() {
    return __privateGet(this, _e3).hash;
  }
  get hasRegExpGroups() {
    return __privateGet(this, _l3);
  }
}, _i3 = new WeakMap(), _n2 = new WeakMap(), _t2 = new WeakMap(), _e3 = new WeakMap(), _s3 = new WeakMap(), _l3 = new WeakMap(), _b);
a(Y, "URLPattern");
function parseUrl(s) {
  return new URL(typeof s === "string" ? s : s.href);
}
function depaginatePathname(url, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace(pathnamePaginationSelector, "/");
  return newUrl;
}
function getPaginationLinks(doc = document, url = location.href, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
  const baseUrl = depaginatePathname(parseUrl(url), pathnamePaginationSelector);
  const pathnameStrict = doc instanceof Document;
  const host = doc.baseURI || baseUrl.origin;
  const urlPattern = new Y({
    pathname: pathnameStrict ? `${baseUrl.pathname}*` : "*",
    hostname: baseUrl.hostname
  });
  const pageLinks = [...doc.querySelectorAll("a[href]")].map((a2) => a2.href).filter((h) => URL.canParse(h));
  return pageLinks.filter((h) => {
    return urlPattern.test(new URL(h, host));
  });
}
function upgradePathname(curr, links, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
  if (pathnamePaginationSelector.test(curr.pathname) || links.length < 1) return curr;
  const linksDepaginated = links.map(
    (l) => depaginatePathname(l, pathnamePaginationSelector)
  );
  if (linksDepaginated.some((l) => l.pathname === curr.pathname)) return curr;
  const last = linksDepaginated.at(-1);
  if (last.pathname !== curr.pathname) curr.pathname = last.pathname;
  return curr;
}
class PaginationStrategy {
  constructor(options) {
    __publicField(this, "doc", document);
    __publicField(this, "url");
    __publicField(this, "paginationSelector", ".pagination");
    __publicField(this, "searchParamSelector", "page");
    __publicField(this, "pathnameSelector", /\/(\d+)\/?$/);
    __publicField(this, "dataparamSelector", "[data-parameters *= from]");
    __publicField(this, "overwritePaginationLast");
    __publicField(this, "offsetMin", 1);
    if (options) {
      Object.entries(options).forEach(([k2, v2]) => {
        Object.assign(this, { [k2]: v2 });
      });
    }
    this.url = parseUrl((options == null ? void 0 : options.url) || this.doc.URL);
  }
  getPaginationElement() {
    return this.doc.querySelector(this.paginationSelector);
  }
  get hasPagination() {
    return !!this.getPaginationElement();
  }
  getPaginationOffset() {
    return this.offsetMin;
  }
  getPaginationLast() {
    if (this.overwritePaginationLast) return this.overwritePaginationLast(1);
    return 1;
  }
  getPaginationUrlGenerator() {
    return (_2) => this.url.href;
  }
}
__publicField(PaginationStrategy, "_pathnameSelector", /\/(page\/)?\d+\/?$/);
class PaginationStrategyDataParams extends PaginationStrategy {
  getPaginationLast() {
    var _a3;
    const links = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelectorAll(this.dataparamSelector);
    const pages = Array.from(links || [], (l) => {
      var _a4;
      const p = l.getAttribute("data-parameters");
      const v2 = ((_a4 = p == null ? void 0 : p.match(/from\w*:(\d+)/)) == null ? void 0 : _a4[1]) || this.offsetMin.toString();
      return parseInt(v2);
    });
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
    return lastPage;
  }
  getPaginationOffset() {
    var _a3, _b2;
    const link = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelector(
      ".prev[data-parameters *= from], .prev [data-parameters *= from]"
    );
    if (!link) return this.offsetMin;
    const p = link.getAttribute("data-parameters");
    const v2 = ((_b2 = p == null ? void 0 : p.match(/from\w*:(\d+)/)) == null ? void 0 : _b2[1]) || this.offsetMin.toString();
    return parseInt(v2);
  }
  getPaginationUrlGenerator() {
    var _a3;
    const url = new URL(this.url.href);
    const parametersElement = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelector(
      "a[data-block-id][data-parameters]"
    );
    const block_id = (parametersElement == null ? void 0 : parametersElement.getAttribute("data-block-id")) || "";
    const parameters = parseDataParams(
      (parametersElement == null ? void 0 : parametersElement.getAttribute("data-parameters")) || ""
    );
    const attrs = {
      block_id,
      function: "get_block",
      mode: "async",
      ...parameters
    };
    Object.keys(attrs).forEach((k2) => {
      url.searchParams.set(k2, attrs[k2]);
    });
    const paginationUrlGenerator = (n) => {
      Object.keys(attrs).forEach((k2) => {
        k2.includes("from") && url.searchParams.set(k2, n.toString());
      });
      url.searchParams.set("_", Date.now().toString());
      return url.href;
    };
    return paginationUrlGenerator;
  }
  static testLinks(doc = document) {
    const dataParamLinks = Array.from(
      doc.querySelectorAll("[data-parameters *= from]")
    );
    return dataParamLinks.length > 0;
  }
}
class PaginationStrategyPathnameParams extends PaginationStrategy {
  constructor() {
    super(...arguments);
    __publicField(this, "extractPage", (a2) => {
      var _a3;
      const href = typeof a2 === "string" ? a2 : a2.href;
      const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
      return parseInt(
        ((_a3 = pathname.match(this.pathnameSelector)) == null ? void 0 : _a3.pop()) || this.offsetMin.toString()
      );
    });
  }
  static checkLink(link, pathnameSelector = PaginationStrategy._pathnameSelector) {
    return pathnameSelector.test(link.pathname);
  }
  static testLinks(links, options) {
    const result = links.some(
      (h) => PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector)
    );
    if (result) {
      const pathnamesMatched = links.filter(
        (h) => PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector)
      );
      options.url = upgradePathname(
        parseUrl(options.url),
        pathnamesMatched
      );
    }
    return result;
  }
  getPaginationLast() {
    const links = getPaginationLinks(
      this.getPaginationElement() || document,
      this.url.href,
      this.pathnameSelector
    );
    const pages = Array.from(links, this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
    return lastPage;
  }
  getPaginationOffset() {
    return this.extractPage(this.url.href);
  }
  getPaginationUrlGenerator(url_ = this.url) {
    const url = new URL(url_.href);
    const pathnameSelectorPlaceholder = this.pathnameSelector.toString().replace(/[/|\\|$|?|(|)]+/g, "/");
    if (!this.pathnameSelector.test(url.pathname)) {
      url.pathname = url.pathname.concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString())).replace(/\/{2,}/g, "/");
    }
    const paginationUrlGenerator = (offset) => {
      url.pathname = url.pathname.replace(
        this.pathnameSelector,
        pathnameSelectorPlaceholder.replace(/d\+/, offset.toString())
      );
      return url.href;
    };
    return paginationUrlGenerator;
  }
}
class PaginationStrategySearchParams extends PaginationStrategy {
  constructor() {
    super(...arguments);
    __publicField(this, "extractPage", (a2) => {
      const href = typeof a2 === "string" ? a2 : a2.href;
      const p = new URL(href).searchParams.get(this.searchParamSelector);
      return parseInt(p) || this.offsetMin;
    });
  }
  getPaginationLast() {
    const links = getPaginationLinks(
      this.getPaginationElement() || document,
      this.url.href
    ).filter(
      (h) => PaginationStrategySearchParams.checkLink(new URL(h), this.searchParamSelector)
    );
    const pages = links.map(this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
    return lastPage;
  }
  getPaginationOffset() {
    var _a3;
    if (this.doc === document) {
      return this.extractPage(this.url);
    }
    const link = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelector(
      `a.active[href *= "${this.searchParamSelector}="]`
    );
    return this.extractPage(link);
  }
  getPaginationUrlGenerator() {
    const url = new URL(this.url.href);
    const paginationUrlGenerator = (offset) => {
      url.searchParams.set(this.searchParamSelector, offset.toString());
      return url.href;
    };
    return paginationUrlGenerator;
  }
  static checkLink(link, searchParamSelector) {
    const searchParamSelectors = ["page", "p"];
    if (searchParamSelector) searchParamSelectors.push(searchParamSelector);
    return searchParamSelectors.some((p) => link.searchParams.get(p) !== null);
  }
  static testLinks(links, searchParamSelector) {
    return links.some(
      (h) => PaginationStrategySearchParams.checkLink(h, searchParamSelector)
    );
  }
}
function getPaginationStrategy(options) {
  const _paginationStrategy = new PaginationStrategy(options);
  const pagination = _paginationStrategy.getPaginationElement();
  Object.assign(options, { ..._paginationStrategy });
  const { url, searchParamSelector } = options;
  if (!pagination) {
    return _paginationStrategy;
  }
  if (typeof options.getPaginationUrlGenerator === "function") {
    return new PaginationStrategy(options);
  }
  const pageLinks = getPaginationLinks(pagination, url).map((l) => new URL(l));
  const selectStrategy = () => {
    if (PaginationStrategyDataParams.testLinks(pagination)) {
      return PaginationStrategyDataParams;
    }
    if (PaginationStrategySearchParams.testLinks(pageLinks, searchParamSelector)) {
      return PaginationStrategySearchParams;
    }
    if (PaginationStrategyPathnameParams.testLinks(pageLinks, options)) {
      return PaginationStrategyPathnameParams;
    }
    console.error("Found No Strategy");
    return PaginationStrategy;
  };
  const PaginationStrategyConstructor = selectStrategy();
  const paginationStrategy = new PaginationStrategyConstructor(options);
  return paginationStrategy;
}
var _i = {};
// @__NO_SIDE_EFFECTS__
function oe(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t.split(",")) e[n] = 1;
  return (n) => n in e;
}
const B = _i.NODE_ENV !== "production" ? Object.freeze({}) : {}, Te = _i.NODE_ENV !== "production" ? Object.freeze([]) : [], ot = () => {
}, xi = () => false, cn = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
(t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), jn = (t) => t.startsWith("onUpdate:"), X = Object.assign, Wo = (t, e) => {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}, Us = Object.prototype.hasOwnProperty, I = (t, e) => Us.call(t, e), D = Array.isArray, _e = (t) => pn(t) === "[object Map]", Gn = (t) => pn(t) === "[object Set]", Er = (t) => pn(t) === "[object Date]", T = (t) => typeof t == "function", J = (t) => typeof t == "string", Jt = (t) => typeof t == "symbol", U = (t) => t !== null && typeof t == "object", qo = (t) => (U(t) || T(t)) && T(t.then) && T(t.catch), vi = Object.prototype.toString, pn = (t) => vi.call(t), Go = (t) => pn(t).slice(8, -1), Jn = (t) => pn(t) === "[object Object]", Jo = (t) => J(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, Xe = /* @__PURE__ */ oe(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Hs = /* @__PURE__ */ oe(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
), Yn = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return ((n) => e[n] || (e[n] = t(n)));
}, Bs = /-\w/g, st = Yn(
  (t) => t.replace(Bs, (e) => e.slice(1).toUpperCase())
), Ks = /\B([A-Z])/g, kt = Yn(
  (t) => t.replace(Ks, "-$1").toLowerCase()
), Ee = Yn((t) => t.charAt(0).toUpperCase() + t.slice(1)), be = Yn(
  (t) => t ? `on${Ee(t)}` : ""
), pe = (t, e) => !Object.is(t, e), Ve = (t, ...e) => {
  for (let n = 0; n < t.length; n++)
    t[n](...e);
}, $n = (t, e, n, o = false) => {
  Object.defineProperty(t, e, {
    configurable: true,
    enumerable: false,
    writable: o,
    value: n
  });
}, Yo = (t) => {
  const e = parseFloat(t);
  return isNaN(e) ? t : e;
}, kr = (t) => {
  const e = J(t) ? Number(t) : NaN;
  return isNaN(e) ? t : e;
};
let Nr;
const fn = () => Nr || (Nr = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Xo(t) {
  if (D(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const o = t[n], r = J(o) ? Js(o) : Xo(o);
      if (r)
        for (const i in r)
          e[i] = r[i];
    }
    return e;
  } else if (J(t) || U(t))
    return t;
}
const Ws = /;(?![^(]*\))/g, qs = /:([^]+)/, Gs = /\/\*[^]*?\*\//g;
function Js(t) {
  const e = {};
  return t.replace(Gs, "").split(Ws).forEach((n) => {
    if (n) {
      const o = n.split(qs);
      o.length > 1 && (e[o[0].trim()] = o[1].trim());
    }
  }), e;
}
function Zo(t) {
  let e = "";
  if (J(t))
    e = t;
  else if (D(t))
    for (let n = 0; n < t.length; n++) {
      const o = Zo(t[n]);
      o && (e += o + " ");
    }
  else if (U(t))
    for (const n in t)
      t[n] && (e += n + " ");
  return e.trim();
}
const Ys = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", Xs = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view", Zs = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics", Qs = /* @__PURE__ */ oe(Ys), ta = /* @__PURE__ */ oe(Xs), ea = /* @__PURE__ */ oe(Zs), na = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", oa = /* @__PURE__ */ oe(na);
function wi(t) {
  return !!t || t === "";
}
function ra(t, e) {
  if (t.length !== e.length) return false;
  let n = true;
  for (let o = 0; n && o < t.length; o++)
    n = Xn(t[o], e[o]);
  return n;
}
function Xn(t, e) {
  if (t === e) return true;
  let n = Er(t), o = Er(e);
  if (n || o)
    return n && o ? t.getTime() === e.getTime() : false;
  if (n = Jt(t), o = Jt(e), n || o)
    return t === e;
  if (n = D(t), o = D(e), n || o)
    return n && o ? ra(t, e) : false;
  if (n = U(t), o = U(e), n || o) {
    if (!n || !o)
      return false;
    const r = Object.keys(t).length, i = Object.keys(e).length;
    if (r !== i)
      return false;
    for (const s in t) {
      const a2 = t.hasOwnProperty(s), l = e.hasOwnProperty(s);
      if (a2 && !l || !a2 && l || !Xn(t[s], e[s]))
        return false;
    }
  }
  return String(t) === String(e);
}
function Ei(t, e) {
  return t.findIndex((n) => Xn(n, e));
}
const ki = (t) => !!(t && t.__v_isRef === true), dn = (t) => J(t) ? t : t == null ? "" : D(t) || U(t) && (t.toString === vi || !T(t.toString)) ? ki(t) ? dn(t.value) : JSON.stringify(t, Ni, 2) : String(t), Ni = (t, e) => ki(e) ? Ni(t, e.value) : _e(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (n, [o, r], i) => (n[fo(o, i) + " =>"] = r, n),
    {}
  )
} : Gn(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((n) => fo(n))
} : Jt(e) ? fo(e) : U(e) && !D(e) && !Jn(e) ? String(e) : e, fo = (t, e = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Jt(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t
  );
};
var q = {};
function $t(t, ...e) {
  console.warn(`[Vue warn] ${t}`, ...e);
}
let vt;
class ia {
  constructor(e = false) {
    this.detached = e, this._active = true, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = false, this.parent = vt, !e && vt && (this.index = (vt.scopes || (vt.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let e, n;
      if (this.scopes)
        for (e = 0, n = this.scopes.length; e < n; e++)
          this.scopes[e].pause();
      for (e = 0, n = this.effects.length; e < n; e++)
        this.effects[e].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = false;
      let e, n;
      if (this.scopes)
        for (e = 0, n = this.scopes.length; e < n; e++)
          this.scopes[e].resume();
      for (e = 0, n = this.effects.length; e < n; e++)
        this.effects[e].resume();
    }
  }
  run(e) {
    if (this._active) {
      const n = vt;
      try {
        return vt = this, e();
      } finally {
        vt = n;
      }
    } else q.NODE_ENV !== "production" && $t("cannot run an inactive effect scope.");
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = vt, vt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (vt = this.prevScope, this.prevScope = void 0);
  }
  stop(e) {
    if (this._active) {
      this._active = false;
      let n, o;
      for (n = 0, o = this.effects.length; n < o; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, o = this.cleanups.length; n < o; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, o = this.scopes.length; n < o; n++)
          this.scopes[n].stop(true);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !e) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function sa() {
  return vt;
}
let H;
const ho = /* @__PURE__ */ new WeakSet();
class Oi {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, vt && vt.active && vt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, ho.has(this) && (ho.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ci(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Or(this), Di(this);
    const e = H, n = jt;
    H = this, jt = true;
    try {
      return this.fn();
    } finally {
      q.NODE_ENV !== "production" && H !== this && $t(
        "Active effect was not restored correctly - this is likely a Vue internal bug."
      ), zi(this), H = e, jt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        er(e);
      this.deps = this.depsTail = void 0, Or(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? ho.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ko(this) && this.run();
  }
  get dirty() {
    return ko(this);
  }
}
let Si = 0, Ze, Qe;
function Ci(t, e = false) {
  if (t.flags |= 8, e) {
    t.next = Qe, Qe = t;
    return;
  }
  t.next = Ze, Ze = t;
}
function Qo() {
  Si++;
}
function tr() {
  if (--Si > 0)
    return;
  if (Qe) {
    let e = Qe;
    for (Qe = void 0; e; ) {
      const n = e.next;
      e.next = void 0, e.flags &= -9, e = n;
    }
  }
  let t;
  for (; Ze; ) {
    let e = Ze;
    for (Ze = void 0; e; ) {
      const n = e.next;
      if (e.next = void 0, e.flags &= -9, e.flags & 1)
        try {
          e.trigger();
        } catch (o) {
          t || (t = o);
        }
      e = n;
    }
  }
  if (t) throw t;
}
function Di(t) {
  for (let e = t.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function zi(t) {
  let e, n = t.depsTail, o = n;
  for (; o; ) {
    const r = o.prevDep;
    o.version === -1 ? (o === n && (n = r), er(o), aa(o)) : e = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = r;
  }
  t.deps = e, t.depsTail = n;
}
function ko(t) {
  for (let e = t.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (Vi(e.dep.computed) || e.dep.version !== e.version))
      return true;
  return !!t._dirty;
}
function Vi(t) {
  if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === on) || (t.globalVersion = on, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !ko(t))))
    return;
  t.flags |= 2;
  const e = t.dep, n = H, o = jt;
  H = t, jt = true;
  try {
    Di(t);
    const r = t.fn(t._value);
    (e.version === 0 || pe(r, t._value)) && (t.flags |= 128, t._value = r, e.version++);
  } catch (r) {
    throw e.version++, r;
  } finally {
    H = n, jt = o, zi(t), t.flags &= -3;
  }
}
function er(t, e = false) {
  const { dep: n, prevSub: o, nextSub: r } = t;
  if (o && (o.nextSub = r, t.prevSub = void 0), r && (r.prevSub = o, t.nextSub = void 0), q.NODE_ENV !== "production" && n.subsHead === t && (n.subsHead = r), n.subs === t && (n.subs = o, !o && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      er(i, true);
  }
  !e && !--n.sc && n.map && n.map.delete(n.key);
}
function aa(t) {
  const { prevDep: e, nextDep: n } = t;
  e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
let jt = true;
const Mi = [];
function At() {
  Mi.push(jt), jt = false;
}
function It() {
  const t = Mi.pop();
  jt = t === void 0 ? true : t;
}
function Or(t) {
  const { cleanup: e } = t;
  if (t.cleanup = void 0, e) {
    const n = H;
    H = void 0;
    try {
      e();
    } finally {
      H = n;
    }
  }
}
let on = 0;
class ua {
  constructor(e, n) {
    this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class nr {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = true, q.NODE_ENV !== "production" && (this.subsHead = void 0);
  }
  track(e) {
    if (!H || !jt || H === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== H)
      n = this.activeLink = new ua(H, this), H.deps ? (n.prevDep = H.depsTail, H.depsTail.nextDep = n, H.depsTail = n) : H.deps = H.depsTail = n, Ti(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const o = n.nextDep;
      o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = H.depsTail, n.nextDep = void 0, H.depsTail.nextDep = n, H.depsTail = n, H.deps === n && (H.deps = o);
    }
    return q.NODE_ENV !== "production" && H.onTrack && H.onTrack(
      X(
        {
          effect: H
        },
        e
      )
    ), n;
  }
  trigger(e) {
    this.version++, on++, this.notify(e);
  }
  notify(e) {
    Qo();
    try {
      if (q.NODE_ENV !== "production")
        for (let n = this.subsHead; n; n = n.nextSub)
          n.sub.onTrigger && !(n.sub.flags & 8) && n.sub.onTrigger(
            X(
              {
                effect: n.sub
              },
              e
            )
          );
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      tr();
    }
  }
}
function Ti(t) {
  if (t.dep.sc++, t.sub.flags & 4) {
    const e = t.dep.computed;
    if (e && !t.dep.subs) {
      e.flags |= 20;
      for (let o = e.deps; o; o = o.nextDep)
        Ti(o);
    }
    const n = t.dep.subs;
    n !== t && (t.prevSub = n, n && (n.nextSub = t)), q.NODE_ENV !== "production" && t.dep.subsHead === void 0 && (t.dep.subsHead = t), t.dep.subs = t;
  }
}
const No = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ Symbol(
  q.NODE_ENV !== "production" ? "Object iterate" : ""
), Oo = /* @__PURE__ */ Symbol(
  q.NODE_ENV !== "production" ? "Map keys iterate" : ""
), rn = /* @__PURE__ */ Symbol(
  q.NODE_ENV !== "production" ? "Array iterate" : ""
);
function nt(t, e, n) {
  if (jt && H) {
    let o = No.get(t);
    o || No.set(t, o = /* @__PURE__ */ new Map());
    let r = o.get(n);
    r || (o.set(n, r = new nr()), r.map = o, r.key = n), q.NODE_ENV !== "production" ? r.track({
      target: t,
      type: e,
      key: n
    }) : r.track();
  }
}
function Wt(t, e, n, o, r, i) {
  const s = No.get(t);
  if (!s) {
    on++;
    return;
  }
  const a2 = (l) => {
    l && (q.NODE_ENV !== "production" ? l.trigger({
      target: t,
      type: e,
      key: n,
      newValue: o,
      oldValue: r,
      oldTarget: i
    }) : l.trigger());
  };
  if (Qo(), e === "clear")
    s.forEach(a2);
  else {
    const l = D(t), h = l && Jo(n);
    if (l && n === "length") {
      const f = Number(o);
      s.forEach((p, b2) => {
        (b2 === "length" || b2 === rn || !Jt(b2) && b2 >= f) && a2(p);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && a2(s.get(n)), h && a2(s.get(rn)), e) {
        case "add":
          l ? h && a2(s.get("length")) : (a2(s.get(xe)), _e(t) && a2(s.get(Oo)));
          break;
        case "delete":
          l || (a2(s.get(xe)), _e(t) && a2(s.get(Oo)));
          break;
        case "set":
          _e(t) && a2(s.get(xe));
          break;
      }
  }
  tr();
}
function Se(t) {
  const e = $(t);
  return e === t ? e : (nt(e, "iterate", rn), gt(t) ? e : e.map(Rt));
}
function Zn(t) {
  return nt(t = $(t), "iterate", rn), t;
}
function ue(t, e) {
  return Pt(t) ? fe(t) ? Pe(Rt(e)) : Pe(e) : Rt(e);
}
const la = {
  __proto__: null,
  [Symbol.iterator]() {
    return go(this, Symbol.iterator, (t) => ue(this, t));
  },
  concat(...t) {
    return Se(this).concat(
      ...t.map((e) => D(e) ? Se(e) : e)
    );
  },
  entries() {
    return go(this, "entries", (t) => (t[1] = ue(this, t[1]), t));
  },
  every(t, e) {
    return Zt(this, "every", t, e, void 0, arguments);
  },
  filter(t, e) {
    return Zt(
      this,
      "filter",
      t,
      e,
      (n) => n.map((o) => ue(this, o)),
      arguments
    );
  },
  find(t, e) {
    return Zt(
      this,
      "find",
      t,
      e,
      (n) => ue(this, n),
      arguments
    );
  },
  findIndex(t, e) {
    return Zt(this, "findIndex", t, e, void 0, arguments);
  },
  findLast(t, e) {
    return Zt(
      this,
      "findLast",
      t,
      e,
      (n) => ue(this, n),
      arguments
    );
  },
  findLastIndex(t, e) {
    return Zt(this, "findLastIndex", t, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(t, e) {
    return Zt(this, "forEach", t, e, void 0, arguments);
  },
  includes(...t) {
    return bo(this, "includes", t);
  },
  indexOf(...t) {
    return bo(this, "indexOf", t);
  },
  join(t) {
    return Se(this).join(t);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...t) {
    return bo(this, "lastIndexOf", t);
  },
  map(t, e) {
    return Zt(this, "map", t, e, void 0, arguments);
  },
  pop() {
    return We(this, "pop");
  },
  push(...t) {
    return We(this, "push", t);
  },
  reduce(t, ...e) {
    return Sr(this, "reduce", t, e);
  },
  reduceRight(t, ...e) {
    return Sr(this, "reduceRight", t, e);
  },
  shift() {
    return We(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(t, e) {
    return Zt(this, "some", t, e, void 0, arguments);
  },
  splice(...t) {
    return We(this, "splice", t);
  },
  toReversed() {
    return Se(this).toReversed();
  },
  toSorted(t) {
    return Se(this).toSorted(t);
  },
  toSpliced(...t) {
    return Se(this).toSpliced(...t);
  },
  unshift(...t) {
    return We(this, "unshift", t);
  },
  values() {
    return go(this, "values", (t) => ue(this, t));
  }
};
function go(t, e, n) {
  const o = Zn(t), r = o[e]();
  return o !== t && !gt(t) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.done || (i.value = n(i.value)), i;
  }), r;
}
const ca = Array.prototype;
function Zt(t, e, n, o, r, i) {
  const s = Zn(t), a2 = s !== t && !gt(t), l = s[e];
  if (l !== ca[e]) {
    const p = l.apply(t, i);
    return a2 ? Rt(p) : p;
  }
  let h = n;
  s !== t && (a2 ? h = function(p, b2) {
    return n.call(this, ue(t, p), b2, t);
  } : n.length > 2 && (h = function(p, b2) {
    return n.call(this, p, b2, t);
  }));
  const f = l.call(s, h, o);
  return a2 && r ? r(f) : f;
}
function Sr(t, e, n, o) {
  const r = Zn(t);
  let i = n;
  return r !== t && (gt(t) ? n.length > 3 && (i = function(s, a2, l) {
    return n.call(this, s, a2, l, t);
  }) : i = function(s, a2, l) {
    return n.call(this, s, ue(t, a2), l, t);
  }), r[e](i, ...o);
}
function bo(t, e, n) {
  const o = $(t);
  nt(o, "iterate", rn);
  const r = o[e](...n);
  return (r === -1 || r === false) && An(n[0]) ? (n[0] = $(n[0]), o[e](...n)) : r;
}
function We(t, e, n = []) {
  At(), Qo();
  const o = $(t)[e].apply(t, n);
  return tr(), It(), o;
}
const pa = /* @__PURE__ */ oe("__proto__,__v_isRef,__isVue"), ji = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Jt)
);
function fa(t) {
  Jt(t) || (t = String(t));
  const e = $(this);
  return nt(e, "has", t), e.hasOwnProperty(t);
}
class $i {
  constructor(e = false, n = false) {
    this._isReadonly = e, this._isShallow = n;
  }
  get(e, n, o) {
    if (n === "__v_skip") return e.__v_skip;
    const r = this._isReadonly, i = this._isShallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return i;
    if (n === "__v_raw")
      return o === (r ? i ? Li : Fi : i ? Ri : Pi).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(o) ? e : void 0;
    const s = D(e);
    if (!r) {
      let l;
      if (s && (l = la[n]))
        return l;
      if (n === "hasOwnProperty")
        return fa;
    }
    const a2 = Reflect.get(
      e,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      et(e) ? e : o
    );
    if ((Jt(n) ? ji.has(n) : pa(n)) || (r || nt(e, "get", n), i))
      return a2;
    if (et(a2)) {
      const l = s && Jo(n) ? a2 : a2.value;
      return r && U(l) ? Co(l) : l;
    }
    return U(a2) ? r ? Co(a2) : to(a2) : a2;
  }
}
class Ai extends $i {
  constructor(e = false) {
    super(false, e);
  }
  set(e, n, o, r) {
    let i = e[n];
    const s = D(e) && Jo(n);
    if (!this._isShallow) {
      const h = Pt(i);
      if (!gt(o) && !Pt(o) && (i = $(i), o = $(o)), !s && et(i) && !et(o))
        return h ? (q.NODE_ENV !== "production" && $t(
          `Set operation on key "${String(n)}" failed: target is readonly.`,
          e[n]
        ), true) : (i.value = o, true);
    }
    const a2 = s ? Number(n) < e.length : I(e, n), l = Reflect.set(
      e,
      n,
      o,
      et(e) ? e : r
    );
    return e === $(r) && (a2 ? pe(o, i) && Wt(e, "set", n, o, i) : Wt(e, "add", n, o)), l;
  }
  deleteProperty(e, n) {
    const o = I(e, n), r = e[n], i = Reflect.deleteProperty(e, n);
    return i && o && Wt(e, "delete", n, void 0, r), i;
  }
  has(e, n) {
    const o = Reflect.has(e, n);
    return (!Jt(n) || !ji.has(n)) && nt(e, "has", n), o;
  }
  ownKeys(e) {
    return nt(
      e,
      "iterate",
      D(e) ? "length" : xe
    ), Reflect.ownKeys(e);
  }
}
class Ii extends $i {
  constructor(e = false) {
    super(true, e);
  }
  set(e, n) {
    return q.NODE_ENV !== "production" && $t(
      `Set operation on key "${String(n)}" failed: target is readonly.`,
      e
    ), true;
  }
  deleteProperty(e, n) {
    return q.NODE_ENV !== "production" && $t(
      `Delete operation on key "${String(n)}" failed: target is readonly.`,
      e
    ), true;
  }
}
const da = /* @__PURE__ */ new Ai(), ha = /* @__PURE__ */ new Ii(), ga = /* @__PURE__ */ new Ai(true), ba = /* @__PURE__ */ new Ii(true), So = (t) => t, vn = (t) => Reflect.getPrototypeOf(t);
function ma(t, e, n) {
  return function(...o) {
    const r = this.__v_raw, i = $(r), s = _e(i), a2 = t === "entries" || t === Symbol.iterator && s, l = t === "keys" && s, h = r[t](...o), f = n ? So : e ? Pe : Rt;
    return !e && nt(
      i,
      "iterate",
      l ? Oo : xe
    ), {
      // iterator protocol
      next() {
        const { value: p, done: b2 } = h.next();
        return b2 ? { value: p, done: b2 } : {
          value: a2 ? [f(p[0]), f(p[1])] : f(p),
          done: b2
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function wn(t) {
  return function(...e) {
    if (q.NODE_ENV !== "production") {
      const n = e[0] ? `on key "${e[0]}" ` : "";
      $t(
        `${Ee(t)} operation ${n}failed: target is readonly.`,
        $(this)
      );
    }
    return t === "delete" ? false : t === "clear" ? void 0 : this;
  };
}
function ya(t, e) {
  const n = {
    get(r) {
      const i = this.__v_raw, s = $(i), a2 = $(r);
      t || (pe(r, a2) && nt(s, "get", r), nt(s, "get", a2));
      const { has: l } = vn(s), h = e ? So : t ? Pe : Rt;
      if (l.call(s, r))
        return h(i.get(r));
      if (l.call(s, a2))
        return h(i.get(a2));
      i !== s && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !t && nt($(r), "iterate", xe), r.size;
    },
    has(r) {
      const i = this.__v_raw, s = $(i), a2 = $(r);
      return t || (pe(r, a2) && nt(s, "has", r), nt(s, "has", a2)), r === a2 ? i.has(r) : i.has(r) || i.has(a2);
    },
    forEach(r, i) {
      const s = this, a2 = s.__v_raw, l = $(a2), h = e ? So : t ? Pe : Rt;
      return !t && nt(l, "iterate", xe), a2.forEach((f, p) => r.call(i, h(f), h(p), s));
    }
  };
  return X(
    n,
    t ? {
      add: wn("add"),
      set: wn("set"),
      delete: wn("delete"),
      clear: wn("clear")
    } : {
      add(r) {
        !e && !gt(r) && !Pt(r) && (r = $(r));
        const i = $(this);
        return vn(i).has.call(i, r) || (i.add(r), Wt(i, "add", r, r)), this;
      },
      set(r, i) {
        !e && !gt(i) && !Pt(i) && (i = $(i));
        const s = $(this), { has: a2, get: l } = vn(s);
        let h = a2.call(s, r);
        h ? q.NODE_ENV !== "production" && Cr(s, a2, r) : (r = $(r), h = a2.call(s, r));
        const f = l.call(s, r);
        return s.set(r, i), h ? pe(i, f) && Wt(s, "set", r, i, f) : Wt(s, "add", r, i), this;
      },
      delete(r) {
        const i = $(this), { has: s, get: a2 } = vn(i);
        let l = s.call(i, r);
        l ? q.NODE_ENV !== "production" && Cr(i, s, r) : (r = $(r), l = s.call(i, r));
        const h = a2 ? a2.call(i, r) : void 0, f = i.delete(r);
        return l && Wt(i, "delete", r, void 0, h), f;
      },
      clear() {
        const r = $(this), i = r.size !== 0, s = q.NODE_ENV !== "production" ? _e(r) ? new Map(r) : new Set(r) : void 0, a2 = r.clear();
        return i && Wt(
          r,
          "clear",
          void 0,
          void 0,
          s
        ), a2;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    n[r] = ma(r, t, e);
  }), n;
}
function Qn(t, e) {
  const n = ya(t, e);
  return (o, r, i) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? o : Reflect.get(
    I(n, r) && r in o ? n : o,
    r,
    i
  );
}
const _a = {
  get: /* @__PURE__ */ Qn(false, false)
}, xa = {
  get: /* @__PURE__ */ Qn(false, true)
}, va = {
  get: /* @__PURE__ */ Qn(true, false)
}, wa = {
  get: /* @__PURE__ */ Qn(true, true)
};
function Cr(t, e, n) {
  const o = $(n);
  if (o !== n && e.call(t, o)) {
    const r = Go(t);
    $t(
      `Reactive ${r} contains both the raw and reactive versions of the same object${r === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const Pi = /* @__PURE__ */ new WeakMap(), Ri = /* @__PURE__ */ new WeakMap(), Fi = /* @__PURE__ */ new WeakMap(), Li = /* @__PURE__ */ new WeakMap();
function Ea(t) {
  switch (t) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function ka(t) {
  return t.__v_skip || !Object.isExtensible(t) ? 0 : Ea(Go(t));
}
function to(t) {
  return Pt(t) ? t : eo(
    t,
    false,
    da,
    _a,
    Pi
  );
}
function Na(t) {
  return eo(
    t,
    false,
    ga,
    xa,
    Ri
  );
}
function Co(t) {
  return eo(
    t,
    true,
    ha,
    va,
    Fi
  );
}
function Gt(t) {
  return eo(
    t,
    true,
    ba,
    wa,
    Li
  );
}
function eo(t, e, n, o, r) {
  if (!U(t))
    return q.NODE_ENV !== "production" && $t(
      `value cannot be made ${e ? "readonly" : "reactive"}: ${String(
        t
      )}`
    ), t;
  if (t.__v_raw && !(e && t.__v_isReactive))
    return t;
  const i = ka(t);
  if (i === 0)
    return t;
  const s = r.get(t);
  if (s)
    return s;
  const a2 = new Proxy(
    t,
    i === 2 ? o : n
  );
  return r.set(t, a2), a2;
}
function fe(t) {
  return Pt(t) ? fe(t.__v_raw) : !!(t && t.__v_isReactive);
}
function Pt(t) {
  return !!(t && t.__v_isReadonly);
}
function gt(t) {
  return !!(t && t.__v_isShallow);
}
function An(t) {
  return t ? !!t.__v_raw : false;
}
function $(t) {
  const e = t && t.__v_raw;
  return e ? $(e) : t;
}
function Oa(t) {
  return !I(t, "__v_skip") && Object.isExtensible(t) && $n(t, "__v_skip", true), t;
}
const Rt = (t) => U(t) ? to(t) : t, Pe = (t) => U(t) ? Co(t) : t;
function et(t) {
  return t ? t.__v_isRef === true : false;
}
function Ce(t) {
  return Sa(t, false);
}
function Sa(t, e) {
  return et(t) ? t : new Ca(t, e);
}
class Ca {
  constructor(e, n) {
    this.dep = new nr(), this.__v_isRef = true, this.__v_isShallow = false, this._rawValue = n ? e : $(e), this._value = n ? e : Rt(e), this.__v_isShallow = n;
  }
  get value() {
    return q.NODE_ENV !== "production" ? this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) : this.dep.track(), this._value;
  }
  set value(e) {
    const n = this._rawValue, o = this.__v_isShallow || gt(e) || Pt(e);
    e = o ? e : $(e), pe(e, n) && (this._rawValue = e, this._value = o ? e : Rt(e), q.NODE_ENV !== "production" ? this.dep.trigger({
      target: this,
      type: "set",
      key: "value",
      newValue: e,
      oldValue: n
    }) : this.dep.trigger());
  }
}
function In(t) {
  return et(t) ? t.value : t;
}
const Da = {
  get: (t, e, n) => e === "__v_raw" ? t : In(Reflect.get(t, e, n)),
  set: (t, e, n, o) => {
    const r = t[e];
    return et(r) && !et(n) ? (r.value = n, true) : Reflect.set(t, e, n, o);
  }
};
function Ui(t) {
  return fe(t) ? t : new Proxy(t, Da);
}
class za {
  constructor(e, n, o) {
    this.fn = e, this.setter = n, this._value = void 0, this.dep = new nr(this), this.__v_isRef = true, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = on - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    H !== this)
      return Ci(this, true), true;
  }
  get value() {
    const e = q.NODE_ENV !== "production" ? this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) : this.dep.track();
    return Vi(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter ? this.setter(e) : q.NODE_ENV !== "production" && $t("Write operation failed: computed value is readonly");
  }
}
function Va(t, e, n = false) {
  let o, r;
  return T(t) ? o = t : (o = t.get, r = t.set), new za(o, r, n);
}
const En = {}, Pn = /* @__PURE__ */ new WeakMap();
let me;
function Ma(t, e = false, n = me) {
  if (n) {
    let o = Pn.get(n);
    o || Pn.set(n, o = []), o.push(t);
  } else q.NODE_ENV !== "production" && !e && $t(
    "onWatcherCleanup() was called when there was no active watcher to associate with."
  );
}
function Ta(t, e, n = B) {
  const { immediate: o, deep: r, once: i, scheduler: s, augmentJob: a2, call: l } = n, h = (V2) => {
    (n.onWarn || $t)(
      "Invalid watch source: ",
      V2,
      "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
    );
  }, f = (V2) => r ? V2 : gt(V2) || r === false || r === 0 ? ee(V2, 1) : ee(V2);
  let p, b2, v2, C2, S = false, rt = false;
  if (et(t) ? (b2 = () => t.value, S = gt(t)) : fe(t) ? (b2 = () => f(t), S = true) : D(t) ? (rt = true, S = t.some((V2) => fe(V2) || gt(V2)), b2 = () => t.map((V2) => {
    if (et(V2))
      return V2.value;
    if (fe(V2))
      return f(V2);
    if (T(V2))
      return l ? l(V2, 2) : V2();
    q.NODE_ENV !== "production" && h(V2);
  })) : T(t) ? e ? b2 = l ? () => l(t, 2) : t : b2 = () => {
    if (v2) {
      At();
      try {
        v2();
      } finally {
        It();
      }
    }
    const V2 = me;
    me = p;
    try {
      return l ? l(t, 3, [C2]) : t(C2);
    } finally {
      me = V2;
    }
  } : (b2 = ot, q.NODE_ENV !== "production" && h(t)), e && r) {
    const V2 = b2, it = r === true ? 1 / 0 : r;
    b2 = () => ee(V2(), it);
  }
  const Y2 = sa(), L2 = () => {
    p.stop(), Y2 && Y2.active && Wo(Y2.effects, p);
  };
  if (i && e) {
    const V2 = e;
    e = (...it) => {
      V2(...it), L2();
    };
  }
  let F2 = rt ? new Array(t.length).fill(En) : En;
  const wt = (V2) => {
    if (!(!(p.flags & 1) || !p.dirty && !V2))
      if (e) {
        const it = p.run();
        if (r || S || (rt ? it.some((Dt, ut) => pe(Dt, F2[ut])) : pe(it, F2))) {
          v2 && v2();
          const Dt = me;
          me = p;
          try {
            const ut = [
              it,
              // pass undefined as the old value when it's changed for the first time
              F2 === En ? void 0 : rt && F2[0] === En ? [] : F2,
              C2
            ];
            F2 = it, l ? l(e, 3, ut) : (
              // @ts-expect-error
              e(...ut)
            );
          } finally {
            me = Dt;
          }
        }
      } else
        p.run();
  };
  return a2 && a2(wt), p = new Oi(b2), p.scheduler = s ? () => s(wt, false) : wt, C2 = (V2) => Ma(V2, false, p), v2 = p.onStop = () => {
    const V2 = Pn.get(p);
    if (V2) {
      if (l)
        l(V2, 4);
      else
        for (const it of V2) it();
      Pn.delete(p);
    }
  }, q.NODE_ENV !== "production" && (p.onTrack = n.onTrack, p.onTrigger = n.onTrigger), e ? o ? wt(true) : F2 = p.run() : s ? s(wt.bind(null, true), true) : p.run(), L2.pause = p.pause.bind(p), L2.resume = p.resume.bind(p), L2.stop = L2, L2;
}
function ee(t, e = 1 / 0, n) {
  if (e <= 0 || !U(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(t) || 0) >= e))
    return t;
  if (n.set(t, e), e--, et(t))
    ee(t.value, e, n);
  else if (D(t))
    for (let o = 0; o < t.length; o++)
      ee(t[o], e, n);
  else if (Gn(t) || _e(t))
    t.forEach((o) => {
      ee(o, e, n);
    });
  else if (Jn(t)) {
    for (const o in t)
      ee(t[o], e, n);
    for (const o of Object.getOwnPropertySymbols(t))
      Object.prototype.propertyIsEnumerable.call(t, o) && ee(t[o], e, n);
  }
  return t;
}
var d = {};
const ve = [];
function Nn(t) {
  ve.push(t);
}
function On() {
  ve.pop();
}
let mo = false;
function k(t, ...e) {
  if (mo) return;
  mo = true, At();
  const n = ve.length ? ve[ve.length - 1].component : null, o = n && n.appContext.config.warnHandler, r = ja();
  if (o)
    Fe(
      o,
      n,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        t + e.map((i) => {
          var s, a2;
          return (a2 = (s = i.toString) == null ? void 0 : s.call(i)) != null ? a2 : JSON.stringify(i);
        }).join(""),
        n && n.proxy,
        r.map(
          ({ vnode: i }) => `at <${yn(n, i.type)}>`
        ).join(`
`),
        r
      ]
    );
  else {
    const i = [`[Vue warn]: ${t}`, ...e];
    r.length && i.push(`
`, ...$a(r)), console.warn(...i);
  }
  It(), mo = false;
}
function ja() {
  let t = ve[ve.length - 1];
  if (!t)
    return [];
  const e = [];
  for (; t; ) {
    const n = e[0];
    n && n.vnode === t ? n.recurseCount++ : e.push({
      vnode: t,
      recurseCount: 0
    });
    const o = t.component && t.component.parent;
    t = o && o.vnode;
  }
  return e;
}
function $a(t) {
  const e = [];
  return t.forEach((n, o) => {
    e.push(...o === 0 ? [] : [`
`], ...Aa(n));
  }), e;
}
function Aa({ vnode: t, recurseCount: e }) {
  const n = e > 0 ? `... (${e} recursive calls)` : "", o = t.component ? t.component.parent == null : false, r = ` at <${yn(
    t.component,
    t.type,
    o
  )}`, i = ">" + n;
  return t.props ? [r, ...Ia(t.props), i] : [r + i];
}
function Ia(t) {
  const e = [], n = Object.keys(t);
  return n.slice(0, 3).forEach((o) => {
    e.push(...Hi(o, t[o]));
  }), n.length > 3 && e.push(" ..."), e;
}
function Hi(t, e, n) {
  return J(e) ? (e = JSON.stringify(e), n ? e : [`${t}=${e}`]) : typeof e == "number" || typeof e == "boolean" || e == null ? n ? e : [`${t}=${e}`] : et(e) ? (e = Hi(t, $(e.value), true), n ? e : [`${t}=Ref<`, e, ">"]) : T(e) ? [`${t}=fn${e.name ? `<${e.name}>` : ""}`] : (e = $(e), n ? e : [`${t}=`, e]);
}
const or = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  0: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush",
  15: "component update",
  16: "app unmount cleanup function"
};
function Fe(t, e, n, o) {
  try {
    return o ? t(...o) : t();
  } catch (r) {
    hn(r, e, n);
  }
}
function Yt(t, e, n, o) {
  if (T(t)) {
    const r = Fe(t, e, n, o);
    return r && qo(r) && r.catch((i) => {
      hn(i, e, n);
    }), r;
  }
  if (D(t)) {
    const r = [];
    for (let i = 0; i < t.length; i++)
      r.push(Yt(t[i], e, n, o));
    return r;
  } else d.NODE_ENV !== "production" && k(
    `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof t}`
  );
}
function hn(t, e, n, o = true) {
  const r = e ? e.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: s } = e && e.appContext.config || B;
  if (e) {
    let a2 = e.parent;
    const l = e.proxy, h = d.NODE_ENV !== "production" ? or[n] : `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a2; ) {
      const f = a2.ec;
      if (f) {
        for (let p = 0; p < f.length; p++)
          if (f[p](t, l, h) === false)
            return;
      }
      a2 = a2.parent;
    }
    if (i) {
      At(), Fe(i, null, 10, [
        t,
        l,
        h
      ]), It();
      return;
    }
  }
  Pa(t, n, r, o, s);
}
function Pa(t, e, n, o = true, r = false) {
  if (d.NODE_ENV !== "production") {
    const i = or[e];
    if (n && Nn(n), k(`Unhandled error${i ? ` during execution of ${i}` : ""}`), n && On(), o)
      throw t;
    console.error(t);
  } else {
    if (r)
      throw t;
    console.error(t);
  }
}
const ht = [];
let Kt = -1;
const je = [];
let le = null, Me = 0;
const Bi = /* @__PURE__ */ Promise.resolve();
let Rn = null;
const Ra = 100;
function rr(t) {
  const e = Rn || Bi;
  return t ? e.then(this ? t.bind(this) : t) : e;
}
function Fa(t) {
  let e = Kt + 1, n = ht.length;
  for (; e < n; ) {
    const o = e + n >>> 1, r = ht[o], i = sn(r);
    i < t || i === t && r.flags & 2 ? e = o + 1 : n = o;
  }
  return e;
}
function no(t) {
  if (!(t.flags & 1)) {
    const e = sn(t), n = ht[ht.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(t.flags & 2) && e >= sn(n) ? ht.push(t) : ht.splice(Fa(e), 0, t), t.flags |= 1, Ki();
  }
}
function Ki() {
  Rn || (Rn = Bi.then(Gi));
}
function Wi(t) {
  D(t) ? je.push(...t) : le && t.id === -1 ? le.splice(Me + 1, 0, t) : t.flags & 1 || (je.push(t), t.flags |= 1), Ki();
}
function Dr(t, e, n = Kt + 1) {
  for (d.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()); n < ht.length; n++) {
    const o = ht[n];
    if (o && o.flags & 2) {
      if (t && o.id !== t.uid || d.NODE_ENV !== "production" && ir(e, o))
        continue;
      ht.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
    }
  }
}
function qi(t) {
  if (je.length) {
    const e = [...new Set(je)].sort(
      (n, o) => sn(n) - sn(o)
    );
    if (je.length = 0, le) {
      le.push(...e);
      return;
    }
    for (le = e, d.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map()), Me = 0; Me < le.length; Me++) {
      const n = le[Me];
      d.NODE_ENV !== "production" && ir(t, n) || (n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2);
    }
    le = null, Me = 0;
  }
}
const sn = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
function Gi(t) {
  d.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map());
  const e = d.NODE_ENV !== "production" ? (n) => ir(t, n) : ot;
  try {
    for (Kt = 0; Kt < ht.length; Kt++) {
      const n = ht[Kt];
      if (n && !(n.flags & 8)) {
        if (d.NODE_ENV !== "production" && e(n))
          continue;
        n.flags & 4 && (n.flags &= -2), Fe(
          n,
          n.i,
          n.i ? 15 : 14
        ), n.flags & 4 || (n.flags &= -2);
      }
    }
  } finally {
    for (; Kt < ht.length; Kt++) {
      const n = ht[Kt];
      n && (n.flags &= -2);
    }
    Kt = -1, ht.length = 0, qi(t), Rn = null, (ht.length || je.length) && Gi(t);
  }
}
function ir(t, e) {
  const n = t.get(e) || 0;
  if (n > Ra) {
    const o = e.i, r = o && gr(o.type);
    return hn(
      `Maximum recursive updates exceeded${r ? ` in component <${r}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
      null,
      10
    ), true;
  }
  return t.set(e, n + 1), false;
}
let Tt = false;
const Sn = /* @__PURE__ */ new Map();
d.NODE_ENV !== "production" && (fn().__VUE_HMR_RUNTIME__ = {
  createRecord: yo(Ji),
  rerender: yo(Ha),
  reload: yo(Ba)
});
const ke = /* @__PURE__ */ new Map();
function La(t) {
  const e = t.type.__hmrId;
  let n = ke.get(e);
  n || (Ji(e, t.type), n = ke.get(e)), n.instances.add(t);
}
function Ua(t) {
  ke.get(t.type.__hmrId).instances.delete(t);
}
function Ji(t, e) {
  return ke.has(t) ? false : (ke.set(t, {
    initialDef: Fn(e),
    instances: /* @__PURE__ */ new Set()
  }), true);
}
function Fn(t) {
  return Ms(t) ? t.__vccOpts : t;
}
function Ha(t, e) {
  const n = ke.get(t);
  n && (n.initialDef.render = e, [...n.instances].forEach((o) => {
    e && (o.render = e, Fn(o.type).render = e), o.renderCache = [], Tt = true, o.job.flags & 8 || o.update(), Tt = false;
  }));
}
function Ba(t, e) {
  const n = ke.get(t);
  if (!n) return;
  e = Fn(e), zr(n.initialDef, e);
  const o = [...n.instances];
  for (let r = 0; r < o.length; r++) {
    const i = o[r], s = Fn(i.type);
    let a2 = Sn.get(s);
    a2 || (s !== n.initialDef && zr(s, e), Sn.set(s, a2 = /* @__PURE__ */ new Set())), a2.add(i), i.appContext.propsCache.delete(i.type), i.appContext.emitsCache.delete(i.type), i.appContext.optionsCache.delete(i.type), i.ceReload ? (a2.add(i), i.ceReload(e.styles), a2.delete(i)) : i.parent ? no(() => {
      i.job.flags & 8 || (Tt = true, i.parent.update(), Tt = false, a2.delete(i));
    }) : i.appContext.reload ? i.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
      "[HMR] Root or manually mounted instance modified. Full reload required."
    ), i.root.ce && i !== i.root && i.root.ce._removeChildStyle(s);
  }
  Wi(() => {
    Sn.clear();
  });
}
function zr(t, e) {
  X(t, e);
  for (const n in t)
    n !== "__file" && !(n in e) && delete t[n];
}
function yo(t) {
  return (e, n) => {
    try {
      return t(e, n);
    } catch (o) {
      console.error(o), console.warn(
        "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
      );
    }
  };
}
let qt, Je = [], Do = false;
function gn(t, ...e) {
  qt ? qt.emit(t, ...e) : Do || Je.push({ event: t, args: e });
}
function Yi(t, e) {
  var n, o;
  qt = t, qt ? (qt.enabled = true, Je.forEach(({ event: r, args: i }) => qt.emit(r, ...i)), Je = []) : (
    /* handle late devtools injection - only do this if we are in an actual */
    /* browser environment to avoid the timer handle stalling test runner exit */
    /* (#4815) */
    typeof window < "u" && // some envs mock window but not fully
    window.HTMLElement && // also exclude jsdom
    // eslint-disable-next-line no-restricted-syntax
    !((o = (n = window.navigator) == null ? void 0 : n.userAgent) != null && o.includes("jsdom")) ? ((e.__VUE_DEVTOOLS_HOOK_REPLAY__ = e.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((i) => {
      Yi(i, e);
    }), setTimeout(() => {
      qt || (e.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Do = true, Je = []);
    }, 3e3)) : (Do = true, Je = [])
  );
}
function Ka(t, e) {
  gn("app:init", t, e, {
    Fragment: ct,
    Text: bn,
    Comment: Ot,
    Static: zn
  });
}
function Wa(t) {
  gn("app:unmount", t);
}
const qa = /* @__PURE__ */ sr(
  "component:added"
  /* COMPONENT_ADDED */
), Xi = /* @__PURE__ */ sr(
  "component:updated"
  /* COMPONENT_UPDATED */
), Ga = /* @__PURE__ */ sr(
  "component:removed"
  /* COMPONENT_REMOVED */
), Ja = (t) => {
  qt && typeof qt.cleanupBuffer == "function" && // remove the component if it wasn't buffered
  !qt.cleanupBuffer(t) && Ga(t);
};
// @__NO_SIDE_EFFECTS__
function sr(t) {
  return (e) => {
    gn(
      t,
      e.appContext.app,
      e.uid,
      e.parent ? e.parent.uid : void 0,
      e
    );
  };
}
const Ya = /* @__PURE__ */ Zi(
  "perf:start"
  /* PERFORMANCE_START */
), Xa = /* @__PURE__ */ Zi(
  "perf:end"
  /* PERFORMANCE_END */
);
function Zi(t) {
  return (e, n, o) => {
    gn(t, e.appContext.app, e.uid, e, n, o);
  };
}
function Za(t, e, n) {
  gn(
    "component:emit",
    t.appContext.app,
    t,
    e,
    n
  );
}
let pt = null, Qi = null;
function Ln(t) {
  const e = pt;
  return pt = t, Qi = t && t.type.__scopeId || null, e;
}
function Qa(t, e = pt, n) {
  if (!e || t._n)
    return t;
  const o = (...r) => {
    o._d && Kr(-1);
    const i = Ln(e);
    let s;
    try {
      s = t(...r);
    } finally {
      Ln(i), o._d && Kr(1);
    }
    return d.NODE_ENV !== "production" && Xi(e), s;
  };
  return o._n = true, o._c = true, o._d = true, o;
}
function ts(t) {
  Hs(t) && k("Do not use built-in directive ids as custom directive id: " + t);
}
function Re(t, e) {
  if (pt === null)
    return d.NODE_ENV !== "production" && k("withDirectives can only be used inside render functions."), t;
  const n = so(pt), o = t.dirs || (t.dirs = []);
  for (let r = 0; r < e.length; r++) {
    let [i, s, a2, l = B] = e[r];
    i && (T(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && ee(s), o.push({
      dir: i,
      instance: n,
      value: s,
      oldValue: void 0,
      arg: a2,
      modifiers: l
    }));
  }
  return t;
}
function he(t, e, n, o) {
  const r = t.dirs, i = e && e.dirs;
  for (let s = 0; s < r.length; s++) {
    const a2 = r[s];
    i && (a2.oldValue = i[s].value);
    let l = a2.dir[o];
    l && (At(), Yt(l, n, 8, [
      t.el,
      a2,
      t,
      e
    ]), It());
  }
}
function tu(t, e) {
  if (d.NODE_ENV !== "production" && (!tt || tt.isMounted) && k("provide() can only be used inside setup()."), tt) {
    let n = tt.provides;
    const o = tt.parent && tt.parent.provides;
    o === n && (n = tt.provides = Object.create(o)), n[t] = e;
  }
}
function Cn(t, e, n = false) {
  const o = Ds();
  if (o || Ae) {
    let r = Ae ? Ae._context.provides : o ? o.parent == null || o.ce ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
    if (r && t in r)
      return r[t];
    if (arguments.length > 1)
      return n && T(e) ? e.call(o && o.proxy) : e;
    d.NODE_ENV !== "production" && k(`injection "${String(t)}" not found.`);
  } else d.NODE_ENV !== "production" && k("inject() can only be used inside setup() or functional components.");
}
const eu = /* @__PURE__ */ Symbol.for("v-scx"), nu = () => {
  {
    const t = Cn(eu);
    return t || d.NODE_ENV !== "production" && k(
      "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
    ), t;
  }
};
function $e(t, e, n) {
  return d.NODE_ENV !== "production" && !T(e) && k(
    "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
  ), es(t, e, n);
}
function es(t, e, n = B) {
  const { immediate: o, deep: r, flush: i, once: s } = n;
  d.NODE_ENV !== "production" && !e && (o !== void 0 && k(
    'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
  ), r !== void 0 && k(
    'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
  ), s !== void 0 && k(
    'watch() "once" option is only respected when using the watch(source, callback, options?) signature.'
  ));
  const a2 = X({}, n);
  d.NODE_ENV !== "production" && (a2.onWarn = k);
  const l = e && o || !e && i !== "post";
  let h;
  if (un) {
    if (i === "sync") {
      const v2 = nu();
      h = v2.__watcherHandles || (v2.__watcherHandles = []);
    } else if (!l) {
      const v2 = () => {
      };
      return v2.stop = ot, v2.resume = ot, v2.pause = ot, v2;
    }
  }
  const f = tt;
  a2.call = (v2, C2, S) => Yt(v2, f, C2, S);
  let p = false;
  i === "post" ? a2.scheduler = (v2) => {
    Et(v2, f && f.suspense);
  } : i !== "sync" && (p = true, a2.scheduler = (v2, C2) => {
    C2 ? v2() : no(v2);
  }), a2.augmentJob = (v2) => {
    e && (v2.flags |= 4), p && (v2.flags |= 2, f && (v2.id = f.uid, v2.i = f));
  };
  const b2 = Ta(t, e, a2);
  return un && (h ? h.push(b2) : l && b2()), b2;
}
function ou(t, e, n) {
  const o = this.proxy, r = J(t) ? t.includes(".") ? ns(o, t) : () => o[t] : t.bind(o, o);
  let i;
  T(e) ? i = e : (i = e.handler, n = e);
  const s = mn(this), a2 = es(r, i.bind(o), n);
  return s(), a2;
}
function ns(t, e) {
  const n = e.split(".");
  return () => {
    let o = t;
    for (let r = 0; r < n.length && o; r++)
      o = o[n[r]];
    return o;
  };
}
const ru = /* @__PURE__ */ Symbol("_vte"), iu = (t) => t.__isTeleport, su = /* @__PURE__ */ Symbol("_leaveCb");
function ar(t, e) {
  t.shapeFlag & 6 && t.component ? (t.transition = e, ar(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
// @__NO_SIDE_EFFECTS__
function Ct(t, e) {
  return T(t) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    X({ name: t.name }, e, { setup: t })
  ) : t;
}
function os(t) {
  t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
}
const Vr = /* @__PURE__ */ new WeakSet(), Un = /* @__PURE__ */ new WeakMap();
function tn(t, e, n, o, r = false) {
  if (D(t)) {
    t.forEach(
      (S, rt) => tn(
        S,
        e && (D(e) ? e[rt] : e),
        n,
        o,
        r
      )
    );
    return;
  }
  if (en(o) && !r) {
    o.shapeFlag & 512 && o.type.__asyncResolved && o.component.subTree.component && tn(t, e, n, o.component.subTree);
    return;
  }
  const i = o.shapeFlag & 4 ? so(o.component) : o.el, s = r ? null : i, { i: a2, r: l } = t;
  if (d.NODE_ENV !== "production" && !a2) {
    k(
      "Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function."
    );
    return;
  }
  const h = e && e.r, f = a2.refs === B ? a2.refs = {} : a2.refs, p = a2.setupState, b2 = $(p), v2 = p === B ? xi : (S) => d.NODE_ENV !== "production" && (I(b2, S) && !et(b2[S]) && k(
    `Template ref "${S}" used on a non-ref value. It will not work in the production build.`
  ), Vr.has(b2[S])) ? false : I(b2, S), C2 = (S) => d.NODE_ENV === "production" || !Vr.has(S);
  if (h != null && h !== l) {
    if (Mr(e), J(h))
      f[h] = null, v2(h) && (p[h] = null);
    else if (et(h)) {
      C2(h) && (h.value = null);
      const S = e;
      S.k && (f[S.k] = null);
    }
  }
  if (T(l))
    Fe(l, a2, 12, [s, f]);
  else {
    const S = J(l), rt = et(l);
    if (S || rt) {
      const Y2 = () => {
        if (t.f) {
          const L2 = S ? v2(l) ? p[l] : f[l] : C2(l) || !t.k ? l.value : f[t.k];
          if (r)
            D(L2) && Wo(L2, i);
          else if (D(L2))
            L2.includes(i) || L2.push(i);
          else if (S)
            f[l] = [i], v2(l) && (p[l] = f[l]);
          else {
            const F2 = [i];
            C2(l) && (l.value = F2), t.k && (f[t.k] = F2);
          }
        } else S ? (f[l] = s, v2(l) && (p[l] = s)) : rt ? (C2(l) && (l.value = s), t.k && (f[t.k] = s)) : d.NODE_ENV !== "production" && k("Invalid template ref type:", l, `(${typeof l})`);
      };
      if (s) {
        const L2 = () => {
          Y2(), Un.delete(t);
        };
        L2.id = -1, Un.set(t, L2), Et(L2, n);
      } else
        Mr(t), Y2();
    } else d.NODE_ENV !== "production" && k("Invalid template ref type:", l, `(${typeof l})`);
  }
}
function Mr(t) {
  const e = Un.get(t);
  e && (e.flags |= 8, Un.delete(t));
}
fn().requestIdleCallback;
fn().cancelIdleCallback;
const en = (t) => !!t.type.__asyncLoader, ur = (t) => t.type.__isKeepAlive;
function au(t, e) {
  rs(t, "a", e);
}
function uu(t, e) {
  rs(t, "da", e);
}
function rs(t, e, n = tt) {
  const o = t.__wdc || (t.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return t();
  });
  if (oo(e, o, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      ur(r.parent.vnode) && lu(o, e, n, r), r = r.parent;
  }
}
function lu(t, e, n, o) {
  const r = oo(
    e,
    t,
    o,
    true
    /* prepend */
  );
  is(() => {
    Wo(o[e], r);
  }, n);
}
function oo(t, e, n = tt, o = false) {
  if (n) {
    const r = n[t] || (n[t] = []), i = e.__weh || (e.__weh = (...s) => {
      At();
      const a2 = mn(n), l = Yt(e, n, t, s);
      return a2(), It(), l;
    });
    return o ? r.unshift(i) : r.push(i), i;
  } else if (d.NODE_ENV !== "production") {
    const r = be(or[t].replace(/ hook$/, ""));
    k(
      `${r} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
    );
  }
}
const re = (t) => (e, n = tt) => {
  (!un || t === "sp") && oo(t, (...o) => e(...o), n);
}, cu = re("bm"), pu = re("m"), fu = re(
  "bu"
), du = re("u"), hu = re(
  "bum"
), is = re("um"), gu = re(
  "sp"
), bu = re("rtg"), mu = re("rtc");
function yu(t, e = tt) {
  oo("ec", t, e);
}
const _u = "components", ss = /* @__PURE__ */ Symbol.for("v-ndc");
function as(t) {
  return J(t) ? xu(_u, t, false) || t : t || ss;
}
function xu(t, e, n = true, o = false) {
  const r = pt || tt;
  if (r) {
    const i = r.type;
    {
      const a2 = gr(
        i,
        false
      );
      if (a2 && (a2 === e || a2 === st(e) || a2 === Ee(st(e))))
        return i;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      Tr(r[t] || i[t], e) || // global registration
      Tr(r.appContext[t], e)
    );
    return !s && o ? i : (d.NODE_ENV !== "production" && n && !s && k(`Failed to resolve ${t.slice(0, -1)}: ${e}
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.`), s);
  } else d.NODE_ENV !== "production" && k(
    `resolve${Ee(t.slice(0, -1))} can only be used in render() or setup().`
  );
}
function Tr(t, e) {
  return t && (t[e] || t[st(e)] || t[Ee(st(e))]);
}
function lr(t, e, n, o) {
  let r;
  const i = n, s = D(t);
  if (s || J(t)) {
    const a2 = s && fe(t);
    let l = false, h = false;
    a2 && (l = !gt(t), h = Pt(t), t = Zn(t)), r = new Array(t.length);
    for (let f = 0, p = t.length; f < p; f++)
      r[f] = e(
        l ? h ? Pe(Rt(t[f])) : Rt(t[f]) : t[f],
        f,
        void 0,
        i
      );
  } else if (typeof t == "number") {
    d.NODE_ENV !== "production" && !Number.isInteger(t) && k(`The v-for range expect an integer value but got ${t}.`), r = new Array(t);
    for (let a2 = 0; a2 < t; a2++)
      r[a2] = e(a2 + 1, a2, void 0, i);
  } else if (U(t))
    if (t[Symbol.iterator])
      r = Array.from(
        t,
        (a2, l) => e(a2, l, void 0, i)
      );
    else {
      const a2 = Object.keys(t);
      r = new Array(a2.length);
      for (let l = 0, h = a2.length; l < h; l++) {
        const f = a2[l];
        r[l] = e(t[f], f, l, i);
      }
    }
  else
    r = [];
  return r;
}
const zo = (t) => t ? zs(t) ? so(t) : zo(t.parent) : null, we = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ X(/* @__PURE__ */ Object.create(null), {
    $: (t) => t,
    $el: (t) => t.vnode.el,
    $data: (t) => t.data,
    $props: (t) => d.NODE_ENV !== "production" ? Gt(t.props) : t.props,
    $attrs: (t) => d.NODE_ENV !== "production" ? Gt(t.attrs) : t.attrs,
    $slots: (t) => d.NODE_ENV !== "production" ? Gt(t.slots) : t.slots,
    $refs: (t) => d.NODE_ENV !== "production" ? Gt(t.refs) : t.refs,
    $parent: (t) => zo(t.parent),
    $root: (t) => zo(t.root),
    $host: (t) => t.ce,
    $emit: (t) => t.emit,
    $options: (t) => cs(t),
    $forceUpdate: (t) => t.f || (t.f = () => {
      no(t.update);
    }),
    $nextTick: (t) => t.n || (t.n = rr.bind(t.proxy)),
    $watch: (t) => ou.bind(t)
  })
), cr = (t) => t === "_" || t === "$", _o = (t, e) => t !== B && !t.__isScriptSetup && I(t, e), us = {
  get({ _: t }, e) {
    if (e === "__v_skip")
      return true;
    const { ctx: n, setupState: o, data: r, props: i, accessCache: s, type: a2, appContext: l } = t;
    if (d.NODE_ENV !== "production" && e === "__isVue")
      return true;
    if (e[0] !== "$") {
      const b2 = s[e];
      if (b2 !== void 0)
        switch (b2) {
          case 1:
            return o[e];
          case 2:
            return r[e];
          case 4:
            return n[e];
          case 3:
            return i[e];
        }
      else {
        if (_o(o, e))
          return s[e] = 1, o[e];
        if (r !== B && I(r, e))
          return s[e] = 2, r[e];
        if (I(i, e))
          return s[e] = 3, i[e];
        if (n !== B && I(n, e))
          return s[e] = 4, n[e];
        Vo && (s[e] = 0);
      }
    }
    const h = we[e];
    let f, p;
    if (h)
      return e === "$attrs" ? (nt(t.attrs, "get", ""), d.NODE_ENV !== "production" && Bn()) : d.NODE_ENV !== "production" && e === "$slots" && nt(t, "get", e), h(t);
    if (
      // css module (injected by vue-loader)
      (f = a2.__cssModules) && (f = f[e])
    )
      return f;
    if (n !== B && I(n, e))
      return s[e] = 4, n[e];
    if (
      // global properties
      p = l.config.globalProperties, I(p, e)
    )
      return p[e];
    d.NODE_ENV !== "production" && pt && (!J(e) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    e.indexOf("__v") !== 0) && (r !== B && cr(e[0]) && I(r, e) ? k(
      `Property ${JSON.stringify(
        e
      )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
    ) : t === pt && k(
      `Property ${JSON.stringify(e)} was accessed during render but is not defined on instance.`
    ));
  },
  set({ _: t }, e, n) {
    const { data: o, setupState: r, ctx: i } = t;
    return _o(r, e) ? (r[e] = n, true) : d.NODE_ENV !== "production" && r.__isScriptSetup && I(r, e) ? (k(`Cannot mutate <script setup> binding "${e}" from Options API.`), false) : o !== B && I(o, e) ? (o[e] = n, true) : I(t.props, e) ? (d.NODE_ENV !== "production" && k(`Attempting to mutate prop "${e}". Props are readonly.`), false) : e[0] === "$" && e.slice(1) in t ? (d.NODE_ENV !== "production" && k(
      `Attempting to mutate public property "${e}". Properties starting with $ are reserved and readonly.`
    ), false) : (d.NODE_ENV !== "production" && e in t.appContext.config.globalProperties ? Object.defineProperty(i, e, {
      enumerable: true,
      configurable: true,
      value: n
    }) : i[e] = n, true);
  },
  has({
    _: { data: t, setupState: e, accessCache: n, ctx: o, appContext: r, props: i, type: s }
  }, a2) {
    let l;
    return !!(n[a2] || t !== B && a2[0] !== "$" && I(t, a2) || _o(e, a2) || I(i, a2) || I(o, a2) || I(we, a2) || I(r.config.globalProperties, a2) || (l = s.__cssModules) && l[a2]);
  },
  defineProperty(t, e, n) {
    return n.get != null ? t._.accessCache[e] = 0 : I(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
  }
};
d.NODE_ENV !== "production" && (us.ownKeys = (t) => (k(
  "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
), Reflect.ownKeys(t)));
function vu(t) {
  const e = {};
  return Object.defineProperty(e, "_", {
    configurable: true,
    enumerable: false,
    get: () => t
  }), Object.keys(we).forEach((n) => {
    Object.defineProperty(e, n, {
      configurable: true,
      enumerable: false,
      get: () => we[n](t),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: ot
    });
  }), e;
}
function wu(t) {
  const {
    ctx: e,
    propsOptions: [n]
  } = t;
  n && Object.keys(n).forEach((o) => {
    Object.defineProperty(e, o, {
      enumerable: true,
      configurable: true,
      get: () => t.props[o],
      set: ot
    });
  });
}
function Eu(t) {
  const { ctx: e, setupState: n } = t;
  Object.keys($(n)).forEach((o) => {
    if (!n.__isScriptSetup) {
      if (cr(o[0])) {
        k(
          `setup() return property ${JSON.stringify(
            o
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(e, o, {
        enumerable: true,
        configurable: true,
        get: () => n[o],
        set: ot
      });
    }
  });
}
function jr(t) {
  return D(t) ? t.reduce(
    (e, n) => (e[n] = null, e),
    {}
  ) : t;
}
function ku() {
  const t = /* @__PURE__ */ Object.create(null);
  return (e, n) => {
    t[n] ? k(`${e} property "${n}" is already defined in ${t[n]}.`) : t[n] = e;
  };
}
let Vo = true;
function Nu(t) {
  const e = cs(t), n = t.proxy, o = t.ctx;
  Vo = false, e.beforeCreate && $r(e.beforeCreate, t, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: s,
    watch: a2,
    provide: l,
    inject: h,
    // lifecycle
    created: f,
    beforeMount: p,
    mounted: b2,
    beforeUpdate: v2,
    updated: C2,
    activated: S,
    deactivated: rt,
    beforeDestroy: Y2,
    beforeUnmount: L2,
    destroyed: F2,
    unmounted: wt,
    render: V2,
    renderTracked: it,
    renderTriggered: Dt,
    errorCaptured: ut,
    serverPrefetch: mt,
    // public API
    expose: Xt,
    inheritAttrs: ie2,
    // assets
    components: Vt,
    directives: _n3,
    filters: yr
  } = e, se2 = d.NODE_ENV !== "production" ? ku() : null;
  if (d.NODE_ENV !== "production") {
    const [P2] = t.propsOptions;
    if (P2)
      for (const A in P2)
        se2("Props", A);
  }
  if (h && Ou(h, o, se2), s)
    for (const P2 in s) {
      const A = s[P2];
      T(A) ? (d.NODE_ENV !== "production" ? Object.defineProperty(o, P2, {
        value: A.bind(n),
        configurable: true,
        enumerable: true,
        writable: true
      }) : o[P2] = A.bind(n), d.NODE_ENV !== "production" && se2("Methods", P2)) : d.NODE_ENV !== "production" && k(
        `Method "${P2}" has type "${typeof A}" in the component definition. Did you reference the function correctly?`
      );
    }
  if (r) {
    d.NODE_ENV !== "production" && !T(r) && k(
      "The data option must be a function. Plain object usage is no longer supported."
    );
    const P2 = r.call(n, n);
    if (d.NODE_ENV !== "production" && qo(P2) && k(
      "data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."
    ), !U(P2))
      d.NODE_ENV !== "production" && k("data() should return an object.");
    else if (t.data = to(P2), d.NODE_ENV !== "production")
      for (const A in P2)
        se2("Data", A), cr(A[0]) || Object.defineProperty(o, A, {
          configurable: true,
          enumerable: true,
          get: () => P2[A],
          set: ot
        });
  }
  if (Vo = true, i)
    for (const P2 in i) {
      const A = i[P2], Ft = T(A) ? A.bind(n, n) : T(A.get) ? A.get.bind(n, n) : ot;
      d.NODE_ENV !== "production" && Ft === ot && k(`Computed property "${P2}" has no getter.`);
      const lo = !T(A) && T(A.set) ? A.set.bind(n) : d.NODE_ENV !== "production" ? () => {
        k(
          `Write operation failed: computed property "${P2}" is readonly.`
        );
      } : ot, Ue = St({
        get: Ft,
        set: lo
      });
      Object.defineProperty(o, P2, {
        enumerable: true,
        configurable: true,
        get: () => Ue.value,
        set: (Oe2) => Ue.value = Oe2
      }), d.NODE_ENV !== "production" && se2("Computed", P2);
    }
  if (a2)
    for (const P2 in a2)
      ls(a2[P2], o, n, P2);
  if (l) {
    const P2 = T(l) ? l.call(n) : l;
    Reflect.ownKeys(P2).forEach((A) => {
      tu(A, P2[A]);
    });
  }
  f && $r(f, t, "c");
  function yt(P2, A) {
    D(A) ? A.forEach((Ft) => P2(Ft.bind(n))) : A && P2(A.bind(n));
  }
  if (yt(cu, p), yt(pu, b2), yt(fu, v2), yt(du, C2), yt(au, S), yt(uu, rt), yt(yu, ut), yt(mu, it), yt(bu, Dt), yt(hu, L2), yt(is, wt), yt(gu, mt), D(Xt))
    if (Xt.length) {
      const P2 = t.exposed || (t.exposed = {});
      Xt.forEach((A) => {
        Object.defineProperty(P2, A, {
          get: () => n[A],
          set: (Ft) => n[A] = Ft,
          enumerable: true
        });
      });
    } else t.exposed || (t.exposed = {});
  V2 && t.render === ot && (t.render = V2), ie2 != null && (t.inheritAttrs = ie2), Vt && (t.components = Vt), _n3 && (t.directives = _n3), mt && os(t);
}
function Ou(t, e, n = ot) {
  D(t) && (t = Mo(t));
  for (const o in t) {
    const r = t[o];
    let i;
    U(r) ? "default" in r ? i = Cn(
      r.from || o,
      r.default,
      true
    ) : i = Cn(r.from || o) : i = Cn(r), et(i) ? Object.defineProperty(e, o, {
      enumerable: true,
      configurable: true,
      get: () => i.value,
      set: (s) => i.value = s
    }) : e[o] = i, d.NODE_ENV !== "production" && n("Inject", o);
  }
}
function $r(t, e, n) {
  Yt(
    D(t) ? t.map((o) => o.bind(e.proxy)) : t.bind(e.proxy),
    e,
    n
  );
}
function ls(t, e, n, o) {
  let r = o.includes(".") ? ns(n, o) : () => n[o];
  if (J(t)) {
    const i = e[t];
    T(i) ? $e(r, i) : d.NODE_ENV !== "production" && k(`Invalid watch handler specified by key "${t}"`, i);
  } else if (T(t))
    $e(r, t.bind(n));
  else if (U(t))
    if (D(t))
      t.forEach((i) => ls(i, e, n, o));
    else {
      const i = T(t.handler) ? t.handler.bind(n) : e[t.handler];
      T(i) ? $e(r, i, t) : d.NODE_ENV !== "production" && k(`Invalid watch handler specified by key "${t.handler}"`, i);
    }
  else d.NODE_ENV !== "production" && k(`Invalid watch option: "${o}"`, t);
}
function cs(t) {
  const e = t.type, { mixins: n, extends: o } = e, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: s }
  } = t.appContext, a2 = i.get(e);
  let l;
  return a2 ? l = a2 : !r.length && !n && !o ? l = e : (l = {}, r.length && r.forEach(
    (h) => Hn(l, h, s, true)
  ), Hn(l, e, s)), U(e) && i.set(e, l), l;
}
function Hn(t, e, n, o = false) {
  const { mixins: r, extends: i } = e;
  i && Hn(t, i, n, true), r && r.forEach(
    (s) => Hn(t, s, n, true)
  );
  for (const s in e)
    if (o && s === "expose")
      d.NODE_ENV !== "production" && k(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const a2 = Su[s] || n && n[s];
      t[s] = a2 ? a2(t[s], e[s]) : e[s];
    }
  return t;
}
const Su = {
  data: Ar,
  props: Ir,
  emits: Ir,
  // objects
  methods: Ye,
  computed: Ye,
  // lifecycle
  beforeCreate: dt,
  created: dt,
  beforeMount: dt,
  mounted: dt,
  beforeUpdate: dt,
  updated: dt,
  beforeDestroy: dt,
  beforeUnmount: dt,
  destroyed: dt,
  unmounted: dt,
  activated: dt,
  deactivated: dt,
  errorCaptured: dt,
  serverPrefetch: dt,
  // assets
  components: Ye,
  directives: Ye,
  // watch
  watch: Du,
  // provide / inject
  provide: Ar,
  inject: Cu
};
function Ar(t, e) {
  return e ? t ? function() {
    return X(
      T(t) ? t.call(this, this) : t,
      T(e) ? e.call(this, this) : e
    );
  } : e : t;
}
function Cu(t, e) {
  return Ye(Mo(t), Mo(e));
}
function Mo(t) {
  if (D(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++)
      e[t[n]] = t[n];
    return e;
  }
  return t;
}
function dt(t, e) {
  return t ? [...new Set([].concat(t, e))] : e;
}
function Ye(t, e) {
  return t ? X(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function Ir(t, e) {
  return t ? D(t) && D(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : X(
    /* @__PURE__ */ Object.create(null),
    jr(t),
    jr(e ?? {})
  ) : e;
}
function Du(t, e) {
  if (!t) return e;
  if (!e) return t;
  const n = X(/* @__PURE__ */ Object.create(null), t);
  for (const o in e)
    n[o] = dt(t[o], e[o]);
  return n;
}
function ps() {
  return {
    app: null,
    config: {
      isNativeTag: xi,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let zu = 0;
function Vu(t, e) {
  return function(o, r = null) {
    T(o) || (o = X({}, o)), r != null && !U(r) && (d.NODE_ENV !== "production" && k("root props passed to app.mount() must be an object."), r = null);
    const i = ps(), s = /* @__PURE__ */ new WeakSet(), a2 = [];
    let l = false;
    const h = i.app = {
      _uid: zu++,
      _component: o,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Jr,
      get config() {
        return i.config;
      },
      set config(f) {
        d.NODE_ENV !== "production" && k(
          "app.config cannot be replaced. Modify individual options instead."
        );
      },
      use(f, ...p) {
        return s.has(f) ? d.NODE_ENV !== "production" && k("Plugin has already been applied to target app.") : f && T(f.install) ? (s.add(f), f.install(h, ...p)) : T(f) ? (s.add(f), f(h, ...p)) : d.NODE_ENV !== "production" && k(
          'A plugin must either be a function or an object with an "install" function.'
        ), h;
      },
      mixin(f) {
        return i.mixins.includes(f) ? d.NODE_ENV !== "production" && k(
          "Mixin has already been applied to target app" + (f.name ? `: ${f.name}` : "")
        ) : i.mixins.push(f), h;
      },
      component(f, p) {
        return d.NODE_ENV !== "production" && Io(f, i.config), p ? (d.NODE_ENV !== "production" && i.components[f] && k(`Component "${f}" has already been registered in target app.`), i.components[f] = p, h) : i.components[f];
      },
      directive(f, p) {
        return d.NODE_ENV !== "production" && ts(f), p ? (d.NODE_ENV !== "production" && i.directives[f] && k(`Directive "${f}" has already been registered in target app.`), i.directives[f] = p, h) : i.directives[f];
      },
      mount(f, p, b2) {
        if (l)
          d.NODE_ENV !== "production" && k(
            "App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`"
          );
        else {
          d.NODE_ENV !== "production" && f.__vue_app__ && k(
            "There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first."
          );
          const v2 = h._ceVNode || bt(o, r);
          return v2.appContext = i, b2 === true ? b2 = "svg" : b2 === false && (b2 = void 0), d.NODE_ENV !== "production" && (i.reload = () => {
            const C2 = de(v2);
            C2.el = null, t(C2, f, b2);
          }), t(v2, f, b2), l = true, h._container = f, f.__vue_app__ = h, d.NODE_ENV !== "production" && (h._instance = v2.component, Ka(h, Jr)), so(v2.component);
        }
      },
      onUnmount(f) {
        d.NODE_ENV !== "production" && typeof f != "function" && k(
          `Expected function as first argument to app.onUnmount(), but got ${typeof f}`
        ), a2.push(f);
      },
      unmount() {
        l ? (Yt(
          a2,
          h._instance,
          16
        ), t(null, h._container), d.NODE_ENV !== "production" && (h._instance = null, Wa(h)), delete h._container.__vue_app__) : d.NODE_ENV !== "production" && k("Cannot unmount an app that is not mounted.");
      },
      provide(f, p) {
        return d.NODE_ENV !== "production" && f in i.provides && (I(i.provides, f) ? k(
          `App already provides property with key "${String(f)}". It will be overwritten with the new value.`
        ) : k(
          `App already provides property with key "${String(f)}" inherited from its parent element. It will be overwritten with the new value.`
        )), i.provides[f] = p, h;
      },
      runWithContext(f) {
        const p = Ae;
        Ae = h;
        try {
          return f();
        } finally {
          Ae = p;
        }
      }
    };
    return h;
  };
}
let Ae = null;
const Mu = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${st(e)}Modifiers`] || t[`${kt(e)}Modifiers`];
function Tu(t, e, ...n) {
  if (t.isUnmounted) return;
  const o = t.vnode.props || B;
  if (d.NODE_ENV !== "production") {
    const {
      emitsOptions: f,
      propsOptions: [p]
    } = t;
    if (f)
      if (!(e in f))
        (!p || !(be(st(e)) in p)) && k(
          `Component emitted event "${e}" but it is neither declared in the emits option nor as an "${be(st(e))}" prop.`
        );
      else {
        const b2 = f[e];
        T(b2) && (b2(...n) || k(
          `Invalid event arguments: event validation failed for event "${e}".`
        ));
      }
  }
  let r = n;
  const i = e.startsWith("update:"), s = i && Mu(o, e.slice(7));
  if (s && (s.trim && (r = n.map((f) => J(f) ? f.trim() : f)), s.number && (r = n.map(Yo))), d.NODE_ENV !== "production" && Za(t, e, r), d.NODE_ENV !== "production") {
    const f = e.toLowerCase();
    f !== e && o[be(f)] && k(
      `Event "${f}" is emitted in component ${yn(
        t,
        t.type
      )} but the handler is registered for "${e}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${kt(
        e
      )}" instead of "${e}".`
    );
  }
  let a2, l = o[a2 = be(e)] || // also try camelCase event handler (#2249)
  o[a2 = be(st(e))];
  !l && i && (l = o[a2 = be(kt(e))]), l && Yt(
    l,
    t,
    6,
    r
  );
  const h = o[a2 + "Once"];
  if (h) {
    if (!t.emitted)
      t.emitted = {};
    else if (t.emitted[a2])
      return;
    t.emitted[a2] = true, Yt(
      h,
      t,
      6,
      r
    );
  }
}
const ju = /* @__PURE__ */ new WeakMap();
function fs(t, e, n = false) {
  const o = n ? ju : e.emitsCache, r = o.get(t);
  if (r !== void 0)
    return r;
  const i = t.emits;
  let s = {}, a2 = false;
  if (!T(t)) {
    const l = (h) => {
      const f = fs(h, e, true);
      f && (a2 = true, X(s, f));
    };
    !n && e.mixins.length && e.mixins.forEach(l), t.extends && l(t.extends), t.mixins && t.mixins.forEach(l);
  }
  return !i && !a2 ? (U(t) && o.set(t, null), null) : (D(i) ? i.forEach((l) => s[l] = null) : X(s, i), U(t) && o.set(t, s), s);
}
function ro(t, e) {
  return !t || !cn(e) ? false : (e = e.slice(2).replace(/Once$/, ""), I(t, e[0].toLowerCase() + e.slice(1)) || I(t, kt(e)) || I(t, e));
}
let To = false;
function Bn() {
  To = true;
}
function Pr(t) {
  const {
    type: e,
    vnode: n,
    proxy: o,
    withProxy: r,
    propsOptions: [i],
    slots: s,
    attrs: a2,
    emit: l,
    render: h,
    renderCache: f,
    props: p,
    data: b2,
    setupState: v2,
    ctx: C2,
    inheritAttrs: S
  } = t, rt = Ln(t);
  let Y2, L2;
  d.NODE_ENV !== "production" && (To = false);
  try {
    if (n.shapeFlag & 4) {
      const V2 = r || o, it = d.NODE_ENV !== "production" && v2.__isScriptSetup ? new Proxy(V2, {
        get(Dt, ut, mt) {
          return k(
            `Property '${String(
              ut
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          ), Reflect.get(Dt, ut, mt);
        }
      }) : V2;
      Y2 = Mt(
        h.call(
          it,
          V2,
          f,
          d.NODE_ENV !== "production" ? Gt(p) : p,
          v2,
          b2,
          C2
        )
      ), L2 = a2;
    } else {
      const V2 = e;
      d.NODE_ENV !== "production" && a2 === p && Bn(), Y2 = Mt(
        V2.length > 1 ? V2(
          d.NODE_ENV !== "production" ? Gt(p) : p,
          d.NODE_ENV !== "production" ? {
            get attrs() {
              return Bn(), Gt(a2);
            },
            slots: s,
            emit: l
          } : { attrs: a2, slots: s, emit: l }
        ) : V2(
          d.NODE_ENV !== "production" ? Gt(p) : p,
          null
        )
      ), L2 = e.props ? a2 : $u(a2);
    }
  } catch (V2) {
    nn.length = 0, hn(V2, t, 1), Y2 = bt(Ot);
  }
  let F2 = Y2, wt;
  if (d.NODE_ENV !== "production" && Y2.patchFlag > 0 && Y2.patchFlag & 2048 && ([F2, wt] = ds(Y2)), L2 && S !== false) {
    const V2 = Object.keys(L2), { shapeFlag: it } = F2;
    if (V2.length) {
      if (it & 7)
        i && V2.some(jn) && (L2 = Au(
          L2,
          i
        )), F2 = de(F2, L2, false, true);
      else if (d.NODE_ENV !== "production" && !To && F2.type !== Ot) {
        const Dt = Object.keys(a2), ut = [], mt = [];
        for (let Xt = 0, ie2 = Dt.length; Xt < ie2; Xt++) {
          const Vt = Dt[Xt];
          cn(Vt) ? jn(Vt) || ut.push(Vt[2].toLowerCase() + Vt.slice(3)) : mt.push(Vt);
        }
        mt.length && k(
          `Extraneous non-props attributes (${mt.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`
        ), ut.length && k(
          `Extraneous non-emits event listeners (${ut.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
        );
      }
    }
  }
  return n.dirs && (d.NODE_ENV !== "production" && !Rr(F2) && k(
    "Runtime directive used on component with non-element root node. The directives will not function as intended."
  ), F2 = de(F2, null, false, true), F2.dirs = F2.dirs ? F2.dirs.concat(n.dirs) : n.dirs), n.transition && (d.NODE_ENV !== "production" && !Rr(F2) && k(
    "Component inside <Transition> renders non-element root node that cannot be animated."
  ), ar(F2, n.transition)), d.NODE_ENV !== "production" && wt ? wt(F2) : Y2 = F2, Ln(rt), Y2;
}
const ds = (t) => {
  const e = t.children, n = t.dynamicChildren, o = pr(e, false);
  if (o) {
    if (d.NODE_ENV !== "production" && o.patchFlag > 0 && o.patchFlag & 2048)
      return ds(o);
  } else return [t, void 0];
  const r = e.indexOf(o), i = n ? n.indexOf(o) : -1, s = (a2) => {
    e[r] = a2, n && (i > -1 ? n[i] = a2 : a2.patchFlag > 0 && (t.dynamicChildren = [...n, a2]));
  };
  return [Mt(o), s];
};
function pr(t, e = true) {
  let n;
  for (let o = 0; o < t.length; o++) {
    const r = t[o];
    if (io(r)) {
      if (r.type !== Ot || r.children === "v-if") {
        if (n)
          return;
        if (n = r, d.NODE_ENV !== "production" && e && n.patchFlag > 0 && n.patchFlag & 2048)
          return pr(n.children);
      }
    } else
      return;
  }
  return n;
}
const $u = (t) => {
  let e;
  for (const n in t)
    (n === "class" || n === "style" || cn(n)) && ((e || (e = {}))[n] = t[n]);
  return e;
}, Au = (t, e) => {
  const n = {};
  for (const o in t)
    (!jn(o) || !(o.slice(9) in e)) && (n[o] = t[o]);
  return n;
}, Rr = (t) => t.shapeFlag & 7 || t.type === Ot;
function Iu(t, e, n) {
  const { props: o, children: r, component: i } = t, { props: s, children: a2, patchFlag: l } = e, h = i.emitsOptions;
  if (d.NODE_ENV !== "production" && (r || a2) && Tt || e.dirs || e.transition)
    return true;
  if (n && l >= 0) {
    if (l & 1024)
      return true;
    if (l & 16)
      return o ? Fr(o, s, h) : !!s;
    if (l & 8) {
      const f = e.dynamicProps;
      for (let p = 0; p < f.length; p++) {
        const b2 = f[p];
        if (s[b2] !== o[b2] && !ro(h, b2))
          return true;
      }
    }
  } else
    return (r || a2) && (!a2 || !a2.$stable) ? true : o === s ? false : o ? s ? Fr(o, s, h) : true : !!s;
  return false;
}
function Fr(t, e, n) {
  const o = Object.keys(e);
  if (o.length !== Object.keys(t).length)
    return true;
  for (let r = 0; r < o.length; r++) {
    const i = o[r];
    if (e[i] !== t[i] && !ro(n, i))
      return true;
  }
  return false;
}
function Pu({ vnode: t, parent: e }, n) {
  for (; e; ) {
    const o = e.subTree;
    if (o.suspense && o.suspense.activeBranch === t && (o.el = t.el), o === t)
      (t = e.vnode).el = n, e = e.parent;
    else
      break;
  }
}
const hs = {}, gs = () => Object.create(hs), bs = (t) => Object.getPrototypeOf(t) === hs;
function Ru(t, e, n, o = false) {
  const r = {}, i = gs();
  t.propsDefaults = /* @__PURE__ */ Object.create(null), ms(t, e, r, i);
  for (const s in t.propsOptions[0])
    s in r || (r[s] = void 0);
  d.NODE_ENV !== "production" && _s(e || {}, r, t), n ? t.props = o ? r : Na(r) : t.type.props ? t.props = r : t.props = i, t.attrs = i;
}
function Fu(t) {
  for (; t; ) {
    if (t.type.__hmrId) return true;
    t = t.parent;
  }
}
function Lu(t, e, n, o) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: s }
  } = t, a2 = $(r), [l] = t.propsOptions;
  let h = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(d.NODE_ENV !== "production" && Fu(t)) && (o || s > 0) && !(s & 16)
  ) {
    if (s & 8) {
      const f = t.vnode.dynamicProps;
      for (let p = 0; p < f.length; p++) {
        let b2 = f[p];
        if (ro(t.emitsOptions, b2))
          continue;
        const v2 = e[b2];
        if (l)
          if (I(i, b2))
            v2 !== i[b2] && (i[b2] = v2, h = true);
          else {
            const C2 = st(b2);
            r[C2] = jo(
              l,
              a2,
              C2,
              v2,
              t,
              false
            );
          }
        else
          v2 !== i[b2] && (i[b2] = v2, h = true);
      }
    }
  } else {
    ms(t, e, r, i) && (h = true);
    let f;
    for (const p in a2)
      (!e || // for camelCase
      !I(e, p) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((f = kt(p)) === p || !I(e, f))) && (l ? n && // for camelCase
      (n[p] !== void 0 || // for kebab-case
      n[f] !== void 0) && (r[p] = jo(
        l,
        a2,
        p,
        void 0,
        t,
        true
      )) : delete r[p]);
    if (i !== a2)
      for (const p in i)
        (!e || !I(e, p)) && (delete i[p], h = true);
  }
  h && Wt(t.attrs, "set", ""), d.NODE_ENV !== "production" && _s(e || {}, r, t);
}
function ms(t, e, n, o) {
  const [r, i] = t.propsOptions;
  let s = false, a2;
  if (e)
    for (let l in e) {
      if (Xe(l))
        continue;
      const h = e[l];
      let f;
      r && I(r, f = st(l)) ? !i || !i.includes(f) ? n[f] = h : (a2 || (a2 = {}))[f] = h : ro(t.emitsOptions, l) || (!(l in o) || h !== o[l]) && (o[l] = h, s = true);
    }
  if (i) {
    const l = $(n), h = a2 || B;
    for (let f = 0; f < i.length; f++) {
      const p = i[f];
      n[p] = jo(
        r,
        l,
        p,
        h[p],
        t,
        !I(h, p)
      );
    }
  }
  return s;
}
function jo(t, e, n, o, r, i) {
  const s = t[n];
  if (s != null) {
    const a2 = I(s, "default");
    if (a2 && o === void 0) {
      const l = s.default;
      if (s.type !== Function && !s.skipFactory && T(l)) {
        const { propsDefaults: h } = r;
        if (n in h)
          o = h[n];
        else {
          const f = mn(r);
          o = h[n] = l.call(
            null,
            e
          ), f();
        }
      } else
        o = l;
      r.ce && r.ce._setProp(n, o);
    }
    s[
      0
      /* shouldCast */
    ] && (i && !a2 ? o = false : s[
      1
      /* shouldCastTrue */
    ] && (o === "" || o === kt(n)) && (o = true));
  }
  return o;
}
const Uu = /* @__PURE__ */ new WeakMap();
function ys(t, e, n = false) {
  const o = n ? Uu : e.propsCache, r = o.get(t);
  if (r)
    return r;
  const i = t.props, s = {}, a2 = [];
  let l = false;
  if (!T(t)) {
    const f = (p) => {
      l = true;
      const [b2, v2] = ys(p, e, true);
      X(s, b2), v2 && a2.push(...v2);
    };
    !n && e.mixins.length && e.mixins.forEach(f), t.extends && f(t.extends), t.mixins && t.mixins.forEach(f);
  }
  if (!i && !l)
    return U(t) && o.set(t, Te), Te;
  if (D(i))
    for (let f = 0; f < i.length; f++) {
      d.NODE_ENV !== "production" && !J(i[f]) && k("props must be strings when using array syntax.", i[f]);
      const p = st(i[f]);
      Lr(p) && (s[p] = B);
    }
  else if (i) {
    d.NODE_ENV !== "production" && !U(i) && k("invalid props options", i);
    for (const f in i) {
      const p = st(f);
      if (Lr(p)) {
        const b2 = i[f], v2 = s[p] = D(b2) || T(b2) ? { type: b2 } : X({}, b2), C2 = v2.type;
        let S = false, rt = true;
        if (D(C2))
          for (let Y2 = 0; Y2 < C2.length; ++Y2) {
            const L2 = C2[Y2], F2 = T(L2) && L2.name;
            if (F2 === "Boolean") {
              S = true;
              break;
            } else F2 === "String" && (rt = false);
          }
        else
          S = T(C2) && C2.name === "Boolean";
        v2[
          0
          /* shouldCast */
        ] = S, v2[
          1
          /* shouldCastTrue */
        ] = rt, (S || I(v2, "default")) && a2.push(p);
      }
    }
  }
  const h = [s, a2];
  return U(t) && o.set(t, h), h;
}
function Lr(t) {
  return t[0] !== "$" && !Xe(t) ? true : (d.NODE_ENV !== "production" && k(`Invalid prop name: "${t}" is a reserved property.`), false);
}
function Hu(t) {
  return t === null ? "null" : typeof t == "function" ? t.name || "" : typeof t == "object" && t.constructor && t.constructor.name || "";
}
function _s(t, e, n) {
  const o = $(e), r = n.propsOptions[0], i = Object.keys(t).map((s) => st(s));
  for (const s in r) {
    let a2 = r[s];
    a2 != null && Bu(
      s,
      o[s],
      a2,
      d.NODE_ENV !== "production" ? Gt(o) : o,
      !i.includes(s)
    );
  }
}
function Bu(t, e, n, o, r) {
  const { type: i, required: s, validator: a2, skipCheck: l } = n;
  if (s && r) {
    k('Missing required prop: "' + t + '"');
    return;
  }
  if (!(e == null && !s)) {
    if (i != null && i !== true && !l) {
      let h = false;
      const f = D(i) ? i : [i], p = [];
      for (let b2 = 0; b2 < f.length && !h; b2++) {
        const { valid: v2, expectedType: C2 } = Wu(e, f[b2]);
        p.push(C2 || ""), h = v2;
      }
      if (!h) {
        k(qu(t, e, p));
        return;
      }
    }
    a2 && !a2(e, o) && k('Invalid prop: custom validator check failed for prop "' + t + '".');
  }
}
const Ku = /* @__PURE__ */ oe(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function Wu(t, e) {
  let n;
  const o = Hu(e);
  if (o === "null")
    n = t === null;
  else if (Ku(o)) {
    const r = typeof t;
    n = r === o.toLowerCase(), !n && r === "object" && (n = t instanceof e);
  } else o === "Object" ? n = U(t) : o === "Array" ? n = D(t) : n = t instanceof e;
  return {
    valid: n,
    expectedType: o
  };
}
function qu(t, e, n) {
  if (n.length === 0)
    return `Prop type [] for prop "${t}" won't match anything. Did you mean to use type Array instead?`;
  let o = `Invalid prop: type check failed for prop "${t}". Expected ${n.map(Ee).join(" | ")}`;
  const r = n[0], i = Go(e), s = Ur(e, r), a2 = Ur(e, i);
  return n.length === 1 && Hr(r) && !Gu(r, i) && (o += ` with value ${s}`), o += `, got ${i} `, Hr(i) && (o += `with value ${a2}.`), o;
}
function Ur(t, e) {
  return e === "String" ? `"${t}"` : e === "Number" ? `${Number(t)}` : `${t}`;
}
function Hr(t) {
  return ["string", "number", "boolean"].some((n) => t.toLowerCase() === n);
}
function Gu(...t) {
  return t.some((e) => e.toLowerCase() === "boolean");
}
const fr = (t) => t === "_" || t === "_ctx" || t === "$stable", dr = (t) => D(t) ? t.map(Mt) : [Mt(t)], Ju = (t, e, n) => {
  if (e._n)
    return e;
  const o = Qa((...r) => (d.NODE_ENV !== "production" && tt && !(n === null && pt) && !(n && n.root !== tt.root) && k(
    `Slot "${t}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
  ), dr(e(...r))), n);
  return o._c = false, o;
}, xs = (t, e, n) => {
  const o = t._ctx;
  for (const r in t) {
    if (fr(r)) continue;
    const i = t[r];
    if (T(i))
      e[r] = Ju(r, i, o);
    else if (i != null) {
      d.NODE_ENV !== "production" && k(
        `Non-function value encountered for slot "${r}". Prefer function slots for better performance.`
      );
      const s = dr(i);
      e[r] = () => s;
    }
  }
}, vs = (t, e) => {
  d.NODE_ENV !== "production" && !ur(t.vnode) && k(
    "Non-function value encountered for default slot. Prefer function slots for better performance."
  );
  const n = dr(e);
  t.slots.default = () => n;
}, $o = (t, e, n) => {
  for (const o in e)
    (n || !fr(o)) && (t[o] = e[o]);
}, Yu = (t, e, n) => {
  const o = t.slots = gs();
  if (t.vnode.shapeFlag & 32) {
    const r = e._;
    r ? ($o(o, e, n), n && $n(o, "_", r, true)) : xs(e, o);
  } else e && vs(t, e);
}, Xu = (t, e, n) => {
  const { vnode: o, slots: r } = t;
  let i = true, s = B;
  if (o.shapeFlag & 32) {
    const a2 = e._;
    a2 ? d.NODE_ENV !== "production" && Tt ? ($o(r, e, n), Wt(t, "set", "$slots")) : n && a2 === 1 ? i = false : $o(r, e, n) : (i = !e.$stable, xs(e, r)), s = e;
  } else e && (vs(t, e), s = { default: 1 });
  if (i)
    for (const a2 in r)
      !fr(a2) && s[a2] == null && delete r[a2];
};
let qe, te;
function De(t, e) {
  t.appContext.config.performance && Kn() && te.mark(`vue-${e}-${t.uid}`), d.NODE_ENV !== "production" && Ya(t, e, Kn() ? te.now() : Date.now());
}
function ze(t, e) {
  if (t.appContext.config.performance && Kn()) {
    const n = `vue-${e}-${t.uid}`, o = n + ":end", r = `<${yn(t, t.type)}> ${e}`;
    te.mark(o), te.measure(r, n, o), te.clearMeasures(r), te.clearMarks(n), te.clearMarks(o);
  }
  d.NODE_ENV !== "production" && Xa(t, e, Kn() ? te.now() : Date.now());
}
function Kn() {
  return qe !== void 0 || (typeof window < "u" && window.performance ? (qe = true, te = window.performance) : qe = false), qe;
}
function Zu() {
  const t = [];
  if (d.NODE_ENV !== "production" && t.length) {
    const e = t.length > 1;
    console.warn(
      `Feature flag${e ? "s" : ""} ${t.join(", ")} ${e ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
    );
  }
}
const Et = ol;
function Qu(t) {
  return tl(t);
}
function tl(t, e) {
  Zu();
  const n = fn();
  n.__VUE__ = true, d.NODE_ENV !== "production" && Yi(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n);
  const {
    insert: o,
    remove: r,
    patchProp: i,
    createElement: s,
    createText: a2,
    createComment: l,
    setText: h,
    setElementText: f,
    parentNode: p,
    nextSibling: b2,
    setScopeId: v2 = ot,
    insertStaticContent: C2
  } = t, S = (u, c, g, x2 = null, y = null, m = null, N = void 0, w2 = null, E = d.NODE_ENV !== "production" && Tt ? false : !!c.dynamicChildren) => {
    if (u === c)
      return;
    u && !Ge(u, c) && (x2 = xn(u), ae2(u, y, m, true), u = null), c.patchFlag === -2 && (E = false, c.dynamicChildren = null);
    const { type: _2, ref: M, shapeFlag: O2 } = c;
    switch (_2) {
      case bn:
        rt(u, c, g, x2);
        break;
      case Ot:
        Y2(u, c, g, x2);
        break;
      case zn:
        u == null ? L2(c, g, x2, N) : d.NODE_ENV !== "production" && F2(u, c, g, N);
        break;
      case ct:
        _n3(
          u,
          c,
          g,
          x2,
          y,
          m,
          N,
          w2,
          E
        );
        break;
      default:
        O2 & 1 ? it(
          u,
          c,
          g,
          x2,
          y,
          m,
          N,
          w2,
          E
        ) : O2 & 6 ? yr(
          u,
          c,
          g,
          x2,
          y,
          m,
          N,
          w2,
          E
        ) : O2 & 64 || O2 & 128 ? _2.process(
          u,
          c,
          g,
          x2,
          y,
          m,
          N,
          w2,
          E,
          Be
        ) : d.NODE_ENV !== "production" && k("Invalid VNode type:", _2, `(${typeof _2})`);
    }
    M != null && y ? tn(M, u && u.ref, m, c || u, !c) : M == null && u && u.ref != null && tn(u.ref, null, m, u, true);
  }, rt = (u, c, g, x2) => {
    if (u == null)
      o(
        c.el = a2(c.children),
        g,
        x2
      );
    else {
      const y = c.el = u.el;
      if (c.children !== u.children)
        if (d.NODE_ENV !== "production" && Tt && c.patchFlag === -1 && "__elIndex" in u) {
          const m = g.childNodes, N = a2(c.children), w2 = m[c.__elIndex = u.__elIndex];
          o(N, g, w2), r(w2);
        } else
          h(y, c.children);
    }
  }, Y2 = (u, c, g, x2) => {
    u == null ? o(
      c.el = l(c.children || ""),
      g,
      x2
    ) : c.el = u.el;
  }, L2 = (u, c, g, x2) => {
    [u.el, u.anchor] = C2(
      u.children,
      c,
      g,
      x2,
      u.el,
      u.anchor
    );
  }, F2 = (u, c, g, x2) => {
    if (c.children !== u.children) {
      const y = b2(u.anchor);
      V2(u), [c.el, c.anchor] = C2(
        c.children,
        g,
        y,
        x2
      );
    } else
      c.el = u.el, c.anchor = u.anchor;
  }, wt = ({ el: u, anchor: c }, g, x2) => {
    let y;
    for (; u && u !== c; )
      y = b2(u), o(u, g, x2), u = y;
    o(c, g, x2);
  }, V2 = ({ el: u, anchor: c }) => {
    let g;
    for (; u && u !== c; )
      g = b2(u), r(u), u = g;
    r(c);
  }, it = (u, c, g, x2, y, m, N, w2, E) => {
    if (c.type === "svg" ? N = "svg" : c.type === "math" && (N = "mathml"), u == null)
      Dt(
        c,
        g,
        x2,
        y,
        m,
        N,
        w2,
        E
      );
    else {
      const _2 = u.el && u.el._isVueCE ? u.el : null;
      try {
        _2 && _2._beginPatch(), Xt(
          u,
          c,
          y,
          m,
          N,
          w2,
          E
        );
      } finally {
        _2 && _2._endPatch();
      }
    }
  }, Dt = (u, c, g, x2, y, m, N, w2) => {
    let E, _2;
    const { props: M, shapeFlag: O2, transition: z2, dirs: j2 } = u;
    if (E = u.el = s(
      u.type,
      m,
      M && M.is,
      M
    ), O2 & 8 ? f(E, u.children) : O2 & 16 && mt(
      u.children,
      E,
      null,
      x2,
      y,
      xo(u, m),
      N,
      w2
    ), j2 && he(u, null, x2, "created"), ut(E, u, u.scopeId, N, x2), M) {
      for (const G2 in M)
        G2 !== "value" && !Xe(G2) && i(E, G2, null, M[G2], m, x2);
      "value" in M && i(E, "value", null, M.value, m), (_2 = M.onVnodeBeforeMount) && Bt(_2, x2, u);
    }
    d.NODE_ENV !== "production" && ($n(E, "__vnode", u, true), $n(E, "__vueParentComponent", x2, true)), j2 && he(u, null, x2, "beforeMount");
    const R2 = el(y, z2);
    R2 && z2.beforeEnter(E), o(E, c, g), ((_2 = M && M.onVnodeMounted) || R2 || j2) && Et(() => {
      _2 && Bt(_2, x2, u), R2 && z2.enter(E), j2 && he(u, null, x2, "mounted");
    }, y);
  }, ut = (u, c, g, x2, y) => {
    if (g && v2(u, g), x2)
      for (let m = 0; m < x2.length; m++)
        v2(u, x2[m]);
    if (y) {
      let m = y.subTree;
      if (d.NODE_ENV !== "production" && m.patchFlag > 0 && m.patchFlag & 2048 && (m = pr(m.children) || m), c === m || ks(m.type) && (m.ssContent === c || m.ssFallback === c)) {
        const N = y.vnode;
        ut(
          u,
          N,
          N.scopeId,
          N.slotScopeIds,
          y.parent
        );
      }
    }
  }, mt = (u, c, g, x2, y, m, N, w2, E = 0) => {
    for (let _2 = E; _2 < u.length; _2++) {
      const M = u[_2] = w2 ? ce(u[_2]) : Mt(u[_2]);
      S(
        null,
        M,
        c,
        g,
        x2,
        y,
        m,
        N,
        w2
      );
    }
  }, Xt = (u, c, g, x2, y, m, N) => {
    const w2 = c.el = u.el;
    d.NODE_ENV !== "production" && (w2.__vnode = c);
    let { patchFlag: E, dynamicChildren: _2, dirs: M } = c;
    E |= u.patchFlag & 16;
    const O2 = u.props || B, z2 = c.props || B;
    let j2;
    if (g && ge(g, false), (j2 = z2.onVnodeBeforeUpdate) && Bt(j2, g, c, u), M && he(c, u, g, "beforeUpdate"), g && ge(g, true), d.NODE_ENV !== "production" && Tt && (E = 0, N = false, _2 = null), (O2.innerHTML && z2.innerHTML == null || O2.textContent && z2.textContent == null) && f(w2, ""), _2 ? (ie2(
      u.dynamicChildren,
      _2,
      w2,
      g,
      x2,
      xo(c, y),
      m
    ), d.NODE_ENV !== "production" && Dn(u, c)) : N || Ft(
      u,
      c,
      w2,
      null,
      g,
      x2,
      xo(c, y),
      m,
      false
    ), E > 0) {
      if (E & 16)
        Vt(w2, O2, z2, g, y);
      else if (E & 2 && O2.class !== z2.class && i(w2, "class", null, z2.class, y), E & 4 && i(w2, "style", O2.style, z2.style, y), E & 8) {
        const R2 = c.dynamicProps;
        for (let G2 = 0; G2 < R2.length; G2++) {
          const K2 = R2[G2], _t3 = O2[K2], xt = z2[K2];
          (xt !== _t3 || K2 === "value") && i(w2, K2, _t3, xt, y, g);
        }
      }
      E & 1 && u.children !== c.children && f(w2, c.children);
    } else !N && _2 == null && Vt(w2, O2, z2, g, y);
    ((j2 = z2.onVnodeUpdated) || M) && Et(() => {
      j2 && Bt(j2, g, c, u), M && he(c, u, g, "updated");
    }, x2);
  }, ie2 = (u, c, g, x2, y, m, N) => {
    for (let w2 = 0; w2 < c.length; w2++) {
      const E = u[w2], _2 = c[w2], M = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        E.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (E.type === ct || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Ge(E, _2) || // - In the case of a component, it could contain anything.
        E.shapeFlag & 198) ? p(E.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          g
        )
      );
      S(
        E,
        _2,
        M,
        null,
        x2,
        y,
        m,
        N,
        true
      );
    }
  }, Vt = (u, c, g, x2, y) => {
    if (c !== g) {
      if (c !== B)
        for (const m in c)
          !Xe(m) && !(m in g) && i(
            u,
            m,
            c[m],
            null,
            y,
            x2
          );
      for (const m in g) {
        if (Xe(m)) continue;
        const N = g[m], w2 = c[m];
        N !== w2 && m !== "value" && i(u, m, w2, N, y, x2);
      }
      "value" in g && i(u, "value", c.value, g.value, y);
    }
  }, _n3 = (u, c, g, x2, y, m, N, w2, E) => {
    const _2 = c.el = u ? u.el : a2(""), M = c.anchor = u ? u.anchor : a2("");
    let { patchFlag: O2, dynamicChildren: z2, slotScopeIds: j2 } = c;
    d.NODE_ENV !== "production" && // #5523 dev root fragment may inherit directives
    (Tt || O2 & 2048) && (O2 = 0, E = false, z2 = null), j2 && (w2 = w2 ? w2.concat(j2) : j2), u == null ? (o(_2, g, x2), o(M, g, x2), mt(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      c.children || [],
      g,
      M,
      y,
      m,
      N,
      w2,
      E
    )) : O2 > 0 && O2 & 64 && z2 && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    u.dynamicChildren && u.dynamicChildren.length === z2.length ? (ie2(
      u.dynamicChildren,
      z2,
      g,
      y,
      m,
      N,
      w2
    ), d.NODE_ENV !== "production" ? Dn(u, c) : (
      // #2080 if the stable fragment has a key, it's a <template v-for> that may
      //  get moved around. Make sure all root level vnodes inherit el.
      // #2134 or if it's a component root, it may also get moved around
      // as the component is being moved.
      (c.key != null || y && c === y.subTree) && Dn(
        u,
        c,
        true
        /* shallow */
      )
    )) : Ft(
      u,
      c,
      g,
      M,
      y,
      m,
      N,
      w2,
      E
    );
  }, yr = (u, c, g, x2, y, m, N, w2, E) => {
    c.slotScopeIds = w2, u == null ? c.shapeFlag & 512 ? y.ctx.activate(
      c,
      g,
      x2,
      N,
      E
    ) : se2(
      c,
      g,
      x2,
      y,
      m,
      N,
      E
    ) : yt(u, c, E);
  }, se2 = (u, c, g, x2, y, m, N) => {
    const w2 = u.component = pl(
      u,
      x2,
      y
    );
    if (d.NODE_ENV !== "production" && w2.type.__hmrId && La(w2), d.NODE_ENV !== "production" && (Nn(u), De(w2, "mount")), ur(u) && (w2.ctx.renderer = Be), d.NODE_ENV !== "production" && De(w2, "init"), dl(w2, false, N), d.NODE_ENV !== "production" && ze(w2, "init"), d.NODE_ENV !== "production" && Tt && (u.el = null), w2.asyncDep) {
      if (y && y.registerDep(w2, P2, N), !u.el) {
        const E = w2.subTree = bt(Ot);
        Y2(null, E, c, g), u.placeholder = E.el;
      }
    } else
      P2(
        w2,
        u,
        c,
        g,
        y,
        m,
        N
      );
    d.NODE_ENV !== "production" && (On(), ze(w2, "mount"));
  }, yt = (u, c, g) => {
    const x2 = c.component = u.component;
    if (Iu(u, c, g))
      if (x2.asyncDep && !x2.asyncResolved) {
        d.NODE_ENV !== "production" && Nn(c), A(x2, c, g), d.NODE_ENV !== "production" && On();
        return;
      } else
        x2.next = c, x2.update();
    else
      c.el = u.el, x2.vnode = c;
  }, P2 = (u, c, g, x2, y, m, N) => {
    const w2 = () => {
      if (u.isMounted) {
        let { next: O2, bu: z2, u: j2, parent: R2, vnode: G2 } = u;
        {
          const Ut = ws(u);
          if (Ut) {
            O2 && (O2.el = G2.el, A(u, O2, N)), Ut.asyncDep.then(() => {
              u.isUnmounted || w2();
            });
            return;
          }
        }
        let K2 = O2, _t3;
        d.NODE_ENV !== "production" && Nn(O2 || u.vnode), ge(u, false), O2 ? (O2.el = G2.el, A(u, O2, N)) : O2 = G2, z2 && Ve(z2), (_t3 = O2.props && O2.props.onVnodeBeforeUpdate) && Bt(_t3, R2, O2, G2), ge(u, true), d.NODE_ENV !== "production" && De(u, "render");
        const xt = Pr(u);
        d.NODE_ENV !== "production" && ze(u, "render");
        const Lt = u.subTree;
        u.subTree = xt, d.NODE_ENV !== "production" && De(u, "patch"), S(
          Lt,
          xt,
          // parent may have changed if it's in a teleport
          p(Lt.el),
          // anchor may have changed if it's in a fragment
          xn(Lt),
          u,
          y,
          m
        ), d.NODE_ENV !== "production" && ze(u, "patch"), O2.el = xt.el, K2 === null && Pu(u, xt.el), j2 && Et(j2, y), (_t3 = O2.props && O2.props.onVnodeUpdated) && Et(
          () => Bt(_t3, R2, O2, G2),
          y
        ), d.NODE_ENV !== "production" && Xi(u), d.NODE_ENV !== "production" && On();
      } else {
        let O2;
        const { el: z2, props: j2 } = c, { bm: R2, m: G2, parent: K2, root: _t3, type: xt } = u, Lt = en(c);
        ge(u, false), R2 && Ve(R2), !Lt && (O2 = j2 && j2.onVnodeBeforeMount) && Bt(O2, K2, c), ge(u, true);
        {
          _t3.ce && // @ts-expect-error _def is private
          _t3.ce._def.shadowRoot !== false && _t3.ce._injectChildStyle(xt), d.NODE_ENV !== "production" && De(u, "render");
          const Ut = u.subTree = Pr(u);
          d.NODE_ENV !== "production" && ze(u, "render"), d.NODE_ENV !== "production" && De(u, "patch"), S(
            null,
            Ut,
            g,
            x2,
            u,
            y,
            m
          ), d.NODE_ENV !== "production" && ze(u, "patch"), c.el = Ut.el;
        }
        if (G2 && Et(G2, y), !Lt && (O2 = j2 && j2.onVnodeMounted)) {
          const Ut = c;
          Et(
            () => Bt(O2, K2, Ut),
            y
          );
        }
        (c.shapeFlag & 256 || K2 && en(K2.vnode) && K2.vnode.shapeFlag & 256) && u.a && Et(u.a, y), u.isMounted = true, d.NODE_ENV !== "production" && qa(u), c = g = x2 = null;
      }
    };
    u.scope.on();
    const E = u.effect = new Oi(w2);
    u.scope.off();
    const _2 = u.update = E.run.bind(E), M = u.job = E.runIfDirty.bind(E);
    M.i = u, M.id = u.uid, E.scheduler = () => no(M), ge(u, true), d.NODE_ENV !== "production" && (E.onTrack = u.rtc ? (O2) => Ve(u.rtc, O2) : void 0, E.onTrigger = u.rtg ? (O2) => Ve(u.rtg, O2) : void 0), _2();
  }, A = (u, c, g) => {
    c.component = u;
    const x2 = u.vnode.props;
    u.vnode = c, u.next = null, Lu(u, c.props, x2, g), Xu(u, c.children, g), At(), Dr(u), It();
  }, Ft = (u, c, g, x2, y, m, N, w2, E = false) => {
    const _2 = u && u.children, M = u ? u.shapeFlag : 0, O2 = c.children, { patchFlag: z2, shapeFlag: j2 } = c;
    if (z2 > 0) {
      if (z2 & 128) {
        Ue(
          _2,
          O2,
          g,
          x2,
          y,
          m,
          N,
          w2,
          E
        );
        return;
      } else if (z2 & 256) {
        lo(
          _2,
          O2,
          g,
          x2,
          y,
          m,
          N,
          w2,
          E
        );
        return;
      }
    }
    j2 & 8 ? (M & 16 && He(_2, y, m), O2 !== _2 && f(g, O2)) : M & 16 ? j2 & 16 ? Ue(
      _2,
      O2,
      g,
      x2,
      y,
      m,
      N,
      w2,
      E
    ) : He(_2, y, m, true) : (M & 8 && f(g, ""), j2 & 16 && mt(
      O2,
      g,
      x2,
      y,
      m,
      N,
      w2,
      E
    ));
  }, lo = (u, c, g, x2, y, m, N, w2, E) => {
    u = u || Te, c = c || Te;
    const _2 = u.length, M = c.length, O2 = Math.min(_2, M);
    let z2;
    for (z2 = 0; z2 < O2; z2++) {
      const j2 = c[z2] = E ? ce(c[z2]) : Mt(c[z2]);
      S(
        u[z2],
        j2,
        g,
        null,
        y,
        m,
        N,
        w2,
        E
      );
    }
    _2 > M ? He(
      u,
      y,
      m,
      true,
      false,
      O2
    ) : mt(
      c,
      g,
      x2,
      y,
      m,
      N,
      w2,
      E,
      O2
    );
  }, Ue = (u, c, g, x2, y, m, N, w2, E) => {
    let _2 = 0;
    const M = c.length;
    let O2 = u.length - 1, z2 = M - 1;
    for (; _2 <= O2 && _2 <= z2; ) {
      const j2 = u[_2], R2 = c[_2] = E ? ce(c[_2]) : Mt(c[_2]);
      if (Ge(j2, R2))
        S(
          j2,
          R2,
          g,
          null,
          y,
          m,
          N,
          w2,
          E
        );
      else
        break;
      _2++;
    }
    for (; _2 <= O2 && _2 <= z2; ) {
      const j2 = u[O2], R2 = c[z2] = E ? ce(c[z2]) : Mt(c[z2]);
      if (Ge(j2, R2))
        S(
          j2,
          R2,
          g,
          null,
          y,
          m,
          N,
          w2,
          E
        );
      else
        break;
      O2--, z2--;
    }
    if (_2 > O2) {
      if (_2 <= z2) {
        const j2 = z2 + 1, R2 = j2 < M ? c[j2].el : x2;
        for (; _2 <= z2; )
          S(
            null,
            c[_2] = E ? ce(c[_2]) : Mt(c[_2]),
            g,
            R2,
            y,
            m,
            N,
            w2,
            E
          ), _2++;
      }
    } else if (_2 > z2)
      for (; _2 <= O2; )
        ae2(u[_2], y, m, true), _2++;
    else {
      const j2 = _2, R2 = _2, G2 = /* @__PURE__ */ new Map();
      for (_2 = R2; _2 <= z2; _2++) {
        const ft = c[_2] = E ? ce(c[_2]) : Mt(c[_2]);
        ft.key != null && (d.NODE_ENV !== "production" && G2.has(ft.key) && k(
          "Duplicate keys found during update:",
          JSON.stringify(ft.key),
          "Make sure keys are unique."
        ), G2.set(ft.key, _2));
      }
      let K2, _t3 = 0;
      const xt = z2 - R2 + 1;
      let Lt = false, Ut = 0;
      const Ke = new Array(xt);
      for (_2 = 0; _2 < xt; _2++) Ke[_2] = 0;
      for (_2 = j2; _2 <= O2; _2++) {
        const ft = u[_2];
        if (_t3 >= xt) {
          ae2(ft, y, m, true);
          continue;
        }
        let Ht;
        if (ft.key != null)
          Ht = G2.get(ft.key);
        else
          for (K2 = R2; K2 <= z2; K2++)
            if (Ke[K2 - R2] === 0 && Ge(ft, c[K2])) {
              Ht = K2;
              break;
            }
        Ht === void 0 ? ae2(ft, y, m, true) : (Ke[Ht - R2] = _2 + 1, Ht >= Ut ? Ut = Ht : Lt = true, S(
          ft,
          c[Ht],
          g,
          null,
          y,
          m,
          N,
          w2,
          E
        ), _t3++);
      }
      const xr = Lt ? nl(Ke) : Te;
      for (K2 = xr.length - 1, _2 = xt - 1; _2 >= 0; _2--) {
        const ft = R2 + _2, Ht = c[ft], vr = c[ft + 1], wr = ft + 1 < M ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          vr.el || Es(vr)
        ) : x2;
        Ke[_2] === 0 ? S(
          null,
          Ht,
          g,
          wr,
          y,
          m,
          N,
          w2,
          E
        ) : Lt && (K2 < 0 || _2 !== xr[K2] ? Oe2(Ht, g, wr, 2) : K2--);
      }
    }
  }, Oe2 = (u, c, g, x2, y = null) => {
    const { el: m, type: N, transition: w2, children: E, shapeFlag: _2 } = u;
    if (_2 & 6) {
      Oe2(u.component.subTree, c, g, x2);
      return;
    }
    if (_2 & 128) {
      u.suspense.move(c, g, x2);
      return;
    }
    if (_2 & 64) {
      N.move(u, c, g, Be);
      return;
    }
    if (N === ct) {
      o(m, c, g);
      for (let O2 = 0; O2 < E.length; O2++)
        Oe2(E[O2], c, g, x2);
      o(u.anchor, c, g);
      return;
    }
    if (N === zn) {
      wt(u, c, g);
      return;
    }
    if (x2 !== 2 && _2 & 1 && w2)
      if (x2 === 0)
        w2.beforeEnter(m), o(m, c, g), Et(() => w2.enter(m), y);
      else {
        const { leave: O2, delayLeave: z2, afterLeave: j2 } = w2, R2 = () => {
          u.ctx.isUnmounted ? r(m) : o(m, c, g);
        }, G2 = () => {
          m._isLeaving && m[su](
            true
            /* cancelled */
          ), O2(m, () => {
            R2(), j2 && j2();
          });
        };
        z2 ? z2(m, R2, G2) : G2();
      }
    else
      o(m, c, g);
  }, ae2 = (u, c, g, x2 = false, y = false) => {
    const {
      type: m,
      props: N,
      ref: w2,
      children: E,
      dynamicChildren: _2,
      shapeFlag: M,
      patchFlag: O2,
      dirs: z2,
      cacheIndex: j2
    } = u;
    if (O2 === -2 && (y = false), w2 != null && (At(), tn(w2, null, g, u, true), It()), j2 != null && (c.renderCache[j2] = void 0), M & 256) {
      c.ctx.deactivate(u);
      return;
    }
    const R2 = M & 1 && z2, G2 = !en(u);
    let K2;
    if (G2 && (K2 = N && N.onVnodeBeforeUnmount) && Bt(K2, c, u), M & 6)
      Ls(u.component, g, x2);
    else {
      if (M & 128) {
        u.suspense.unmount(g, x2);
        return;
      }
      R2 && he(u, null, c, "beforeUnmount"), M & 64 ? u.type.remove(
        u,
        c,
        g,
        Be,
        x2
      ) : _2 && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_2.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (m !== ct || O2 > 0 && O2 & 64) ? He(
        _2,
        c,
        g,
        false,
        true
      ) : (m === ct && O2 & 384 || !y && M & 16) && He(E, c, g), x2 && co(u);
    }
    (G2 && (K2 = N && N.onVnodeUnmounted) || R2) && Et(() => {
      K2 && Bt(K2, c, u), R2 && he(u, null, c, "unmounted");
    }, g);
  }, co = (u) => {
    const { type: c, el: g, anchor: x2, transition: y } = u;
    if (c === ct) {
      d.NODE_ENV !== "production" && u.patchFlag > 0 && u.patchFlag & 2048 && y && !y.persisted ? u.children.forEach((N) => {
        N.type === Ot ? r(N.el) : co(N);
      }) : Fs(g, x2);
      return;
    }
    if (c === zn) {
      V2(u);
      return;
    }
    const m = () => {
      r(g), y && !y.persisted && y.afterLeave && y.afterLeave();
    };
    if (u.shapeFlag & 1 && y && !y.persisted) {
      const { leave: N, delayLeave: w2 } = y, E = () => N(g, m);
      w2 ? w2(u.el, m, E) : E();
    } else
      m();
  }, Fs = (u, c) => {
    let g;
    for (; u !== c; )
      g = b2(u), r(u), u = g;
    r(c);
  }, Ls = (u, c, g) => {
    d.NODE_ENV !== "production" && u.type.__hmrId && Ua(u);
    const { bum: x2, scope: y, job: m, subTree: N, um: w2, m: E, a: _2 } = u;
    Br(E), Br(_2), x2 && Ve(x2), y.stop(), m && (m.flags |= 8, ae2(N, u, c, g)), w2 && Et(w2, c), Et(() => {
      u.isUnmounted = true;
    }, c), d.NODE_ENV !== "production" && Ja(u);
  }, He = (u, c, g, x2 = false, y = false, m = 0) => {
    for (let N = m; N < u.length; N++)
      ae2(u[N], c, g, x2, y);
  }, xn = (u) => {
    if (u.shapeFlag & 6)
      return xn(u.component.subTree);
    if (u.shapeFlag & 128)
      return u.suspense.next();
    const c = b2(u.anchor || u.el), g = c && c[ru];
    return g ? b2(g) : c;
  };
  let po = false;
  const _r = (u, c, g) => {
    let x2;
    u == null ? c._vnode && (ae2(c._vnode, null, null, true), x2 = c._vnode.component) : S(
      c._vnode || null,
      u,
      c,
      null,
      null,
      null,
      g
    ), c._vnode = u, po || (po = true, Dr(x2), qi(), po = false);
  }, Be = {
    p: S,
    um: ae2,
    m: Oe2,
    r: co,
    mt: se2,
    mc: mt,
    pc: Ft,
    pbc: ie2,
    n: xn,
    o: t
  };
  return {
    render: _r,
    hydrate: void 0,
    createApp: Vu(_r)
  };
}
function xo({ type: t, props: e }, n) {
  return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function ge({ effect: t, job: e }, n) {
  n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function el(t, e) {
  return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function Dn(t, e, n = false) {
  const o = t.children, r = e.children;
  if (D(o) && D(r))
    for (let i = 0; i < o.length; i++) {
      const s = o[i];
      let a2 = r[i];
      a2.shapeFlag & 1 && !a2.dynamicChildren && ((a2.patchFlag <= 0 || a2.patchFlag === 32) && (a2 = r[i] = ce(r[i]), a2.el = s.el), !n && a2.patchFlag !== -2 && Dn(s, a2)), a2.type === bn && (a2.patchFlag !== -1 ? a2.el = s.el : a2.__elIndex = i + // take fragment start anchor into account
      (t.type === ct ? 1 : 0)), a2.type === Ot && !a2.el && (a2.el = s.el), d.NODE_ENV !== "production" && a2.el && (a2.el.__vnode = a2);
    }
}
function nl(t) {
  const e = t.slice(), n = [0];
  let o, r, i, s, a2;
  const l = t.length;
  for (o = 0; o < l; o++) {
    const h = t[o];
    if (h !== 0) {
      if (r = n[n.length - 1], t[r] < h) {
        e[o] = r, n.push(o);
        continue;
      }
      for (i = 0, s = n.length - 1; i < s; )
        a2 = i + s >> 1, t[n[a2]] < h ? i = a2 + 1 : s = a2;
      h < t[n[i]] && (i > 0 && (e[o] = n[i - 1]), n[i] = o);
    }
  }
  for (i = n.length, s = n[i - 1]; i-- > 0; )
    n[i] = s, s = e[s];
  return n;
}
function ws(t) {
  const e = t.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : ws(e);
}
function Br(t) {
  if (t)
    for (let e = 0; e < t.length; e++)
      t[e].flags |= 8;
}
function Es(t) {
  if (t.placeholder)
    return t.placeholder;
  const e = t.component;
  return e ? Es(e.subTree) : null;
}
const ks = (t) => t.__isSuspense;
function ol(t, e) {
  e && e.pendingBranch ? D(t) ? e.effects.push(...t) : e.effects.push(t) : Wi(t);
}
const ct = /* @__PURE__ */ Symbol.for("v-fgt"), bn = /* @__PURE__ */ Symbol.for("v-txt"), Ot = /* @__PURE__ */ Symbol.for("v-cmt"), zn = /* @__PURE__ */ Symbol.for("v-stc"), nn = [];
let Nt = null;
function W(t = false) {
  nn.push(Nt = t ? null : []);
}
function rl() {
  nn.pop(), Nt = nn[nn.length - 1] || null;
}
let an = 1;
function Kr(t, e = false) {
  an += t, t < 0 && Nt && e && (Nt.hasOnce = true);
}
function Ns(t) {
  return t.dynamicChildren = an > 0 ? Nt || Te : null, rl(), an > 0 && Nt && Nt.push(t), t;
}
function Z(t, e, n, o, r, i) {
  return Ns(
    Q(
      t,
      e,
      n,
      o,
      r,
      i,
      true
    )
  );
}
function Le(t, e, n, o, r) {
  return Ns(
    bt(
      t,
      e,
      n,
      o,
      r,
      true
    )
  );
}
function io(t) {
  return t ? t.__v_isVNode === true : false;
}
function Ge(t, e) {
  if (d.NODE_ENV !== "production" && e.shapeFlag & 6 && t.component) {
    const n = Sn.get(e.type);
    if (n && n.has(t.component))
      return t.shapeFlag &= -257, e.shapeFlag &= -513, false;
  }
  return t.type === e.type && t.key === e.key;
}
const il = (...t) => Ss(
  ...t
), Os = ({ key: t }) => t ?? null, Vn = ({
  ref: t,
  ref_key: e,
  ref_for: n
}) => (typeof t == "number" && (t = "" + t), t != null ? J(t) || et(t) || T(t) ? { i: pt, r: t, k: e, f: !!n } : t : null);
function Q(t, e = null, n = null, o = 0, r = null, i = t === ct ? 0 : 1, s = false, a2 = false) {
  const l = {
    __v_isVNode: true,
    __v_skip: true,
    type: t,
    props: e,
    key: e && Os(e),
    ref: e && Vn(e),
    scopeId: Qi,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: i,
    patchFlag: o,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: pt
  };
  return a2 ? (hr(l, n), i & 128 && t.normalize(l)) : n && (l.shapeFlag |= J(n) ? 8 : 16), d.NODE_ENV !== "production" && l.key !== l.key && k("VNode created with invalid key (NaN). VNode type:", l.type), an > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  Nt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Nt.push(l), l;
}
const bt = d.NODE_ENV !== "production" ? il : Ss;
function Ss(t, e = null, n = null, o = 0, r = null, i = false) {
  if ((!t || t === ss) && (d.NODE_ENV !== "production" && !t && k(`Invalid vnode type when creating vnode: ${t}.`), t = Ot), io(t)) {
    const a2 = de(
      t,
      e,
      true
      /* mergeRef: true */
    );
    return n && hr(a2, n), an > 0 && !i && Nt && (a2.shapeFlag & 6 ? Nt[Nt.indexOf(t)] = a2 : Nt.push(a2)), a2.patchFlag = -2, a2;
  }
  if (Ms(t) && (t = t.__vccOpts), e) {
    e = sl(e);
    let { class: a2, style: l } = e;
    a2 && !J(a2) && (e.class = Zo(a2)), U(l) && (An(l) && !D(l) && (l = X({}, l)), e.style = Xo(l));
  }
  const s = J(t) ? 1 : ks(t) ? 128 : iu(t) ? 64 : U(t) ? 4 : T(t) ? 2 : 0;
  return d.NODE_ENV !== "production" && s & 4 && An(t) && (t = $(t), k(
    "Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
    `
Component that was made reactive: `,
    t
  )), Q(
    t,
    e,
    n,
    o,
    r,
    s,
    i,
    true
  );
}
function sl(t) {
  return t ? An(t) || bs(t) ? X({}, t) : t : null;
}
function de(t, e, n = false, o = false) {
  const { props: r, ref: i, patchFlag: s, children: a2, transition: l } = t, h = e ? ul(r || {}, e) : r, f = {
    __v_isVNode: true,
    __v_skip: true,
    type: t.type,
    props: h,
    key: h && Os(h),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? D(i) ? i.concat(Vn(e)) : [i, Vn(e)] : Vn(e)
    ) : i,
    scopeId: t.scopeId,
    slotScopeIds: t.slotScopeIds,
    children: d.NODE_ENV !== "production" && s === -1 && D(a2) ? a2.map(Cs) : a2,
    target: t.target,
    targetStart: t.targetStart,
    targetAnchor: t.targetAnchor,
    staticCount: t.staticCount,
    shapeFlag: t.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: e && t.type !== ct ? s === -1 ? 16 : s | 16 : s,
    dynamicProps: t.dynamicProps,
    dynamicChildren: t.dynamicChildren,
    appContext: t.appContext,
    dirs: t.dirs,
    transition: l,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: t.component,
    suspense: t.suspense,
    ssContent: t.ssContent && de(t.ssContent),
    ssFallback: t.ssFallback && de(t.ssFallback),
    placeholder: t.placeholder,
    el: t.el,
    anchor: t.anchor,
    ctx: t.ctx,
    ce: t.ce
  };
  return l && o && ar(
    f,
    l.clone(f)
  ), f;
}
function Cs(t) {
  const e = de(t);
  return D(t.children) && (e.children = t.children.map(Cs)), e;
}
function al(t = " ", e = 0) {
  return bt(bn, null, t, e);
}
function Ne(t = "", e = false) {
  return e ? (W(), Le(Ot, null, t)) : bt(Ot, null, t);
}
function Mt(t) {
  return t == null || typeof t == "boolean" ? bt(Ot) : D(t) ? bt(
    ct,
    null,
    // #3666, avoid reference pollution when reusing vnode
    t.slice()
  ) : io(t) ? ce(t) : bt(bn, null, String(t));
}
function ce(t) {
  return t.el === null && t.patchFlag !== -1 || t.memo ? t : de(t);
}
function hr(t, e) {
  let n = 0;
  const { shapeFlag: o } = t;
  if (e == null)
    e = null;
  else if (D(e))
    n = 16;
  else if (typeof e == "object")
    if (o & 65) {
      const r = e.default;
      r && (r._c && (r._d = false), hr(t, r()), r._c && (r._d = true));
      return;
    } else {
      n = 32;
      const r = e._;
      !r && !bs(e) ? e._ctx = pt : r === 3 && pt && (pt.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
    }
  else T(e) ? (e = { default: e, _ctx: pt }, n = 32) : (e = String(e), o & 64 ? (n = 16, e = [al(e)]) : n = 8);
  t.children = e, t.shapeFlag |= n;
}
function ul(...t) {
  const e = {};
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    for (const r in o)
      if (r === "class")
        e.class !== o.class && (e.class = Zo([e.class, o.class]));
      else if (r === "style")
        e.style = Xo([e.style, o.style]);
      else if (cn(r)) {
        const i = e[r], s = o[r];
        s && i !== s && !(D(i) && i.includes(s)) && (e[r] = i ? [].concat(i, s) : s);
      } else r !== "" && (e[r] = o[r]);
  }
  return e;
}
function Bt(t, e, n, o = null) {
  Yt(t, e, 7, [
    n,
    o
  ]);
}
const ll = ps();
let cl = 0;
function pl(t, e, n) {
  const o = t.type, r = (e ? e.appContext : t.appContext) || ll, i = {
    uid: cl++,
    vnode: t,
    type: o,
    parent: e,
    appContext: r,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new ia(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: e ? e.provides : Object.create(r.provides),
    ids: e ? e.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: ys(o, r),
    emitsOptions: fs(o, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: B,
    // inheritAttrs
    inheritAttrs: o.inheritAttrs,
    // state
    ctx: B,
    data: B,
    props: B,
    attrs: B,
    slots: B,
    refs: B,
    setupState: B,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return d.NODE_ENV !== "production" ? i.ctx = vu(i) : i.ctx = { _: i }, i.root = e ? e.root : i, i.emit = Tu.bind(null, i), t.ce && t.ce(i), i;
}
let tt = null;
const Ds = () => tt || pt;
let Wn, Ao;
{
  const t = fn(), e = (n, o) => {
    let r;
    return (r = t[n]) || (r = t[n] = []), r.push(o), (i) => {
      r.length > 1 ? r.forEach((s) => s(i)) : r[0](i);
    };
  };
  Wn = e(
    "__VUE_INSTANCE_SETTERS__",
    (n) => tt = n
  ), Ao = e(
    "__VUE_SSR_SETTERS__",
    (n) => un = n
  );
}
const mn = (t) => {
  const e = tt;
  return Wn(t), t.scope.on(), () => {
    t.scope.off(), Wn(e);
  };
}, Wr = () => {
  tt && tt.scope.off(), Wn(null);
}, fl = /* @__PURE__ */ oe("slot,component");
function Io(t, { isNativeTag: e }) {
  (fl(t) || e(t)) && k(
    "Do not use built-in or reserved HTML elements as component id: " + t
  );
}
function zs(t) {
  return t.vnode.shapeFlag & 4;
}
let un = false;
function dl(t, e = false, n = false) {
  e && Ao(e);
  const { props: o, children: r } = t.vnode, i = zs(t);
  Ru(t, o, i, e), Yu(t, r, n || e);
  const s = i ? hl(t, e) : void 0;
  return e && Ao(false), s;
}
function hl(t, e) {
  const n = t.type;
  if (d.NODE_ENV !== "production") {
    if (n.name && Io(n.name, t.appContext.config), n.components) {
      const r = Object.keys(n.components);
      for (let i = 0; i < r.length; i++)
        Io(r[i], t.appContext.config);
    }
    if (n.directives) {
      const r = Object.keys(n.directives);
      for (let i = 0; i < r.length; i++)
        ts(r[i]);
    }
    n.compilerOptions && gl() && k(
      '"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.'
    );
  }
  t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, us), d.NODE_ENV !== "production" && wu(t);
  const { setup: o } = n;
  if (o) {
    At();
    const r = t.setupContext = o.length > 1 ? ml(t) : null, i = mn(t), s = Fe(
      o,
      t,
      0,
      [
        d.NODE_ENV !== "production" ? Gt(t.props) : t.props,
        r
      ]
    ), a2 = qo(s);
    if (It(), i(), (a2 || t.sp) && !en(t) && os(t), a2) {
      if (s.then(Wr, Wr), e)
        return s.then((l) => {
          qr(t, l, e);
        }).catch((l) => {
          hn(l, t, 0);
        });
      if (t.asyncDep = s, d.NODE_ENV !== "production" && !t.suspense) {
        const l = yn(t, n);
        k(
          `Component <${l}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
        );
      }
    } else
      qr(t, s, e);
  } else
    Vs(t, e);
}
function qr(t, e, n) {
  T(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : U(e) ? (d.NODE_ENV !== "production" && io(e) && k(
    "setup() should not return VNodes directly - return a render function instead."
  ), d.NODE_ENV !== "production" && (t.devtoolsRawSetupState = e), t.setupState = Ui(e), d.NODE_ENV !== "production" && Eu(t)) : d.NODE_ENV !== "production" && e !== void 0 && k(
    `setup() should return an object. Received: ${e === null ? "null" : typeof e}`
  ), Vs(t, n);
}
const gl = () => true;
function Vs(t, e, n) {
  const o = t.type;
  t.render || (t.render = o.render || ot);
  {
    const r = mn(t);
    At();
    try {
      Nu(t);
    } finally {
      It(), r();
    }
  }
  d.NODE_ENV !== "production" && !o.render && t.render === ot && !e && (o.template ? k(
    'Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".'
  ) : k("Component is missing template or render function: ", o));
}
const Gr = d.NODE_ENV !== "production" ? {
  get(t, e) {
    return Bn(), nt(t, "get", ""), t[e];
  },
  set() {
    return k("setupContext.attrs is readonly."), false;
  },
  deleteProperty() {
    return k("setupContext.attrs is readonly."), false;
  }
} : {
  get(t, e) {
    return nt(t, "get", ""), t[e];
  }
};
function bl(t) {
  return new Proxy(t.slots, {
    get(e, n) {
      return nt(t, "get", "$slots"), e[n];
    }
  });
}
function ml(t) {
  const e = (n) => {
    if (d.NODE_ENV !== "production" && (t.exposed && k("expose() should be called only once per setup()."), n != null)) {
      let o = typeof n;
      o === "object" && (D(n) ? o = "array" : et(n) && (o = "ref")), o !== "object" && k(
        `expose() should be passed a plain object, received ${o}.`
      );
    }
    t.exposed = n || {};
  };
  if (d.NODE_ENV !== "production") {
    let n, o;
    return Object.freeze({
      get attrs() {
        return n || (n = new Proxy(t.attrs, Gr));
      },
      get slots() {
        return o || (o = bl(t));
      },
      get emit() {
        return (r, ...i) => t.emit(r, ...i);
      },
      expose: e
    });
  } else
    return {
      attrs: new Proxy(t.attrs, Gr),
      slots: t.slots,
      emit: t.emit,
      expose: e
    };
}
function so(t) {
  return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(Ui(Oa(t.exposed)), {
    get(e, n) {
      if (n in e)
        return e[n];
      if (n in we)
        return we[n](t);
    },
    has(e, n) {
      return n in e || n in we;
    }
  })) : t.proxy;
}
const yl = /(?:^|[-_])\w/g, _l = (t) => t.replace(yl, (e) => e.toUpperCase()).replace(/[-_]/g, "");
function gr(t, e = true) {
  return T(t) ? t.displayName || t.name : t.name || e && t.__name;
}
function yn(t, e, n = false) {
  let o = gr(e);
  if (!o && e.__file) {
    const r = e.__file.match(/([^/\\]+)\.\w+$/);
    r && (o = r[1]);
  }
  if (!o && t) {
    const r = (i) => {
      for (const s in i)
        if (i[s] === e)
          return s;
    };
    o = r(t.components) || t.parent && r(
      t.parent.type.components
    ) || r(t.appContext.components);
  }
  return o ? _l(o) : n ? "App" : "Anonymous";
}
function Ms(t) {
  return T(t) && "__vccOpts" in t;
}
const St = (t, e) => {
  const n = Va(t, e, un);
  if (d.NODE_ENV !== "production") {
    const o = Ds();
    o && o.appContext.config.warnRecursiveComputed && (n._warnRecursive = true);
  }
  return n;
};
function xl() {
  if (d.NODE_ENV === "production" || typeof window > "u")
    return;
  const t = { style: "color:#3ba776" }, e = { style: "color:#1677ff" }, n = { style: "color:#f5222d" }, o = { style: "color:#eb2f96" }, r = {
    __vue_custom_formatter: true,
    header(p) {
      if (!U(p))
        return null;
      if (p.__isVue)
        return ["div", t, "VueInstance"];
      if (et(p)) {
        At();
        const b2 = p.value;
        return It(), [
          "div",
          {},
          ["span", t, f(p)],
          "<",
          a2(b2),
          ">"
        ];
      } else {
        if (fe(p))
          return [
            "div",
            {},
            ["span", t, gt(p) ? "ShallowReactive" : "Reactive"],
            "<",
            a2(p),
            `>${Pt(p) ? " (readonly)" : ""}`
          ];
        if (Pt(p))
          return [
            "div",
            {},
            ["span", t, gt(p) ? "ShallowReadonly" : "Readonly"],
            "<",
            a2(p),
            ">"
          ];
      }
      return null;
    },
    hasBody(p) {
      return p && p.__isVue;
    },
    body(p) {
      if (p && p.__isVue)
        return [
          "div",
          {},
          ...i(p.$)
        ];
    }
  };
  function i(p) {
    const b2 = [];
    p.type.props && p.props && b2.push(s("props", $(p.props))), p.setupState !== B && b2.push(s("setup", p.setupState)), p.data !== B && b2.push(s("data", $(p.data)));
    const v2 = l(p, "computed");
    v2 && b2.push(s("computed", v2));
    const C2 = l(p, "inject");
    return C2 && b2.push(s("injected", C2)), b2.push([
      "div",
      {},
      [
        "span",
        {
          style: o.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: p }]
    ]), b2;
  }
  function s(p, b2) {
    return b2 = X({}, b2), Object.keys(b2).length ? [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        p
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(b2).map((v2) => [
          "div",
          {},
          ["span", o, v2 + ": "],
          a2(b2[v2], false)
        ])
      ]
    ] : ["span", {}];
  }
  function a2(p, b2 = true) {
    return typeof p == "number" ? ["span", e, p] : typeof p == "string" ? ["span", n, JSON.stringify(p)] : typeof p == "boolean" ? ["span", o, p] : U(p) ? ["object", { object: b2 ? $(p) : p }] : ["span", n, String(p)];
  }
  function l(p, b2) {
    const v2 = p.type;
    if (T(v2))
      return;
    const C2 = {};
    for (const S in p.ctx)
      h(v2, S, b2) && (C2[S] = p.ctx[S]);
    return C2;
  }
  function h(p, b2, v2) {
    const C2 = p[v2];
    if (D(C2) && C2.includes(b2) || U(C2) && b2 in C2 || p.extends && h(p.extends, b2, v2) || p.mixins && p.mixins.some((S) => h(S, b2, v2)))
      return true;
  }
  function f(p) {
    return gt(p) ? "ShallowRef" : p.effect ? "ComputedRef" : "Ref";
  }
  window.devtoolsFormatters ? window.devtoolsFormatters.push(r) : window.devtoolsFormatters = [r];
}
const Jr = "3.5.26", zt = d.NODE_ENV !== "production" ? k : ot;
var lt = {};
let Po;
const Yr = typeof window < "u" && window.trustedTypes;
if (Yr)
  try {
    Po = /* @__PURE__ */ Yr.createPolicy("vue", {
      createHTML: (t) => t
    });
  } catch (t) {
    lt.NODE_ENV !== "production" && zt(`Error creating trusted types policy: ${t}`);
  }
const Ts = Po ? (t) => Po.createHTML(t) : (t) => t, vl = "http://www.w3.org/2000/svg", wl = "http://www.w3.org/1998/Math/MathML", Qt = typeof document < "u" ? document : null, Xr = Qt && /* @__PURE__ */ Qt.createElement("template"), El = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, o) => {
    const r = e === "svg" ? Qt.createElementNS(vl, t) : e === "mathml" ? Qt.createElementNS(wl, t) : n ? Qt.createElement(t, { is: n }) : Qt.createElement(t);
    return t === "select" && o && o.multiple != null && r.setAttribute("multiple", o.multiple), r;
  },
  createText: (t) => Qt.createTextNode(t),
  createComment: (t) => Qt.createComment(t),
  setText: (t, e) => {
    t.nodeValue = e;
  },
  setElementText: (t, e) => {
    t.textContent = e;
  },
  parentNode: (t) => t.parentNode,
  nextSibling: (t) => t.nextSibling,
  querySelector: (t) => Qt.querySelector(t),
  setScopeId(t, e) {
    t.setAttribute(e, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(t, e, n, o, r, i) {
    const s = n ? n.previousSibling : e.lastChild;
    if (r && (r === i || r.nextSibling))
      for (; e.insertBefore(r.cloneNode(true), n), !(r === i || !(r = r.nextSibling)); )
        ;
    else {
      Xr.innerHTML = Ts(
        o === "svg" ? `<svg>${t}</svg>` : o === "mathml" ? `<math>${t}</math>` : t
      );
      const a2 = Xr.content;
      if (o === "svg" || o === "mathml") {
        const l = a2.firstChild;
        for (; l.firstChild; )
          a2.appendChild(l.firstChild);
        a2.removeChild(l);
      }
      e.insertBefore(a2, n);
    }
    return [
      // first
      s ? s.nextSibling : e.firstChild,
      // last
      n ? n.previousSibling : e.lastChild
    ];
  }
}, kl = /* @__PURE__ */ Symbol("_vtc");
function Nl(t, e, n) {
  const o = t[kl];
  o && (e = (e ? [e, ...o] : [...o]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
const Zr = /* @__PURE__ */ Symbol("_vod"), Ol = /* @__PURE__ */ Symbol("_vsh"), Sl = /* @__PURE__ */ Symbol(lt.NODE_ENV !== "production" ? "CSS_VAR_TEXT" : ""), Cl = /(?:^|;)\s*display\s*:/;
function Dl(t, e, n) {
  const o = t.style, r = J(n);
  let i = false;
  if (n && !r) {
    if (e)
      if (J(e))
        for (const s of e.split(";")) {
          const a2 = s.slice(0, s.indexOf(":")).trim();
          n[a2] == null && Mn(o, a2, "");
        }
      else
        for (const s in e)
          n[s] == null && Mn(o, s, "");
    for (const s in n)
      s === "display" && (i = true), Mn(o, s, n[s]);
  } else if (r) {
    if (e !== n) {
      const s = o[Sl];
      s && (n += ";" + s), o.cssText = n, i = Cl.test(n);
    }
  } else e && t.removeAttribute("style");
  Zr in t && (t[Zr] = i ? o.display : "", t[Ol] && (o.display = "none"));
}
const zl = /[^\\];\s*$/, Qr = /\s*!important$/;
function Mn(t, e, n) {
  if (D(n))
    n.forEach((o) => Mn(t, e, o));
  else if (n == null && (n = ""), lt.NODE_ENV !== "production" && zl.test(n) && zt(
    `Unexpected semicolon at the end of '${e}' style value: '${n}'`
  ), e.startsWith("--"))
    t.setProperty(e, n);
  else {
    const o = Vl(t, e);
    Qr.test(n) ? t.setProperty(
      kt(o),
      n.replace(Qr, ""),
      "important"
    ) : t[o] = n;
  }
}
const ti = ["Webkit", "Moz", "ms"], vo = {};
function Vl(t, e) {
  const n = vo[e];
  if (n)
    return n;
  let o = st(e);
  if (o !== "filter" && o in t)
    return vo[e] = o;
  o = Ee(o);
  for (let r = 0; r < ti.length; r++) {
    const i = ti[r] + o;
    if (i in t)
      return vo[e] = i;
  }
  return e;
}
const ei = "http://www.w3.org/1999/xlink";
function ni(t, e, n, o, r, i = oa(e)) {
  o && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(ei, e.slice(6, e.length)) : t.setAttributeNS(ei, e, n) : n == null || i && !wi(n) ? t.removeAttribute(e) : t.setAttribute(
    e,
    i ? "" : Jt(n) ? String(n) : n
  );
}
function oi(t, e, n, o, r) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? Ts(n) : n);
    return;
  }
  const i = t.tagName;
  if (e === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const a2 = i === "OPTION" ? t.getAttribute("value") || "" : t.value, l = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      t.type === "checkbox" ? "on" : ""
    ) : String(n);
    (a2 !== l || !("_value" in t)) && (t.value = l), n == null && t.removeAttribute(e), t._value = n;
    return;
  }
  let s = false;
  if (n === "" || n == null) {
    const a2 = typeof t[e];
    a2 === "boolean" ? n = wi(n) : n == null && a2 === "string" ? (n = "", s = true) : a2 === "number" && (n = 0, s = true);
  }
  try {
    t[e] = n;
  } catch (a2) {
    lt.NODE_ENV !== "production" && !s && zt(
      `Failed setting prop "${e}" on <${i.toLowerCase()}>: value ${n} is invalid.`,
      a2
    );
  }
  s && t.removeAttribute(r || e);
}
function ye(t, e, n, o) {
  t.addEventListener(e, n, o);
}
function Ml(t, e, n, o) {
  t.removeEventListener(e, n, o);
}
const ri = /* @__PURE__ */ Symbol("_vei");
function Tl(t, e, n, o, r = null) {
  const i = t[ri] || (t[ri] = {}), s = i[e];
  if (o && s)
    s.value = lt.NODE_ENV !== "production" ? si(o, e) : o;
  else {
    const [a2, l] = jl(e);
    if (o) {
      const h = i[e] = Il(
        lt.NODE_ENV !== "production" ? si(o, e) : o,
        r
      );
      ye(t, a2, h, l);
    } else s && (Ml(t, a2, s, l), i[e] = void 0);
  }
}
const ii = /(?:Once|Passive|Capture)$/;
function jl(t) {
  let e;
  if (ii.test(t)) {
    e = {};
    let o;
    for (; o = t.match(ii); )
      t = t.slice(0, t.length - o[0].length), e[o[0].toLowerCase()] = true;
  }
  return [t[2] === ":" ? t.slice(3) : kt(t.slice(2)), e];
}
let wo = 0;
const $l = /* @__PURE__ */ Promise.resolve(), Al = () => wo || ($l.then(() => wo = 0), wo = Date.now());
function Il(t, e) {
  const n = (o) => {
    if (!o._vts)
      o._vts = Date.now();
    else if (o._vts <= n.attached)
      return;
    Yt(
      Pl(o, n.value),
      e,
      5,
      [o]
    );
  };
  return n.value = t, n.attached = Al(), n;
}
function si(t, e) {
  return T(t) || D(t) ? t : (zt(
    `Wrong type passed as event handler to ${e} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof t}.`
  ), ot);
}
function Pl(t, e) {
  if (D(e)) {
    const n = t.stopImmediatePropagation;
    return t.stopImmediatePropagation = () => {
      n.call(t), t._stopped = true;
    }, e.map(
      (o) => (r) => !r._stopped && o && o(r)
    );
  } else
    return e;
}
const ai = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, Rl = (t, e, n, o, r, i) => {
  const s = r === "svg";
  e === "class" ? Nl(t, o, s) : e === "style" ? Dl(t, n, o) : cn(e) ? jn(e) || Tl(t, e, n, o, i) : (e[0] === "." ? (e = e.slice(1), true) : e[0] === "^" ? (e = e.slice(1), false) : Fl(t, e, o, s)) ? (oi(t, e, o), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && ni(t, e, o, s, i, e !== "value")) : (
    /* #11081 force set props for possible async custom element */
    t._isVueCE && (/[A-Z]/.test(e) || !J(o)) ? oi(t, st(e), o, i, e) : (e === "true-value" ? t._trueValue = o : e === "false-value" && (t._falseValue = o), ni(t, e, o, s))
  );
};
function Fl(t, e, n, o) {
  if (o)
    return !!(e === "innerHTML" || e === "textContent" || e in t && ai(e) && T(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && t.tagName === "IFRAME" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
    return false;
  if (e === "width" || e === "height") {
    const r = t.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return false;
  }
  return ai(e) && J(n) ? false : e in t;
}
const ui = {};
// @__NO_SIDE_EFFECTS__
function Ll(t, e, n) {
  let o = /* @__PURE__ */ Ct(t, e);
  Jn(o) && (o = X({}, o, e));
  class r extends br {
    constructor(s) {
      super(o, s, n);
    }
  }
  return r.def = o, r;
}
const Ul = typeof HTMLElement < "u" ? HTMLElement : class {
};
class br extends Ul {
  constructor(e, n = {}, o = di) {
    super(), this._def = e, this._props = n, this._createApp = o, this._isVueCE = true, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = false, this._resolved = false, this._patching = false, this._dirty = false, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._ob = null, this.shadowRoot && o !== di ? this._root = this.shadowRoot : (lt.NODE_ENV !== "production" && this.shadowRoot && zt(
      "Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use `defineSSRCustomElement`."
    ), e.shadowRoot !== false ? (this.attachShadow(
      X({}, e.shadowRootOptions, {
        mode: "open"
      })
    ), this._root = this.shadowRoot) : this._root = this);
  }
  connectedCallback() {
    if (!this.isConnected) return;
    !this.shadowRoot && !this._resolved && this._parseSlots(), this._connected = true;
    let e = this;
    for (; e = e && (e.parentNode || e.host); )
      if (e instanceof br) {
        this._parent = e;
        break;
      }
    this._instance || (this._resolved ? this._mount(this._def) : e && e._pendingResolve ? this._pendingResolve = e._pendingResolve.then(() => {
      this._pendingResolve = void 0, this._resolveDef();
    }) : this._resolveDef());
  }
  _setParent(e = this._parent) {
    e && (this._instance.parent = e._instance, this._inheritParentContext(e));
  }
  _inheritParentContext(e = this._parent) {
    e && this._app && Object.setPrototypeOf(
      this._app._context.provides,
      e._instance.provides
    );
  }
  disconnectedCallback() {
    this._connected = false, rr(() => {
      this._connected || (this._ob && (this._ob.disconnect(), this._ob = null), this._app && this._app.unmount(), this._instance && (this._instance.ce = void 0), this._app = this._instance = null, this._teleportTargets && (this._teleportTargets.clear(), this._teleportTargets = void 0));
    });
  }
  _processMutations(e) {
    for (const n of e)
      this._setAttr(n.attributeName);
  }
  /**
   * resolve inner component definition (handle possible async component)
   */
  _resolveDef() {
    if (this._pendingResolve)
      return;
    for (let o = 0; o < this.attributes.length; o++)
      this._setAttr(this.attributes[o].name);
    this._ob = new MutationObserver(this._processMutations.bind(this)), this._ob.observe(this, { attributes: true });
    const e = (o, r = false) => {
      this._resolved = true, this._pendingResolve = void 0;
      const { props: i, styles: s } = o;
      let a2;
      if (i && !D(i))
        for (const l in i) {
          const h = i[l];
          (h === Number || h && h.type === Number) && (l in this._props && (this._props[l] = kr(this._props[l])), (a2 || (a2 = /* @__PURE__ */ Object.create(null)))[st(l)] = true);
        }
      this._numberProps = a2, this._resolveProps(o), this.shadowRoot ? this._applyStyles(s) : lt.NODE_ENV !== "production" && s && zt(
        "Custom element style injection is not supported when using shadowRoot: false"
      ), this._mount(o);
    }, n = this._def.__asyncLoader;
    n ? this._pendingResolve = n().then((o) => {
      o.configureApp = this._def.configureApp, e(this._def = o, true);
    }) : e(this._def);
  }
  _mount(e) {
    lt.NODE_ENV !== "production" && !e.name && (e.name = "VueElement"), this._app = this._createApp(e), this._inheritParentContext(), e.configureApp && e.configureApp(this._app), this._app._ceVNode = this._createVNode(), this._app.mount(this._root);
    const n = this._instance && this._instance.exposed;
    if (n)
      for (const o in n)
        I(this, o) ? lt.NODE_ENV !== "production" && zt(`Exposed property "${o}" already exists on custom element.`) : Object.defineProperty(this, o, {
          // unwrap ref to be consistent with public instance behavior
          get: () => In(n[o])
        });
  }
  _resolveProps(e) {
    const { props: n } = e, o = D(n) ? n : Object.keys(n || {});
    for (const r of Object.keys(this))
      r[0] !== "_" && o.includes(r) && this._setProp(r, this[r]);
    for (const r of o.map(st))
      Object.defineProperty(this, r, {
        get() {
          return this._getProp(r);
        },
        set(i) {
          this._setProp(r, i, true, !this._patching);
        }
      });
  }
  _setAttr(e) {
    if (e.startsWith("data-v-")) return;
    const n = this.hasAttribute(e);
    let o = n ? this.getAttribute(e) : ui;
    const r = st(e);
    n && this._numberProps && this._numberProps[r] && (o = kr(o)), this._setProp(r, o, false, true);
  }
  /**
   * @internal
   */
  _getProp(e) {
    return this._props[e];
  }
  /**
   * @internal
   */
  _setProp(e, n, o = true, r = false) {
    if (n !== this._props[e] && (this._dirty = true, n === ui ? delete this._props[e] : (this._props[e] = n, e === "key" && this._app && (this._app._ceVNode.key = n)), r && this._instance && this._update(), o)) {
      const i = this._ob;
      i && (this._processMutations(i.takeRecords()), i.disconnect()), n === true ? this.setAttribute(kt(e), "") : typeof n == "string" || typeof n == "number" ? this.setAttribute(kt(e), n + "") : n || this.removeAttribute(kt(e)), i && i.observe(this, { attributes: true });
    }
  }
  _update() {
    const e = this._createVNode();
    this._app && (e.appContext = this._app._context), ql(e, this._root);
  }
  _createVNode() {
    const e = {};
    this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
    const n = bt(this._def, X(e, this._props));
    return this._instance || (n.ce = (o) => {
      this._instance = o, o.ce = this, o.isCE = true, lt.NODE_ENV !== "production" && (o.ceReload = (i) => {
        this._styles && (this._styles.forEach((s) => this._root.removeChild(s)), this._styles.length = 0), this._applyStyles(i), this._instance = null, this._update();
      });
      const r = (i, s) => {
        this.dispatchEvent(
          new CustomEvent(
            i,
            Jn(s[0]) ? X({ detail: s }, s[0]) : { detail: s }
          )
        );
      };
      o.emit = (i, ...s) => {
        r(i, s), kt(i) !== i && r(kt(i), s);
      }, this._setParent();
    }), n;
  }
  _applyStyles(e, n) {
    if (!e) return;
    if (n) {
      if (n === this._def || this._styleChildren.has(n))
        return;
      this._styleChildren.add(n);
    }
    const o = this._nonce;
    for (let r = e.length - 1; r >= 0; r--) {
      const i = document.createElement("style");
      if (o && i.setAttribute("nonce", o), i.textContent = e[r], this.shadowRoot.prepend(i), lt.NODE_ENV !== "production")
        if (n) {
          if (n.__hmrId) {
            this._childStyles || (this._childStyles = /* @__PURE__ */ new Map());
            let s = this._childStyles.get(n.__hmrId);
            s || this._childStyles.set(n.__hmrId, s = []), s.push(i);
          }
        } else
          (this._styles || (this._styles = [])).push(i);
    }
  }
  /**
   * Only called when shadowRoot is false
   */
  _parseSlots() {
    const e = this._slots = {};
    let n;
    for (; n = this.firstChild; ) {
      const o = n.nodeType === 1 && n.getAttribute("slot") || "default";
      (e[o] || (e[o] = [])).push(n), this.removeChild(n);
    }
  }
  /**
   * Only called when shadowRoot is false
   */
  _renderSlots() {
    const e = this._getSlots(), n = this._instance.type.__scopeId;
    for (let o = 0; o < e.length; o++) {
      const r = e[o], i = r.getAttribute("name") || "default", s = this._slots[i], a2 = r.parentNode;
      if (s)
        for (const l of s) {
          if (n && l.nodeType === 1) {
            const h = n + "-s", f = document.createTreeWalker(l, 1);
            l.setAttribute(h, "");
            let p;
            for (; p = f.nextNode(); )
              p.setAttribute(h, "");
          }
          a2.insertBefore(l, r);
        }
      else
        for (; r.firstChild; ) a2.insertBefore(r.firstChild, r);
      a2.removeChild(r);
    }
  }
  /**
   * @internal
   */
  _getSlots() {
    const e = [this];
    this._teleportTargets && e.push(...this._teleportTargets);
    const n = /* @__PURE__ */ new Set();
    for (const o of e) {
      const r = o.querySelectorAll("slot");
      for (let i = 0; i < r.length; i++)
        n.add(r[i]);
    }
    return Array.from(n);
  }
  /**
   * @internal
   */
  _injectChildStyle(e) {
    this._applyStyles(e.styles, e);
  }
  /**
   * @internal
   */
  _beginPatch() {
    this._patching = true, this._dirty = false;
  }
  /**
   * @internal
   */
  _endPatch() {
    this._patching = false, this._dirty && this._instance && this._update();
  }
  /**
   * @internal
   */
  _removeChildStyle(e) {
    if (lt.NODE_ENV !== "production" && (this._styleChildren.delete(e), this._childStyles && e.__hmrId)) {
      const n = this._childStyles.get(e.__hmrId);
      n && (n.forEach((o) => this._root.removeChild(o)), n.length = 0);
    }
  }
}
const qn = (t) => {
  const e = t.props["onUpdate:modelValue"] || false;
  return D(e) ? (n) => Ve(e, n) : e;
};
function Hl(t) {
  t.target.composing = true;
}
function li(t) {
  const e = t.target;
  e.composing && (e.composing = false, e.dispatchEvent(new Event("input")));
}
const Ie = /* @__PURE__ */ Symbol("_assign");
function ci(t, e, n) {
  return e && (t = t.trim()), n && (t = Yo(t)), t;
}
const ln = {
  created(t, { modifiers: { lazy: e, trim: n, number: o } }, r) {
    t[Ie] = qn(r);
    const i = o || r.props && r.props.type === "number";
    ye(t, e ? "change" : "input", (s) => {
      s.target.composing || t[Ie](ci(t.value, n, i));
    }), (n || i) && ye(t, "change", () => {
      t.value = ci(t.value, n, i);
    }), e || (ye(t, "compositionstart", Hl), ye(t, "compositionend", li), ye(t, "change", li));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(t, { value: e }) {
    t.value = e ?? "";
  },
  beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: o, trim: r, number: i } }, s) {
    if (t[Ie] = qn(s), t.composing) return;
    const a2 = (i || t.type === "number") && !/^0\d/.test(t.value) ? Yo(t.value) : t.value, l = e ?? "";
    a2 !== l && (document.activeElement === t && t.type !== "range" && (o && e === n || r && t.value.trim() === l) || (t.value = l));
  }
}, Bl = {
  // #4096 array checkboxes need to be deep traversed
  deep: true,
  created(t, e, n) {
    t[Ie] = qn(n), ye(t, "change", () => {
      const o = t._modelValue, r = Kl(t), i = t.checked, s = t[Ie];
      if (D(o)) {
        const a2 = Ei(o, r), l = a2 !== -1;
        if (i && !l)
          s(o.concat(r));
        else if (!i && l) {
          const h = [...o];
          h.splice(a2, 1), s(h);
        }
      } else if (Gn(o)) {
        const a2 = new Set(o);
        i ? a2.add(r) : a2.delete(r), s(a2);
      } else
        s(js(t, i));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: pi,
  beforeUpdate(t, e, n) {
    t[Ie] = qn(n), pi(t, e, n);
  }
};
function pi(t, { value: e, oldValue: n }, o) {
  t._modelValue = e;
  let r;
  if (D(e))
    r = Ei(e, o.props.value) > -1;
  else if (Gn(e))
    r = e.has(o.props.value);
  else {
    if (e === n) return;
    r = Xn(e, js(t, true));
  }
  t.checked !== r && (t.checked = r);
}
function Kl(t) {
  return "_value" in t ? t._value : t.value;
}
function js(t, e) {
  const n = e ? "_trueValue" : "_falseValue";
  return n in t ? t[n] : e;
}
const Wl = /* @__PURE__ */ X({ patchProp: Rl }, El);
let fi;
function $s() {
  return fi || (fi = Qu(Wl));
}
const ql = ((...t) => {
  $s().render(...t);
}), di = ((...t) => {
  const e = $s().createApp(...t);
  lt.NODE_ENV !== "production" && (Jl(e), Yl(e));
  const { mount: n } = e;
  return e.mount = (o) => {
    const r = Xl(o);
    if (!r) return;
    const i = e._component;
    !T(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const s = n(r, false, Gl(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), s;
  }, e;
});
function Gl(t) {
  if (t instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement)
    return "mathml";
}
function Jl(t) {
  Object.defineProperty(t.config, "isNativeTag", {
    value: (e) => Qs(e) || ta(e) || ea(e),
    writable: false
  });
}
function Yl(t) {
  {
    const e = t.config.isCustomElement;
    Object.defineProperty(t.config, "isCustomElement", {
      get() {
        return e;
      },
      set() {
        zt(
          "The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead."
        );
      }
    });
    const n = t.config.compilerOptions, o = 'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc';
    Object.defineProperty(t.config, "compilerOptions", {
      get() {
        return zt(o), n;
      },
      set() {
        zt(o);
      }
    });
  }
}
function Xl(t) {
  if (J(t)) {
    const e = document.querySelector(t);
    return lt.NODE_ENV !== "production" && !e && zt(
      `Failed to mount app: mount target selector "${t}" returned null.`
    ), e;
  }
  return lt.NODE_ENV !== "production" && window.ShadowRoot && t instanceof window.ShadowRoot && t.mode === "closed" && zt(
    'mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs'
  ), t;
}
var Zl = {};
function Ql() {
  xl();
}
Zl.NODE_ENV !== "production" && Ql();
const tc = {
  key: 0,
  class: "uno-7liy0l"
}, ec = /* @__PURE__ */ Ct({
  __name: "badge",
  props: {
    state: { type: null },
    group: { type: Object }
  },
  setup(t) {
    var _a3, _b2;
    const e = t, n = St(() => e.group.content[0]);
    function o(s) {
      return St(() => new Function("state", `${s}`)(e.state));
    }
    const r = o(((_a3 = n.value) == null ? void 0 : _a3.vif) || ""), i = o(((_b2 = n.value) == null ? void 0 : _b2.text) || "");
    return (s, a2) => In(r) ? (W(), Z("span", tc, dn(In(i)), 1)) : Ne("", true);
  }
}), nc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[data-theme=dark] .uno-7liy0l{--un-text-opacity:1 !important;color:rgb(203 213 225 / var(--un-text-opacity))!important;--un-border-opacity:1 !important;border-color:#3f3f46!important;--un-bg-opacity:1 !important;background-color:#374151!important}.uno-7liy0l{padding:4px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;font-weight:600!important;--un-bg-opacity:1 !important;background-color:#000!important;--un-text-opacity:1 !important;color:#fff!important;--un-border-opacity:1 !important;border-color:#3f3f46!important;border-width:2px!important;font-size:12px!important;line-height:16px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', at = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [o, r] of e)
    n[o] = r;
  return n;
}, oc = /* @__PURE__ */ at(ec, [["styles", [nc]]]), rc = {}, ic = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
};
function sc(t, e) {
  return W(), Z("svg", ic, [...e[0] || (e[0] = [
    Q("path", {
      fill: "none",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M5 12h14"
    }, null, -1)
  ])]);
}
const ac = /* @__PURE__ */ at(rc, [["render", sc]]), uc = {}, lc = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
};
function cc(t, e) {
  return W(), Z("svg", lc, [...e[0] || (e[0] = [
    Q("g", {
      fill: "none",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2"
    }, [
      Q("circle", {
        cx: "12",
        cy: "12",
        r: "4"
      }),
      Q("path", { d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })
    ], -1)
  ])]);
}
const pc = /* @__PURE__ */ at(uc, [["render", cc]]), fc = { class: "uno-r5eg4i" }, dc = { class: "uno-bzl8yv" }, hc = { class: "uno-0qwcsd" }, gc = /* @__PURE__ */ Ct({
  __name: "header",
  props: {
    state: { type: null },
    scheme: { type: Array }
  },
  setup(t) {
    const e = t, n = St(() => e.scheme.find((o) => o.title === "Badge"));
    return (o, r) => (W(), Z("div", fc, [
      Q("div", dc, [
        n.value ? (W(), Le(oc, {
          key: 0,
          state: e.state,
          group: n.value
        }, null, 8, ["state", "group"])) : Ne("", true),
        r[2] || (r[2] = Q("span", { class: "uno-sol10l" }, "Config", -1))
      ]),
      Q("div", hc, [
        bt(pc, {
          class: "uno-nm789l",
          onClick: r[0] || (r[0] = (i) => e.state.darkmode = !e.state.darkmode)
        }),
        bt(ac, {
          class: "uno-nm789l",
          onClick: r[1] || (r[1] = (i) => e.state.collapsed = !e.state.collapsed)
        })
      ])
    ]));
  }
}), bc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[data-theme=dark] .uno-r5eg4i{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important;--un-bg-opacity:1 !important;background-color:#27272a!important}.uno-r5eg4i:hover{--un-bg-opacity:1 !important;background-color:rgb(229 231 235 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-r5eg4i:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-nm789l:hover{--un-text-opacity:1 !important;color:rgb(107 114 128 / var(--un-text-opacity))!important}.uno-0qwcsd{display:flex!important;gap:8px!important}.uno-bzl8yv{display:flex!important;align-items:center!important;gap:8px!important}.uno-r5eg4i{display:flex!important;align-items:center!important;justify-content:space-between!important;-webkit-user-select:none!important;user-select:none!important;padding:8px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;--un-border-opacity:1 !important;border-color:#000!important;--un-bg-opacity:1 !important;background-color:#fff!important;font-size:18px!important;line-height:28px!important;border-bottom-width:2px!important}.uno-nm789l{cursor:pointer!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;font-size:18px!important;line-height:28px!important}.uno-sol10l{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;letter-spacing:.1em!important;font-weight:500!important;font-size:16px!important;line-height:24px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', mc = /* @__PURE__ */ at(gc, [["styles", [bc]]]), yc = {}, _c = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
};
function xc(t, e) {
  return W(), Z("svg", _c, [...e[0] || (e[0] = [
    Q("path", {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "2",
      d: "m6 9l6 6l6-6"
    }, null, -1)
  ])]);
}
const vc = /* @__PURE__ */ at(yc, [["render", xc]]), wc = {}, Ec = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
};
function kc(t, e) {
  return W(), Z("svg", Ec, [...e[0] || (e[0] = [
    Q("path", {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "2",
      d: "m18 15l-6-6l-6 6"
    }, null, -1)
  ])]);
}
const Nc = /* @__PURE__ */ at(wc, [["render", kc]]), Oc = /* @__PURE__ */ Ct({
  __name: "chevron",
  props: {
    collapsed: { type: Boolean }
  },
  setup(t) {
    const e = t, n = St(() => e.collapsed ? vc : Nc);
    return (o, r) => (W(), Le(as(n.value), { class: "uno-iyw1ix text---muted-foreground" }));
  }
}), Sc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-iyw1ix{font-size:14px!important;line-height:20px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', Cc = /* @__PURE__ */ at(Oc, [["styles", [Sc]]]), Dc = { class: "uno-e7a42m" }, zc = /* @__PURE__ */ Ct({
  __name: "button",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t;
    return (n, o) => (W(), Z("div", Dc, [
      Q("button", {
        onClick: o[0] || (o[0] = //@ts-ignore
        (...r) => e.element.callback && e.element.callback(...r)),
        class: "uno-ylxvnf"
      }, dn(e.element.name), 1)
    ]));
  }
}), Vc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[data-theme=dark] .uno-ylxvnf{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important;--un-border-opacity:1 !important;border-color:#27272a!important}[data-theme=dark] .uno-ylxvnf:hover{--un-bg-opacity:1 !important;background-color:rgb(107 114 128 / var(--un-bg-opacity))!important}.uno-ylxvnf{box-sizing:border-box!important;cursor:pointer!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;width:100%!important;padding:2px!important;--un-border-opacity:1 !important;border-color:#000!important;--un-bg-opacity:1 !important;background-color:#fff!important;font-weight:500!important;border-width:2px!important;font-size:14px!important;line-height:20px!important}.uno-e7a42m{grid-column:1/-1!important}.uno-ylxvnf:hover{--un-bg-opacity:1 !important;background-color:#000!important;--un-text-opacity:1 !important;color:#fff!important}.left-0{left:0!important}.top-0{top:0!important}.hover\\:shadow-\\[0px_0px_0px_0px_rgba\\(0\\,0\\,0\\,1\\)\\]:hover{--un-shadow:0px 0px 0px 0px var(--un-shadow-color, rgba(0, 0, 0, 1)) !important;box-shadow:var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}.shadow-\\[2px_2px_0px_0px_rgba\\(0\\,0\\,0\\,1\\)\\]{--un-shadow:2px 2px 0px 0px 1) !important;box-shadow:1,1,1!important}', Mc = /* @__PURE__ */ at(zc, [["styles", [Vc]]]), Tc = {}, jc = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
};
function $c(t, e) {
  return W(), Z("svg", jc, [...e[0] || (e[0] = [
    Q("path", {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "2",
      d: "M20 6L9 17l-5-5"
    }, null, -1)
  ])]);
}
const Ac = /* @__PURE__ */ at(Tc, [["render", $c]]), Ic = { class: "uno-g3pt2q" }, Pc = { class: "uno-7ar3e0" }, Rc = /* @__PURE__ */ Ct({
  __name: "input-checkbox",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t, n = St(() => e.element.name);
    return (o, r) => (W(), Z("label", Ic, [
      Re(Q("input", {
        type: "checkbox",
        "onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
        class: "peer sr-only"
      }, null, 512), [
        [Bl, e.state[n.value]]
      ]),
      Q("span", Pc, [
        e.state[n.value] ? (W(), Le(Ac, {
          key: 0,
          class: "uno-44ork4"
        })) : Ne("", true)
      ])
    ]));
  }
}), Fc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.peer:checked~.uno-44ork4{display:block!important}.uno-7ar3e0{display:flex!important;box-sizing:border-box!important;align-items:center!important;justify-content:center!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;height:20px!important;width:20px!important;--un-border-opacity:1 !important;border-color:#000!important;border-width:2px!important}.uno-g3pt2q{cursor:pointer!important;align-items:center!important;display:inline-flex!important;position:relative!important}.uno-44ork4{--un-text-opacity:1 !important;color:#000!important;stroke-width:2px!important;font-size:14px!important;line-height:20px!important}.peer:checked~.uno-7ar3e0{--un-bg-opacity:1 !important;background-color:#000!important}[data-theme=dark] .peer:checked~.uno-7ar3e0{--un-bg-opacity:1 !important;background-color:#374151!important}.left-0{left:0!important}.top-0{top:0!important}.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border-width:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', Lc = /* @__PURE__ */ at(Rc, [["styles", [Fc]]]), Uc = ["placeholder", "min", "max", "step"], Hc = /* @__PURE__ */ Ct({
  __name: "input-number",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t, n = St(() => e.element.name);
    return (o, r) => Re((W(), Z("input", {
      type: "number",
      "onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
      class: "uno-dzm8ko",
      placeholder: e.element.placeholder || "",
      min: e.element.min || "",
      max: e.element.max || "",
      step: e.element.step || ""
    }, null, 8, Uc)), [
      [ln, e.state[n.value]]
    ]);
  }
}), Bc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[data-theme=dark] .uno-dzm8ko:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-dzm8ko:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-dzm8ko{--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important;--un-bg-opacity:1 !important;background-color:#3f3f46!important}[data-theme=dark] .uno-dzm8ko:focus{--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important;--un-bg-opacity:1 !important;background-color:#3f3f46!important}.uno-dzm8ko{box-sizing:border-box!important;padding:4px!important;width:100%!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;--un-border-opacity:1 !important;border-color:#000!important;border-width:2px!important;font-size:14px!important;line-height:20px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', Kc = /* @__PURE__ */ at(Hc, [["styles", [Bc]]]), Wc = { class: "uno-c9kunu" }, qc = /* @__PURE__ */ Ct({
  __name: "input-range",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t, n = St(() => e.element.name);
    return (o, r) => (W(), Z("div", Wc, [
      Re(Q("input", {
        type: "range",
        min: "0",
        max: "100",
        "onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
        style: { width: "calc(100% - 30px)" },
        oninput: "this.nextElementSibling.value = this.value"
      }, null, 512), [
        [ln, e.state[n.value]]
      ]),
      Re(Q("input", {
        type: "number",
        "onUpdate:modelValue": r[1] || (r[1] = (i) => e.state[n.value] = i),
        class: "uno-56kyll",
        oninput: "this.previousElementSibling.value = this.value"
      }, null, 512), [
        [ln, e.state[n.value]]
      ])
    ]));
  }
}), Gc = "input[type=range][data-v-324fa701]{-webkit-appearance:none;appearance:none;height:5px;background:#000;cursor:pointer}input[type=range][data-v-324fa701]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;background:#000;border:2px solid black;cursor:pointer}input[type=range][data-v-324fa701]::-moz-range-thumb{width:13px;height:13px;background:#000;border:none;border-radius:0;cursor:pointer}input[type=number][data-v-324fa701]::-webkit-inner-spin-button{-webkit-appearance:none}", Jc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[data-theme=dark] .uno-56kyll:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-56kyll:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-56kyll{--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important;--un-bg-opacity:1 !important;background-color:#3f3f46!important}[data-theme=dark] .uno-56kyll:focus{--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important;--un-bg-opacity:1 !important;background-color:#3f3f46!important}.uno-c9kunu{display:flex!important;align-items:center!important;gap:4px!important}.uno-56kyll{box-sizing:border-box!important;text-align:center!important;padding:4px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;width:80px!important;--un-border-opacity:1 !important;border-color:#000!important;--un-bg-opacity:1 !important;background-color:#fff!important;border-width:2px!important;font-size:14px!important;line-height:20px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}.border{border-width:1px!important}', Yc = /* @__PURE__ */ at(qc, [["styles", [Gc, Jc]], ["__scopeId", "data-v-324fa701"]]), Xc = ["placeholder"], Zc = /* @__PURE__ */ Ct({
  __name: "input-text",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t, n = St(() => e.element.name);
    return (o, r) => Re((W(), Z("input", {
      type: "text",
      "onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
      class: "uno-dqkii9",
      placeholder: e.element.placeholder || ""
    }, null, 8, Xc)), [
      [ln, e.state[n.value]]
    ]);
  }
}), Qc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-dqkii9:hover{--un-bg-opacity:1 !important;background-color:rgb(243 244 246 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-dqkii9:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-dqkii9:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-dqkii9{--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important;--un-bg-opacity:1 !important;background-color:#3f3f46!important}[data-theme=dark] .uno-dqkii9:focus{--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important;--un-bg-opacity:1 !important;background-color:#3f3f46!important}.uno-dqkii9{box-sizing:border-box!important;padding:4px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;width:100%!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;--un-border-opacity:1 !important;border-color:#000!important;--un-bg-opacity:1 !important;background-color:#fff!important;border-width:2px!important;font-size:14px!important;line-height:20px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', tp = /* @__PURE__ */ at(Zc, [["styles", [Qc]]]), ep = { class: "uno-qryapb" }, np = {
  key: 0,
  class: "uno-bqvokc"
}, op = ["onUpdate:modelValue", "onInput", "onKeydown", "onBlur"], rp = /* @__PURE__ */ Ct({
  __name: "input-time",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t, n = {
      h: { max: 99, value: Ce("00"), inputRef: Ce() },
      m: { max: 59, value: Ce("00"), inputRef: Ce() },
      s: { max: 59, value: Ce("00"), inputRef: Ce() }
    }, o = Object.keys(n), r = (h) => String(h).padStart(2, "0"), i = St({
      get: () => {
        const h = parseInt(n.h.value.value) || 0, f = parseInt(n.m.value.value) || 0, p = parseInt(n.s.value.value) || 0;
        return h * 3600 + f * 60 + p;
      },
      set: (h) => {
        const f = Math.floor(h / 3600), p = Math.floor(h % 3600 / 60), b2 = h % 60;
        n.h.value.value = r(f), n.m.value.value = r(p), n.s.value.value = r(b2);
      }
    });
    $e(
      () => e.state[e.element.name],
      (h) => {
        typeof h == "number" && h !== i.value && (i.value = h);
      },
      { immediate: true }
    );
    const s = (h, f, p) => {
      let v2 = h.target.value.replace(/\D/g, "");
      v2.length > 2 && (v2 = v2.slice(-2)), parseInt(v2) > n[f].max && (v2 = n[f].max.toString()), n[f].value.value = v2, e.state[e.element.name] = i.value, v2.length === 2 && p < o.length - 1 && rr(() => {
        var _a3;
        (_a3 = n[f === "h" ? "m" : "s"].inputRef.value) == null ? void 0 : _a3.focus();
      });
    }, a2 = (h) => {
      n[h].value.value = r(n[h].value.value || 0);
    }, l = (h, f) => {
      var _a3;
      h.key === "Backspace" && (h.preventDefault(), n[f].value.value = "00", (_a3 = n[f === "s" ? "m" : "h"].inputRef.value) == null ? void 0 : _a3.focus());
    };
    return (h, f) => (W(), Z("div", ep, [
      (W(), Z(ct, null, lr(n, (p, b2, v2) => (W(), Z(ct, { key: b2 }, [
        v2 > 0 ? (W(), Z("span", np, ":")) : Ne("", true),
        Re(Q("input", {
          ref_for: true,
          ref: (C2) => p.inputRef.value = C2,
          "onUpdate:modelValue": (C2) => p.value.value = C2,
          type: "text",
          placeholder: "00",
          class: "uno-z921r7",
          onInput: (C2) => s(C2, b2, v2),
          onKeydown: (C2) => l(C2, b2),
          onBlur: (C2) => a2(b2)
        }, null, 40, op), [
          [ln, p.value.value]
        ])
      ], 64))), 64))
    ]));
  }
}), ip = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-qryapb:focus-within{--un-border-opacity:1 !important;border-color:rgb(107 114 128 / var(--un-border-opacity))!important;--un-ring-width:1px !important;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color) !important;--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color) !important;box-shadow:var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)!important}[data-theme=dark] .uno-z921r7{background-color:transparent!important;--un-text-opacity:1 !important;color:rgb(203 213 225 / var(--un-text-opacity))!important}.uno-z921r7:focus{background-color:transparent!important;outline:2px solid transparent!important;outline-offset:2px!important}.uno-qryapb{display:flex!important;box-sizing:border-box!important;justify-content:center!important;padding:2px!important;width:136px!important;transition-property:all!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;--un-border-opacity:1 !important;border-color:#000!important;--un-bg-opacity:1 !important;background-color:#fff!important;border-width:2px!important;font-size:14px!important;line-height:20px!important}.uno-bqvokc{-webkit-user-select:none!important;user-select:none!important;margin-left:2px!important;margin-right:2px!important;--un-text-opacity:1 !important;color:#94a3b8!important;font-weight:700!important}.uno-z921r7{text-align:center!important;width:28px!important}[data-theme=dark] .uno-qryapb{--un-bg-opacity:1 !important;background-color:#374151!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', sp = /* @__PURE__ */ at(rp, [["styles", [ip]]]), ap = { class: "uno-4jm9gl" }, up = /* @__PURE__ */ Ct({
  __name: "section-element",
  props: {
    state: { type: null },
    element: { type: Object }
  },
  setup(t) {
    const e = t, n = {
      text: tp,
      number: Kc,
      time: sp,
      checkbox: Lc,
      button: Mc,
      range: Yc
    }, o = St(() => n[e.element.type]);
    return (r, i) => (W(), Z(ct, null, [
      Q("label", ap, dn(e.element.label), 1),
      (W(), Le(as(o.value), {
        element: e.element,
        state: e.state
      }, null, 8, ["element", "state"]))
    ], 64));
  }
}), lp = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-4jm9gl{justify-self:start!important;text-align:left!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', cp = /* @__PURE__ */ at(up, [["styles", [lp]]]), pp = { class: "uno-cz9i6p" }, fp = { class: "uno-hx8m6u text-mono" }, dp = { class: "uno-3o9hie" }, hp = /* @__PURE__ */ Ct({
  __name: "section",
  props: {
    state: { type: null },
    group: { type: Object }
  },
  setup(t) {
    const e = t;
    function n() {
      e.state[e.group.id] = !e.state[e.group.id];
    }
    const o = St(() => !!e.state[e.group.id]);
    return (r, i) => (W(), Z("div", pp, [
      Q("div", {
        onClick: n,
        class: "uno-ux4grt"
      }, [
        bt(Cc, {
          collapsed: !o.value
        }, null, 8, ["collapsed"]),
        Q("span", fp, dn(e.group.title), 1)
      ]),
      o.value ? Ne("", true) : (W(true), Z(ct, { key: 0 }, lr(e.group.content, (s) => (W(), Z("div", dp, [
        bt(cp, {
          state: e.state,
          element: s
        }, null, 8, ["state", "element"])
      ]))), 256))
    ]));
  }
}), gp = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-cz9i6p:last-child{margin-bottom:0!important}[data-theme=dark] .uno-3o9hie,[data-theme=dark] .uno-cz9i6p,[data-theme=dark] .uno-ux4grt{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important;--un-bg-opacity:1 !important;background-color:#27272a!important}[data-theme=dark] .uno-cz9i6p:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-ux4grt:hover{--un-bg-opacity:1 !important;background-color:rgb(229 231 235 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-ux4grt:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-ux4grt{display:flex!important;cursor:pointer!important;align-items:center!important;padding:4px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;gap:4px!important;--un-border-opacity:1 !important;border-color:#000!important;--un-bg-opacity:1 !important;background-color:#f9fafb!important;border-bottom-width:2px!important}.uno-3o9hie{align-items:center!important;display:grid!important;padding:8px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;gap:8px!important;grid-template-columns:88px 1fr!important}.uno-cz9i6p>*{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;font-size:14px!important;line-height:20px!important}.uno-cz9i6p{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;margin-bottom:8px!important;--un-border-opacity:1 !important;border-color:#000!important;border-width:2px!important}.uno-hx8m6u{font-weight:500!important;font-size:14px!important;line-height:20px!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}', bp = /* @__PURE__ */ at(hp, [["styles", [gp]]]), mp = ["data-theme"], yp = { class: "uno-d1cunv" }, _p = {
  key: 0,
  class: "uno-fsiqeh"
}, xp = /* @__PURE__ */ Ct({
  __name: "app",
  props: {
    state: { type: null },
    scheme: { type: Array }
  },
  setup(t) {
    const e = t, n = St(() => e.scheme.filter((o) => o.title !== "Badge"));
    return (o, r) => e.state.enabled ? (W(), Z("div", {
      key: 0,
      id: "jabroni-app",
      "data-theme": e.state.darkmode ? "dark" : "bright",
      class: "fixed right-0 bottom-0 z-9999999"
    }, [
      Q("div", yp, [
        bt(mc, {
          state: e.state,
          scheme: e.scheme
        }, null, 8, ["state", "scheme"]),
        e.state.collapsed ? Ne("", true) : (W(), Z("div", _p, [
          (W(true), Z(ct, null, lr(n.value, (i) => (W(), Le(bp, {
            state: e.state,
            group: i
          }, null, 8, ["state", "group"]))), 256))
        ]))
      ])
    ], 8, mp)) : Ne("", true);
  }
}), vp = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[data-theme=dark] .uno-d1cunv{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important}[data-theme=dark] .uno-fsiqeh{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:#27272a!important}.uno-d1cunv{display:flex!important;flex-direction:column!important;width:340px!important;max-height:472px!important;margin:8px!important;--un-text-opacity:1 !important;color:#000!important;--un-border-opacity:1 !important;border-color:#000!important;border-width:2px!important;font-size:14px!important;line-height:20px!important}.uno-fsiqeh{flex:1 1 0%!important;overflow-y:auto!important;padding:8px!important;--un-bg-opacity:1 !important;background-color:#fff!important}.left-0{left:0!important}.top-0{top:0!important}.fixed{position:fixed!important}.right-0{right:0!important}.bottom-0{bottom:0!important}.z-9999999{z-index:9999999!important}', wp = /* @__PURE__ */ at(xp, [["styles", [vp]]]);
var Ro = function(t, e) {
  return Ro = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, o) {
    n.__proto__ = o;
  } || function(n, o) {
    for (var r in o) Object.prototype.hasOwnProperty.call(o, r) && (n[r] = o[r]);
  }, Ro(t, e);
};
function ao(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  Ro(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
function Fo(t) {
  var e = typeof Symbol == "function" && Symbol.iterator, n = e && t[e], o = 0;
  if (n) return n.call(t);
  if (t && typeof t.length == "number") return {
    next: function() {
      return t && o >= t.length && (t = void 0), { value: t && t[o++], done: !t };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Lo(t, e) {
  var n = typeof Symbol == "function" && t[Symbol.iterator];
  if (!n) return t;
  var o = n.call(t), r, i = [], s;
  try {
    for (; (e === void 0 || e-- > 0) && !(r = o.next()).done; ) i.push(r.value);
  } catch (a2) {
    s = { error: a2 };
  } finally {
    try {
      r && !r.done && (n = o.return) && n.call(o);
    } finally {
      if (s) throw s.error;
    }
  }
  return i;
}
function Uo(t, e, n) {
  if (arguments.length === 2) for (var o = 0, r = e.length, i; o < r; o++)
    (i || !(o in e)) && (i || (i = Array.prototype.slice.call(e, 0, o)), i[o] = e[o]);
  return t.concat(i || Array.prototype.slice.call(e));
}
function ne(t) {
  return typeof t == "function";
}
function As(t) {
  var e = function(o) {
    Error.call(o), o.stack = new Error().stack;
  }, n = t(e);
  return n.prototype = Object.create(Error.prototype), n.prototype.constructor = n, n;
}
var Eo = As(function(t) {
  return function(n) {
    t(this), this.message = n ? n.length + ` errors occurred during unsubscription:
` + n.map(function(o, r) {
      return r + 1 + ") " + o.toString();
    }).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = n;
  };
});
function Ho(t, e) {
  if (t) {
    var n = t.indexOf(e);
    0 <= n && t.splice(n, 1);
  }
}
var uo = (function() {
  function t(e) {
    this.initialTeardown = e, this.closed = false, this._parentage = null, this._finalizers = null;
  }
  return t.prototype.unsubscribe = function() {
    var e, n, o, r, i;
    if (!this.closed) {
      this.closed = true;
      var s = this._parentage;
      if (s)
        if (this._parentage = null, Array.isArray(s))
          try {
            for (var a2 = Fo(s), l = a2.next(); !l.done; l = a2.next()) {
              var h = l.value;
              h.remove(this);
            }
          } catch (S) {
            e = { error: S };
          } finally {
            try {
              l && !l.done && (n = a2.return) && n.call(a2);
            } finally {
              if (e) throw e.error;
            }
          }
        else
          s.remove(this);
      var f = this.initialTeardown;
      if (ne(f))
        try {
          f();
        } catch (S) {
          i = S instanceof Eo ? S.errors : [S];
        }
      var p = this._finalizers;
      if (p) {
        this._finalizers = null;
        try {
          for (var b2 = Fo(p), v2 = b2.next(); !v2.done; v2 = b2.next()) {
            var C2 = v2.value;
            try {
              hi(C2);
            } catch (S) {
              i = i ?? [], S instanceof Eo ? i = Uo(Uo([], Lo(i)), Lo(S.errors)) : i.push(S);
            }
          }
        } catch (S) {
          o = { error: S };
        } finally {
          try {
            v2 && !v2.done && (r = b2.return) && r.call(b2);
          } finally {
            if (o) throw o.error;
          }
        }
      }
      if (i)
        throw new Eo(i);
    }
  }, t.prototype.add = function(e) {
    var n;
    if (e && e !== this)
      if (this.closed)
        hi(e);
      else {
        if (e instanceof t) {
          if (e.closed || e._hasParent(this))
            return;
          e._addParent(this);
        }
        (this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(e);
      }
  }, t.prototype._hasParent = function(e) {
    var n = this._parentage;
    return n === e || Array.isArray(n) && n.includes(e);
  }, t.prototype._addParent = function(e) {
    var n = this._parentage;
    this._parentage = Array.isArray(n) ? (n.push(e), n) : n ? [n, e] : e;
  }, t.prototype._removeParent = function(e) {
    var n = this._parentage;
    n === e ? this._parentage = null : Array.isArray(n) && Ho(n, e);
  }, t.prototype.remove = function(e) {
    var n = this._finalizers;
    n && Ho(n, e), e instanceof t && e._removeParent(this);
  }, t.EMPTY = (function() {
    var e = new t();
    return e.closed = true, e;
  })(), t;
})(), Is = uo.EMPTY;
function Ps(t) {
  return t instanceof uo || t && "closed" in t && ne(t.remove) && ne(t.add) && ne(t.unsubscribe);
}
function hi(t) {
  ne(t) ? t() : t.unsubscribe();
}
var Ep = {
  Promise: void 0
}, kp = {
  setTimeout: function(t, e) {
    for (var n = [], o = 2; o < arguments.length; o++)
      n[o - 2] = arguments[o];
    return setTimeout.apply(void 0, Uo([t, e], Lo(n)));
  },
  clearTimeout: function(t) {
    return clearTimeout(t);
  },
  delegate: void 0
};
function Np(t) {
  kp.setTimeout(function() {
    throw t;
  });
}
function gi() {
}
function Tn(t) {
  t();
}
var Rs = (function(t) {
  ao(e, t);
  function e(n) {
    var o = t.call(this) || this;
    return o.isStopped = false, n ? (o.destination = n, Ps(n) && n.add(o)) : o.destination = Cp, o;
  }
  return e.create = function(n, o, r) {
    return new Bo(n, o, r);
  }, e.prototype.next = function(n) {
    this.isStopped || this._next(n);
  }, e.prototype.error = function(n) {
    this.isStopped || (this.isStopped = true, this._error(n));
  }, e.prototype.complete = function() {
    this.isStopped || (this.isStopped = true, this._complete());
  }, e.prototype.unsubscribe = function() {
    this.closed || (this.isStopped = true, t.prototype.unsubscribe.call(this), this.destination = null);
  }, e.prototype._next = function(n) {
    this.destination.next(n);
  }, e.prototype._error = function(n) {
    try {
      this.destination.error(n);
    } finally {
      this.unsubscribe();
    }
  }, e.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }, e;
})(uo), Op = (function() {
  function t(e) {
    this.partialObserver = e;
  }
  return t.prototype.next = function(e) {
    var n = this.partialObserver;
    if (n.next)
      try {
        n.next(e);
      } catch (o) {
        kn(o);
      }
  }, t.prototype.error = function(e) {
    var n = this.partialObserver;
    if (n.error)
      try {
        n.error(e);
      } catch (o) {
        kn(o);
      }
    else
      kn(e);
  }, t.prototype.complete = function() {
    var e = this.partialObserver;
    if (e.complete)
      try {
        e.complete();
      } catch (n) {
        kn(n);
      }
  }, t;
})(), Bo = (function(t) {
  ao(e, t);
  function e(n, o, r) {
    var i = t.call(this) || this, s;
    return ne(n) || !n ? s = {
      next: n ?? void 0,
      error: o ?? void 0,
      complete: r ?? void 0
    } : s = n, i.destination = new Op(s), i;
  }
  return e;
})(Rs);
function kn(t) {
  Np(t);
}
function Sp(t) {
  throw t;
}
var Cp = {
  closed: true,
  next: gi,
  error: Sp,
  complete: gi
}, Dp = (function() {
  return typeof Symbol == "function" && Symbol.observable || "@@observable";
})();
function zp(t) {
  return t;
}
function Vp(t) {
  return t.length === 0 ? zp : t.length === 1 ? t[0] : function(n) {
    return t.reduce(function(o, r) {
      return r(o);
    }, n);
  };
}
var bi = (function() {
  function t(e) {
    e && (this._subscribe = e);
  }
  return t.prototype.lift = function(e) {
    var n = new t();
    return n.source = this, n.operator = e, n;
  }, t.prototype.subscribe = function(e, n, o) {
    var r = this, i = Tp(e) ? e : new Bo(e, n, o);
    return Tn(function() {
      var s = r, a2 = s.operator, l = s.source;
      i.add(a2 ? a2.call(i, l) : l ? r._subscribe(i) : r._trySubscribe(i));
    }), i;
  }, t.prototype._trySubscribe = function(e) {
    try {
      return this._subscribe(e);
    } catch (n) {
      e.error(n);
    }
  }, t.prototype.forEach = function(e, n) {
    var o = this;
    return n = mi(n), new n(function(r, i) {
      var s = new Bo({
        next: function(a2) {
          try {
            e(a2);
          } catch (l) {
            i(l), s.unsubscribe();
          }
        },
        error: i,
        complete: r
      });
      o.subscribe(s);
    });
  }, t.prototype._subscribe = function(e) {
    var n;
    return (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(e);
  }, t.prototype[Dp] = function() {
    return this;
  }, t.prototype.pipe = function() {
    for (var e = [], n = 0; n < arguments.length; n++)
      e[n] = arguments[n];
    return Vp(e)(this);
  }, t.prototype.toPromise = function(e) {
    var n = this;
    return e = mi(e), new e(function(o, r) {
      var i;
      n.subscribe(function(s) {
        return i = s;
      }, function(s) {
        return r(s);
      }, function() {
        return o(i);
      });
    });
  }, t.create = function(e) {
    return new t(e);
  }, t;
})();
function mi(t) {
  var e;
  return (e = t ?? Ep.Promise) !== null && e !== void 0 ? e : Promise;
}
function Mp(t) {
  return t && ne(t.next) && ne(t.error) && ne(t.complete);
}
function Tp(t) {
  return t && t instanceof Rs || Mp(t) && Ps(t);
}
var jp = As(function(t) {
  return function() {
    t(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
  };
}), Ko = (function(t) {
  ao(e, t);
  function e() {
    var n = t.call(this) || this;
    return n.closed = false, n.currentObservers = null, n.observers = [], n.isStopped = false, n.hasError = false, n.thrownError = null, n;
  }
  return e.prototype.lift = function(n) {
    var o = new yi(this, this);
    return o.operator = n, o;
  }, e.prototype._throwIfClosed = function() {
    if (this.closed)
      throw new jp();
  }, e.prototype.next = function(n) {
    var o = this;
    Tn(function() {
      var r, i;
      if (o._throwIfClosed(), !o.isStopped) {
        o.currentObservers || (o.currentObservers = Array.from(o.observers));
        try {
          for (var s = Fo(o.currentObservers), a2 = s.next(); !a2.done; a2 = s.next()) {
            var l = a2.value;
            l.next(n);
          }
        } catch (h) {
          r = { error: h };
        } finally {
          try {
            a2 && !a2.done && (i = s.return) && i.call(s);
          } finally {
            if (r) throw r.error;
          }
        }
      }
    });
  }, e.prototype.error = function(n) {
    var o = this;
    Tn(function() {
      if (o._throwIfClosed(), !o.isStopped) {
        o.hasError = o.isStopped = true, o.thrownError = n;
        for (var r = o.observers; r.length; )
          r.shift().error(n);
      }
    });
  }, e.prototype.complete = function() {
    var n = this;
    Tn(function() {
      if (n._throwIfClosed(), !n.isStopped) {
        n.isStopped = true;
        for (var o = n.observers; o.length; )
          o.shift().complete();
      }
    });
  }, e.prototype.unsubscribe = function() {
    this.isStopped = this.closed = true, this.observers = this.currentObservers = null;
  }, Object.defineProperty(e.prototype, "observed", {
    get: function() {
      var n;
      return ((n = this.observers) === null || n === void 0 ? void 0 : n.length) > 0;
    },
    enumerable: false,
    configurable: true
  }), e.prototype._trySubscribe = function(n) {
    return this._throwIfClosed(), t.prototype._trySubscribe.call(this, n);
  }, e.prototype._subscribe = function(n) {
    return this._throwIfClosed(), this._checkFinalizedStatuses(n), this._innerSubscribe(n);
  }, e.prototype._innerSubscribe = function(n) {
    var o = this, r = this, i = r.hasError, s = r.isStopped, a2 = r.observers;
    return i || s ? Is : (this.currentObservers = null, a2.push(n), new uo(function() {
      o.currentObservers = null, Ho(a2, n);
    }));
  }, e.prototype._checkFinalizedStatuses = function(n) {
    var o = this, r = o.hasError, i = o.thrownError, s = o.isStopped;
    r ? n.error(i) : s && n.complete();
  }, e.prototype.asObservable = function() {
    var n = new bi();
    return n.source = this, n;
  }, e.create = function(n, o) {
    return new yi(n, o);
  }, e;
})(bi), yi = (function(t) {
  ao(e, t);
  function e(n, o) {
    var r = t.call(this) || this;
    return r.destination = n, r.source = o, r;
  }
  return e.prototype.next = function(n) {
    var o, r;
    (r = (o = this.destination) === null || o === void 0 ? void 0 : o.next) === null || r === void 0 || r.call(o, n);
  }, e.prototype.error = function(n) {
    var o, r;
    (r = (o = this.destination) === null || o === void 0 ? void 0 : o.error) === null || r === void 0 || r.call(o, n);
  }, e.prototype.complete = function() {
    var n, o;
    (o = (n = this.destination) === null || n === void 0 ? void 0 : n.complete) === null || o === void 0 || o.call(n);
  }, e.prototype._subscribe = function(n) {
    var o, r;
    return (r = (o = this.source) === null || o === void 0 ? void 0 : o.subscribe(n)) !== null && r !== void 0 ? r : Is;
  }, e;
})(Ko);
function $p(t, e) {
  const n = new Set(Object.getOwnPropertyNames(t)), o = new Set(Object.getOwnPropertyNames(e)), r = n.difference(o).values().toArray(), i = o.difference(n).values().toArray();
  return { d1: r, d2: i };
}
function Ap(t, e) {
  return ((n) => Number.isNaN(n) ? e : n)(parseInt(t));
}
const Ip = {
  enabled: true,
  collapsed: false,
  darkmode: true
}, Pp = "state_acephale";
class Rp {
  constructor(e, n = Pp) {
    __publicField(this, "state");
    __publicField(this, "watchStopHandler");
    __publicField(this, "setFromLocalStorage", () => {
      const e = localStorage.getItem(this.key);
      if (e !== null) {
        const n = JSON.parse(e);
        Object.assign(this.state, n);
      }
    });
    this.key = n, this.key = n, this.state = to(e), this.sync(), this.watchStopHandler = this.watchPersistence();
  }
  dispose() {
    this.watchStopHandler(), window.removeEventListener("focus", this.setFromLocalStorage), document.removeEventListener("visibilitychange", this.setFromLocalStorage);
  }
  sync() {
    this.setFromLocalStorage(), window.addEventListener("focus", this.setFromLocalStorage), document.addEventListener("visibilitychange", this.setFromLocalStorage);
  }
  watchPersistence() {
    return $e(
      this.state,
      () => {
        this.saveToLocalStorage();
      },
      { immediate: false, deep: true }
    );
  }
  get persistentOnly() {
    const e = Object.keys(this.state).filter(
      (o) => !o.startsWith("$")
    );
    return Object.assign(
      {},
      ...e.map((o) => ({ [o]: this.state[o] }))
    );
  }
  saveToLocalStorage() {
    localStorage.setItem(this.key, JSON.stringify(this.persistentOnly));
  }
}
class Fp {
  constructor(e) {
    __publicField(this, "state");
    __publicField(this, "stateSubject", new Ko());
    __publicField(this, "eventSubject", new Ko());
    const n = Object.assign({}, Ip, e);
    this.state = new Rp({}).state, this.parseState(n);
  }
  add(e, n, o, r) {
    return this.state[e] = e in this.state ? this.state[e] : n, $e(
      () => this.state[e],
      (i, s) => {
        r !== false && typeof n == "number" && (this.state[e] = Ap(i, s));
        const a2 = typeof o == "string" ? o : e;
        this.stateSubject.next({ [a2]: this.state[a2] });
      },
      { deep: true }
    ), this;
  }
  parseState(e) {
    Object.entries(e).forEach(([n, o]) => {
      typeof o == "object" ? this.add(n, o.value, o.watch) : this.add(n, o);
    });
  }
}
class Lp {
  constructor(e, n) {
    __publicField(this, "name");
    __publicField(this, "value");
    __publicField(this, "watch");
    __publicField(this, "step");
    __publicField(this, "min");
    __publicField(this, "max");
    __publicField(this, "vif");
    __publicField(this, "text");
    __publicField(this, "type", "div");
    __publicField(this, "label");
    __publicField(this, "placeholder");
    __publicField(this, "id");
    const { d2: o } = $p(this, e);
    Object.assign(this, e), this.parseModel(o), this.parseType(n), this.parseLabel(), this.id = this.name || window.crypto.randomUUID();
  }
  parseType(e) {
    if (this.type === "div")
      if (this.value !== void 0) {
        let n = typeof this.value;
        if (n === "time") return;
        n === "function" ? (n = "button", this.parseButton(e)) : n === "string" ? n = "text" : n === "number" ? (n = "number", this.parseNumber()) : n === "boolean" && (n = "checkbox"), this.type = n;
      } else this.text && (this.type = "span");
  }
  parseNumber() {
    this.min || this.max || this.step || (this.min = "0", this.step = "10");
  }
  parseLabel() {
    this.label !== void 0 || this.type === "button" || (this.label = this.name);
  }
  parseButton(e) {
    if (typeof this.value == "function") {
      this.type = "button";
      const n = this.value;
      this.value = () => {
        e.next(this.name), n();
      };
    } else this.type === "button" && (this.value = () => {
      e.next(this.name);
    });
  }
  parseModel(e) {
    if (this.name && this.value) return;
    const n = e[0];
    n && (this.name = n, this.value = this[n], delete this[n]);
  }
  get isInput() {
    return /checkbox|text|number/.test(this.type);
  }
  get htmlTag() {
    return this.isInput ? "input" : this.type;
  }
  get inputType() {
    return this.isInput ? this.type : "";
  }
  get callback() {
    return this.htmlTag === "button" ? this.value : void 0;
  }
}
class mr {
  constructor(e, n = new Fp({})) {
    __publicField(this, "parsedScheme");
    this.scheme = e, this.store = n, this.parsedScheme = this.parseScheme();
  }
  static parse(...e) {
    const { parsedScheme: n, store: o } = new mr(...e);
    return { scheme: n, store: o };
  }
  parseSchemeElement(e) {
    this.parseStatePropsFromModel(e), this.parseStatePropsFromExpressions(e.text), this.parseStatePropsFromExpressions(e.vif);
  }
  parseStatePropsFromModel(e) {
    const { name: n, value: o } = e;
    n === void 0 || o === void 0 || typeof o == "function" || (this.store.add(n, o), e.value = this.store.state[n]);
  }
  parseStatePropsFromExpressions(e) {
    var _a3;
    e && ((_a3 = e.match(/state\.\$?\w+/g)) == null ? void 0 : _a3.forEach((n) => {
      const o = n.replace("state.", "");
      this.store.add(o, "", void 0, false);
    }));
  }
  parseScheme() {
    const n = this.scheme.map(
      (o, r) => {
        const i = {
          content: [],
          collapsed: false,
          title: "",
          id: `section ${r}`
        };
        if (o.content) {
          const s = {
            ...i,
            ...o
          };
          return s.title.length > 0 && (s.id = s.title), this.store.add(s.id, s.collapsed), s;
        } else
          return this.store.add(i.id, i.collapsed), i;
      }
    ).map(
      (o) => {
        const { content: r, ...i } = o;
        return { content: r.map(
          (a2) => new Lp(a2, this.store.eventSubject)
        ), ...i };
      }
    );
    return n.forEach((o) => {
      o.content.forEach((r) => {
        this.parseSchemeElement(r);
      });
    }), n;
  }
}
class Hp {
  constructor(e, n) {
    __publicField(this, "element");
    const o = mr.parse(e, n);
    this.element = this.createCustomElement(), Object.assign(this.element, {
      state: n.state,
      scheme: o.scheme
    }), document.body.appendChild(this.element);
  }
  createCustomElement() {
    const e = "jabronio-widget", n = /* @__PURE__ */ Ll(wp);
    return customElements.get(e) || customElements.define(e, n), new n();
  }
  dispose() {
    this.element.remove();
  }
}
function Bp(t, e = []) {
  return t.filter((r) => !(typeof r == "string" && t.find((i) => typeof i != "string" && i.title === r))).map((r) => {
    if (typeof r == "string")
      return e.find((s) => s.title === r);
    const i = e.find(
      (s) => s.title === r.title
    );
    if (Array.isArray(r.content) && i) {
      const s = { ...i };
      return s.content = [
        ...s.content,
        ...r.content
      ], s;
    }
    return r;
  });
}
const DefaultScheme = [
  {
    title: "Text Filter",
    collapsed: true,
    content: [
      { filterExclude: false, label: "exclude" },
      {
        filterExcludeWords: "",
        label: "keywords",
        watch: "filterExclude",
        placeholder: "word, f:full_word, r:RegEx..."
      },
      { filterInclude: false, label: "include" },
      {
        filterIncludeWords: "",
        label: "keywords",
        watch: "filterInclude",
        placeholder: "word, f:full_word, r:RegEx..."
      }
    ]
  },
  {
    title: "Duration Filter",
    collapsed: true,
    content: [
      { filterDuration: false, label: "enable" },
      {
        filterDurationFrom: 0,
        watch: "filterDuration",
        label: "from",
        type: "time"
      },
      {
        filterDurationTo: 600,
        watch: "filterDuration",
        label: "to",
        type: "time"
      }
    ]
  },
  {
    title: "Sort By",
    content: [
      {
        "sort by views": () => {
        }
      },
      {
        "sort by duration": () => {
        }
      }
    ]
  },
  {
    title: "Privacy Filter",
    content: [
      { filterPrivate: false, label: "private" },
      { filterPublic: false, label: "public" },
      { "check access 🔓": () => {
      } }
    ]
  },
  {
    title: "Advanced",
    content: [
      {
        infiniteScrollEnabled: true,
        label: "infinite scroll"
      },
      {
        autoScroll: false,
        label: "auto scroll"
      },
      {
        delay: 250,
        label: "scroll delay"
      },
      {
        writeHistory: false,
        label: "write history"
      }
    ]
  },
  {
    title: "Badge",
    content: [
      {
        text: "return `${state.$paginationOffset}/${state.$paginationLast}`",
        vif: "return state.$paginationLast > 1"
      }
    ]
  }
];
const StoreStateDefault = {
  enabled: true,
  collapsed: false,
  darkmode: true,
  $paginationLast: 1,
  $paginationOffset: 1
};
class RulesGlobal {
  constructor(options) {
    __publicField(this, "delay");
    __publicField(this, "customGenerator");
    __publicField(this, "titleSelector");
    __publicField(this, "uploaderSelector");
    __publicField(this, "durationSelector");
    __publicField(this, "customThumbDataSelectors");
    __publicField(this, "getThumbDataStrategy", "default");
    __publicField(this, "getThumbDataCallback");
    __publicField(this, "getThumbImgDataAttrSelector");
    __publicField(this, "getThumbImgDataAttrDelete");
    __publicField(this, "getThumbImgDataStrategy", "default");
    __publicField(this, "containerSelector", ".container");
    __publicField(this, "containerSelectorLast");
    __publicField(this, "intersectionObservableSelector");
    __publicField(this, "thumbsSelector", ".thumb");
    __publicField(this, "getThumbsStrategy", "default");
    __publicField(this, "getThumbsTransform");
    __publicField(this, "paginationStrategyOptions", {});
    __publicField(this, "paginationStrategy");
    __publicField(this, "customDataSelectorFns", [
      "filterInclude",
      "filterExclude",
      "filterDuration"
    ]);
    __publicField(this, "animatePreview");
    __publicField(this, "storeOptions");
    __publicField(this, "schemeOptions", []);
    __publicField(this, "store");
    __publicField(this, "gui");
    __publicField(this, "dataManager");
    __publicField(this, "infiniteScroller");
    __publicField(this, "getPaginationData");
    __publicField(this, "gropeStrategy", "all-in-one");
    __publicField(this, "dataManagerOptions", {});
    __publicField(this, "mutationObservers", []);
    __publicField(this, "resetOnPaginationOrContainerDeath", true);
    __publicField(this, "onResetCallback");
    if (this.isEmbedded) throw Error("Embedded is not supported");
    Object.assign(this, options);
    this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
    this.store = this.createStore();
    this.gui = this.createGui();
    this.dataManager = this.setupDataManager();
    this.reset();
  }
  getThumbUrl(thumb) {
    return (thumb.querySelector("a[href]") || thumb).href;
  }
  getThumbData(thumb) {
    var _a3, _b2;
    let { titleSelector, uploaderSelector, durationSelector } = this;
    const thumbData = { title: "" };
    if (this.getThumbDataStrategy === "auto-text") {
      const text = sanitizeStr(thumb.innerText);
      thumbData.title = text;
      thumbData.duration = timeToSeconds(((_a3 = text.match(/\d+m|\d+:\d+/)) == null ? void 0 : _a3[0]) || "");
      return thumbData;
    }
    if (this.getThumbDataStrategy === "auto-select") {
      titleSelector = "[class *= title],[title]";
      durationSelector = "[class *= duration]";
      uploaderSelector = "[class *= uploader], [class *= user], [class *= name]";
    }
    if (this.getThumbDataStrategy === "auto-select") {
      const selected = querySelectorLast(thumb, titleSelector);
      if (selected) {
        thumbData.title = sanitizeStr(selected.innerText);
      } else {
        thumbData.title = sanitizeStr(thumb.innerText);
      }
    } else {
      thumbData.title = querySelectorText(thumb, titleSelector);
    }
    if (uploaderSelector) {
      const uploader = querySelectorText(thumb, uploaderSelector);
      thumbData.title = `${thumbData.title} user:${uploader}`;
    }
    if (durationSelector) {
      const duration = timeToSeconds(querySelectorText(thumb, durationSelector));
      thumbData.duration = duration;
    }
    (_b2 = this.getThumbDataCallback) == null ? void 0 : _b2.call(this, thumb, thumbData);
    function getCustomThumbData(selector, type) {
      if (type === "boolean") {
        return !!thumb.querySelector(selector);
      }
      if (type === "string") {
        return querySelectorText(thumb, selector);
      }
      return Number.parseInt(querySelectorText(thumb, selector));
    }
    if (this.customThumbDataSelectors) {
      Object.entries(this.customThumbDataSelectors).forEach(([name, x2]) => {
        const data = getCustomThumbData(x2.selector, x2.type);
        Object.assign(thumbData, { [name]: data });
      });
    }
    return thumbData;
  }
  getThumbImgData(thumb) {
    const result = {};
    if (this.getThumbImgDataStrategy === "auto") {
      const img = thumb.querySelector("img");
      if (!img) return {};
      result.img = img;
      if (typeof this.getThumbImgDataAttrSelector === "function") {
        result.imgSrc = this.getThumbImgDataAttrSelector(img);
      } else {
        const possibleAttrs = this.getThumbImgDataAttrSelector ? [this.getThumbImgDataAttrSelector].flat() : ["data-src", "src"];
        for (const attr of possibleAttrs) {
          const imgSrc = img.getAttribute(attr);
          if (imgSrc) {
            result.imgSrc = imgSrc;
            img.removeAttribute(attr);
            break;
          }
        }
      }
      if (this.getThumbImgDataAttrDelete) {
        if (this.getThumbImgDataAttrDelete === "auto") {
          removeClassesAndDataAttributes(img, "lazy");
        } else {
          if (this.getThumbImgDataAttrDelete.startsWith(".")) {
            img.classList.remove(this.getThumbImgDataAttrDelete.slice(1));
          } else {
            img.removeAttribute(this.getThumbImgDataAttrDelete);
          }
        }
        if (img.src.includes("data:image")) {
          result.img.src = "";
        }
        if (img.complete && img.naturalWidth > 0) {
          return {};
        }
      }
    }
    return result;
  }
  get intersectionObservable() {
    return this.intersectionObservableSelector && document.querySelector(this.intersectionObservableSelector);
  }
  get observable() {
    return this.intersectionObservable || this.paginationStrategy.getPaginationElement();
  }
  get container() {
    if (typeof this.containerSelectorLast === "string") {
      return querySelectorLast(document, this.containerSelectorLast);
    }
    if (typeof this.containerSelector === "string") {
      return document.querySelector(this.containerSelector);
    }
    return this.containerSelector();
  }
  getThumbs(html) {
    if (!html) return [];
    let thumbs;
    if (this.getThumbsStrategy === "auto") {
      if (typeof this.containerSelector !== "string") return [];
      const container = html.querySelector(this.containerSelector);
      thumbs = [...(container == null ? void 0 : container.children) || []];
    }
    thumbs = Array.from(html.querySelectorAll(this.thumbsSelector));
    if (typeof this.getThumbsTransform === "function") {
      thumbs.forEach(this.getThumbsTransform);
    }
    return thumbs;
  }
  createStore() {
    const config = { ...StoreStateDefault, ...this.storeOptions };
    this.store = new Fp(config);
    return this.store;
  }
  createGui() {
    const scheme = Bp(
      this.schemeOptions,
      DefaultScheme
    );
    this.gui = new Hp(scheme, this.store);
    return this.gui;
  }
  resetInfiniteScroller() {
    var _a3;
    (_a3 = this.infiniteScroller) == null ? void 0 : _a3.dispose();
    if (!this.paginationStrategy.hasPagination) return;
    this.infiniteScroller = InfiniteScroller.create(this);
  }
  gropeInit() {
    var _a3;
    if (!this.gropeStrategy) return;
    if (this.gropeStrategy === "all-in-one") {
      (_a3 = this.dataManager) == null ? void 0 : _a3.parseData(this.container, this.container);
    }
    if (this.gropeStrategy === "all-in-all") {
      getCommonParents(this.getThumbs(document.body)).forEach((c) => {
        this.dataManager.parseData(c, c, true);
      });
    }
  }
  get isEmbedded() {
    return window.self !== window.top;
  }
  setupStoreListeners() {
    const eventsMap = {
      "sort by duration": {
        action: (direction2) => this.dataManager.sortBy("duration", direction2)
      }
    };
    let lastEvent;
    let direction = true;
    this.store.eventSubject.subscribe((event) => {
      if (event === lastEvent) {
        direction = !direction;
      } else {
        lastEvent = event;
        direction = true;
      }
      if (event in eventsMap) {
        const ev = eventsMap[event];
        ev == null ? void 0 : ev.action(direction);
      }
    });
    this.store.stateSubject.subscribe((a2) => {
      this.dataManager.applyFilters(a2);
    });
  }
  setupDataManager() {
    this.dataManager = new DataManager(this);
    if (this.dataManagerOptions) {
      Object.assign(this.dataManager, this.dataManagerOptions);
    }
    return this.dataManager;
  }
  resetOn() {
    if (!this.resetOnPaginationOrContainerDeath) return;
    const observables = [
      this.container,
      this.intersectionObservable || this.paginationStrategy.getPaginationElement()
    ].filter(Boolean);
    if (observables.length === 0) return;
    observables.forEach((o) => {
      const observer = waitForElementToDisappear(o, () => {
        this.reset();
      });
      this.mutationObservers.push(observer);
    });
  }
  reset() {
    var _a3, _b2;
    this.mutationObservers.forEach((o) => {
      o.disconnect();
    });
    this.mutationObservers = [];
    this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
    this.setupDataManager();
    this.setupStoreListeners();
    this.resetInfiniteScroller();
    this.container && ((_a3 = this.animatePreview) == null ? void 0 : _a3.call(this, this.container));
    this.gropeInit();
    (_b2 = this.onResetCallback) == null ? void 0 : _b2.call(this);
    this.resetOn();
  }
}
export {
  DataManager,
  InfiniteScroller,
  LazyImgLoader,
  Observer,
  RegexFilter,
  RulesGlobal,
  Tick,
  checkHomogenity,
  chunks,
  circularShift,
  copyAttributes,
  downloader,
  exterminateVideo,
  fetchHtml,
  fetchJson,
  fetchText,
  fetchWith,
  findNextSibling,
  getCommonParents,
  getPaginationStrategy,
  instantiateTemplate,
  memoize,
  objectToFormData,
  onPointerOverAndLeave,
  parseCssUrl,
  parseDataParams,
  parseHtml,
  parseIntegerOr,
  querySelectorLast,
  querySelectorLastNumber,
  querySelectorText,
  range,
  removeClassesAndDataAttributes,
  replaceElementTag,
  sanitizeStr,
  splitWith,
  timeToSeconds,
  wait,
  waitForElementToAppear,
  waitForElementToDisappear,
  watchDomChangesWithThrottle,
  watchElementChildrenCount
};
//# sourceMappingURL=pervertmonkey.core.es.js.map
