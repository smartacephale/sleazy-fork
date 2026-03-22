import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addStyle, unsafeWindow } from '$';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Erome PervertMonkey',
  version: '5.0.20',
  description:
    'Infinite scroll [optional], Filter by Title, Uploader and Video/Photo albums, Sort by Views. Show/Hide Photos in album. Remove disclaimer. Restore Search Bar',
  match: ['*://*.erome.com/*'],
};

const $ = (unsafeWindow as any).$;

const rules = new Rules({
  containerSelector: '#albums',
  gropeStrategy: 'all-in-one',
  thumbs: {
    selector: 'div[id^=album-]',
  },
  thumb: {
    selectors: {
      title: '.album-title',
      uploader: '.album-user',
      videoAlbum: { selector: '.album-videos', type: 'boolean' },
      views: { selector: '.album-bottom-views', type: 'float' },
    },
  },
  storeOptions: { showPhotos: true },
  customDataFilterFns: [
    { filterPhotoAlbums: (el, state) => !!state.filterPhotoAlbums && !el.videoAlbum },
    { filterVideoAlbums: (el, state) => !!state.filterVideoAlbums && !!el.videoAlbum },
  ],
  schemeOptions: [
    'Title Filter',
    'Uploader Filter',
    {
      title: 'Filter Albums',
      content: [
        {
          filterVideoAlbums: false,
          label: 'photo',
        },
        {
          filterPhotoAlbums: false,
          label: 'video',
        },
      ],
    },
    'Sort By Views',
    'Badge',
    'Advanced',
  ],
  containMutationEnabled: false,
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

(function restoreSearchBar() {
  $('[aria-label="Search"]').click(() => $('#searchModal').show());
  $('#searchModal .close').click(() => $('#searchModal').hide());
})();
