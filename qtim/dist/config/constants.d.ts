export declare const PAGINATION_CONFIG: {
    DEFAULT_LIMIT: number;
    DEFAULT_PAGE: number;
    MAX_LIMIT: number;
};
export declare const ARTICLES_LOG: {
    CREATED: (id: number) => string;
    UPDATED: (id: number) => string;
    DELETED: (id: number) => string;
    NOT_FOUND: (id: number) => string;
    NOT_PERMITTED: (id: number) => string;
    CACHE_HIT: (key: string) => string;
    CACHE_SET: (key: string) => string;
    CACHE_STORE: string;
    CACHE_ERROR: (stack: string) => string;
};
