const checkAuthorization = (req: any, res: any, next: any) => {
    const userId = req.headers.authorization;
    if (!userId || userId.trim() === '') {
        return res
            .status(401)
            .send({ error: "Authorization header is missing" });
    }
    if (userId.length != 24) {
        return res.status(401).send({ error: "UserId not valid" });
    }
    next();
};

export { checkAuthorization };
