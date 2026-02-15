import { JabronioGUI } from 'jabroni-outfit';
import { JabronioStore } from 'jabroni-outfit';
import { JabroniTypes } from 'jabroni-outfit';
import { setupScheme } from 'jabroni-outfit';
import { StoreState } from 'jabroni-outfit';

declare type AnyFunction = (...args: any[]) => any;

export declare function checkHomogenity<T extends HTMLElement>(a: T, b: T, options: {
    id?: boolean;
    className?: boolean;
}): boolean;

export declare function chunks<T>(arr: T[], size: number): T[][];

export declare function circularShift(n: number, c?: number, s?: number): number;

export declare function copyAttributes<T extends Element = HTMLElement>(target: T, source: T): void;

declare type CustomThumbDataSelector = {
    [x: string]: _CustomThumbDataSelector;
};

declare type _CustomThumbDataSelector = {
    selector: string;
    type: 'boolean' | 'string' | 'number';
};

declare type DataElement = Record<string, string | number | boolean | HTMLElement>;

declare class DataFilter {
    private rules;
    filters: Map<string, () => DataFilterFn>;
    constructor(rules: RulesGlobal);
    static isFiltered(el: HTMLElement): boolean;
    applyCSSFilters(wrapper?: (cssRule: string) => string): void;
    customDataSelectorFns: Record<string, DataSelectorFn<any>>;
    registerFilters(customFilters: (Record<string, DataSelectorFn<any>> | string)[]): void;
    private customSelectorParser;
    registerFilter(customSelectorName: string): void;
    filterMapping: Record<string, string>;
    selectFilters(filters: {
        [key: string]: boolean;
    }): (() => DataFilterFn)[];
    static customDataSelectorFnsDefault: Record<string, DataSelectorFn<any>>;
}

declare type DataFilterFn = (v: DataElement) => DataFilterResult;

declare interface DataFilterResult {
    tag: string;
    condition: boolean;
}

export declare class DataManager {
    private rules;
    data: Map<string, DataElement>;
    private lazyImgLoader;
    dataFilter: DataFilter;
    constructor(rules: RulesGlobal);
    applyFilters: (filters?: Record<string, boolean>, offset?: number) => Promise<void>;
    filterAll: (offset?: number) => Promise<void>;
    parseDataParentHomogenity?: Parameters<typeof checkHomogenity>[2];
    parseData: (html: HTMLElement, container?: HTMLElement, removeDuplicates?: boolean, shouldLazify?: boolean) => void;
    sortBy<K extends keyof DataElement>(key: K, direction?: boolean): void;
}

declare type DataSelectorFn<R> = DataSelectorFnAdvanced<R> | DataSelectorFnShort;

declare type DataSelectorFnAdvanced<R> = {
    handle: (el: DataElement, state: StoreState, $preDefineResult?: R) => boolean;
    $preDefine?: (state: StoreState) => R;
    deps?: string[];
};

declare type DataSelectorFnShort = (e: DataElement, state: StoreState) => boolean;

declare const DefaultScheme: [{
    readonly title: "Text Filter";
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
    readonly content: [{
        readonly 'sort by views': () => void;
    }, {
        readonly 'sort by duration': () => void;
    }];
}, {
    readonly title: "Privacy Filter";
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
    readonly title: "Advanced";
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
    }];
}, {
    readonly title: "Badge";
    readonly content: [{
        readonly text: "return `${state.$paginationOffset}/${state.$paginationLast}`";
        readonly vif: "return state.$paginationLast > 1";
    }];
}];

