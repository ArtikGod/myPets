function toNumberOrNull(value) {
    if (value === undefined || value === null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
}

function validateCustomFields(customFields) {
    if (customFields === undefined) return { ok: true, value: undefined };
    if (!Array.isArray(customFields))
        return { ok: false, errors: ["custom_fields_values must be an array"] };
    return { ok: true, value: customFields };
}

function buildLeadDTO(input) {
    const errors = [];

    const name = input.name;
    if (!isNonEmptyString(name)) {
        errors.push("name is required and must be a non-empty string");
    }

    const price = toNumberOrNull(input.price);
    if (input.price !== undefined && price === null) {
        errors.push("price must be a number");
    }
    if (price !== null && price < 0) {
        errors.push("price must be >= 0");
    }

    const pipelineId = toNumberOrNull(input.pipeline_id);
    if (input.pipeline_id !== undefined && pipelineId === null) {
        errors.push("pipeline_id must be a number");
    }

    const statusId = toNumberOrNull(input.status_id);
    if (input.status_id !== undefined && statusId === null) {
        errors.push("status_id must be a number");
    }

    const cf = validateCustomFields(input.custom_fields_values);
    if (cf.ok === false) {
        errors.push(...cf.errors);
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const dto = { name: String(name).trim() };
    if (price !== null) dto.price = price;
    if (pipelineId !== null) dto.pipeline_id = pipelineId;
    if (statusId !== null) dto.status_id = statusId;
    if (cf.value !== undefined) dto.custom_fields_values = cf.value;

    return { ok: true, value: dto };
}

module.exports = { buildLeadDTO };
