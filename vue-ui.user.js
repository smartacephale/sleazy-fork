// ==UserScript==
// @name         vue-ui
// @description  creates menu, vue, tailwind
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @license      MIT
// @version      1.0
// @match        *://*/*
// ==/UserScript==
/* globals */

/* 
  tailwind cannot be compiled into normal css without js 

  you have to do this in style.css to prevent collisions and than you fucking with million other problems
    #tapermonkey-app {
      @tailwind base;
      @tailwind utilities;
    }

  prefixes doesn't work properly without js too. it's a hell
  should be removed.
*/

class VueUI {
  template = `
  <div class="fixed bottom-0 right-0 z-9999 rounded bg-zinc-800 max-w-full p-2 m-2"
    :class="state.hidden ? 'hover:bg-gray-600' : ''" v-if="state.uiEnabled">

    <!-- SHOW/HIDE BUTTON -->
    <div class="flex items-center cursor-pointer py-1 px-2 m-1 rounded"
      :class="!state.hidden ? 'hover:bg-zinc-900' : ''" @click="state.hidden = !state.hidden">
      <span class="m-auto">
        <svg v-if="state.hidden" class="h-7 w-7 fill-gray-600 stroke-gray-400" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
        </svg>
        <svg v-if="!state.hidden" class="h-7 w-7 fill-gray-600 stroke-gray-400" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </span>
    </div>

    <template v-if="!state.hidden">
      <!-- EXCLUDE FILTER -->
      <div class="flex items-center bg-zinc-900 py-2 px-2 m-1 font-mono rounded">
        <input type="checkbox" id="exclude" v-model="state.filterExclude"
          class="mx-2 size-auto invert checked:invert-0 accent-gray-700">
        <label for="exclude" class="text-zinc-300 flex font-mono">exclude</label>
        <input type="text" v-model="state.filterExcludeWords" placeholder="tag1, tag2,.." class="w-full h-8 text-zinc-300 px-3 py-2 mx-2 rounded-sm bg-zinc-700
            outline-none focus:outline-gray-600 hover:bg-zinc-600">
      </div>

      <!-- INCLUDE FILTER -->
      <div class="flex items-center bg-zinc-900 py-2 px-2 m-1 font-mono rounded">
        <input type="checkbox" id="include" v-model="state.filterInclude"
          class="mx-2 size-auto invert checked:invert-0 accent-gray-700">
        <label for="include" class="text-zinc-300 flex font-mono">include</label>
        <input type="text" v-model="state.filterIncludeWords" placeholder="tag1, tag2,.." class="w-full h-8 text-zinc-300 px-3 py-2 mx-2 rounded-sm bg-zinc-700
            outline-none focus:outline-gray-600 hover:bg-zinc-600">
      </div>

      <!-- PRIVATE/PUBLIC FILTER v-if="Object.hasOwn(state, privateFilter)" -->
      <div v-if="accessFilter" class="flex items-center bg-zinc-900 py-2 px-2 m-1 font-mono rounded">
        <span class="inline-block ml-2">
          <input type="checkbox" id="filterPrivate" v-model="state.filterPrivate"
            class="size-auto invert checked:invert-0 accent-gray-700">
          <label for="filterPrivate" class="text-zinc-300 font-mono ml-2">private</label>
          <span class="ml-2"></span>
          <input type="checkbox" id="filterPublic" v-model="state.filterPublic"
            class="size-auto invert checked:invert-0 accent-gray-700 ml-2">
          <label for="filterPublic" class="text-zinc-300 font-mono ml-2">public</label>
        </span>

        <button type="button" @click="accessFilterCallback"
          class="mx-2 size-auto text-zinc-300 rounded px-3 py-1 bg-gray-700 hover:bg-gray-600 ml-auto">check
          access 🔓</button>
      </div>

      <!-- INFINITE SCROLL -->
      <div class="flex items-center bg-zinc-900 py-2 px-2 m-1 font-mono rounded">
        <input type="checkbox" id="infiniteScrollEnabled" v-model="state.infiniteScrollEnabled"
          class="mx-2 size-auto invert checked:invert-0 accent-gray-700">
        <label for="infiniteScrollEnabled" class="text-zinc-300 flex font-mono">infinite scroll</label>
        <span v-if="stateLocale.pagIndexLast > 1" class="text-zinc-300 ml-auto mr-4">
          {{ stateLocale.pagIndexCur }}/{{ stateLocale.pagIndexLast }}
        </span>
      </div>

      <!-- DURATION FILTER -->
      <div class="flex items-center bg-zinc-900 py-1 px-2 m-1 font-mono rounded">
        <input type="checkbox" id="duration" v-model="state.filterDuration"
          class="mx-2 size-auto invert checked:invert-0 accent-gray-700">
        <label for="duration" class="text-zinc-300 font-mono">duration</label>

        <label for="durationFrom" class="text-zinc-300 mx-2 font-mono">from</label>
        <input type="number" step="10" min="0" max="72000" id="durationFrom" v-model.number="state.filterDurationFrom"
          class="w-24 h-8 text-zinc-300 rounded px-3 py-2 bg-gray-700 hover:bg-gray-600
            outline-none focus:outline-gray-600">

        <label for="durationTo" class="text-zinc-300 mx-2 font-mono">to</label>
        <input type="number" step="10" min="0" max="72000" id="durationTo" v-model.number="state.filterDurationTo"
          class="w-24 h-8 text-zinc-300 rounded px-3 py-2 mr-2 bg-gray-700 hover:bg-gray-600
            outline-none focus:outline-gray-600">
      </div>
    </template>
  </div>`;

