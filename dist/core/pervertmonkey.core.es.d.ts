import { JabronioGUI } from 'jabroni-outfit';
import { JabronioStore } from 'jabroni-outfit';
import { JabroniTypes } from 'jabroni-outfit';
import { setupScheme } from 'jabroni-outfit';
import { StoreState } from 'jabroni-outfit';
import { Subject } from 'rxjs';

declare type AnyFunction = (...args: any[]) => any;

export declare function areElementsAlike<T extends HTMLElement>(a: T, b: T, options: {
    id?: boolean;
    className?: boolean;
}): boolean;

export declare function chunks<T>(arr: T[], size: number): T[][];

export declare function circularShift(n: number, c?: number, s?: number): number;

export declare function containMutation(container: HTMLElement, mutation: () => void): void;

export declare function copyAttributes<T extends Element = HTMLElement>(target: T, source: T): void;

export declare type DataElement = {
    element: HTMLElement;
    [key: string]: HTMLElement | string | number | boolean;
};

export declare class DataFilter {
    private rules;
    filters: Map<string, () => DataFilterFnRendered>;
    filterDepsMapping: Record<string, string>;
    constructor(rules: Rules);
    static isFiltered(e: HTMLElement): boolean;
    createCssFilters(wrapper?: (cssRule: string) => string): void;
    customDataFilterFns: Record<string, DataFilterFnFrom<any>>;
    registerFilters(customFilters: (Record<string, DataFilterFnFrom<any>> | string)[]): void;
    registerFilter(customSelectorName: string): void;
    selectFilters(filters: {
        [key: string]: boolean;
    }): (() => DataFilterFnRendered)[];
}

declare class DataFilterFn<R> {
    handle: DataFilterFnHandle<R>;
    deps: string[];
    name: string;
    $preDefine?: ((state: StoreState) => R) | undefined;
    static prefix: string;
    static setPrefix(name: string): string;
    constructor(handle: DataFilterFnHandle<R>, deps: string[] | undefined, name: string, $preDefine?: ((state: StoreState) => R) | undefined);
    static from<R>(options: DataFilterFnFrom<R>, name: string): DataFilterFn<R>;
    renderFn(state: StoreState): () => DataFilterFnRendered;
}

declare type DataFilterFnFrom<R> = Partial<DataFilterFn<R>> | DataFilterFnHandle<R>;

declare type DataFilterFnHandle<R> = (el: DataElement, state: StoreState, $preDefineResult?: R) => boolean;

declare type DataFilterFnRendered = (v: DataElement) => DataFilterFnRenderedResult;

declare type DataFilterFnRenderedResult = {
    name: string;
    condition: boolean;
};

export declare class DataManager {
    private rules;
    private containerHomogenity?;
    data: Map<string, DataElement>;
    private lazyImgLoader;
    dataFilter: DataFilter;
    constructor(rules: Rules, containerHomogenity?: Parameters<typeof areElementsAlike>[2] | undefined);
    applyFilters(filters?: Record<string, boolean>, offset?: number): Promise<void>;
    filterAll(offset?: number): Promise<void>;
    parseData(html: HTMLElement, container?: HTMLElement, removeDuplicates?: boolean, shouldLazify?: boolean): Promise<void>;
    private optimize;
    sortBy<K extends keyof DataElement>(key: K, direction?: boolean): void;
}

