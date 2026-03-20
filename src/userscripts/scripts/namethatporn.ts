import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'NameThatPorn PervertMonkey',
  version: '3.0.16',
  description: 'Infinite scroll [optional], Filter by Title, Uploader and Solved/Unsolved',
  match: ['https://namethatporn.com/*'],
};

const rules = new Rules({
  thumbs: { selector: '.item, .nsw_r_w' },
  containerSelector: '#items_wrapper, #nsw_r',
  thumb: {
    selectors: {
      title: '.item_title, .nsw_r_tit',
      uploader: '.item_answer b, .nsw_r_desc',
      solved: { selector: '.item_solved, .nsw_r_slvd', type: 'boolean' },
    },
  },
  thumbImg: {
    selector: (img: HTMLImageElement) =>
      img.getAttribute('data-dyn')?.concat('.webp') || (img.getAttribute('src') as string),
  },
  paginationStrategyOptions: {
    paginationSelector: '#smi_wrp, #nsw_p',
  },
  gropeStrategy: 'all-in-all',
  customDataFilterFns: [
    {
      filterSolved: (e, state) => (state.filterSolved && e.solved) as boolean,
    },
    {
      filterUnsolved: (e, state) => (state.filterUnsolved && !e.solved) as boolean,
    },
  ],
  schemeOptions: [
    'Title Filter',
    'Uploader Filter',
    {
      title: 'Filter Status',
      content: [
        { filterSolved: false, label: 'solved' },
        { filterUnsolved: false, label: 'unsolved' },
      ],
    },
    'Badge',
    'Advanced',
  ],
});

unsafeWindow.confirm = () => true;

function handleKeys(event: KeyboardEvent) {
  if (event.key === 'c') {
    const name = document.querySelector<HTMLElement>('#loggedin_box_new_username')
      ?.innerText as string;
    if (!document.querySelector(`.ida_confirm_usernames a[href$="${name}.html"]`)) {
      document.querySelector<HTMLButtonElement>('.id_answer_buttons > .iab.iac')?.click();
    }
  }
}

unsafeWindow.addEventListener('keydown', handleKeys, { once: true });
