const express = require("express");
const router = express.Router();

const amoConfig = require("../config/amoConfig");
const AmoApi = require("../utils/amoApi");
const constants = require("../config/constants");

const amoApi = new AmoApi(amoConfig);

router.get("/url", (req, res) => {
    const state = req.query.state || "state";

    const authUrl = `${constants.OAUTH_URLS.BASE}?${
        constants.OAUTH_PARAMS.CLIENT_ID
    }=${encodeURIComponent(amoConfig.clientId)}&${
        constants.OAUTH_PARAMS.REDIRECT_URI
    }=${encodeURIComponent(amoConfig.redirectUri)}&${
        constants.OAUTH_PARAMS.RESPONSE_TYPE
    }=${constants.OAUTH_PARAMS.RESPONSE_TYPE_VALUE}&${
        constants.OAUTH_PARAMS.STATE
    }=${encodeURIComponent(state)}`;

    res.json({ authUrl });
});

router.get("/callback", (req, res, next) => {
    const { code, state } = req.query;
    console.log(
        `[AUTH] ${constants.USER_MESSAGES.CALLBACK_HIT_LOG}${
            code
                ? String(code).slice(0, 6) +
                  constants.USER_MESSAGES.REDACTED_SUFFIX_LOG
                : constants.USER_MESSAGES.CALLBACK_NONE_LOG
        }${constants.USER_MESSAGES.CALLBACK_STATE_LOG}${
            state || constants.USER_MESSAGES.CALLBACK_EMPTY_LOG
        }`
    );
    if (!code) {
        return res.status(400).send(constants.USER_MESSAGES.NO_CODE_ERROR);
    }

    res.send(constants.USER_MESSAGES.AUTH_BACKGROUND_PROCESSING);

    setImmediate(async () => {
        try {
            amoApi.setAuthCode(code);
            await amoApi.getNewAccessToken();
            console.log(
                `[AUTH] ${constants.USER_MESSAGES.TOKEN_EXCHANGE_SUCCESS}${amoApi.tokenExpires}`
            );
        } catch (err) {
            console.error(
                `[AUTH] ${constants.USER_MESSAGES.TOKEN_EXCHANGE_ERROR}:`,
                err.response ? err.response.data : err.message
            );
        }
    });
});

router.post("/code", async (req, res, next) => {
    try {
        const { code } = req.body || {};
        if (!code) {
            return res
                .status(constants.HTTP_STATUS.BAD_REQUEST)
                .json({ error: constants.USER_MESSAGES.CODE_REQUIRED_ERROR });
        }

        amoApi.setAuthCode(code);
        const accessToken = await amoApi.getNewAccessToken();

        res.json({ accessToken, expires: amoApi.tokenExpires });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

router.get("/diagnostics", (req, res) => {
    const redacted = (v) =>
        v
            ? `${String(v).slice(0, 4)}${
                  constants.USER_MESSAGES.REDACTED_SUFFIX_LOG
              }`
            : null;
    const state = constants.USER_MESSAGES.REDACTED_PREFIX_LOG;
    const authUrl = `https://${amoConfig.domain}${
        constants.OAUTH_URLS.DOMAIN_OAUTH
    }?${constants.OAUTH_PARAMS.CLIENT_ID}=${encodeURIComponent(
        amoConfig.clientId
    )}&${constants.OAUTH_PARAMS.REDIRECT_URI}=${encodeURIComponent(
        amoConfig.redirectUri
    )}&${constants.OAUTH_PARAMS.RESPONSE_TYPE}=${
        constants.OAUTH_PARAMS.RESPONSE_TYPE_VALUE
    }&${constants.OAUTH_PARAMS.STATE}=${encodeURIComponent(state)}`;

    res.json({
        env: {
            domain: amoConfig.domain,
            clientId: redacted(amoConfig.clientId),
            clientSecret: redacted(amoConfig.clientSecret),
            redirectUri: amoConfig.redirectUri,
        },
        tokenState: {
            hasAccessToken: Boolean(amoApi.accessToken),
            hasRefreshToken: Boolean(amoApi.refreshToken),
            expiresAt: amoApi.tokenExpires || null,
        },
        authUrl,
    });
});
