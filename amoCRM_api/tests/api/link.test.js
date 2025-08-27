const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const LinkController = require("../../src/controllers/linkController");
const LinkService = require("../../src/services/linkService");

jest.mock("../../src/services/linkService");

describe("Link API", () => {
    let app;
    let svc;
    let ctrl;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());

        svc = new LinkService();
        svc.linkLeadWithContact = jest.fn();
        svc.unlinkLeadFromContact = jest.fn();

        ctrl = new LinkController(svc);

        app.post("/link", (req, res, next) =>
            ctrl.linkLeadWithContact(req, res, next)
        );
        app.delete("/link", (req, res, next) =>
            ctrl.unlinkLeadFromContact(req, res, next)
        );

        app.use((err, req, res, next) =>
            res.status(500).json({ error: err.message })
        );
    });

    test("POST /link returns linked pair", async () => {
        const r = await request(app)
            .post("/link")
            .send({ lead_id: 10, contact_id: 20 });
        expect(r.status).toBe(201);
        expect(r.body).toEqual({ linked: { lead_id: 10, contact_id: 20 } });
    });

    test("DELETE /link returns unlinked pair", async () => {
        const r = await request(app)
            .delete("/link")
            .send({ lead_id: 10, contact_id: 20 });
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ unlinked: { lead_id: 10, contact_id: 20 } });
    });

    test("validation error 400", async () => {
        const r = await request(app)
            .post("/link")
            .send({ lead_id: "x", contact_id: null });
        expect(r.status).toBe(400);
        expect(r.body.error).toBe("Validation failed");
    });
});
