function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
}

function validateCustomFields(customFields) {
    if (customFields === undefined) return { ok: true, value: undefined };
    if (!Array.isArray(customFields))
        return { ok: false, errors: ["custom_fields_values must be an array"] };
    return { ok: true, value: customFields };
}

function buildContactDTO(input) {
    const errors = [];

    const name = input.name;
    if (!isNonEmptyString(name)) {
        errors.push("name is required and must be a non-empty string");
    }

    const cf = validateCustomFields(input.custom_fields_values);
    if (cf.ok === false) errors.push(...cf.errors);

    if (errors.length > 0) return { ok: false, errors };

    const dto = { name: String(name).trim() };
    if (cf.value !== undefined) dto.custom_fields_values = cf.value;

    return { ok: true, value: dto };
}

module.exports = { buildContactDTO };