export declare function downloader(options?: {
    append: string;
    after: string;
    button: string;
    cbBefore: () => void;
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

declare type GeneratorResult = {
    url: string;
    offset: number;
};

export declare function getCommonParents(elements: HTMLCollection | HTMLElement[]): HTMLElement[];

export declare function getPaginationStrategy(options: Partial<PaginationStrategy>): PaginationStrategy;

export declare class InfiniteScroller {
    enabled: boolean;
    paginationOffset: number;
    parseData?: (document: HTMLElement) => void;
    rules: RulesGlobal;
    private observer?;
    private paginationGenerator;
    constructor(options: InfiniteScrollerOptions);
    dispose(): void;
    setObserver(observable: HTMLElement): this;
    private onScrollCBs;
    onScroll(callback: (scroller: InfiniteScroller) => void, initCall?: boolean): this;
    private _onScroll;
    private setAutoScroll;
    generatorConsumer: () => Promise<boolean>;
    private getPaginationData;
    doScroll(url: string, offset: number): Promise<void>;
    static generatorForPaginationStrategy(pstrategy: PaginationStrategy): OffsetGenerator;
    static create(rules: RulesGlobal): InfiniteScroller;
}

declare type InfiniteScrollerOptions = Pick<InfiniteScroller, 'rules'> & Partial<InfiniteScroller>;

export declare function instantiateTemplate(sourceSelector: string, attributeUpdates: Record<string, string>, contentUpdates: Record<string, string>): string;

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

declare type OffsetGenerator<T = GeneratorResult> = Generator<T> | AsyncGenerator<T>;

export declare function onPointerOverAndLeave(container: HTMLElement, subjectSelector: (target: HTMLElement) => boolean, onOver: (target: HTMLElement) => {
    onOverCallback?: () => void;
    leaveTarget?: HTMLElement;
} | void, onLeave?: (target: HTMLElement) => void): void;

declare class PaginationStrategy {
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

export declare function parseCssUrl(s: string): string;

export declare function parseDataParams(str: string): Record<string, string>;

export declare function parseHtml(html: string): HTMLElement;

export declare function parseIntegerOr(n: string | number, or: number): number;

export declare function querySelectorLast<T extends Element = HTMLElement>(root: ParentNode | undefined, selector: string): T | undefined;

export declare function querySelectorLastNumber(selector: string, e?: ParentNode): number;

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

export declare class RulesGlobal {
    delay?: number;
    customGenerator?: OffsetGenerator;
    getThumbUrl(thumb: HTMLElement | HTMLAnchorElement): string;
    titleSelector: undefined | string;
    uploaderSelector: undefined | string;
    durationSelector: undefined | string;
    customThumbDataSelectors: undefined | CustomThumbDataSelector;
    getThumbDataStrategy: 'default' | 'auto-select' | 'auto-text';
    getThumbDataCallback?: (thumb: HTMLElement, thumbData: ThumbData) => void;
    getThumbData(thumb: HTMLElement): ThumbData;
    getThumbImgDataAttrSelector?: string | string[] | ((img: HTMLImageElement) => string);
    getThumbImgDataAttrDelete?: 'auto' | string;
    getThumbImgDataStrategy: 'default' | 'auto';
    getThumbImgData(thumb: HTMLElement): {
        img?: HTMLImageElement;
        imgSrc?: string;
    };
    containerSelector: string | (() => HTMLElement);
    containerSelectorLast?: string;
    intersectionObservableSelector?: string;
    get intersectionObservable(): "" | Element | null | undefined;
    get observable(): HTMLElement;
    get container(): HTMLElement;
    thumbsSelector: string;
    getThumbsStrategy: 'default' | 'auto';
    getThumbsTransform?: (thumb: HTMLElement) => void;
    getThumbs(html: HTMLElement): HTMLElement[];
    paginationStrategyOptions: Partial<PaginationStrategy>;
    paginationStrategy: PaginationStrategy;
    customDataSelectorFns: (Record<string, DataSelectorFn<any>> | string)[];
    animatePreview?: (doc: HTMLElement) => void;
    storeOptions?: JabroniTypes.StoreStateOptions;
    private createStore;
    schemeOptions: SchemeOptions;
    private createGui;
    store: JabronioStore;
    gui: JabronioGUI;
    dataManager: DataManager;
    infiniteScroller?: InfiniteScroller;
    getPaginationData?: InfiniteScroller['getPaginationData'];
    private resetInfiniteScroller;
    gropeStrategy: 'all-in-one' | 'all-in-all';
    gropeInit(): void;
    get isEmbedded(): boolean;
    private setupStoreListeners;
    dataManagerOptions: Partial<DataManager>;
    private setupDataManager;
    private mutationObservers;
    resetOnPaginationOrContainerDeath: boolean;
    private resetOn;
    onResetCallback?: () => void;
    private reset;
    constructor(options: Partial<RulesGlobal>);
}

export declare function sanitizeStr(s: string): string;

declare type SchemeOptions = (Parameters<typeof setupScheme>[0][0] | JabroniTypes.ExtractValuesByKey<typeof DefaultScheme, 'title'>)[];

export declare function splitWith(s: string, c?: string): Array<string>;

declare type ThumbData = {
    title: string;
    duration?: number;
} & {
    [x: string]: string | boolean | number;
};

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