declare const DefaultScheme: [{
    readonly title: "Title Filter";
    readonly collapsed: true;
    readonly content: [{
        readonly filterExclude: false;
        readonly label: "exclude";
    }, {
        readonly filterExcludeWords: "";
        readonly label: "keywords";
        readonly watch: "filterExclude";
        readonly placeholder: "word, f:full_word, r:RegEx...";
    }, {
        readonly filterInclude: false;
        readonly label: "include";
    }, {
        readonly filterIncludeWords: "";
        readonly label: "keywords";
        readonly watch: "filterInclude";
        readonly placeholder: "word, f:full_word, r:RegEx...";
    }];
}, {
    readonly title: "Uploader Filter";
    readonly collapsed: true;
    readonly content: [{
        readonly filterUploaderExclude: false;
        readonly label: "exclude";
    }, {
        readonly filterUploaderExcludeWords: "";
        readonly label: "keywords";
        readonly watch: "filterUploaderExclude";
        readonly placeholder: "word, f:full_word, r:RegEx...";
    }, {
        readonly filterUploaderInclude: false;
        readonly label: "include";
    }, {
        readonly filterUploaderIncludeWords: "";
        readonly label: "keywords";
        readonly watch: "filterUploaderInclude";
        readonly placeholder: "word, f:full_word, r:RegEx...";
    }];
}, {
    readonly title: "Duration Filter";
    readonly collapsed: true;
    readonly content: [{
        readonly filterDuration: false;
        readonly label: "enable";
    }, {
        readonly filterDurationFrom: 0;
        readonly watch: "filterDuration";
        readonly label: "from";
        readonly type: "time";
    }, {
        readonly filterDurationTo: 600;
        readonly watch: "filterDuration";
        readonly label: "to";
        readonly type: "time";
    }];
}, {
    readonly title: "Sort By";
    readonly collapsed: true;
    readonly content: [{
        readonly 'sort by views': () => void;
    }, {
        readonly 'sort by duration': () => void;
    }];
}, {
    readonly title: "Sort By Duration";
    readonly collapsed: true;
    readonly content: [{
        readonly 'sort by duration': () => void;
    }];
}, {
    readonly title: "Sort By Views";
    readonly collapsed: true;
    readonly content: [{
        readonly 'sort by views': () => void;
    }];
}, {
    readonly title: "Privacy Filter";
    readonly collapsed: true;
    readonly content: [{
        readonly filterPrivate: false;
        readonly label: "private";
    }, {
        readonly filterPublic: false;
        readonly label: "public";
    }, {
        readonly 'check access \uD83D\uDD13': () => void;
    }];
}, {
    readonly title: "HD Filter";
    readonly content: [{
        readonly filterHD: false;
        readonly label: "hd";
    }, {
        readonly filterNonHD: false;
        readonly label: "non-hd";
    }];
}, {
    readonly title: "Advanced";
    readonly collapsed: true;
    readonly content: [{
        readonly infiniteScrollEnabled: true;
        readonly label: "infinite scroll";
    }, {
        readonly autoScroll: false;
        readonly label: "auto scroll";
    }, {
        readonly delay: 250;
        readonly label: "scroll delay";
    }, {
        readonly writeHistory: false;
        readonly label: "write history";
    }, {
        readonly reset: () => void;
    }];
}, {
    readonly title: "Badge";
    readonly content: [{
        readonly text: "return `${state.$paginationOffset}/${state.$paginationLast}`";
        readonly vif: "return state.$paginationLast > 1";
    }];
}];

export declare function downloader(options: {
    append?: string;
    after?: string;
    buttonHtml: string;
    doBefore?: () => void;
}): void;

export declare function exterminateVideo(video: HTMLVideoElement): void;

export declare const fetchHtml: (input: RequestInfo | URL) => Promise<HTMLElement>;

export declare const fetchJson: (input: RequestInfo | URL) => Promise<JSON>;

export declare const fetchText: (input: RequestInfo | URL) => Promise<string>;

export declare function fetchWith<T extends JSON | string | HTMLElement>(input: RequestInfo | URL, options: {
    init?: RequestInit;
    type: 'json' | 'html' | 'text';
    mobile?: boolean;
}): Promise<T>;

export declare function findNextSibling<T extends Element = HTMLElement>(e: T): Element | null;

/**
 * Converts a duration string (e.g., "1h 22min 3sec") to HH:MM:SS format.
 * @param timeStr - The duration string to format.
 * @returns A string in the format HH:MM:SS.
 */
export declare function formatTimeToHHMMSS(timeStr: string): string;

declare type GeneratorResult = {
    url: string;
    offset: number;
};

