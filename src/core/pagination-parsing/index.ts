import {
  PaginationStrategy,
  PaginationStrategyDataParams,
  PaginationStrategyPathnameParams,
  PaginationStrategySearchParams,
} from './pagination-strategies';
import { getPaginationLinks } from './pagination-utils';

export function getPaginationStrategy(
  options: Partial<PaginationStrategy>,
): PaginationStrategy {
  const _paginationStrategy = new PaginationStrategy(options);
  const pagination = _paginationStrategy.getPaginationElement();

  Object.assign(options, { ..._paginationStrategy });
  const { url, searchParamSelector } = options;

  if (!pagination) {
    // console.error('Found No Pagination');
    return _paginationStrategy;
  }

  if (typeof options.getPaginationUrlGenerator === 'function') {
    // console.log(PaginationStrategy.name);
    return new PaginationStrategy(options);
  }

  const pageLinks = getPaginationLinks(pagination, url).map((l) => new URL(l));

  // console.log({ pageLinks: pageLinks.map((l) => l.href) });

  const selectStrategy = (): typeof PaginationStrategy => {
    if (PaginationStrategyDataParams.testLinks(pagination)) {
      return PaginationStrategyDataParams;
    }

    if (PaginationStrategySearchParams.testLinks(pageLinks, searchParamSelector)) {
      return PaginationStrategySearchParams;
    }

    if (PaginationStrategyPathnameParams.testLinks(pageLinks, options)) {
      return PaginationStrategyPathnameParams;
    }

    console.error('Found No Strategy');
    return PaginationStrategy;
  };

  const PaginationStrategyConstructor = selectStrategy();
  const paginationStrategy = new PaginationStrategyConstructor(options);

  // console.log({ [PaginationStrategyConstructor.name]: paginationStrategy });

  return paginationStrategy;
}
