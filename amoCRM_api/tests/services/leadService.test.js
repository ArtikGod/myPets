const LeadService = require("../../src/services/leadService");
const LeadModel = require("../../src/models/leadModel");

describe("LeadService", () => {
    let service;
    let api;

    beforeEach(() => {
        api = {
            getLeadById: jest.fn(),
            createLead: jest.fn(),
            updateLead: jest.fn(),
            searchLeadsByFilter: jest.fn(),
        };
        service = new LeadService(api);
    });

    test("getLeadById", async () => {
        api.getLeadById.mockResolvedValue({ id: 1, name: "L" });
        const res = await service.getLeadById(1);
        expect(res).toBeInstanceOf(LeadModel);
        expect(res.id).toBe(1);
    });

    test("createLead: returns existing by name", async () => {
        api.searchLeadsByFilter.mockResolvedValue({
            _embedded: { leads: [{ id: 2, name: "L" }] },
        });
        const res = await service.createLead({ name: "L" });
        expect(res.id).toBe(2);
        expect(api.createLead).not.toHaveBeenCalled();
    });

    test("createLead: creates new when not found", async () => {
        api.searchLeadsByFilter.mockResolvedValue({ _embedded: { leads: [] } });
        api.createLead.mockResolvedValue({
            _embedded: { leads: [{ id: 3, name: "N" }] },
        });
        const res = await service.createLead({ name: "N" });
        expect(res.id).toBe(3);
    });

    test("updateLead", async () => {
        api.getLeadById.mockResolvedValue({ id: 1 });
        api.updateLead.mockResolvedValue({
            _embedded: { leads: [{ id: 1, name: "U" }] },
        });
        const res = await service.updateLead(1, { name: "U" });
        expect(res.name).toBe("U");
    });

    test("propagates errors from getLeadById", async () => {
        api.getLeadById.mockRejectedValue(new Error("nf"));
        await expect(service.getLeadById(0)).rejects.toThrow("nf");
    });

    test("propagates errors from createLead branches", async () => {
        api.searchLeadsByFilter.mockResolvedValue({ _embedded: { leads: [] } });
        api.createLead.mockResolvedValue({ _embedded: { leads: [] } });
        await expect(service.createLead({ name: "X" })).rejects.toThrow();
    });

    test("propagates errors from updateLead", async () => {
        api.getLeadById.mockResolvedValue({ id: 1 });
        api.updateLead.mockResolvedValue({ _embedded: { leads: [] } });
        await expect(service.updateLead(1, { name: "U" })).rejects.toThrow();
    });
});
