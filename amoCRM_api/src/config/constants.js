// HTTP статусы
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

// API пути
const API_PATHS = {
    OAUTH_TOKEN: "/oauth2/access_token",
    LEADS: "/leads",
    CONTACTS: "/contacts",
    API_VERSION: "/api/v4",
};

// Параметры токенов
const TOKEN_PARAMS = {
    GRANT_TYPE: {
        AUTH_CODE: "authorization_code",
        REFRESH_TOKEN: "refresh_token",
    },
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    EXPIRES_IN: "expires_in",
};

// Заголовки запросов
const HEADERS = {
    AUTHORIZATION: "Authorization",
    CONTENT_TYPE: "Content-Type",
    CONTENT_TYPE_JSON: "application/json",
};

// Типы сущностей
const ENTITY_TYPES = {
    LEAD: "leads",
    CONTACT: "contacts",
};

// Ключи API ответов
const API_RESPONSE_KEYS = {
    EMBEDDED: "_embedded",
    LEADS: "leads",
    CONTACTS: "contacts",
};

// Сообщения об ошибках
const ERROR_MESSAGES = {
    FAILED_GET_TOKEN: "Failed to get access token:",
    FAILED_CREATE_LEAD: "Failed to create lead",
    FAILED_UPDATE_LEAD: "Failed to update lead",
    FAILED_CREATE_CONTACT: "Failed to create contact",
    FAILED_UPDATE_CONTACT: "Failed to update contact",
    MISSING_LEAD_CONTACT_IDS: "lead_id and contact_id are required",
    SOMETHING_WENT_WRONG: "Something went wrong!",
    TOKEN_ERROR: "Token error, trying to refresh...",
    TRYING_NEW_TOKEN: "Trying to get new token using auth code...",
    NO_AUTH_CODE: "No authorization code available",
    VALIDATION_FAILED: "Validation failed",
};

// Пути к файлам
const FILE_PATHS = {
    TOKENS: "../../tokens.json",
};

// OAuth URLs
const OAUTH_URLS = {
    BASE: "https://www.amocrm.ru/oauth",
    DOMAIN_OAUTH: "/oauth",
};

// OAuth параметры
const OAUTH_PARAMS = {
    CLIENT_ID: "client_id",
    REDIRECT_URI: "redirect_uri",
    RESPONSE_TYPE: "response_type",
    STATE: "state",
    CODE: "code",
    RESPONSE_TYPE_VALUE: "code",
};

// Сообщения для пользователя
const USER_MESSAGES = {
    CALLBACK_HIT_LOG: "/callback hit. code=",
    CALLBACK_STATE_LOG: " state=",
    CALLBACK_NONE_LOG: "none",
    CALLBACK_EMPTY_LOG: "",
    REDACTED_SUFFIX_LOG: "***",
    REDACTED_PREFIX_LOG: "diag",
    TOKEN_EXCHANGE_SUCCESS: "token issued. expiresAt=",
    TOKEN_EXCHANGE_ERROR: "exchange error:",
    AUTH_BACKGROUND_PROCESSING:
        "Authorization received. Exchanging code for tokens in background...",
    NO_CODE_ERROR: "No code received",
    CODE_REQUIRED_ERROR: "code is required",
    LINKED_SUCCESS: "linked",
    UNLINKED_SUCCESS: "unlinked",
};

module.exports = {
    HTTP_STATUS,
    API_PATHS,
    TOKEN_PARAMS,
    HEADERS,
    ENTITY_TYPES,
    API_RESPONSE_KEYS,
    ERROR_MESSAGES,
    FILE_PATHS,
    OAUTH_URLS,
    OAUTH_PARAMS,
    USER_MESSAGES,
};
