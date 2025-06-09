declare const _default: () => {
    database: {
        host: string | undefined;
        port: number;
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
    };
    redis: {
        host: string | undefined;
        port: number;
        ttl: number;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
};
export default _default;