  constructor(state, stateLocale, accessFilter = false, accessFilterCallback = false) {
    const root = parseDOM('<div id="tapermonkey-app" style="position: relative; z-index: 999999;"></div>');
      document.body.appendChild(root);

    this.vue = createApp({
      setup: () => ({ state, stateLocale, accessFilter, accessFilterCallback }),
      template: this.template
    }).mount("#tapermonkey-app");

    // since we have this, put vue prop back to avoid collisions
    // @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
    unsafeWindow.Vue = tempVue;
    
    const style_ = `#tapermonkey-app *,#tapermonkey-app :before,#tapermonkey-app :after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}#tapermonkey-app :before,#tapermonkey-app :after{--tw-content: ""}#tapermonkey-app html,#tapermonkey-app :host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}#tapermonkey-app body{margin:0;line-height:inherit}#tapermonkey-app hr{height:0;color:inherit;border-top-width:1px}#tapermonkey-app abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}#tapermonkey-app h1,#tapermonkey-app h2,#tapermonkey-app h3,#tapermonkey-app h4,#tapermonkey-app h5,#tapermonkey-app h6{font-size:inherit;font-weight:inherit}#tapermonkey-app a{color:inherit;text-decoration:inherit}#tapermonkey-app b,#tapermonkey-app strong{font-weight:bolder}#tapermonkey-app code,#tapermonkey-app kbd,#tapermonkey-app samp,#tapermonkey-app pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}#tapermonkey-app small{font-size:80%}#tapermonkey-app sub,#tapermonkey-app sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}#tapermonkey-app sub{bottom:-.25em}#tapermonkey-app sup{top:-.5em}#tapermonkey-app table{text-indent:0;border-color:inherit;border-collapse:collapse}#tapermonkey-app button,#tapermonkey-app input,#tapermonkey-app optgroup,#tapermonkey-app select,#tapermonkey-app textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}#tapermonkey-app button,#tapermonkey-app select{text-transform:none}#tapermonkey-app button,#tapermonkey-app input:where([type=button]),#tapermonkey-app input:where([type=reset]),#tapermonkey-app input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}#tapermonkey-app :-moz-focusring{outline:auto}#tapermonkey-app :-moz-ui-invalid{box-shadow:none}#tapermonkey-app progress{vertical-align:baseline}#tapermonkey-app ::-webkit-inner-spin-button,#tapermonkey-app ::-webkit-outer-spin-button{height:auto}#tapermonkey-app [type=search]{-webkit-appearance:textfield;outline-offset:-2px}#tapermonkey-app ::-webkit-search-decoration{-webkit-appearance:none}#tapermonkey-app ::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}#tapermonkey-app summary{display:list-item}#tapermonkey-app blockquote,#tapermonkey-app dl,#tapermonkey-app dd,#tapermonkey-app h1,#tapermonkey-app h2,#tapermonkey-app h3,#tapermonkey-app h4,#tapermonkey-app h5,#tapermonkey-app h6,#tapermonkey-app hr,#tapermonkey-app figure,#tapermonkey-app p,#tapermonkey-app pre{margin:0}#tapermonkey-app fieldset{margin:0;padding:0}#tapermonkey-app legend{padding:0}#tapermonkey-app ol,#tapermonkey-app ul,#tapermonkey-app menu{list-style:none;margin:0;padding:0}#tapermonkey-app dialog{padding:0}#tapermonkey-app textarea{resize:vertical}#tapermonkey-app input::-moz-placeholder,#tapermonkey-app textarea::-moz-placeholder{opacity:1;color:#9ca3af}#tapermonkey-app input::placeholder,#tapermonkey-app textarea::placeholder{opacity:1;color:#9ca3af}#tapermonkey-app button,#tapermonkey-app [role=button]{cursor:pointer}#tapermonkey-app :disabled{cursor:default}#tapermonkey-app img,#tapermonkey-app svg,#tapermonkey-app video,#tapermonkey-app canvas,#tapermonkey-app audio,#tapermonkey-app iframe,#tapermonkey-app embed,#tapermonkey-app object{display:block;vertical-align:middle}#tapermonkey-app img,#tapermonkey-app video{max-width:100%;height:auto}#tapermonkey-app [hidden]{display:none}#tapermonkey-app *,#tapermonkey-app :before,#tapermonkey-app :after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }#tapermonkey-app ::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }#tapermonkey-app .fixed{position:fixed}#tapermonkey-app .bottom-0{bottom:0}#tapermonkey-app .right-0{right:0}#tapermonkey-app .m-1{margin:.25rem}#tapermonkey-app .m-2{margin:.5rem}#tapermonkey-app .m-auto{margin:auto}#tapermonkey-app .mx-2{margin-left:.5rem;margin-right:.5rem}#tapermonkey-app .ml-2{margin-left:.5rem}#tapermonkey-app .ml-auto{margin-left:auto}#tapermonkey-app .mr-2{margin-right:.5rem}#tapermonkey-app .mr-4{margin-right:1rem}#tapermonkey-app .inline-block{display:inline-block}#tapermonkey-app .flex{display:flex}#tapermonkey-app .hidden{display:none}#tapermonkey-app .size-auto{width:auto;height:auto}#tapermonkey-app .h-7{height:1.75rem}#tapermonkey-app .h-8{height:2rem}#tapermonkey-app .w-24{width:6rem}#tapermonkey-app .w-7{width:1.75rem}#tapermonkey-app .w-full{width:100%}#tapermonkey-app .max-w-full{max-width:100%}#tapermonkey-app .cursor-pointer{cursor:pointer}#tapermonkey-app .items-center{align-items:center}#tapermonkey-app .rounded{border-radius:.25rem}#tapermonkey-app .rounded-sm{border-radius:.125rem}#tapermonkey-app .bg-gray-700{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity))}#tapermonkey-app .bg-zinc-700{--tw-bg-opacity: 1;background-color:rgb(63 63 70 / var(--tw-bg-opacity))}#tapermonkey-app .bg-zinc-800{--tw-bg-opacity: 1;background-color:rgb(39 39 42 / var(--tw-bg-opacity))}#tapermonkey-app .bg-zinc-900{--tw-bg-opacity: 1;background-color:rgb(24 24 27 / var(--tw-bg-opacity))}#tapermonkey-app .fill-gray-600{fill:#4b5563}#tapermonkey-app .stroke-gray-400{stroke:#9ca3af}#tapermonkey-app .p-2{padding:.5rem}#tapermonkey-app .px-2{padding-left:.5rem;padding-right:.5rem}#tapermonkey-app .px-3{padding-left:.75rem;padding-right:.75rem}#tapermonkey-app .py-1{padding-top:.25rem;padding-bottom:.25rem}#tapermonkey-app .py-2{padding-top:.5rem;padding-bottom:.5rem}#tapermonkey-app .font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}#tapermonkey-app .text-zinc-300{--tw-text-opacity: 1;color:rgb(212 212 216 / var(--tw-text-opacity))}#tapermonkey-app .accent-gray-700{accent-color:#374151}#tapermonkey-app .outline-none{outline:2px solid transparent;outline-offset:2px}#tapermonkey-app .invert{--tw-invert: invert(100%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.checked\:invert-0:checked{--tw-invert: invert(0);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.hover\:bg-gray-600:hover{--tw-bg-opacity: 1;background-color:rgb(75 85 99 / var(--tw-bg-opacity))}.hover\:bg-zinc-600:hover{--tw-bg-opacity: 1;background-color:rgb(82 82 91 / var(--tw-bg-opacity))}.hover\:bg-zinc-900:hover{--tw-bg-opacity: 1;background-color:rgb(24 24 27 / var(--tw-bg-opacity))}.focus\:outline-gray-600:focus{outline-color:#4b5563}`;
    GM_addStyle(style_);

    GM_addStyle(`
      #tapermonkey-app .flex.items-center:first-child:hover { background: #3741512b; }
      #tapermonkey-app input[type="text"]:hover { background: #52525b; }
      #tapermonkey-app input[type="number"]:hover { background: #4b5563; }
      #tapermonkey-app button:hover { background: #4b5563; }`);
  }
}

