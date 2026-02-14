import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addStyle, unsafeWindow } from '$';
import { RulesGlobal } from '../../core/rules';

export const meta: MonkeyUserScript = {
  name: 'Erome PervertMonkey',
  version: '5.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Video/Photo albums',
  match: ['*://*.erome.com/*'],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=erome.com',
};

const $ = (unsafeWindow as any).$;
declare var LazyLoad: ObjectConstructor;

const rules = new RulesGlobal({
  containerSelector: '#albums',
  thumbsSelector: 'div[id^=album-]',
  titleSelector: '.album-title',
  uploaderSelector: '.album-user',
  gropeStrategy: 'all-in-one',
  customThumbDataSelectors: {
    videoAlbum: {
      type: 'boolean',
      selector: '.album-videos',
    },
  },
  storeOptions: { showPhotos: true },
  customDataSelectorFns: [
    'filterInclude',
    'filterExclude',
    {
      filterPhotoAlbums: (el, state) =>
        (state.filterPhotoAlbums && !el.videoAlbum) as boolean,
    },
    {
      filterVideoAlbums: (el, state) =>
        (state.filterVideoAlbums && el.videoAlbum) as boolean,
    },
  ],
  schemeOptions: [
    'Text Filter',
    {
      title: 'Filter Albums',
      content: [
        {
          filterVideoAlbums: true,
          label: 'video albums',
        },
        {
          filterPhotoAlbums: true,
          label: 'photo albums',
        },
      ],
    },
    'Badge',
    'Advanced',
  ],
});

rules.infiniteScroller?.onScroll(() => {
  setTimeout(() => new LazyLoad(), 100);
});

GM_addStyle(`
.inactive-gm { background: #a09f9d; }
.active-gm { background: #eb6395 !important; }
`);

(function disableDisclaimer() {
  if (!$('#disclaimer').length) return;
  $.ajax({ type: 'POST', url: '/user/disclaimer', async: true });
  $('#disclaimer').remove();
  $('body').css('overflow', 'visible');
})();

const IS_ALBUM_PAGE = /^\/a\//.test(window.location.pathname);

function togglePhotoElements() {
  $('.media-group > div:last-child:not(.video)').toggle(rules.store.state.showPhotos);
  $('#togglePhotos').toggleClass('active-gm', rules.store.state.showPhotos);
  $('#togglePhotos').text(!rules.store.state.showPhotos ? 'show photos' : 'hide photos');
}

function setupAlbumPage() {
  $('#user_name')
    .parent()
    .append(
      '<button id="togglePhotos" class="btn btn-pink inactive-gm">show/hide photos</button>',
    );

  $('#togglePhotos').on('click', () => {
    rules.store.state.showPhotos = !rules.store.state.showPhotos;
  });

  rules.store.stateSubject.subscribe(() => {
    togglePhotoElements();
  });

  togglePhotoElements();
}

if (IS_ALBUM_PAGE) {
  setupAlbumPage();
}
