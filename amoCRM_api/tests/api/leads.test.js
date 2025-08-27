const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const LeadController = require("../../src/controllers/leadController");
const LeadService = require("../../src/services/leadService");

jest.mock("../../src/services/leadService");

describe("Leads API", () => {
    let app;
    let svc;
    let ctrl;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());

        svc = new LeadService();
        svc.getLeadById = jest.fn();
        svc.createLead = jest.fn();
        svc.updateLead = jest.fn();

        ctrl = new LeadController(svc);

        app.get("/leads/:id", (req, res, next) =>
            ctrl.getLeadById(req, res, next)
        );
        app.post("/leads", (req, res, next) => ctrl.createLead(req, res, next));
        app.put("/leads/:id", (req, res, next) =>
            ctrl.updateLead(req, res, next)
        );

        app.use((err, req, res, next) =>
            res.status(500).json({ error: err.message })
        );
    });

    test("GET /leads/:id", async () => {
        svc.getLeadById.mockResolvedValue({ id: 1, name: "L" });
        const r = await request(app).get("/leads/1");
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ id: 1, name: "L" });
    });

    test("POST /leads", async () => {
        svc.createLead.mockResolvedValue({ id: 2, name: "N" });
        const r = await request(app).post("/leads").send({ name: "N" });
        expect(r.status).toBe(201);
        expect(r.body).toEqual({ id: 2 });
    });

    test("PUT /leads/:id", async () => {
        svc.updateLead.mockResolvedValue({ id: 1, name: "U" });
        const r = await request(app).put("/leads/1").send({ name: "U" });
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ id: 1, name: "U" });
    });

    test("handles errors", async () => {
        svc.getLeadById.mockRejectedValue(new Error("not found"));
        const r = await request(app).get("/leads/0");
        expect(r.status).toBe(500);
        expect(r.body.error).toBe("not found");
    });

    test("POST /leads handles errors", async () => {
        svc.createLead.mockRejectedValue(new Error("create failed"));
        const r = await request(app).post("/leads").send({ name: "X" });
        expect(r.status).toBe(500);
        expect(r.body.error).toBe("create failed");
    });

    test("PUT /leads/:id handles errors", async () => {
        svc.updateLead.mockRejectedValue(new Error("update failed"));
        const r = await request(app).put("/leads/1").send({ name: "U" });
        expect(r.status).toBe(500);
        expect(r.body.error).toBe("update failed");
    });
});