export declare function getCommonParents<T extends HTMLElement>(elements: Iterable<T>): HTMLElement[];

export declare function getPaginationStrategy(options: Partial<PaginationStrategy>): PaginationStrategy;

export declare class InfiniteScroller {
    paginationOffset: number;
    rules: Rules;
    private observer?;
    private paginationGenerator;
    constructor(options: InfiniteScrollerOptions);
    dispose(): void;
    setObserver(observable: HTMLElement): this;
    subject: Subject<IScrollerSubject>;
    private setAutoScroll;
    generatorConsumer: () => Promise<boolean>;
    private getPaginationData;
    doScroll(url: string, offset: number): Promise<void>;
    static generatorForPaginationStrategy(pstrategy: PaginationStrategy): OffsetGenerator;
    static create(rules: Rules): InfiniteScroller;
}

declare type InfiniteScrollerOptions = Pick<InfiniteScroller, 'rules'> & Partial<InfiniteScroller>;

export declare function instantiateTemplate(sourceSelector: string, attributeUpdates: Record<string, string>, contentUpdates: Record<string, string>): string;

export declare function irange(start?: number, step?: number): Generator<number, void, unknown>;

declare type IScrollerSubject = {
    type: 'scroll';
    scroller: InfiniteScroller;
    page: HTMLElement;
};

declare class JabronioGuiController {
    private store;
    private dataManager;
    constructor(store: JabronioStore, dataManager: DataManager);
    private readonly destroy$;
    dispose(): void;
    private directionalEventObservable$?;
    private directionalEvent;
    private readonly eventsMap;
    private setupStoreListeners;
}

export declare class LazyImgLoader {
    lazyImgObserver: Observer;
    private attributeName;
    constructor(shouldDelazify: (target: Element) => boolean);
    lazify(_target: Element, img?: HTMLImageElement, imgSrc?: string): void;
    delazify: (target: HTMLImageElement) => void;
}

export declare function memoize<T extends AnyFunction>(fn: T): MemoizedFunction<T>;

declare interface MemoizedFunction<T extends AnyFunction> extends CallableFunction {
    (...args: Parameters<T>): ReturnType<T>;
    clear: () => void;
}

export declare const MOBILE_UA: {
    readonly 'User-Agent': string;
};

export declare function objectToFormData<T extends {}>(obj: T): FormData;

export declare class Observer {
    private callback;
    observer: IntersectionObserver;
    private timeout?;
    constructor(callback: (entry: Element) => void);
    observe(target: Element): void;
    throttle(target: Element, throttleTime: number): void;
    handleIntersection(entries: Iterable<IntersectionObserverEntry>): void;
    dispose(): void;
    static observeWhile(target: Element, callback: () => Promise<boolean> | boolean, throttleTime: number): Observer;
}

export declare type OffsetGenerator<T = GeneratorResult> = Generator<T> | AsyncGenerator<T>;

export declare class OnHover {
    private container;
    private targetSelector;
    private onOver;
    private handleLeave;
    private handleHover;
    private target?;
    private onOverCallback?;
    constructor(container: HTMLElement, targetSelector: string, onOver: (target: HTMLElement) => void | (() => void));
    static create(...args: ConstructorParameters<typeof OnHover>): OnHover;
}

export declare class PaginationStrategy {
    doc: Document;
    url: URL;
    paginationSelector: string;
    searchParamSelector: string;
    static _pathnameSelector: RegExp;
    pathnameSelector: RegExp;
    dataparamSelector: string;
    overwritePaginationLast?: (n: number, offset?: number) => number;
    offsetMin: number;
    constructor(options?: Partial<PaginationStrategy>);
    getPaginationElement(): HTMLElement | null;
    get hasPagination(): boolean;
    getPaginationOffset(): number;
    getPaginationLast(): number;
    getPaginationUrlGenerator(): (offset: number) => string | Promise<string>;
}

export declare class PaginationStrategyDataParams extends PaginationStrategy {
    getPaginationLast(): number;
    getPaginationOffset(): number;
    getPaginationUrlGenerator(): (n: number) => string;
    static testLinks(doc?: HTMLElement | Document): boolean;
}

