module.exports = {
    i18n: {
        defaultLocale: "ru",
        locales: ["ru", "en"],
        localeDetection: true,
    },
    fallbackLng: {
        default: ["ru"],
    },
    debug: process.env.NODE_ENV === "development",
    reloadOnPrerender: process.env.NODE_ENV === "development",
    localePath: "./public/locales",
    ns: ["common"],
    defaultNS: "common",
};
