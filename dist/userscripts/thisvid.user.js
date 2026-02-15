// ==UserScript==
// @name         ThisVid.com Improved
// @namespace    pervertmonkey
// @version      8.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Preview for private videos. Filter: title, duration, public/private. Check access to private vids. Mass friend request button. Sorts messages. Download button 📼
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thisvid.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.thisvid.com/*
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@2.1.1/dist/jabroni-outfit.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(async function (jabroniOutfit) {
  'use strict';

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
  }

  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  }

  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
  }

  function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
function bindCallback(func, thisArg, argCount) {
      if (typeof thisArg === 'undefined') {
          return func;
      }
      switch (argCount) {
          case 0:
              return function () {
                  return func.call(thisArg);
              };
          case 1:
              return function (arg) {
                  return func.call(thisArg, arg);
              };
          case 2:
              return function (value, index) {
                  return func.call(thisArg, value, index);
              };
          case 3:
              return function (value, index, collection) {
                  return func.call(thisArg, value, index, collection);
              };
          default:
              return function () {
                  return func.apply(thisArg, arguments);
              };
      }
  }
function identityAsync(x) {
      return __awaiter(this, void 0, void 0, function* () {
          return x;
      });
  }

const isNumber = (x) => typeof x === 'number';
const isBoolean = (x) => typeof x === 'boolean';
const isFunction = (x) => typeof x === 'function';
const isObject = (x) => x != null && Object(x) === x;
const isPromise = (x) => {
      return isObject(x) && isFunction(x.then);
  };
function isArrayLike(x) {
      return isObject(x) && isNumber(x['length']);
  }
function isIterable(x) {
      return x != null && isFunction(x[Symbol.iterator]);
  }
function isIterator(x) {
      return isObject(x) && !isFunction(x[Symbol.iterator]) && isFunction(x['next']);
  }
function isAsyncIterable(x) {
      return isObject(x) && isFunction(x[Symbol.asyncIterator]);
  }
function isObservable(x) {
      return x != null && Object(x) === x && typeof x['subscribe'] === 'function';
  }
const isReadableNodeStream = (x) => {
      return (isObject(x) &&
          isFunction(x['pipe']) &&
          isFunction(x['_read']) &&
          isBoolean(x['readable']) &&
          isObject(x['_readableState']));
  };
const isWritableNodeStream = (x) => {
      return (isObject(x) &&
          isFunction(x['end']) &&
          isFunction(x['_write']) &&
          isBoolean(x['writable']) &&
          isObject(x['_writableState']));
  };
function toInteger(value) {
      const number = Number(value);
      if (isNaN(number)) {
          return 0;
      }
      if (number === 0 || !isFinite(number)) {
          return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  }

  const maxSafeInteger = Math.pow(2, 53) - 1;
function toLength(value) {
      const len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
  }
class AbortError extends Error {
      constructor(message = 'The operation has been aborted') {
          super(message);
          Object.setPrototypeOf(this, AbortError.prototype);
          Error.captureStackTrace(this, this.constructor);
          this.name = 'AbortError';
      }
      get [Symbol.toStringTag]() {
          return 'AbortError';
      }
  }
  function throwIfAborted(signal) {
      if (signal && signal.aborted) {
          throw new AbortError();
      }
  }
  Object.defineProperty(AbortError, Symbol.hasInstance, {
      writable: true,
      configurable: true,
      value(x) {
          return (isObject(x) && (x.constructor.name === 'AbortError' || x[Symbol.toStringTag] === 'AbortError'));
      },
  });
class AsyncIterableX {
forEach(projection, thisArg, signal) {
          var _a, e_1, _b, _c;
          return __awaiter(this, void 0, void 0, function* () {
              const source = signal ? new WithAbortAsyncIterable$1(this, signal) : this;
              let i = 0;
              try {
                  for (var _d = true, source_1 = __asyncValues(source), source_1_1; source_1_1 = yield source_1.next(), _a = source_1_1.done, !_a; _d = true) {
                      _c = source_1_1.value;
                      _d = false;
                      const item = _c;
                      yield projection.call(thisArg, item, i++, signal);
                  }
              }
              catch (e_1_1) { e_1 = { error: e_1_1 }; }
              finally {
                  try {
                      if (!_d && !_a && (_b = source_1.return)) yield _b.call(source_1);
                  }
                  finally { if (e_1) throw e_1.error; }
              }
          });
      }
      pipe(...args) {
          let i = -1;
          const n = args.length;
          let acc = this;
          while (++i < n) {
              acc = args[i](AsyncIterableX.as(acc));
          }
          return acc;
      }
static from(source, selector = identityAsync, thisArg) {
          const fn = bindCallback(selector, thisArg, 2);
          if (isIterable(source) || isAsyncIterable(source)) {
              return new FromAsyncIterable(source, fn);
          }
          if (isPromise(source)) {
              return new FromPromiseIterable(source, fn);
          }
          if (isObservable(source)) {
              return new FromObservableAsyncIterable(source, fn);
          }
          if (isArrayLike(source)) {
              return new FromArrayIterable(source, fn);
          }
          if (isIterator(source)) {
              return new FromAsyncIterable({ [Symbol.asyncIterator]: () => source }, fn);
          }
          throw new TypeError('Input type not supported');
      }

static as(source) {
          if (source instanceof AsyncIterableX) {
              return source;
          }
          if (typeof source === 'string') {
              return new FromArrayIterable([source], identityAsync);
          }
          if (isIterable(source) || isAsyncIterable(source)) {
              return new FromAsyncIterable(source, identityAsync);
          }
          if (isPromise(source)) {
              return new FromPromiseIterable(source, identityAsync);
          }
          if (isObservable(source)) {
              return new FromObservableAsyncIterable(source, identityAsync);
          }
          if (isArrayLike(source)) {
              return new FromArrayIterable(source, identityAsync);
          }
          return new FromArrayIterable([source], identityAsync);
      }
  }
  AsyncIterableX.prototype[Symbol.toStringTag] = 'AsyncIterableX';
  Object.defineProperty(AsyncIterableX, Symbol.hasInstance, {
      writable: true,
      configurable: true,
      value(inst) {
          return !!(inst && inst[Symbol.toStringTag] === 'AsyncIterableX');
      },
  });
  const ARRAY_VALUE = 'value';
  const ARRAY_ERROR = 'error';

class AsyncSink {
      constructor() {
          this._ended = false;
          this._values = [];
          this._resolvers = [];
      }
      [Symbol.asyncIterator]() {
          return this;
      }
      write(value) {
          this._push({ type: ARRAY_VALUE, value });
      }
      error(error) {
          this._push({ type: ARRAY_ERROR, error });
      }
      _push(item) {
          if (this._ended) {
              throw new Error('AsyncSink already ended');
          }
          if (this._resolvers.length > 0) {
              const { resolve, reject } = this._resolvers.shift();
              if (item.type === ARRAY_ERROR) {
                  reject(item.error);
              }
              else {
                  resolve({ done: false, value: item.value });
              }
          }
          else {
              this._values.push(item);
          }
      }
      next() {
          if (this._values.length > 0) {
              const { type, value, error } = this._values.shift();
              if (type === ARRAY_ERROR) {
                  return Promise.reject(error);
              }
              else {
                  return Promise.resolve({ done: false, value });
              }
          }
          if (this._ended) {
              return Promise.resolve({ done: true });
          }
          return new Promise((resolve, reject) => {
              this._resolvers.push({ resolve, reject });
          });
      }
      end() {
          while (this._resolvers.length > 0) {
              this._resolvers.shift().resolve({ done: true });
          }
          this._ended = true;
      }
  }
class FromArrayIterable extends AsyncIterableX {
      constructor(source, selector) {
          super();
          this._source = source;
          this._selector = selector;
      }
      [Symbol.asyncIterator]() {
          return __asyncGenerator(this, arguments, function* _a() {
              let i = 0;
              const length = toLength(this._source.length);
              while (i < length) {
                  yield yield __await(yield __await(this._selector(this._source[i], i++)));
              }
          });
      }
  }
class FromAsyncIterable extends AsyncIterableX {
      constructor(source, selector) {
          super();
          this._source = source;
          this._selector = selector;
      }
      [Symbol.asyncIterator](signal) {
          return __asyncGenerator(this, arguments, function* _a() {
              var _b, e_2, _c, _d, _e, e_3, _f, _g;
              let i = 0;
              if (signal && this._source instanceof AsyncIterableX) {
                  try {
                      for (var _h = true, _j = __asyncValues(new WithAbortAsyncIterable$1(this._source, signal)), _k; _k = yield __await(_j.next()), _b = _k.done, !_b; _h = true) {
                          _d = _k.value;
                          _h = false;
                          const item = _d;
                          yield yield __await(yield __await(this._selector(item, i++)));
                      }
                  }
                  catch (e_2_1) { e_2 = { error: e_2_1 }; }
                  finally {
                      try {
                          if (!_h && !_b && (_c = _j.return)) yield __await(_c.call(_j));
                      }
                      finally { if (e_2) throw e_2.error; }
                  }
              }
              else {
                  throwIfAborted(signal);
                  try {
                      for (var _l = true, _m = __asyncValues(this._source), _o; _o = yield __await(_m.next()), _e = _o.done, !_e; _l = true) {
                          _g = _o.value;
                          _l = false;
                          const item = _g;
                          throwIfAborted(signal);
                          const value = yield __await(this._selector(item, i++));
                          throwIfAborted(signal);
                          yield yield __await(value);
                      }
                  }
                  catch (e_3_1) { e_3 = { error: e_3_1 }; }
                  finally {
                      try {
                          if (!_l && !_e && (_f = _m.return)) yield __await(_f.call(_m));
                      }
                      finally { if (e_3) throw e_3.error; }
                  }
              }
          });
      }
  }
class FromPromiseIterable extends AsyncIterableX {
      constructor(source, selector) {
          super();
          this._source = source;
          this._selector = selector;
      }
      [Symbol.asyncIterator]() {
          return __asyncGenerator(this, arguments, function* _a() {
              const item = yield __await(this._source);
              yield yield __await(yield __await(this._selector(item, 0)));
          });
      }
  }
class FromObservableAsyncIterable extends AsyncIterableX {
      constructor(observable, selector) {
          super();
          this._observable = observable;
          this._selector = selector;
      }
      [Symbol.asyncIterator](signal) {
          return __asyncGenerator(this, arguments, function* _a() {
              throwIfAborted(signal);
              const sink = new AsyncSink();
              const subscription = this._observable.subscribe({
                  next(value) {
                      sink.write(value);
                  },
                  error(err) {
                      sink.error(err);
                  },
                  complete() {
                      sink.end();
                  },
              });
              function onAbort() {
                  sink.error(new AbortError());
              }
              if (signal) {
                  signal.addEventListener('abort', onAbort);
              }
              let i = 0;
              try {
                  for (let next; !(next = yield __await(sink.next())).done;) {
                      throwIfAborted(signal);
                      yield yield __await(yield __await(this._selector(next.value, i++)));
                  }
              }
              finally {
                  if (signal) {
                      signal.removeEventListener('abort', onAbort);
                  }
                  subscription.unsubscribe();
              }
          });
      }
  }
  let WithAbortAsyncIterable$1 = class WithAbortAsyncIterable {
      constructor(source, signal) {
          this._source = source;
          this._signal = signal;
      }
      [Symbol.asyncIterator]() {
return this._source[Symbol.asyncIterator](this._signal);
      }
  };
  try {
      ((isBrowser) => {
          if (isBrowser) {
              return;
          }
          AsyncIterableX.prototype['pipe'] = nodePipe;
          const readableOpts = (x, opts = x._writableState || { objectMode: true }) => opts;
          function nodePipe(...args) {
              let i = -1;
              let end;
              const n = args.length;
              let prev = this;
              let next;
              while (++i < n) {
                  next = args[i];
                  if (typeof next === 'function') {
                      prev = next(AsyncIterableX.as(prev));
                  }
                  else if (isWritableNodeStream(next)) {
                      ({ end = true } = args[i + 1] || {});
return isReadableNodeStream(prev) ? prev.pipe(next, { end }) :
                          AsyncIterableX.as(prev).toNodeStream(readableOpts(next)).pipe(next, { end });
                  }
              }
              return prev;
          }
      })(typeof window === 'object' && typeof document === 'object' && document.nodeType === 9);
  }
  catch (e) {
}
  AsyncIterableX.as;
  const from = AsyncIterableX.from;
class WithAbortAsyncIterable extends AsyncIterableX {
      constructor(source, signal) {
          super();
          this._source = source;
          this._signal = signal;
      }
      withAbort(signal) {
          return new WithAbortAsyncIterable(this._source, signal);
      }
      [Symbol.asyncIterator]() {
return this._source[Symbol.asyncIterator](this._signal);
      }
  }
function wrapWithAbort(source, signal) {
      return signal ? new WithAbortAsyncIterable(source, signal) : source;
  }
function returnAsyncIterator(it) {
      return __awaiter(this, void 0, void 0, function* () {
          if (typeof (it === null || it === void 0 ? void 0 : it.return) === 'function') {
              yield it.return();
          }
      });
  }


function isPrimitive(value) {
      return value === null || (typeof value !== 'object' && typeof value !== 'function');
  }

const wm = new WeakMap();
  function safeRace(contenders) {
      let deferred;
      const result = new Promise((resolve, reject) => {
          deferred = { resolve, reject };
          for (const contender of contenders) {
              if (isPrimitive(contender)) {



Promise.resolve(contender).then(resolve, reject);
                  continue;
              }
              let record = wm.get(contender);
              if (record === undefined) {
                  record = { deferreds: new Set([deferred]), settled: false };
                  wm.set(contender, record);
Promise.resolve(contender).then((value) => {
for (const { resolve } of record.deferreds) {
                          resolve(value);
                      }
                      record.deferreds.clear();
                      record.settled = true;
                  }, (err) => {
for (const { reject } of record.deferreds) {
                          reject(err);
                      }
                      record.deferreds.clear();
                      record.settled = true;
                  });
              }
              else if (record.settled) {

Promise.resolve(contender).then(resolve, reject);
              }
              else {
                  record.deferreds.add(deferred);
              }
          }
      });

return result.finally(() => {
          for (const contender of contenders) {
              if (!isPrimitive(contender)) {
                  const record = wm.get(contender);
                  record.deferreds.delete(deferred);
              }
          }
      });
  }
class MapAsyncIterable extends AsyncIterableX {
      constructor(source, selector, thisArg) {
          super();
          this._source = source;
          this._selector = selector;
          this._thisArg = thisArg;
      }
      [Symbol.asyncIterator](signal) {
          return __asyncGenerator(this, arguments, function* _a() {
              var _b, e_1, _c, _d;
              throwIfAborted(signal);
              let i = 0;
              try {
                  for (var _e = true, _f = __asyncValues(wrapWithAbort(this._source, signal)), _g; _g = yield __await(_f.next()), _b = _g.done, !_b; _e = true) {
                      _d = _g.value;
                      _e = false;
                      const item = _d;
                      const result = yield __await(this._selector.call(this._thisArg, item, i++, signal));
                      yield yield __await(result);
                  }
              }
              catch (e_1_1) { e_1 = { error: e_1_1 }; }
              finally {
                  try {
                      if (!_e && !_b && (_c = _f.return)) yield __await(_c.call(_f));
                  }
                  finally { if (e_1) throw e_1.error; }
              }
          });
      }
  }
function map(selector, thisArg) {
      return function mapOperatorFunction(source) {
          return new MapAsyncIterable(source, selector, thisArg);
      };
  }

  class ConcatMapAsyncIterable extends AsyncIterableX {
      constructor(_source, _selector, _thisArg) {
          super();
          this._source = _source;
          this._selector = _selector;
          this._thisArg = _thisArg;
      }
      [Symbol.asyncIterator](signal) {
          return __asyncGenerator(this, arguments, function* _a() {
              var _b, e_1, _c, _d, _e, e_2, _f, _g;
              throwIfAborted(signal);
              let outerIndex = 0;
              const { _thisArg: thisArg, _selector: selector } = this;
              try {
                  for (var _h = true, _j = __asyncValues(wrapWithAbort(this._source, signal)), _k; _k = yield __await(_j.next()), _b = _k.done, !_b; _h = true) {
                      _d = _k.value;
                      _h = false;
                      const outer = _d;
                      const result = selector.call(thisArg, outer, outerIndex++, signal);
                      const values = (isPromise(result) ? yield __await(result) : result);
                      try {
                          for (var _l = true, _m = (e_2 = void 0, __asyncValues(wrapWithAbort(AsyncIterableX.as(values), signal))), _o; _o = yield __await(_m.next()), _e = _o.done, !_e; _l = true) {
                              _g = _o.value;
                              _l = false;
                              const inner = _g;
                              yield yield __await(inner);
                          }
                      }
                      catch (e_2_1) { e_2 = { error: e_2_1 }; }
                      finally {
                          try {
                              if (!_l && !_e && (_f = _m.return)) yield __await(_f.call(_m));
                          }
                          finally { if (e_2) throw e_2.error; }
                      }
                  }
              }
              catch (e_1_1) { e_1 = { error: e_1_1 }; }
              finally {
                  try {
                      if (!_h && !_b && (_c = _j.return)) yield __await(_c.call(_j));
                  }
                  finally { if (e_1) throw e_1.error; }
              }
          });
      }
  }
function concatMap(selector, thisArg) {
      return function concatMapOperatorFunction(source) {
          return new ConcatMapAsyncIterable(source, selector, thisArg);
      };
  }

  const NEVER_PROMISE = new Promise(() => { });
  function ignoreInnerAbortErrors(signal) {
      return function ignoreInnerAbortError(e) {
          if (signal.aborted && e instanceof AbortError) {
              return NEVER_PROMISE;
          }
          throw e;
      };
  }
  function wrapIterator(source, index, type, signal) {
      return __asyncGenerator(this, arguments, function* wrapIterator_1() {
          var _a, e_1, _b, _c;
          throwIfAborted(signal);
          try {
              for (var _d = true, _e = __asyncValues(wrapWithAbort(source, signal)), _f; _f = yield __await(_e.next()), _a = _f.done, !_a; _d = true) {
                  _c = _f.value;
                  _d = false;
                  const value = _c;
                  throwIfAborted(signal);
                  yield yield __await({ type, index, value });
              }
          }
          catch (e_1_1) { e_1 = { error: e_1_1 }; }
          finally {
              try {
                  if (!_d && !_a && (_b = _e.return)) yield __await(_b.call(_e));
              }
              finally { if (e_1) throw e_1.error; }
          }
          return yield __await({ type, index, value: undefined });
      });
  }
class FlattenConcurrentAsyncIterable extends AsyncIterableX {
      constructor(_source, _selector, _concurrent, _switchMode, _thisArg) {
          super();
          this._source = _source;
          this._selector = _selector;
          this._concurrent = _concurrent;
          this._switchMode = _switchMode;
          this._thisArg = _thisArg;
          this._concurrent = this._switchMode ? 1 : Math.max(_concurrent, 1);
      }
      [Symbol.asyncIterator](outerSignal) {
          return __asyncGenerator(this, arguments, function* _a() {
              throwIfAborted(outerSignal);
              let active = 0;
              let outerIndex = 0;
              let outerComplete = false;
              const thisArg = this._thisArg;
              const selector = this._selector;
              const switchMode = this._switchMode;
              const concurrent = this._concurrent;
              const outerValues = new Array(0);
              const innerIndices = new Array(0);
              const controllers = new Array(isFinite(concurrent) ? concurrent : 0);
              const inners = new Array(isFinite(concurrent) ? concurrent : 0);
              const outer = wrapIterator(this._source, 0, 0 , outerSignal);
              const results = [outer.next()];
              try {
                  do {
                      const { done = false, value: { type, value, index }, } = yield __await(safeRace(results));
                      if (!done) {
                          switch (type) {
                              case 0 : {
                                  if (switchMode) {
                                      active = 0;
                                  }
                                  if (active < concurrent) {
                                      pullNextOuter(value);
                                  }
                                  else {
                                      outerValues.push(value);
                                  }
                                  results[0] = outer.next();
                                  break;
                              }
                              case 1 : {
                                  yield yield __await(value);
                                  const { [index - 1]: inner } = inners;
                                  const { [index - 1]: { signal }, } = controllers;
                                  results[index] = inner.next().catch(ignoreInnerAbortErrors(signal));
                                  break;
                              }
                          }
                      }
                      else {
results[index] = NEVER_PROMISE;
                          switch (type) {
                              case 0 : {
                                  outerComplete = true;
                                  break;
                              }
                              case 1 : {
                                  --active;
innerIndices.push(index);
while (active < concurrent && outerValues.length) {
pullNextOuter(outerValues.shift());
                                  }
                                  break;
                              }
                          }
                      }
                  } while (!outerComplete || active + outerValues.length > 0);
              }
              finally {
                  controllers.forEach((controller) => controller === null || controller === void 0 ? void 0 : controller.abort());
                  yield __await(Promise.all([outer, ...inners].map(returnAsyncIterator)));
              }
              function pullNextOuter(outerValue) {
                  ++active;
                  const index = innerIndices.pop() || active;
if (switchMode && controllers[index - 1]) {
                      controllers[index - 1].abort();
                  }
                  controllers[index - 1] = new AbortController();
                  const innerSignal = controllers[index - 1].signal;

const inner = selector.call(thisArg, outerValue, outerIndex++, innerSignal);
                  results[index] = wrapAndPullInner(index, innerSignal, inner).catch(ignoreInnerAbortErrors(innerSignal));
              }
              function wrapAndPullInner(index, signal, inner) {
                  if (isPromise(inner)) {
                      return inner.then((inner) => wrapAndPullInner(index, signal, inner));
                  }
                  return (inners[index - 1] = wrapIterator(AsyncIterableX.as(inner), index, 1 , signal)).next();
              }
          });
      }
  }
function flatMap(selector, concurrent = Infinity, thisArg) {
      return function flatMapOperatorFunction(source) {
          return new FlattenConcurrentAsyncIterable(source, selector, concurrent, false, thisArg);
      };
  }
class TakeWhileAsyncIterable extends AsyncIterableX {
      constructor(source, predicate) {
          super();
          this._source = source;
          this._predicate = predicate;
      }
      [Symbol.asyncIterator](signal) {
          return __asyncGenerator(this, arguments, function* _a() {
              var _b, e_1, _c, _d;
              throwIfAborted(signal);
              let i = 0;
              try {
                  for (var _e = true, _f = __asyncValues(wrapWithAbort(this._source, signal)), _g; _g = yield __await(_f.next()), _b = _g.done, !_b; _e = true) {
                      _d = _g.value;
                      _e = false;
                      const item = _d;
                      if (!(yield __await(this._predicate(item, i++, signal)))) {
                          break;
                      }
                      yield yield __await(item);
                  }
              }
              catch (e_1_1) { e_1 = { error: e_1_1 }; }
              finally {
                  try {
                      if (!_e && !_b && (_c = _f.return)) yield __await(_c.call(_f));
                  }
                  finally { if (e_1) throw e_1.error; }
              }
          });
      }
  }
function takeWhile(predicate) {
      return function takeWhileOperatorFunction(source) {
          return new TakeWhileAsyncIterable(source, predicate);
      };
  }

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

  function objectToFormData(obj) {
    const formData = new FormData();
    Object.entries(obj).forEach(([k, v]) => {
      formData.append(k, v);
    });
    return formData;
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

  function waitForElementToAppear(parent, selector, callback) {
    const observer = new MutationObserver((_mutations) => {
      const el = parent.querySelector(selector);
      if (el) {
        observer.disconnect();
        callback(el);
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

  function querySelectorLast(root = document, selector) {
    const nodes = root.querySelectorAll(selector);
    return nodes.length > 0 ? nodes[nodes.length - 1] : void 0;
  }
  function querySelectorLastNumber(selector, e = document) {
    const text = querySelectorText(e, selector);
    return Number(text.match(/\d+/g)?.pop() || 0);
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
  function copyAttributes(target, source) {
    for (const attr of source.attributes) {
      if (attr.nodeValue) {
        target.setAttribute(attr.nodeName, attr.nodeValue);
      }
    }
  }
  function replaceElementTag(e, tagName) {
    const newTagElement = document.createElement(tagName);
    copyAttributes(newTagElement, e);
    newTagElement.innerHTML = e.innerHTML;
    e.parentNode?.replaceChild(newTagElement, e);
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
  function downloader(options = { append: "", after: "", button: "", cbBefore: () => {
  } }) {
    const btn = parseHtml(options.button);
    if (options.append) document.querySelector(options.append)?.append(btn);
    if (options.after) document.querySelector(options.after)?.after(btn);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (options.cbBefore) options.cbBefore();
      waitForElementToAppear(document.body, "video", (video) => {
        window.location.href = video.getAttribute("src");
      });
    });
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
  function parseCssUrl(s) {
    return s.replace(/url\("|"\).*/g, "");
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

  function* irange(start = 1, step = 1) {
    for (let i = start; ; i += step) {
      yield i;
    }
  }
  function range(size, start = 1, step = 1) {
    return irange(start, step).take(size).toArray();
  }

  function onPointerOverAndLeave(container, subjectSelector, onOver, onLeave) {
    let target;
    let onOverFinally;
    function handleLeaveEvent() {
      onLeave?.(target);
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

  class Tick {
    constructor(delay, startImmediate = true) {
      this.delay = delay;
      this.startImmediate = startImmediate;
    }
    tick;
    callbackFinal;
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

  function circularShift(n, c = 6, s = 1) {
    return (n + s) % c || c;
  }

  const $ = _unsafeWindow.$;
  const lskdb = new LSKDB();
  const IS_MEMBER_PAGE = /^\/members\/\d+\/$/.test(location.pathname);
  const IS_MESSAGES_PAGE = /^\/my_messages\//.test(location.pathname);
  const IS_PLAYLIST = /^\/playlist\/\d+\//.test(location.pathname);
  const IS_VIDEO_PAGE = /^\/videos\//.test(location.pathname);
  const IS_MY_WALL = /^\/my_wall\//.test(location.pathname);
  const MY_ID = document.querySelector('[target="_self"]')?.href.match(
    /\/(\d+)\//
  )?.[1];
  const LOGGED_IN = !!MY_ID;
  const IS_MY_MEMBER_PAGE = LOGGED_IN && !!document.querySelector(".my-avatar") && IS_MEMBER_PAGE;
  const IS_OTHER_MEMBER_PAGE = !IS_MY_MEMBER_PAGE && IS_MEMBER_PAGE;
  const IS_MEMBER_FRIEND = IS_OTHER_MEMBER_PAGE && document.querySelector(".case-left")?.innerText.includes(
    "is in your friends"
  );
  function fixPlaylistThumbUrl(src) {
    return src.replace(/playlist\/\d+\/video/, () => "videos");
  }
  const defaultRulesConfig = {
    thumbsSelector: "div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder",
    getThumbImgData(thumb) {
      const img = thumb.querySelector("img");
      const privateThumb = thumb.querySelector(".private");
      let imgSrc = img?.getAttribute("data-original");
      if (privateThumb) {
        imgSrc = parseCssUrl(privateThumb.style.background);
        privateThumb.removeAttribute("style");
      }
      img.removeAttribute("data-original");
      img.removeAttribute("data-cnt");
      img.classList.remove("lazy-load");
      return { img, imgSrc };
    },
    containerSelectorLast: ".thumbs-items",
    titleSelector: ".title",
    durationSelector: ".duration",
    customThumbDataSelectors: {
      private: { selector: ".private", type: "boolean" },
      hd: { selector: ".quality", type: "boolean" },
      views: { selector: ".view", type: "number" }
    },
    animatePreview,
    customDataSelectorFns: [
      "filterInclude",
      "filterExclude",
      "filterDuration",
      {
        filterPrivate: (el, state) => state.filterPrivate && el.private
      },
      {
        filterPublic: (el, state) => state.filterPublic && !el.private
      },
      {
        filterHD: (el, state) => state.filterHD && !el.hd
      },
      {
        filterNonHD: (el, state) => state.filterNonHD && el.hd
      }
    ],
    schemeOptions: [
      "Text Filter",
      "Duration Filter",
      "Privacy Filter",
      {
        title: "HD Filter",
        content: [
          { filterHD: false, label: "hd" },
          { filterNonHD: false, label: "non-hd" }
        ]
      },
      "Badge",
      {
        title: "Advanced",
        content: [{ autoRequestAccess: false, label: "check access sends friend requests" }]
      }
    ],
    gropeStrategy: getCommonParents([
      ...document.querySelectorAll(
        "div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder"
      )
    ]).length < 2 ? "all-in-one" : "all-in-all"
  };
  const config = IS_MY_MEMBER_PAGE || IS_MY_WALL ? await( createPrivateFeed()) : defaultRulesConfig;
  const rules = new RulesGlobal(config);
  _GM_addStyle(`
  .haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
  .haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
  .success { background: linear-gradient(#2f6eb34f, #66666647) !important; }
  .failure { background: linear-gradient(rgba(179, 47, 47, 0.31), rgba(102, 102, 102, 0.28)) !important; }
  .friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
  .friendProfile { background: radial-gradient(circle, rgb(28, 42, 50) 48%, rgb(0, 0, 0) 100%) !important; }
  `);
  function friend(id, message = "") {
    return fetch(
      `https://thisvid.com/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=${message}`
    );
  }
  function acceptFriendship(id) {
    const body = objectToFormData({
      action: "confirm_add_to_friends",
      function: "get_block",
      block_id: "member_profile_view_view_profile",
      confirm: "",
      format: "json",
      mode: "async"
    });
    const url = `https://thisvid.com/members/${id}/`;
    return fetch(url, { body, method: "post" });
  }
  async function getMemberFriends(memberId, by) {
    const { friendsCount } = await getMemberData(memberId);
    const offset = Math.ceil(friendsCount / 24);
    let friendsURL = `https://thisvid.com/members/${memberId}/friends/`;
    if (by === "activity") friendsURL = "https://thisvid.com/my_friends_by_activity/";
    if (by === "popularity") friendsURL = "https://thisvid.com/my_friends_by_popularity/";
    async function* g() {
      for (const o of range(offset)) {
        const html = await fetchHtml(`${friendsURL}${o}/`);
        for await (const id of getMembers(html)) {
          yield id;
        }
      }
    }
    return g();
  }
  function getMembers(el) {
    const friendsList = el.querySelector("#list_members_friends_items") || el;
    return Array.from(friendsList.querySelectorAll(".tumbpu") || []).map((e) => e.href.match(/\d+/)?.[0]).filter((_) => _);
  }
  async function friendMemberFriends(orientationFilter) {
    const memberId = window.location.pathname.match(/\d+/)?.[0];
    friend(memberId);
    const friends = await getMemberFriends(memberId);
    await from(friends).pipe(
      flatMap(async (fid) => {
        if (!orientationFilter) {
          await friend(fid);
        } else {
          const { orientation, uploadedPrivate } = await getMemberData(fid);
          if (uploadedPrivate > 0 && (orientation === orientationFilter || orientationFilter === "Straight" && orientation === "Lesbian")) {
            await friend(fid);
          }
        }
      }, 60)
    ).forEach(() => {
    });
  }
  function initFriendship() {
    _GM_addStyle(
      ".buttons {display: flex; flex-wrap: wrap} .buttons button, .buttons a {align-self: center; padding: 4px; margin: 5px;}"
    );
    const buttons = [
      { color: "#ff7194", orientation: void 0 },
      { color: "#ba71ff", orientation: "Straight" },
      { color: "#46baff", orientation: "Gay" },
      { color: "#4ebaaf", orientation: "Bisexual" }
    ];
    buttons.forEach((b) => {
      const button = parseHtml(
        `<button style="background: radial-gradient(red, ${b.color});">friend ${b.orientation || "everyone"}</button>`
      );
      document.querySelector(".buttons")?.append(button);
      button.addEventListener("click", (e) => handleClick(e, b.orientation), {
        once: true
      });
    });
    function handleClick(e, orientationFilter) {
      const button = e.target;
      button.style.background = "radial-gradient(#ff6114, #5babc4)";
      button.innerText = "processing requests";
      friendMemberFriends(orientationFilter).then(() => {
        button.style.background = "radial-gradient(blue, lightgreen)";
        button.innerText = "friend requests sent";
      });
    }
  }
  async function getMemberData(id) {
    const url = id.includes("member") ? id : `/members/${id}/`;
    const doc = await fetchHtml(url);
    const data = {};
    doc.querySelectorAll(".profile span").forEach((s) => {
      if (s.innerText.includes("Name:")) {
        data.name = s.firstElementChild?.innerText;
      }
      if (s.innerText.includes("Orientation:")) {
        data.orientation = s.firstElementChild?.innerText;
      }
    });
    data.uploadedPublic = querySelectorLastNumber(
      ".headline:has(+ #list_videos_public_videos_items) span",
      doc
    );
    data.uploadedPrivate = querySelectorLastNumber(
      ".headline:has(+ #list_videos_private_videos_items) span",
      doc
    );
    data.friendsCount = querySelectorLastNumber("#list_members_friends span", doc);
    return data;
  }
  function requestAccessVideoPage() {
    const holder = document.querySelector(".video-holder > p");
    if (holder) {
      const uploader = document.querySelector("a.author").href.match(/\d+/)?.at(-1);
      const button = parseHtml(
        `<button onclick="requestPrivateAccess(event, ${uploader}); this.onclick=null;">Friend Request</button>`
      );
      holder.parentElement?.append(button);
    }
  }
  const requestPrivateAccess = (e, memberid) => {
    e.preventDefault();
    friend(memberid, "");
    e.target.innerText = e.target.innerText.replace(
      "🚑",
      "🍆"
    );
  };
  async function checkPrivateVideoAccess(url) {
    const html = await fetchHtml(url);
    const holder = html.querySelector(".video-holder > p");
    const access = !holder;
    const uploaderEl = holder ? holder.querySelector("a") : html.querySelector("a.author");
    const uploaderURL = uploaderEl.href.match(/\d+/)?.at(-1);
    const uploaderName = uploaderEl.innerText;
    return {
      access,
      uploaderURL,
      uploaderName
    };
  }
  function getUncheckedPrivateThumbs(html = document) {
    return [
      ...html.querySelectorAll(
        ".tumbpu:has(.private):not(.haveNoAccess,.haveAccess), .thumb-holder:has(.private):not(.haveNoAccess,.haveAccess)"
      )
    ];
  }
  const uploadersChecked = new Set();
  async function requestAccess() {
    const checkAccess = async (thumb) => {
      const url = thumb.querySelector("a")?.href || thumb?.href;
      const { access, uploaderURL } = await checkPrivateVideoAccess(url);
      thumb.classList.add(access ? "haveAccess" : "haveNoAccess");
      if (access) return;
      if (rules.store.state.autoRequestAccess && !uploadersChecked.has(uploaderURL)) {
        acceptFriendship(uploaderURL);
        friend(uploaderURL);
      }
    };
    for (const t of getUncheckedPrivateThumbs()) {
      await checkAccess(t);
    }
  }
  const createDownloadButton = () => downloader({
    append: "",
    after: ".share_btn",
    button: '<li><a href="#" style="text-decoration: none;font-size: 2rem;">📼</a></li>',
    cbBefore: () => $(".fp-ui").click()
  });
  function animatePreview(_) {
    const tick = new Tick(750);
    $('img[alt!="Private"]').off();
    function iteratePreviewFrames(img) {
      img.src = img.getAttribute("src").replace(
        /(\d+)(?=\.jpg$)/,
        (_2, n) => `${circularShift(parseInt(n), 6)}`
      );
    }
    function animate(container) {
      onPointerOverAndLeave(
        container,
        (target) => !!target.getAttribute("src"),
        (target) => {
          const e = target;
          const orig = target.getAttribute("src");
          tick.start(
            () => iteratePreviewFrames(e),
            () => {
              e.src = orig;
            }
          );
        },
        () => tick.stop()
      );
    }
    animate(document.querySelector(".content") || document.body);
  }
  async function getMemberVideos(id, type = "private") {
    const { uploadedPrivate, uploadedPublic, name } = await getMemberData(id);
    const videosCount = type === "private" ? uploadedPrivate : uploadedPublic;
    const url = new URL(`https://thisvid.com/members/${id}/${type}_videos/`);
    const doc = await fetchHtml(url.href);
    const paginationStrategy = getPaginationStrategy({ doc, url });
    const memberVideosGenerator = InfiniteScroller.generatorForPaginationStrategy(paginationStrategy);
    return { name, videosCount, memberVideosGenerator };
  }
  function createPrivateFeedButton() {
    const container = document.querySelectorAll(".sidebar ul")[1];
    const links = [
      { hov: "#private_feed", text: "My Private Feed" },
      { hov: "#private_feed_popularity", text: "My Private Feed by Popularity" },
      { hov: "#private_feed_activity", text: "My Private Feed by Activity" },
      { hov: "#public_feed", text: "My Public Feed" },
      { hov: "#public_feed_popularity", text: "My Public Feed by Popularity" },
      { hov: "#public_feed_activity", text: "My Public Feed by Activity" }
    ];
    const fragment = document.createDocumentFragment();
    links.forEach(({ hov, text }) => {
      const button = parseHtml(
        `<li><a style="color: lightblue;" href="https://thisvid.com/my_wall/${hov}" class="selective"><i class="ico-arrow"></i>${text}</a></li>`
      );
      fragment.append(button);
    });
    container.append(fragment);
  }
  async function createPrivateFeed() {
    createPrivateFeedButton();
    if (!location.hash.includes("feed")) return defaultRulesConfig;
    const isPubKey = window.location.hash.includes("public_feed") ? "public" : "private";
    const sortByFeed = window.location.hash.includes("activity") ? "activity" : window.location.hash.includes("popularity") ? "popularity" : void 0;
    const container = parseHtml('<div class="thumbs-items"></div>');
    const ignored = parseHtml('<div class="ignored"><h2>IGNORED:</h2></div>');
    const containerParent = document.querySelector(
      ".main > .container > .content"
    );
    containerParent.innerHTML = "";
    containerParent?.nextElementSibling?.remove();
    containerParent.append(container);
    container.before(ignored);
    _GM_addStyle(`
   .content { width: auto; }
   .member-videos, .ignored { background: #b3b3b324; min-height: 3rem; margin: 1rem 0px; color: #fff; font-size: 1.24rem; display: flex; flex-wrap: wrap; justify-content: center;
     padding: 10px; width: 100%; }
   .member-videos * {  padding: 5px; margin: 4px; }
   .member-videos h2 a { font-size: 1.24rem; margin: 0; padding: 0; display: inline; }
   .ignored * {  padding: 4px; margin: 5px; }
   .thumbs-items { display: flex; flex-wrap: wrap; }`);
    const { friendsCount } = await getMemberData(MY_ID);
    class FeedGenerator {
      constructor(id, memberGeneratorCallback, type = "private", by = void 0) {
        this.id = id;
        this.memberGeneratorCallback = memberGeneratorCallback;
        this.type = type;
        this.by = by;
      }
      offset = 0;
      minVideoCount = 1;
      skip(n) {
        this.offset += n;
      }
      filterMinVideoCount(n) {
        this.minVideoCount = n;
      }
      async *consume() {
        const membersIds = await getMemberFriends(this.id, this.by);
        const stream = from(membersIds).pipe(
          concatMap(async (mid, index) => {
            if (index < this.offset) return from([]);
            this.offset = index;
            const { memberVideosGenerator, name, videosCount } = await getMemberVideos(
              mid,
              this.type
            );
            if (lskdb.hasKey(mid) || videosCount < this.minVideoCount) return from([]);
            this.memberGeneratorCallback?.(name, videosCount, mid);
            return from(memberVideosGenerator).pipe(
              takeWhile(() => index >= this.offset),
              map(async (element) => ({ url: element.url, offset: index }))
            );
          })
        );
        yield* stream;
      }
    }
    const feedGenerator = new FeedGenerator(
      MY_ID,
      (name, videosCount, id) => {
        if (container.querySelector(`#mem-${id}`)) return;
        container.append(
          parseHtml(`
       <div class="member-videos" id="mem-${id}">
         <h2><a href="/members/${id}/">${name}</a> ${videosCount} videos</h2>
         <button onClick="hideMemberVideos(event)">ignore 🗡</button>
         <button onClick="hideMemberVideos(event, false)">skip</button>
       </div>`)
        );
      },
      isPubKey,
      sortByFeed
    );
    const ignoredMembers = lskdb.getAllKeys();
    ignoredMembers.forEach((im) => {
      document.querySelector(".ignored")?.append(
        parseHtml(`<button id="#ir-${im}" onClick="unignore(event)">${im} 🗡</button>`)
      );
    });
    const skip = (n) => {
      feedGenerator.skip(n);
      document.querySelector(".thumbs-items").innerHTML = "";
    };
    const hideMemberVideos = (e, ignore = true) => {
      const container2 = e.target?.closest("div");
      let id = container2.id;
      const videosCount = querySelectorLastNumber(`#${id}`);
      document.querySelectorAll(`#${id}~a`).values().take(videosCount).forEach((e2) => {
        e2.remove();
      });
      container2.remove();
      id = id.slice(4);
      if (ignore) {
        const btn = parseHtml(
          `<button id="irm-${id}" onClick="unignore(event)">${id} X</button>`
        );
        document.querySelector(".ignored")?.append(btn);
        lskdb.setKey(id);
      }
    };
    const unignore = (e) => {
      const target = e.target;
      const id = target.id.slice(4);
      lskdb.removeKey(id);
      target.remove();
    };
    const filterMinVideoCount = (n) => feedGenerator.filterMinVideoCount(n);
    Object.assign(_unsafeWindow, { unignore, hideMemberVideos });
    const customGenerator = await feedGenerator.consume();
    const rulesConfig = Object.assign(defaultRulesConfig, {
      containerSelector: () => container,
      intersectionObservableSelector: ".footer",
      customGenerator,
      paginationStrategyOptions: {
        getPaginationLast: () => friendsCount,
        paginationSelector: ".footer"
      },
      schemeOptions: [
        "Text Filter",
        "Duration Filter",
        "Privacy Filter",
        "Badge",
        {
          title: "Feed Controls",
          content: [
            { "skip 10": () => skip(10) },
            { "skip 100": () => skip(100) },
            { "skip 1000": () => skip(1e3) },
            { "filter >10": () => filterMinVideoCount(10) },
            { "filter >25": () => filterMinVideoCount(25) },
            { "filter >100": () => filterMinVideoCount(100) }
          ]
        },
        "Advanced"
      ]
    });
    return rulesConfig;
  }
  function deleteMsg(id) {
    fetch(
      `https://thisvid.com/my_messages/inbox/?mode=async&format=json&action=delete&function=get_block&block_id=list_messages_my_conversation_messages&delete[]=${id}`
    );
  }
  async function clearMessages() {
    const sortMsgs = (doc) => {
      doc.querySelectorAll(".entry").forEach((e) => {
        const id = e.querySelector('input[name="delete[]"]')?.value;
        const msg = e.querySelector(".user-comment")?.innerText;
        if (/has confirmed|declined your|has removed/g.test(msg)) deleteMsg(id);
      });
    };
    await Promise.all(
      Array.from(
        { length: rules.paginationStrategy.getPaginationLast() },
        (_, i) => fetchHtml(`https://thisvid.com/my_messages/inbox/${i + 1}/`).then(
          (html) => sortMsgs(html)
        )
      )
    );
  }
  function clearMessagesButton() {
    const btn = parseHtml("<button>clear messages</button>");
    btn.addEventListener("click", clearMessages);
    document.querySelector(".headline")?.append(btn);
  }
  function highlightMessages() {
    document.querySelectorAll(".entry").forEach((entry) => {
      const memberUrl = entry.querySelector("a")?.href;
      getMemberData(memberUrl).then(({ uploadedPublic, uploadedPrivate }) => {
        if (uploadedPrivate > 0) {
          const success = !entry.innerText.includes("has declined");
          entry.classList.add(success ? "success" : "failure");
        }
        entry.querySelector(".user-comment p").innerText += `  |  videos: ${uploadedPublic} public, ${uploadedPrivate} private`;
      });
    });
  }
  if (LOGGED_IN) {
    rules.store.eventSubject.subscribe((x) => {
      if (x.includes("check access")) {
        requestAccess();
      }
    });
  }
  if (IS_MESSAGES_PAGE) {
    clearMessagesButton();
    highlightMessages();
  }
  if (IS_VIDEO_PAGE) {
    requestAccessVideoPage();
    createDownloadButton();
  }
  if (IS_OTHER_MEMBER_PAGE) {
    initFriendship();
  }
  Object.assign(_unsafeWindow, { requestPrivateAccess });
  if (IS_MEMBER_FRIEND) {
    document.querySelector(".profile")?.classList.add("friendProfile");
  }
  if (IS_PLAYLIST) {
    const videoUrl = fixPlaylistThumbUrl(location.pathname);
    const desc = document.querySelector(
      ".tools-left > li:nth-child(4) > .title-description"
    );
    const link = replaceElementTag(desc, "a");
    link.href = videoUrl;
  }

})(jabronioutfit);