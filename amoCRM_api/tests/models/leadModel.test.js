const LeadModel = require("../../src/models/leadModel");

describe("LeadModel", () => {
    test("toJSON includes only set fields", () => {
        const m = new LeadModel({
            name: "A",
            price: 0,
            pipeline_id: 1, 
            status_id: 2,
            custom_fields_values: [],
        });
        const json = m.toJSON();
        expect(json).toEqual({ name: "A", status_id: 2, pipeline_id: 1 });
    });

    test("toJSON includes custom_fields_values when present", () => {
        const m = new LeadModel({ custom_fields_values: [{ id: 1 }] });
        const json = m.toJSON();
        expect(json.custom_fields_values).toEqual([{ id: 1 }]);
    });

    test("fromApiResponse", () => {
        const m = LeadModel.fromApiResponse({ id: 5, name: "X" });
        expect(m).toBeInstanceOf(LeadModel);
        expect(m.id).toBe(5);
    });
});
