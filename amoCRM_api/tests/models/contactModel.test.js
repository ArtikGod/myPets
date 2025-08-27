const ContactModel = require("../../src/models/contactModel");

describe("ContactModel", () => {
    let contactModel;

    beforeEach(() => {
        contactModel = new ContactModel();
    });

    describe("constructor", () => {
        it("should create empty contact model", () => {
            expect(contactModel).toBeInstanceOf(ContactModel);
            expect(contactModel.id).toBeNull();
            expect(contactModel.name).toBe("");
            expect(contactModel.first_name).toBe("");
            expect(contactModel.last_name).toBe("");
            expect(contactModel.responsible_user_id).toBe(0);
            expect(contactModel.created_by).toBe(0);
            expect(contactModel.updated_by).toBe(0);
            expect(contactModel.created_at).toBeGreaterThan(0);
            expect(contactModel.updated_at).toBeGreaterThan(0);
            expect(contactModel.custom_fields_values).toEqual([]);
        });

        it("should create contact model with data", () => {
            const data = {
                id: 123,
                name: "John Doe",
                first_name: "John",
                last_name: "Doe",
                responsible_user_id: 456,
                created_by: 789,
                updated_by: 789,
                custom_fields_values: [
                    { field_id: 1, values: [{ value: "Test" }] },
                ],
            };

            contactModel = new ContactModel(data);

            expect(contactModel.id).toBe(123);
            expect(contactModel.name).toBe("John Doe");
            expect(contactModel.first_name).toBe("John");
            expect(contactModel.last_name).toBe("Doe");
            expect(contactModel.responsible_user_id).toBe(456);
            expect(contactModel.created_by).toBe(789);
            expect(contactModel.updated_by).toBe(789);
            expect(contactModel.custom_fields_values).toEqual(
                data.custom_fields_values
            );
        });
    });

    describe("toJSON", () => {
        it("should return object with only defined properties", () => {
            contactModel.name = "John Doe";
            contactModel.first_name = "John";
            contactModel.last_name = "Doe";
            contactModel.responsible_user_id = 123;
            contactModel.custom_fields_values = [
                { field_id: 1, values: [{ value: "Test" }] },
            ];

            const json = contactModel.toJSON();

            expect(json).toEqual({
                name: "John Doe",
                first_name: "John",
                last_name: "Doe",
                responsible_user_id: 123,
                custom_fields_values: [
                    { field_id: 1, values: [{ value: "Test" }] },
                ],
            });
        });

        it("should return empty object for empty model", () => {
            const json = contactModel.toJSON();
            expect(json).toEqual({});
        });

        it("should include only non-empty properties", () => {
            contactModel.name = "John Doe";
            contactModel.first_name = "";
            contactModel.last_name = "Doe";
            contactModel.responsible_user_id = 0;
            contactModel.custom_fields_values = [];

            const json = contactModel.toJSON();

            expect(json).toEqual({
                name: "John Doe",
                last_name: "Doe",
            });
            expect(json.first_name).toBeUndefined();
            expect(json.responsible_user_id).toBeUndefined();
            expect(json.custom_fields_values).toBeUndefined();
        });
    });

    describe("fromApiResponse", () => {
        it("should create model from API response", () => {
            const apiData = {
                id: 123,
                name: "John Doe",
                first_name: "John",
                last_name: "Doe",
            };

            const result = ContactModel.fromApiResponse(apiData);

            expect(result).toBeInstanceOf(ContactModel);
            expect(result.id).toBe(123);
            expect(result.name).toBe("John Doe");
            expect(result.first_name).toBe("John");
            expect(result.last_name).toBe("Doe");
        });

        it("should handle empty API response", () => {
            const result = ContactModel.fromApiResponse({});

            expect(result).toBeInstanceOf(ContactModel);
            expect(result.id).toBeNull();
            expect(result.name).toBe("");
        });
    });
});