export declare class PaginationStrategyPathnameParams extends PaginationStrategy {
    extractPage: (a: HTMLAnchorElement | Location | string) => number;
    static checkLink(link: URL, pathnameSelector?: RegExp): boolean;
    static testLinks(links: URL[], options: Partial<PaginationStrategy>): boolean;
    getPaginationLast(): number;
    getPaginationOffset(): number;
    getPaginationUrlGenerator(url_?: URL): (offset: number) => string;
}

export declare class PaginationStrategySearchParams extends PaginationStrategy {
    extractPage: (a: HTMLAnchorElement | Location | URL | string) => number;
    getPaginationLast(): number;
    getPaginationOffset(): number;
    getPaginationUrlGenerator(): (offset: number) => string;
    static checkLink(link: URL, searchParamSelector?: string): boolean;
    static testLinks(links: URL[], searchParamSelector?: string): boolean;
}

export declare function parseCssUrl(s: string): string;

export declare function parseDataParams(str: string): Record<string, string>;

export declare function parseHtml(html: string): HTMLElement;

export declare function parseIntegerOr(n: string | number, or: number): number;

export declare function parseNumericAbbreviation(str: string): number;

export declare function parseUrl(s: HTMLAnchorElement | Location | URL | string): URL;

declare type Primitive = string | number | boolean;

export declare function querySelectorLast<T extends Element = HTMLElement>(root: ParentNode | undefined, selector: string): T | undefined;

export declare function querySelectorLastNumber(selector: string, e?: ParentNode): number;

export declare function querySelectorOrSelf<T extends Element = HTMLElement>(element: T, selector: string): T | null;

export declare function querySelectorText(e: ParentNode, selector?: string): string;

export declare function range(size: number, start?: number, step?: number): number[];

export declare class RegexFilter {
    private regexes;
    constructor(str: string, flags?: string);
    private compileSearchRegex;
    hasEvery(str: string): boolean;
    hasNone(str: string): boolean;
}

export declare function removeClassesAndDataAttributes(element: HTMLElement, keyword: string): void;

export declare function replaceElementTag(e: HTMLElement, tagName: string): HTMLElement;

export declare class Rules {
    thumbs: Parameters<typeof ThumbsParser.create>[0];
    thumbsParser: ThumbsParser;
    thumb: Parameters<typeof ThumbDataParser.create>[0];
    thumbDataParser: ThumbDataParser;
    thumbImg: Parameters<typeof ThumbImgParser.create>[0];
    thumbImgParser: ThumbImgParser;
    containerSelector: string | (() => HTMLElement);
    containerSelectorLast?: string;
    get container(): HTMLElement;
    intersectionObservableSelector?: string;
    get intersectionObservable(): HTMLElement | null | undefined;
    get observable(): HTMLElement;
    paginationStrategyOptions: Partial<PaginationStrategy>;
    paginationStrategy: PaginationStrategy;
    dataManager: DataManager;
    containerHomogenity: ConstructorParameters<typeof DataManager>[1];
    customDataFilterFns: (Record<string, DataFilterFnFrom<any>> | string)[];
    private hookDataFilterFns;
    animatePreview?: (doc: HTMLElement) => void;
    storeOptions?: JabroniTypes.StoreStateOptions;
    schemeOptions: SchemeOptions;
    store: JabronioStore;
    gui: JabronioGUI;
    inputController: JabronioGuiController;
    private createStore;
    private createGui;
    customGenerator?: OffsetGenerator;
    infiniteScroller?: InfiniteScroller;
    getPaginationData?: InfiniteScroller['getPaginationData'];
    private resetInfiniteScroller;
    gropeStrategy: 'all-in-one' | 'all-in-all';
    gropeInit(): void;
    get isEmbedded(): boolean;
    containMutationEnabled: boolean;
    private mutationObservers;
    resetOnPaginationOrContainerDeath: boolean;
    private resetOn;
    onResetCallback?: () => void;
    private reset;
    constructor(options: Partial<Rules>);
}

