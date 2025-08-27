const { buildLeadDTO } = require("../../src/dto/leadDto");
const { buildContactDTO } = require("../../src/dto/contactDto");
const { buildLinkDTO } = require("../../src/dto/linkDto");

describe("DTO validators", () => {
    test("leadDto: valid minimal", () => {
        const r = buildLeadDTO({ name: "A" });
        expect(r.ok).toBe(true);
        expect(r.value).toEqual({ name: "A" });
    });

    test("leadDto: invalid types", () => {
        const r = buildLeadDTO({
            name: "",
            price: "x",
            pipeline_id: "x",
            status_id: "y",
            custom_fields_values: {},
        });
        expect(r.ok).toBe(false);
        expect(r.errors.length).toBeGreaterThan(0);
    });

    test("contactDto: valid", () => {
        const r = buildContactDTO({ name: "C", custom_fields_values: [] });
        expect(r.ok).toBe(true);
    });

    test("contactDto: invalid", () => {
        const r = buildContactDTO({ name: "   ", custom_fields_values: {} });
        expect(r.ok).toBe(false);
    });

    test("linkDto: valid", () => {
        const r = buildLinkDTO({ lead_id: 1, contact_id: 2 });
        expect(r.ok).toBe(true);
        expect(r.value).toEqual({ lead_id: 1, contact_id: 2 });
    });

    test("linkDto: invalid", () => {
        const r = buildLinkDTO({ lead_id: "a" });
        expect(r.ok).toBe(false);
    });
});
