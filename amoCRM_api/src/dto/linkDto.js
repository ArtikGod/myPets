function toNumberOrNull(value) {
    if (value === undefined || value === null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function buildLinkDTO(input) {
    const errors = [];
    const leadId = toNumberOrNull(input.lead_id);
    const contactId = toNumberOrNull(input.contact_id);

    if (leadId === null)
        errors.push("lead_id is required and must be a number");
    if (contactId === null)
        errors.push("contact_id is required and must be a number");

    if (errors.length > 0) return { ok: false, errors };

    return { ok: true, value: { lead_id: leadId, contact_id: contactId } };
}

module.exports = { buildLinkDTO };
