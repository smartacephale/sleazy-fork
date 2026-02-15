// ==UserScript==
// @name         Eporner PervertMonkey
// @namespace    pervertmonkey
// @version      2.0.1
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Duration and HD
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.eporner.com/*
// @match        https://*.eporner.*/*
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@2.1.1/dist/jabroni-outfit.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (jabroniOutfit) {
  'use strict';

  var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : undefined)();
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  function memoize(fn) {
    const cache = new Map();
    const memoizedFunction = ((...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    });
    return memoizedFunction;
  }

  function splitWith(s, c = ",") {
    return s.split(c).map((s2) => s2.trim()).filter(Boolean);
  }
  function sanitizeStr(s) {
    return s?.replace(/\n|\t/g, " ").replace(/ {2,}/g, " ").trim() || "";
  }

  class RegexFilter {
    regexes;
    constructor(str, flags = "gi") {
      this.regexes = memoize(this.compileSearchRegex)(str, flags);
    }
compileSearchRegex(str, flags) {
      try {
        if (str.startsWith("r:")) return [new RegExp(str.slice(2), flags)];
        const regexes = splitWith(str).map(
          (s) => s.replace(/f:(\w+)/g, (_, w) => `(^|\\ |,)${w}($|\\ |,)`)
).map((_) => new RegExp(_, flags));
        return regexes;
      } catch (_) {
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

  class DataFilter {
    constructor(rules) {
      this.rules = rules;
      this.registerFilters(rules.customDataSelectorFns);
      this.applyCSSFilters();
    }
    filters = new Map();
    static isFiltered(el) {
      return el.className.includes("filter-");
    }
    applyCSSFilters(wrapper) {
      this.filters.forEach((_, name) => {
        const cssRule = `.filter-${name} { display: none !important; }`;
        if (wrapper) {
          _GM_addStyle(wrapper(cssRule));
        } else {
          _GM_addStyle(cssRule);
        }
      });
    }
    customDataSelectorFns = {};
    registerFilters(customFilters) {
      customFilters.forEach((o) => {
        if (typeof o === "string") {
          this.customDataSelectorFns[o] = DataFilter.customDataSelectorFnsDefault[o];
          this.registerFilter(o);
        } else {
          const k = Object.keys(o)[0];
          this.customDataSelectorFns[k] = o[k];
          this.registerFilter(k);
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
      const handler = this.customSelectorParser(
        customSelectorName,
        this.customDataSelectorFns[customSelectorName]
      );
      const tag = `filter-${customSelectorName}`;
      [customSelectorName, ...handler.deps || []]?.forEach((name) => {
        Object.assign(this.filterMapping, { [name]: customSelectorName });
      });
      const fn = () => {
        const preDefined = handler.$preDefine?.(this.rules.store.state);
        return (v) => {
          const condition = handler.handle(v, this.rules.store.state, preDefined);
          return {
            condition,
            tag
          };
        };
      };
      this.filters.set(customSelectorName, fn);
    }
    filterMapping = {};
    selectFilters(filters) {
      const selectedFilters = Object.keys(filters).filter((k) => k in this.filterMapping).map((k) => this.filterMapping[k]).map((k) => this.filters.get(k));
      return selectedFilters;
    }
    static customDataSelectorFnsDefault = {
      filterDuration: {
        handle(el, state, notInRange) {
          return state.filterDuration && notInRange(el.duration);
        },
        $preDefine: (state) => {
          const from = state.filterDurationFrom;
          const to = state.filterDurationTo;
          function notInRange(d) {
            return d < from || d > to;
          }
          return notInRange;
        },
        deps: ["filterDurationFrom", "filterDurationTo"]
      },
      filterExclude: {
        handle(el, state, searchFilter) {
          if (!state.filterExclude) return false;
          return !searchFilter.hasNone(el.title);
        },
        $preDefine: (state) => new RegexFilter(state.filterExcludeWords),
        deps: ["filterExcludeWords"]
      },
      filterInclude: {
        handle(el, state, searchFilter) {
          if (!state.filterInclude) return false;
          return !searchFilter.hasEvery(el.title);
        },
        $preDefine: (state) => new RegexFilter(state.filterIncludeWords),
        deps: ["filterIncludeWords"]
      }
    };
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

  function querySelectorLast(root = document, selector) {
    const nodes = root.querySelectorAll(selector);
    return nodes.length > 0 ? nodes[nodes.length - 1] : void 0;
  }
  function querySelectorText(e, selector) {
    if (typeof selector !== "string") return "";
    const text = e.querySelector(selector)?.innerText || "";
    return sanitizeStr(text);
  }
  function parseHtml(html) {
    const parsed = new DOMParser().parseFromString(html, "text/html").body;
    if (parsed.children.length > 1) return parsed;
    return parsed.firstElementChild;
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
    const parents = Array.from(elements).map((el) => el.parentElement).filter((parent) => parent !== null);
    return [...new Set(parents)];
  }
  function checkHomogenity(a, b, options) {
    if (!a || !b) return false;
    if (options.id) {
      if (a.id !== b.id) return false;
    }
    if (options.className) {
      const ca = a.className;
      const cb = b.className;
      if (!(ca.length > cb.length ? ca.includes(cb) : cb.includes(ca))) {
        return false;
      }
    }
    return true;
  }

  class LazyImgLoader {
    lazyImgObserver;
    attributeName = "data-lazy-load";
    constructor(shouldDelazify) {
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
    delazify = (target) => {
      this.lazyImgObserver.observer.unobserve(target);
      target.src = target.getAttribute(this.attributeName);
      target.removeAttribute(this.attributeName);
    };
  }

  class Observer {
    constructor(callback) {
      this.callback = callback;
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
    }
    observer;
    timeout;
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

  class DataManager {
    constructor(rules) {
      this.rules = rules;
      this.dataFilter = new DataFilter(this.rules);
    }
    data = new Map();
    lazyImgLoader = new LazyImgLoader(
      (target) => !DataFilter.isFiltered(target)
    );
    dataFilter;
    applyFilters = async (filters = {}, offset = 0) => {
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
    };
    filterAll = async (offset) => {
      const keys = Array.from(this.dataFilter.filters.keys());
      const filters = Object.fromEntries(
        keys.map((k) => [k, this.rules.store.state[k]])
      );
      await this.applyFilters(filters, offset);
    };
    parseDataParentHomogenity;
    parseData = (html, container, removeDuplicates = false, shouldLazify = true) => {
      const thumbs = this.rules.getThumbs(html);
      const dataOffset = this.data.size;
      const fragment = document.createDocumentFragment();
      const parent = container || this.rules.container;
      const homogenity = !!this.parseDataParentHomogenity;
      for (const thumbElement of thumbs) {
        const url = this.rules.getThumbUrl(thumbElement);
        if (!url || this.data.has(url) || parent !== container && parent?.contains(thumbElement) || homogenity && !checkHomogenity(
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
    };
    sortBy(key, direction = true) {
      if (this.data.size < 2) return;
      let sorted = this.data.values().toArray().sort((a, b) => {
        return a[key] - b[key];
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

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    return parseHtml(await r.text());
  }
  const fetchHtml = (input) => fetchWith(input, { });

  class InfiniteScroller {
    enabled = true;
    paginationOffset = 1;
    parseData;
    rules;
    observer;
    paginationGenerator;
    constructor(options) {
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
    onScrollCBs = [];
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
        if (type?.autoScroll) {
          autoScrollWrapper();
        }
      });
    }
    generatorConsumer = async () => {
      if (!this.enabled) return false;
      const {
        value: { url, offset },
        done
      } = await this.paginationGenerator.next();
      if (!done && url) {
        await this.doScroll(url, offset);
      }
      return !done;
    };
async getPaginationData(url) {
      return await fetchHtml(url);
    }
    async doScroll(url, offset) {
      const nextPageHtml = await this.getPaginationData(url);
      const prevScrollPos = document.documentElement.scrollTop;
      this.paginationOffset = Math.max(this.paginationOffset, offset);
      this.parseData?.(nextPageHtml);
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

  var Pe=Object.defineProperty;var a=(e,t)=>Pe(e,"name",{value:t,configurable:true});var P=class{type=3;name="";prefix="";value="";suffix="";modifier=3;constructor(t,r,n,c,l,f){this.type=t,this.name=r,this.prefix=n,this.value=c,this.suffix=l,this.modifier=f;}hasCustomName(){return this.name!==""&&typeof this.name!="number"}};a(P,"Part");var Re=/[$_\p{ID_Start}]/u,Ee=/[$_\u200C\u200D\p{ID_Continue}]/u,v=".*";function Oe(e,t){return (t?/^[\x00-\xFF]*$/:/^[\x00-\x7F]*$/).test(e)}a(Oe,"isASCII");function D(e,t=false){let r=[],n=0;for(;n<e.length;){let c=e[n],l=a(function(f){if(!t)throw new TypeError(f);r.push({type:"INVALID_CHAR",index:n,value:e[n++]});},"ErrorOrInvalid");if(c==="*"){r.push({type:"ASTERISK",index:n,value:e[n++]});continue}if(c==="+"||c==="?"){r.push({type:"OTHER_MODIFIER",index:n,value:e[n++]});continue}if(c==="\\"){r.push({type:"ESCAPED_CHAR",index:n++,value:e[n++]});continue}if(c==="{"){r.push({type:"OPEN",index:n,value:e[n++]});continue}if(c==="}"){r.push({type:"CLOSE",index:n,value:e[n++]});continue}if(c===":"){let f="",s=n+1;for(;s<e.length;){let i=e.substr(s,1);if(s===n+1&&Re.test(i)||s!==n+1&&Ee.test(i)){f+=e[s++];continue}break}if(!f){l(`Missing parameter name at ${n}`);continue}r.push({type:"NAME",index:n,value:f}),n=s;continue}if(c==="("){let f=1,s="",i=n+1,o=false;if(e[i]==="?"){l(`Pattern cannot start with "?" at ${i}`);continue}for(;i<e.length;){if(!Oe(e[i],false)){l(`Invalid character '${e[i]}' at ${i}.`),o=true;break}if(e[i]==="\\"){s+=e[i++]+e[i++];continue}if(e[i]===")"){if(f--,f===0){i++;break}}else if(e[i]==="("&&(f++,e[i+1]!=="?")){l(`Capturing groups are not allowed at ${i}`),o=true;break}s+=e[i++];}if(o)continue;if(f){l(`Unbalanced pattern at ${n}`);continue}if(!s){l(`Missing pattern at ${n}`);continue}r.push({type:"REGEX",index:n,value:s}),n=i;continue}r.push({type:"CHAR",index:n,value:e[n++]});}return r.push({type:"END",index:n,value:""}),r}a(D,"lexer");function F(e,t={}){let r=D(e);t.delimiter??="/#?",t.prefixes??="./";let n=`[^${x(t.delimiter)}]+?`,c=[],l=0,f=0,i=new Set,o=a(u=>{if(f<r.length&&r[f].type===u)return r[f++].value},"tryConsume"),h=a(()=>o("OTHER_MODIFIER")??o("ASTERISK"),"tryConsumeModifier"),p=a(u=>{let d=o(u);if(d!==void 0)return d;let{type:g,index:y}=r[f];throw new TypeError(`Unexpected ${g} at ${y}, expected ${u}`)},"mustConsume"),A=a(()=>{let u="",d;for(;d=o("CHAR")??o("ESCAPED_CHAR");)u+=d;return u},"consumeText"),xe=a(u=>u,"DefaultEncodePart"),N=t.encodePart||xe,H="",$=a(u=>{H+=u;},"appendToPendingFixedValue"),M=a(()=>{H.length&&(c.push(new P(3,"","",N(H),"",3)),H="");},"maybeAddPartFromPendingFixedValue"),X=a((u,d,g,y,Z)=>{let m=3;switch(Z){case "?":m=1;break;case "*":m=0;break;case "+":m=2;break}if(!d&&!g&&m===3){$(u);return}if(M(),!d&&!g){if(!u)return;c.push(new P(3,"","",N(u),"",m));return}let S;g?g==="*"?S=v:S=g:S=n;let k=2;S===n?(k=1,S=""):S===v&&(k=0,S="");let E;if(d?E=d:g&&(E=l++),i.has(E))throw new TypeError(`Duplicate name '${E}'.`);i.add(E),c.push(new P(k,E,N(u),S,N(y),m));},"addPart");for(;f<r.length;){let u=o("CHAR"),d=o("NAME"),g=o("REGEX");if(!d&&!g&&(g=o("ASTERISK")),d||g){let m=u??"";t.prefixes.indexOf(m)===-1&&($(m),m=""),M();let S=h();X(m,d,g,"",S);continue}let y=u??o("ESCAPED_CHAR");if(y){$(y);continue}if(o("OPEN")){let m=A(),S=o("NAME"),k=o("REGEX");!S&&!k&&(k=o("ASTERISK"));let E=A();p("CLOSE");let be=h();X(m,S,k,E,be);continue}M(),p("END");}return c}a(F,"parse");function x(e){return e.replace(/([.+*?^${}()[\]|/\\])/g,"\\$1")}a(x,"escapeString");function B(e){return e&&e.ignoreCase?"ui":"u"}a(B,"flags");function q(e,t,r){return W(F(e,r),t,r)}a(q,"stringToRegexp");function T(e){switch(e){case 0:return "*";case 1:return "?";case 2:return "+";case 3:return ""}}a(T,"modifierToString");function W(e,t,r={}){r.delimiter??="/#?",r.prefixes??="./",r.sensitive??=false,r.strict??=false,r.end??=true,r.start??=true,r.endsWith="";let n=r.start?"^":"";for(let s of e){if(s.type===3){s.modifier===3?n+=x(s.value):n+=`(?:${x(s.value)})${T(s.modifier)}`;continue}t&&t.push(s.name);let i=`[^${x(r.delimiter)}]+?`,o=s.value;if(s.type===1?o=i:s.type===0&&(o=v),!s.prefix.length&&!s.suffix.length){s.modifier===3||s.modifier===1?n+=`(${o})${T(s.modifier)}`:n+=`((?:${o})${T(s.modifier)})`;continue}if(s.modifier===3||s.modifier===1){n+=`(?:${x(s.prefix)}(${o})${x(s.suffix)})`,n+=T(s.modifier);continue}n+=`(?:${x(s.prefix)}`,n+=`((?:${o})(?:`,n+=x(s.suffix),n+=x(s.prefix),n+=`(?:${o}))*)${x(s.suffix)})`,s.modifier===0&&(n+="?");}let c=`[${x(r.endsWith)}]|$`,l=`[${x(r.delimiter)}]`;if(r.end)return r.strict||(n+=`${l}?`),r.endsWith.length?n+=`(?=${c})`:n+="$",new RegExp(n,B(r));r.strict||(n+=`(?:${l}(?=${c}))?`);let f=false;if(e.length){let s=e[e.length-1];s.type===3&&s.modifier===3&&(f=r.delimiter.indexOf(s)>-1);}return f||(n+=`(?=${l}|${c})`),new RegExp(n,B(r))}a(W,"partsToRegexp");var b={delimiter:"",prefixes:"",sensitive:true,strict:true},J={delimiter:".",prefixes:"",sensitive:true,strict:true},Q={delimiter:"/",prefixes:"/",sensitive:true,strict:true};function ee(e,t){return e.length?e[0]==="/"?true:!t||e.length<2?false:(e[0]=="\\"||e[0]=="{")&&e[1]=="/":false}a(ee,"isAbsolutePathname");function te(e,t){return e.startsWith(t)?e.substring(t.length,e.length):e}a(te,"maybeStripPrefix");function ke(e,t){return e.endsWith(t)?e.substr(0,e.length-t.length):e}a(ke,"maybeStripSuffix");function _(e){return !e||e.length<2?false:e[0]==="["||(e[0]==="\\"||e[0]==="{")&&e[1]==="["}a(_,"treatAsIPv6Hostname");var re=["ftp","file","http","https","ws","wss"];function U(e){if(!e)return  true;for(let t of re)if(e.test(t))return  true;return  false}a(U,"isSpecialScheme");function ne(e,t){if(e=te(e,"#"),t||e==="")return e;let r=new URL("https://example.com");return r.hash=e,r.hash?r.hash.substring(1,r.hash.length):""}a(ne,"canonicalizeHash");function se(e,t){if(e=te(e,"?"),t||e==="")return e;let r=new URL("https://example.com");return r.search=e,r.search?r.search.substring(1,r.search.length):""}a(se,"canonicalizeSearch");function ie(e,t){return t||e===""?e:_(e)?K(e):j(e)}a(ie,"canonicalizeHostname");function ae(e,t){if(t||e==="")return e;let r=new URL("https://example.com");return r.password=e,r.password}a(ae,"canonicalizePassword");function oe(e,t){if(t||e==="")return e;let r=new URL("https://example.com");return r.username=e,r.username}a(oe,"canonicalizeUsername");function ce(e,t,r){if(r||e==="")return e;if(t&&!re.includes(t))return new URL(`${t}:${e}`).pathname;let n=e[0]=="/";return e=new URL(n?e:"/-"+e,"https://example.com").pathname,n||(e=e.substring(2,e.length)),e}a(ce,"canonicalizePathname");function le(e,t,r){return z(t)===e&&(e=""),r||e===""?e:G(e)}a(le,"canonicalizePort");function fe(e,t){return e=ke(e,":"),t||e===""?e:w(e)}a(fe,"canonicalizeProtocol");function z(e){switch(e){case "ws":case "http":return "80";case "wws":case "https":return "443";case "ftp":return "21";default:return ""}}a(z,"defaultPortForProtocol");function w(e){if(e==="")return e;if(/^[-+.A-Za-z0-9]*$/.test(e))return e.toLowerCase();throw new TypeError(`Invalid protocol '${e}'.`)}a(w,"protocolEncodeCallback");function he(e){if(e==="")return e;let t=new URL("https://example.com");return t.username=e,t.username}a(he,"usernameEncodeCallback");function ue(e){if(e==="")return e;let t=new URL("https://example.com");return t.password=e,t.password}a(ue,"passwordEncodeCallback");function j(e){if(e==="")return e;if(/[\t\n\r #%/:<>?@[\]^\\|]/g.test(e))throw new TypeError(`Invalid hostname '${e}'`);let t=new URL("https://example.com");return t.hostname=e,t.hostname}a(j,"hostnameEncodeCallback");function K(e){if(e==="")return e;if(/[^0-9a-fA-F[\]:]/g.test(e))throw new TypeError(`Invalid IPv6 hostname '${e}'`);return e.toLowerCase()}a(K,"ipv6HostnameEncodeCallback");function G(e){if(e===""||/^[0-9]*$/.test(e)&&parseInt(e)<=65535)return e;throw new TypeError(`Invalid port '${e}'.`)}a(G,"portEncodeCallback");function de(e){if(e==="")return e;let t=new URL("https://example.com");return t.pathname=e[0]!=="/"?"/-"+e:e,e[0]!=="/"?t.pathname.substring(2,t.pathname.length):t.pathname}a(de,"standardURLPathnameEncodeCallback");function pe(e){return e===""?e:new URL(`data:${e}`).pathname}a(pe,"pathURLPathnameEncodeCallback");function ge(e){if(e==="")return e;let t=new URL("https://example.com");return t.search=e,t.search.substring(1,t.search.length)}a(ge,"searchEncodeCallback");function me(e){if(e==="")return e;let t=new URL("https://example.com");return t.hash=e,t.hash.substring(1,t.hash.length)}a(me,"hashEncodeCallback");var C=class{#i;#n=[];#t={};#e=0;#s=1;#l=0;#o=0;#d=0;#p=0;#g=false;constructor(t){this.#i=t;}get result(){return this.#t}parse(){for(this.#n=D(this.#i,true);this.#e<this.#n.length;this.#e+=this.#s){if(this.#s=1,this.#n[this.#e].type==="END"){if(this.#o===0){this.#b(),this.#f()?this.#r(9,1):this.#h()?this.#r(8,1):this.#r(7,0);continue}else if(this.#o===2){this.#u(5);continue}this.#r(10,0);break}if(this.#d>0)if(this.#A())this.#d-=1;else continue;if(this.#T()){this.#d+=1;continue}switch(this.#o){case 0:this.#P()&&this.#u(1);break;case 1:if(this.#P()){this.#C();let t=7,r=1;this.#E()?(t=2,r=3):this.#g&&(t=2),this.#r(t,r);}break;case 2:this.#S()?this.#u(3):(this.#x()||this.#h()||this.#f())&&this.#u(5);break;case 3:this.#O()?this.#r(4,1):this.#S()&&this.#r(5,1);break;case 4:this.#S()&&this.#r(5,1);break;case 5:this.#y()?this.#p+=1:this.#w()&&(this.#p-=1),this.#k()&&!this.#p?this.#r(6,1):this.#x()?this.#r(7,0):this.#h()?this.#r(8,1):this.#f()&&this.#r(9,1);break;case 6:this.#x()?this.#r(7,0):this.#h()?this.#r(8,1):this.#f()&&this.#r(9,1);break;case 7:this.#h()?this.#r(8,1):this.#f()&&this.#r(9,1);break;case 8:this.#f()&&this.#r(9,1);break;}}this.#t.hostname!==void 0&&this.#t.port===void 0&&(this.#t.port="");}#r(t,r){switch(this.#o){case 0:break;case 1:this.#t.protocol=this.#c();break;case 2:break;case 3:this.#t.username=this.#c();break;case 4:this.#t.password=this.#c();break;case 5:this.#t.hostname=this.#c();break;case 6:this.#t.port=this.#c();break;case 7:this.#t.pathname=this.#c();break;case 8:this.#t.search=this.#c();break;case 9:this.#t.hash=this.#c();break;}this.#o!==0&&t!==10&&([1,2,3,4].includes(this.#o)&&[6,7,8,9].includes(t)&&(this.#t.hostname??=""),[1,2,3,4,5,6].includes(this.#o)&&[8,9].includes(t)&&(this.#t.pathname??=this.#g?"/":""),[1,2,3,4,5,6,7].includes(this.#o)&&t===9&&(this.#t.search??="")),this.#R(t,r);}#R(t,r){this.#o=t,this.#l=this.#e+r,this.#e+=r,this.#s=0;}#b(){this.#e=this.#l,this.#s=0;}#u(t){this.#b(),this.#o=t;}#m(t){return t<0&&(t=this.#n.length-t),t<this.#n.length?this.#n[t]:this.#n[this.#n.length-1]}#a(t,r){let n=this.#m(t);return n.value===r&&(n.type==="CHAR"||n.type==="ESCAPED_CHAR"||n.type==="INVALID_CHAR")}#P(){return this.#a(this.#e,":")}#E(){return this.#a(this.#e+1,"/")&&this.#a(this.#e+2,"/")}#S(){return this.#a(this.#e,"@")}#O(){return this.#a(this.#e,":")}#k(){return this.#a(this.#e,":")}#x(){return this.#a(this.#e,"/")}#h(){if(this.#a(this.#e,"?"))return  true;if(this.#n[this.#e].value!=="?")return  false;let t=this.#m(this.#e-1);return t.type!=="NAME"&&t.type!=="REGEX"&&t.type!=="CLOSE"&&t.type!=="ASTERISK"}#f(){return this.#a(this.#e,"#")}#T(){return this.#n[this.#e].type=="OPEN"}#A(){return this.#n[this.#e].type=="CLOSE"}#y(){return this.#a(this.#e,"[")}#w(){return this.#a(this.#e,"]")}#c(){let t=this.#n[this.#e],r=this.#m(this.#l).index;return this.#i.substring(r,t.index)}#C(){let t={};Object.assign(t,b),t.encodePart=w;let r=q(this.#c(),void 0,t);this.#g=U(r);}};a(C,"Parser");var V=["protocol","username","password","hostname","port","pathname","search","hash"],O="*";function Se(e,t){if(typeof e!="string")throw new TypeError("parameter 1 is not of type 'string'.");let r=new URL(e,t);return {protocol:r.protocol.substring(0,r.protocol.length-1),username:r.username,password:r.password,hostname:r.hostname,port:r.port,pathname:r.pathname,search:r.search!==""?r.search.substring(1,r.search.length):void 0,hash:r.hash!==""?r.hash.substring(1,r.hash.length):void 0}}a(Se,"extractValues");function R(e,t){return t?I(e):e}a(R,"processBaseURLString");function L(e,t,r){let n;if(typeof t.baseURL=="string")try{n=new URL(t.baseURL),t.protocol===void 0&&(e.protocol=R(n.protocol.substring(0,n.protocol.length-1),r)),!r&&t.protocol===void 0&&t.hostname===void 0&&t.port===void 0&&t.username===void 0&&(e.username=R(n.username,r)),!r&&t.protocol===void 0&&t.hostname===void 0&&t.port===void 0&&t.username===void 0&&t.password===void 0&&(e.password=R(n.password,r)),t.protocol===void 0&&t.hostname===void 0&&(e.hostname=R(n.hostname,r)),t.protocol===void 0&&t.hostname===void 0&&t.port===void 0&&(e.port=R(n.port,r)),t.protocol===void 0&&t.hostname===void 0&&t.port===void 0&&t.pathname===void 0&&(e.pathname=R(n.pathname,r)),t.protocol===void 0&&t.hostname===void 0&&t.port===void 0&&t.pathname===void 0&&t.search===void 0&&(e.search=R(n.search.substring(1,n.search.length),r)),t.protocol===void 0&&t.hostname===void 0&&t.port===void 0&&t.pathname===void 0&&t.search===void 0&&t.hash===void 0&&(e.hash=R(n.hash.substring(1,n.hash.length),r));}catch{throw new TypeError(`invalid baseURL '${t.baseURL}'.`)}if(typeof t.protocol=="string"&&(e.protocol=fe(t.protocol,r)),typeof t.username=="string"&&(e.username=oe(t.username,r)),typeof t.password=="string"&&(e.password=ae(t.password,r)),typeof t.hostname=="string"&&(e.hostname=ie(t.hostname,r)),typeof t.port=="string"&&(e.port=le(t.port,e.protocol,r)),typeof t.pathname=="string"){if(e.pathname=t.pathname,n&&!ee(e.pathname,r)){let c=n.pathname.lastIndexOf("/");c>=0&&(e.pathname=R(n.pathname.substring(0,c+1),r)+e.pathname);}e.pathname=ce(e.pathname,e.protocol,r);}return typeof t.search=="string"&&(e.search=se(t.search,r)),typeof t.hash=="string"&&(e.hash=ne(t.hash,r)),e}a(L,"applyInit");function I(e){return e.replace(/([+*?:{}()\\])/g,"\\$1")}a(I,"escapePatternString");function Te(e){return e.replace(/([.+*?^${}()[\]|/\\])/g,"\\$1")}a(Te,"escapeRegexpString");function Ae(e,t){t.delimiter??="/#?",t.prefixes??="./",t.sensitive??=false,t.strict??=false,t.end??=true,t.start??=true,t.endsWith="";let r=".*",n=`[^${Te(t.delimiter)}]+?`,c=/[$_\u200C\u200D\p{ID_Continue}]/u,l="";for(let f=0;f<e.length;++f){let s=e[f];if(s.type===3){if(s.modifier===3){l+=I(s.value);continue}l+=`{${I(s.value)}}${T(s.modifier)}`;continue}let i=s.hasCustomName(),o=!!s.suffix.length||!!s.prefix.length&&(s.prefix.length!==1||!t.prefixes.includes(s.prefix)),h=f>0?e[f-1]:null,p=f<e.length-1?e[f+1]:null;if(!o&&i&&s.type===1&&s.modifier===3&&p&&!p.prefix.length&&!p.suffix.length)if(p.type===3){let A=p.value.length>0?p.value[0]:"";o=c.test(A);}else o=!p.hasCustomName();if(!o&&!s.prefix.length&&h&&h.type===3){let A=h.value[h.value.length-1];o=t.prefixes.includes(A);}o&&(l+="{"),l+=I(s.prefix),i&&(l+=`:${s.name}`),s.type===2?l+=`(${s.value})`:s.type===1?i||(l+=`(${n})`):s.type===0&&(!i&&(!h||h.type===3||h.modifier!==3||o||s.prefix!=="")?l+="*":l+=`(${r})`),s.type===1&&i&&s.suffix.length&&c.test(s.suffix[0])&&(l+="\\"),l+=I(s.suffix),o&&(l+="}"),s.modifier!==3&&(l+=T(s.modifier));}return l}a(Ae,"partsToPattern");var Y=class{#i;#n={};#t={};#e={};#s={};#l=false;constructor(t={},r,n){try{let c;if(typeof r=="string"?c=r:n=r,typeof t=="string"){let i=new C(t);if(i.parse(),t=i.result,c===void 0&&typeof t.protocol!="string")throw new TypeError("A base URL must be provided for a relative constructor string.");t.baseURL=c;}else {if(!t||typeof t!="object")throw new TypeError("parameter 1 is not of type 'string' and cannot convert to dictionary.");if(c)throw new TypeError("parameter 1 is not of type 'string'.")}typeof n>"u"&&(n={ignoreCase:!1});let l={ignoreCase:n.ignoreCase===!0},f={pathname:O,protocol:O,username:O,password:O,hostname:O,port:O,search:O,hash:O};this.#i=L(f,t,!0),z(this.#i.protocol)===this.#i.port&&(this.#i.port="");let s;for(s of V){if(!(s in this.#i))continue;let i={},o=this.#i[s];switch(this.#t[s]=[],s){case "protocol":Object.assign(i,b),i.encodePart=w;break;case "username":Object.assign(i,b),i.encodePart=he;break;case "password":Object.assign(i,b),i.encodePart=ue;break;case "hostname":Object.assign(i,J),_(o)?i.encodePart=K:i.encodePart=j;break;case "port":Object.assign(i,b),i.encodePart=G;break;case "pathname":U(this.#n.protocol)?(Object.assign(i,Q,l),i.encodePart=de):(Object.assign(i,b,l),i.encodePart=pe);break;case "search":Object.assign(i,b,l),i.encodePart=ge;break;case "hash":Object.assign(i,b,l),i.encodePart=me;break}try{this.#s[s]=F(o,i),this.#n[s]=W(this.#s[s],this.#t[s],i),this.#e[s]=Ae(this.#s[s],i),this.#l=this.#l||this.#s[s].some(h=>h.type===2);}catch{throw new TypeError(`invalid ${s} pattern '${this.#i[s]}'.`)}}}catch(c){throw new TypeError(`Failed to construct 'URLPattern': ${c.message}`)}}get[Symbol.toStringTag](){return "URLPattern"}test(t={},r){let n={pathname:"",protocol:"",username:"",password:"",hostname:"",port:"",search:"",hash:""};if(typeof t!="string"&&r)throw new TypeError("parameter 1 is not of type 'string'.");if(typeof t>"u")return  false;try{typeof t=="object"?n=L(n,t,!1):n=L(n,Se(t,r),!1);}catch{return  false}let c;for(c of V)if(!this.#n[c].exec(n[c]))return  false;return  true}exec(t={},r){let n={pathname:"",protocol:"",username:"",password:"",hostname:"",port:"",search:"",hash:""};if(typeof t!="string"&&r)throw new TypeError("parameter 1 is not of type 'string'.");if(typeof t>"u")return;try{typeof t=="object"?n=L(n,t,!1):n=L(n,Se(t,r),!1);}catch{return null}let c={};r?c.inputs=[t,r]:c.inputs=[t];let l;for(l of V){let f=this.#n[l].exec(n[l]);if(!f)return null;let s={};for(let[i,o]of this.#t[l].entries())if(typeof o=="string"||typeof o=="number"){let h=f[i+1];s[o]=h;}c[l]={input:n[l]??"",groups:s};}return c}static compareComponent(t,r,n){let c=a((i,o)=>{for(let h of ["type","modifier","prefix","value","suffix"]){if(i[h]<o[h])return  -1;if(i[h]===o[h])continue;return 1}return 0},"comparePart"),l=new P(3,"","","","",3),f=new P(0,"","","","",3),s=a((i,o)=>{let h=0;for(;h<Math.min(i.length,o.length);++h){let p=c(i[h],o[h]);if(p)return p}return i.length===o.length?0:c(i[h]??l,o[h]??l)},"comparePartList");return !r.#e[t]&&!n.#e[t]?0:r.#e[t]&&!n.#e[t]?s(r.#s[t],[f]):!r.#e[t]&&n.#e[t]?s([f],n.#s[t]):s(r.#s[t],n.#s[t])}get protocol(){return this.#e.protocol}get username(){return this.#e.username}get password(){return this.#e.password}get hostname(){return this.#e.hostname}get port(){return this.#e.port}get pathname(){return this.#e.pathname}get search(){return this.#e.search}get hash(){return this.#e.hash}get hasRegExpGroups(){return this.#l}};a(Y,"URLPattern");

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
    const pageLinks = [...doc.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => URL.canParse(h));
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
    doc = document;
    url;
    paginationSelector = ".pagination";
    searchParamSelector = "page";
    static _pathnameSelector = /\/(page\/)?\d+\/?$/;
    pathnameSelector = /\/(\d+)\/?$/;
    dataparamSelector = "[data-parameters *= from]";
    overwritePaginationLast;
    offsetMin = 1;
    constructor(options) {
      if (options) {
        Object.entries(options).forEach(([k, v]) => {
          Object.assign(this, { [k]: v });
        });
      }
      this.url = parseUrl(options?.url || this.doc.URL);
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
      return (_) => this.url.href;
    }
  }

  function formatTimeToHHMMSS(timeStr) {
    const pad = (num) => num.toString().padStart(2, "0");
    const h = timeStr.match(/(\d+)\s*h/)?.[1] || "0";
    const m = timeStr.match(/(\d+)\s*mi?n/)?.[1] || "0";
    const s = timeStr.match(/(\d+)\s*sec/)?.[1] || "0";
    return `${pad(+h)}:${pad(+m)}:${pad(+s)}`;
  }
  function timeToSeconds(timeStr) {
    const normalized = /[a-zA-Z]/.test(timeStr) ? formatTimeToHHMMSS(timeStr) : timeStr;
    return normalized.split(":").reverse().reduce((total, unit, index) => total + parseInt(unit, 10) * 60 ** index, 0);
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

  class PaginationStrategyDataParams extends PaginationStrategy {
    getPaginationLast() {
      const links = this.getPaginationElement()?.querySelectorAll(this.dataparamSelector);
      const pages = Array.from(links || [], (l) => {
        const p = l.getAttribute("data-parameters");
        const v = p?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
        return parseInt(v);
      });
      const lastPage = Math.max(...pages, this.offsetMin);
      if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
      return lastPage;
    }
    getPaginationOffset() {
      const link = this.getPaginationElement()?.querySelector(
        ".prev[data-parameters *= from], .prev [data-parameters *= from]"
      );
      if (!link) return this.offsetMin;
      const p = link.getAttribute("data-parameters");
      const v = p?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
      return parseInt(v);
    }
    getPaginationUrlGenerator() {
      const url = new URL(this.url.href);
      const parametersElement = this.getPaginationElement()?.querySelector(
        "a[data-block-id][data-parameters]"
      );
      const block_id = parametersElement?.getAttribute("data-block-id") || "";
      const parameters = parseDataParams(
        parametersElement?.getAttribute("data-parameters") || ""
      );
      const attrs = {
        block_id,
        function: "get_block",
        mode: "async",
        ...parameters
      };
      Object.keys(attrs).forEach((k) => {
        url.searchParams.set(k, attrs[k]);
      });
      const paginationUrlGenerator = (n) => {
        Object.keys(attrs).forEach((k) => {
          k.includes("from") && url.searchParams.set(k, n.toString());
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
    extractPage = (a) => {
      const href = typeof a === "string" ? a : a.href;
      const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
      return parseInt(
        pathname.match(this.pathnameSelector)?.pop() || this.offsetMin.toString()
      );
    };
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
    extractPage = (a) => {
      const href = typeof a === "string" ? a : a.href;
      const p = new URL(href).searchParams.get(this.searchParamSelector);
      return parseInt(p) || this.offsetMin;
    };
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
      if (this.doc === document) {
        return this.extractPage(this.url);
      }
      const link = this.getPaginationElement()?.querySelector(
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
    delay;
    customGenerator;
    getThumbUrl(thumb) {
      return (thumb.querySelector("a[href]") || thumb).href;
    }
    titleSelector;
    uploaderSelector;
    durationSelector;
    customThumbDataSelectors;
    getThumbDataStrategy = "default";
    getThumbDataCallback;
    getThumbData(thumb) {
      let { titleSelector, uploaderSelector, durationSelector } = this;
      const thumbData = { title: "" };
      if (this.getThumbDataStrategy === "auto-text") {
        const text = sanitizeStr(thumb.innerText);
        thumbData.title = text;
        thumbData.duration = timeToSeconds(text.match(/\d+m|\d+:\d+/)?.[0] || "");
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
      this.getThumbDataCallback?.(thumb, thumbData);
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
        Object.entries(this.customThumbDataSelectors).forEach(([name, x]) => {
          const data = getCustomThumbData(x.selector, x.type);
          Object.assign(thumbData, { [name]: data });
        });
      }
      return thumbData;
    }
    getThumbImgDataAttrSelector;
    getThumbImgDataAttrDelete;
    getThumbImgDataStrategy = "default";
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
    containerSelector = ".container";
    containerSelectorLast;
    intersectionObservableSelector;
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
    thumbsSelector = ".thumb";
    getThumbsStrategy = "default";
    getThumbsTransform;
    getThumbs(html) {
      if (!html) return [];
      let thumbs;
      if (this.getThumbsStrategy === "auto") {
        if (typeof this.containerSelector !== "string") return [];
        const container = html.querySelector(this.containerSelector);
        thumbs = [...container?.children || []];
      }
      thumbs = Array.from(html.querySelectorAll(this.thumbsSelector));
      if (typeof this.getThumbsTransform === "function") {
        thumbs.forEach(this.getThumbsTransform);
      }
      return thumbs;
    }
    paginationStrategyOptions = {};
    paginationStrategy;
    customDataSelectorFns = [
      "filterInclude",
      "filterExclude",
      "filterDuration"
    ];
    animatePreview;
    storeOptions;
    createStore() {
      const config = { ...StoreStateDefault, ...this.storeOptions };
      this.store = new jabroniOutfit.JabronioStore(config);
      return this.store;
    }
    schemeOptions = [];
    createGui() {
      const scheme = jabroniOutfit.setupScheme(
        this.schemeOptions,
        DefaultScheme
      );
      this.gui = new jabroniOutfit.JabronioGUI(scheme, this.store);
      return this.gui;
    }
    store;
    gui;
    dataManager;
    infiniteScroller;
    getPaginationData;
    resetInfiniteScroller() {
      this.infiniteScroller?.dispose();
      if (!this.paginationStrategy.hasPagination) return;
      this.infiniteScroller = InfiniteScroller.create(this);
    }
    gropeStrategy = "all-in-one";
    gropeInit() {
      if (!this.gropeStrategy) return;
      if (this.gropeStrategy === "all-in-one") {
        this.dataManager?.parseData(this.container, this.container);
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
          ev?.action(direction);
        }
      });
      this.store.stateSubject.subscribe((a) => {
        this.dataManager.applyFilters(a);
      });
    }
    dataManagerOptions = {};
    setupDataManager() {
      this.dataManager = new DataManager(this);
      if (this.dataManagerOptions) {
        Object.assign(this.dataManager, this.dataManagerOptions);
      }
      return this.dataManager;
    }
    mutationObservers = [];
    resetOnPaginationOrContainerDeath = true;
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
    onResetCallback;
    reset() {
      this.mutationObservers.forEach((o) => {
        o.disconnect();
      });
      this.mutationObservers = [];
      this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
      this.setupDataManager();
      this.setupStoreListeners();
      this.resetInfiniteScroller();
      this.container && this.animatePreview?.(this.container);
      this.gropeInit();
      this.onResetCallback?.();
      this.resetOn();
    }
    constructor(options) {
      if (this.isEmbedded) throw Error("Embedded is not supported");
      Object.assign(this, options);
      this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
      this.store = this.createStore();
      this.gui = this.createGui();
      this.dataManager = this.setupDataManager();
      this.reset();
    }
  }

  function onPointerOverAndLeave(container, subjectSelector, onOver, onLeave) {
    let target;
    let onOverFinally;
    function handleLeaveEvent() {
      onOverFinally?.();
      target = void 0;
    }
    function handleEvent(e) {
      const currentTarget = e.target;
      if (!subjectSelector(currentTarget) || target === currentTarget) return;
      target = currentTarget;
      const result = onOver(target);
      onOverFinally = result?.onOverCallback;
      const leaveSubject = result?.leaveTarget || target;
      leaveSubject.addEventListener("pointerleave", handleLeaveEvent, {
        once: true
      });
    }
    container.addEventListener("pointerover", handleEvent);
  }

  const show_video_prev = _unsafeWindow.show_video_prev;
  new RulesGlobal({
    paginationStrategyOptions: {
      paginationSelector: ".numlist2"
    },
    customThumbDataSelectors: {
      quality: { type: "number", selector: '[title="Quality"]' }
    },
    containerSelectorLast: "#vidresults",
    thumbsSelector: "div[id^=vf][data-id]",
    uploaderSelector: '[title="Uploader"]',
    titleSelector: "a",
    durationSelector: '[title="Duration"]',
    getThumbImgDataStrategy: "auto",
    getThumbImgDataAttrDelete: "auto",
    customDataSelectorFns: [
      "filterInclude",
      "filterExclude",
      "filterDuration",
      {
        quality360: (el, state) => !!state.quality360 && el.quality !== 360
      },
      {
        quality480: (el, state) => !!state.quality480 && el.quality !== 480
      },
      {
        quality720: (el, state) => !!state.quality720 && el.quality !== 720
      },
      {
        quality1080: (el, state) => !!state.quality1080 && el.quality !== 1080
      },
      {
        quality4k: (el, state) => !!state.quality4k && el.quality !== 4
      }
    ],
    schemeOptions: [
      "Text Filter",
      "Badge",
      "Duration Filter",
      {
        title: "Quality Filter ",
        content: [
          {
            quality360: false
          },
          {
            quality480: false
          },
          {
            quality720: false
          },
          {
            quality1080: false
          },
          {
            quality4k: false
          }
        ]
      },
      "Advanced"
    ],
    animatePreview
  });
  function animatePreview(doc) {
    onPointerOverAndLeave(
      doc,
      (e) => e instanceof HTMLImageElement,
      (e) => {
        const target = e;
        const thumb = target.closest("[data-id]");
        const id = thumb?.getAttribute("data-id");
        show_video_prev(id);
      }
    );
  }

})(jabronioutfit);