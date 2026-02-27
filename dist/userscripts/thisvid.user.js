// ==UserScript==
// @name         ThisVid.com Improved
// @namespace    pervertmonkey
// @version      8.0.4
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Preview for private videos. Filter: title, duration, public/private. Check access to private vids. Mass friend request button. Sorts messages. Download button 📼
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thisvid.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.thisvid.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.13/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(async function (core, utils) {
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
    thumbs: {
      selector: "div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder"
    },
    thumb: {
      selectors: {
        title: ".title",
        duration: ".duration",
        private: { selector: ".private", type: "boolean" },
        hd: { selector: ".quality", type: "boolean" },
        views: { selector: ".view", type: "number" }
      }
    },
    thumbImg: {
      getImgData(thumb) {
        const img = thumb.querySelector("img");
        const privateThumb = thumb.querySelector(".private");
        let imgSrc = img?.getAttribute("data-original");
        if (privateThumb) {
          imgSrc = utils.parseCssUrl(privateThumb.style.background);
          privateThumb.removeAttribute("style");
        }
        img.removeAttribute("data-original");
        img.removeAttribute("data-cnt");
        img.classList.remove("lazy-load");
        return { img, imgSrc };
      }
    },
    containerSelectorLast: ".thumbs-items",
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
    gropeStrategy: utils.getCommonParents([
      ...document.querySelectorAll(
        "div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder"
      )
    ]).length < 2 ? "all-in-one" : "all-in-all"
  };
  const config = IS_MY_MEMBER_PAGE || IS_MY_WALL ? await( createPrivateFeed()) : defaultRulesConfig;
  const rules = new core.Rules(config);
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
    const body = utils.objectToFormData({
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
      for (const o of utils.range(offset)) {
        const html = await utils.fetchHtml(`${friendsURL}${o}/`);
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
      const button = utils.parseHtml(
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
    const doc = await utils.fetchHtml(url);
    const data = {};
    doc.querySelectorAll(".profile span").forEach((s) => {
      if (s.innerText.includes("Name:")) {
        data.name = s.firstElementChild?.innerText;
      }
      if (s.innerText.includes("Orientation:")) {
        data.orientation = s.firstElementChild?.innerText;
      }
    });
    data.uploadedPublic = utils.querySelectorLastNumber(
      ".headline:has(+ #list_videos_public_videos_items) span",
      doc
    );
    data.uploadedPrivate = utils.querySelectorLastNumber(
      ".headline:has(+ #list_videos_private_videos_items) span",
      doc
    );
    data.friendsCount = utils.querySelectorLastNumber("#list_members_friends span", doc);
    return data;
  }
  function requestAccessVideoPage() {
    const holder = document.querySelector(".video-holder > p");
    if (holder) {
      const uploader = document.querySelector("a.author").href.match(/\d+/)?.at(-1);
      const button = utils.parseHtml(
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
    const html = await utils.fetchHtml(url);
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
  const createDownloadButton = () => utils.downloader({
    append: "",
    after: ".share_btn",
    button: '<li><a href="#" style="text-decoration: none;font-size: 2rem;">📼</a></li>',
    cbBefore: () => $(".fp-ui").click()
  });
  function animatePreview(_) {
    const tick = new utils.Tick(750);
    $('img[alt!="Private"]').off();
    function iteratePreviewFrames(img) {
      img.src = img.getAttribute("src").replace(
        /(\d+)(?=\.jpg$)/,
        (_2, n) => `${utils.circularShift(parseInt(n), 6)}`
      );
    }
    const container = document.querySelector(".content") || document.body;
    utils.OnHover.create(
      container,
      "div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder",
      (target) => {
        const img = target.querySelector("img");
        const orig = img.getAttribute("src");
        tick.start(
          () => iteratePreviewFrames(img),
          () => {
            img.src = orig;
          }
        );
        return () => tick.stop();
      }
    );
  }
  async function getMemberVideos(id, type = "private") {
    const { uploadedPrivate, uploadedPublic, name } = await getMemberData(id);
    const videosCount = type === "private" ? uploadedPrivate : uploadedPublic;
    const url = new URL(`https://thisvid.com/members/${id}/${type}_videos/`);
    const doc = await utils.fetchHtml(url.href);
    const paginationStrategy = core.getPaginationStrategy({ doc, url });
    const memberVideosGenerator = core.InfiniteScroller.generatorForPaginationStrategy(paginationStrategy);
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
      const button = utils.parseHtml(
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
    const container = utils.parseHtml('<div class="thumbs-items"></div>');
    const ignored = utils.parseHtml('<div class="ignored"><h2>IGNORED:</h2></div>');
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
          utils.parseHtml(`
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
        utils.parseHtml(`<button id="#ir-${im}" onClick="unignore(event)">${im} 🗡</button>`)
      );
    });
    const skip = (n) => {
      feedGenerator.skip(n);
      document.querySelector(".thumbs-items").innerHTML = "";
    };
    const hideMemberVideos = (e, ignore = true) => {
      const container2 = e.target?.closest("div");
      let id = container2.id;
      const videosCount = utils.querySelectorLastNumber(`#${id}`);
      document.querySelectorAll(`#${id}~a`).values().take(videosCount).forEach((e2) => {
        e2.remove();
      });
      container2.remove();
      id = id.slice(4);
      if (ignore) {
        const btn = utils.parseHtml(
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
        (_, i) => utils.fetchHtml(`https://thisvid.com/my_messages/inbox/${i + 1}/`).then(
          (html) => sortMsgs(html)
        )
      )
    );
  }
  function clearMessagesButton() {
    const btn = utils.parseHtml("<button>clear messages</button>");
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
    const link = utils.replaceElementTag(desc, "a");
    link.href = videoUrl;
  }

})(core, utils);