export type ConfigurationType = {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    redis: {
        host: string;
        port: number;
        ttl: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
};
