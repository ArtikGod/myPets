const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const ContactController = require("../../src/controllers/contactController");
const ContactService = require("../../src/services/contactService");

jest.mock("../../src/services/contactService");

describe("Contacts API", () => {
    let app;
    let svc;
    let ctrl;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());

        svc = new ContactService();
        svc.getContactById = jest.fn();
        svc.createContact = jest.fn();
        svc.updateContact = jest.fn();

        ctrl = new ContactController(svc);

        app.get("/contacts/:id", (req, res, next) =>
            ctrl.getContactById(req, res, next)
        );
        app.post("/contacts", (req, res, next) =>
            ctrl.createContact(req, res, next)
        );
        app.put("/contacts/:id", (req, res, next) =>
            ctrl.updateContact(req, res, next)
        );

        app.use((err, req, res, next) =>
            res.status(500).json({ error: err.message })
        );
    });

    test("GET /contacts/:id", async () => {
        svc.getContactById.mockResolvedValue({ id: 1, name: "C" });
        const r = await request(app).get("/contacts/1");
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ id: 1, name: "C" });
    });

    test("POST /contacts returns id", async () => {
        svc.createContact.mockResolvedValue({ id: 3, name: "NC" });
        const r = await request(app).post("/contacts").send({ name: "NC" });
        expect(r.status).toBe(201);
        expect(r.body).toEqual({ id: 3 });
    });

    test("PUT /contacts/:id", async () => {
        svc.updateContact.mockResolvedValue({ id: 1, name: "U" });
        const r = await request(app).put("/contacts/1").send({ name: "U" });
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ id: 1, name: "U" });
    });

    test("validation error returns 400", async () => {
        const r = await request(app).post("/contacts").send({ name: "   " });
        expect(r.status).toBe(400);
        expect(r.body.error).toBe("Validation failed");
    });
});