export declare function runIdleJob<T>(iterator: Iterator<T>, job: (v: T) => void): Promise<unknown>;

export declare function sanitizeStr(s: string): string;

declare type SchemeKeys = JabroniTypes.ExtractValuesByKey<typeof DefaultScheme, 'title'>;

declare type SchemeOptions = (Parameters<typeof setupScheme>[0][0] | SchemeKeys)[];

export declare function splitWith(s: string, c?: string): Array<string>;

declare type ThumbData = Record<string, Primitive>;

export declare class ThumbDataParser {
    strategy: 'manual' | 'auto-select' | 'auto-text';
    selectors: ThumbDataSelectorsRaw;
    callback?: ((thumb: HTMLElement, thumbData: ThumbData) => void) | undefined;
    private autoParseText;
    getUrl(thumb: HTMLElement | HTMLAnchorElement): string;
    private preprocessCustomThumbDataSelectors;
    private thumbDataSelectors;
    private readonly defaultThumbDataSelectors;
    private getThumbDataWith;
    constructor(strategy?: 'manual' | 'auto-select' | 'auto-text', selectors?: ThumbDataSelectorsRaw, callback?: ((thumb: HTMLElement, thumbData: ThumbData) => void) | undefined);
    static create(o?: Partial<Pick<ThumbDataParser, 'strategy' | 'selectors' | 'callback'>>): ThumbDataParser;
    getThumbData(thumb: HTMLElement): ThumbData;
}

declare type ThumbDataSelector = {
    name: string;
    selector: string;
    type: 'boolean' | 'string' | 'number' | 'float' | 'duration';
};

declare type ThumbDataSelectorsRaw = Record<string, string | Pick<ThumbDataSelector, 'selector' | 'type'>>;

export declare class ThumbImgParser {
    selector?: string | string[] | ((img: HTMLImageElement) => string);
    remove?: 'auto' | string;
    strategy: 'default' | 'auto';
    static create(options?: Partial<Pick<ThumbImgParser, 'selector' | 'remove' | 'strategy' | 'getImgData'>>): ThumbImgParser & Partial<Pick<ThumbImgParser, "selector" | "strategy" | "remove" | "getImgData">>;
    private removeAttrs;
    private getImgSrc;
    getImgData(thumb: HTMLElement): {
        img?: undefined;
        imgSrc?: undefined;
    } | {
        img: HTMLImageElement;
        imgSrc: string;
    };
}

export declare class ThumbsParser {
    selector: string;
    strategy: 'default' | 'auto';
    transform?: (thumb: HTMLElement) => void;
    static create(options?: Partial<Pick<ThumbsParser, 'selector' | 'strategy' | 'transform'>>): ThumbsParser & Partial<Pick<ThumbsParser, "selector" | "strategy" | "transform">>;
    getThumbs(container: HTMLElement): HTMLElement[];
}

export declare class Tick {
    private delay;
    private startImmediate;
    private tick?;
    private callbackFinal?;
    constructor(delay: number, startImmediate?: boolean);
    start(callback: () => void, callbackFinal?: () => void): void;
    stop(): void;
}

/**
 * Converts a time string (HH:MM:SS or duration format) to total seconds.
 * @param timeStr - The time string to convert.
 * @returns The total number of seconds.
 */
export declare function timeToSeconds(timeStr: string): number;

export declare function wait(milliseconds: number): Promise<unknown>;

export declare function waitForElementToAppear(parent: ParentNode, selector: string, callback: (el: Element) => void): MutationObserver;

export declare function waitForElementToDisappear(observable: HTMLElement, callback: () => void): MutationObserver;

export declare function watchDomChangesWithThrottle(element: HTMLElement, callback: () => void, throttle?: number, times?: number, options?: MutationObserverInit): MutationObserver;

export declare function watchElementChildrenCount(element: ParentNode, callback: (observer: MutationObserver, count: number) => void): MutationObserver;

export { }
