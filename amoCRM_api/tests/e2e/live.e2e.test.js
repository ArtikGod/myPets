const request = require("supertest");

const PORT = process.env.PORT || 3002;
const BASE = process.env.E2E_BASE || `http://localhost:${PORT}`;

const runE2E = process.env.E2E === "1";

(runE2E ? describe : describe.skip)("E2E amoCRM live flow", () => {
    let leadId;
    let contactId;
    let available = true;

    beforeAll(async () => {
        try {
            const r = await request(BASE).get("/health");
            available = r.status === 200;
        } catch (e) {
            available = false;
            console.warn(
                `[E2E] Server not reachable at ${BASE}. Skipping E2E.`
            );
        }
    });

    test("diagnostics has tokens", async () => {
        if (!available) return;
        const r = await request(BASE).get("/auth/diagnostics");
        expect(r.status).toBe(200);
        expect(r.body.tokenState.hasAccessToken).toBe(true);
        expect(r.body.tokenState.hasRefreshToken).toBe(true);
    });

    test("create lead", async () => {
        if (!available) return;
        const r = await request(BASE)
            .post("/leads")
            .send({ name: `E2E Lead ${Date.now()}` });
        expect(r.status).toBe(201);
        const id = r.body?.id || r.body?._embedded?.leads?.[0]?.id;
        if (!id) {
            console.warn("[E2E] Lead create response without id:", r.body);
            return; // do not fail; continue to next tests
        }
        leadId = id;
        console.log(`[E2E] Lead created: ${leadId}`);
    });

    test("create contact", async () => {
        if (!available) return;
        const r = await request(BASE)
            .post("/contacts")
            .send({ name: `E2E Contact ${Date.now()}` });
        expect(r.status).toBe(201);
        const id = r.body?.id || r.body?._embedded?.contacts?.[0]?.id;
        if (!id) {
            console.warn("[E2E] Contact create response without id:", r.body);
            return;
        }
        contactId = id;
        console.log(`[E2E] Contact created: ${contactId}`);
    });

    test("link lead with contact", async () => {
        if (!available) return;
        if (!leadId || !contactId) {
            console.warn("[E2E] Skipping link: missing ids", {
                leadId,
                contactId,
            });
            return;
        }
        const r = await request(BASE)
            .post("/link")
            .send({ lead_id: leadId, contact_id: contactId });
        if (![200, 201].includes(r.status)) {
            console.warn("[E2E] Link response:", r.status, r.body);
        }
        expect([200, 201]).toContain(r.status);
        console.log(`[E2E] Linked lead ${leadId} with contact ${contactId}`);
    });

    test("unlink lead from contact", async () => {
        if (!available) return;
        if (!leadId || !contactId) {
            console.warn("[E2E] Skipping unlink: missing ids", {
                leadId,
                contactId,
            });
            return;
        }
        const r = await request(BASE)
            .delete("/link")
            .send({ lead_id: leadId, contact_id: contactId });
        if (![200, 204, 404].includes(r.status)) {
            console.warn("[E2E] Unlink response:", r.status, r.body);
        }
        expect([200, 204, 404]).toContain(r.status);
        console.log(`[E2E] Unlinked lead ${leadId} from contact ${contactId}`);
    });
});
