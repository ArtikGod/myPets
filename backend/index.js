const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// =======================
// DATA
// =======================

const allItemsMap = new Map(
    Array.from({ length: 1_000_000 }, (_, i) => [i + 1, { id: i + 1 }])
);
const selectedItemsSet = new Set();
let selectedOrder = [];
let nextId = 1_000_001;

// queues
let addQueue = new Set();
let selectQueue = new Set();
let deselectQueue = new Set();

// =======================
// BACKGROUND QUEUES
// =======================

setInterval(() => {
    if (addQueue.size > 0) {
        const ids = Array.from(addQueue);
        ids.forEach((id) => {
            if (!allItemsMap.has(id)) {
                allItemsMap.set(id, { id });
                nextId = Math.max(nextId, id + 1);
            }
        });
        addQueue.clear();
    }
}, 10_000);

setInterval(() => {
    if (selectQueue.size > 0) {
        for (const id of selectQueue) {
            if (!selectedItemsSet.has(id)) {
                selectedItemsSet.add(id);
                if (!selectedOrder.includes(id)) {
                    selectedOrder.push(id);
                }
            }
        }
        selectQueue.clear();
    }

    if (deselectQueue.size > 0) {
        for (const id of deselectQueue) {
            selectedItemsSet.delete(id);
            selectedOrder = selectedOrder.filter((x) => x !== id);
        }
        deselectQueue.clear();
    }
}, 1_000);

// =======================
// API
// =======================

// LEFT ITEMS
app.get("/api/left-items", (req, res) => {
    const { filter = "", limit = 20, offset = 0 } = req.query;

    let items = Array.from(allItemsMap.values()).filter(
        (item) => !selectedItemsSet.has(item.id)
    );

    if (filter) {
        items = items.filter((item) => item.id.toString().startsWith(filter));
    }

    const paginated = items.slice(
        Number(offset),
        Number(offset) + Number(limit)
    );

    res.json({
        items: paginated,
        total: items.length,
    });
});

// SELECTED ITEMS (ВАЖНО: ТОЛЬКО selectedOrder!)
app.get("/api/selected-items", (req, res) => {
    const { filter = "", limit = 20, offset = 0 } = req.query;

    let items = selectedOrder
        .map((id) => allItemsMap.get(id))
        .filter(Boolean);

    if (filter) {
        items = items.filter((item) => item.id.toString().startsWith(filter));
    }

    const paginated = items.slice(
        Number(offset),
        Number(offset) + Number(limit)
    );

    res.json({
        items: paginated,
        total: items.length,
    });
});

// ADD ITEM
app.post("/api/add-item", (req, res) => {
    const { id } = req.body;

    if (typeof id !== "number") {
        return res.status(400).json({ error: "Invalid id" });
    }

    addQueue.add(id);
    res.json({ success: true });
});

// SELECT
app.post("/api/select", (req, res) => {
    const { id } = req.body;

    if (typeof id !== "number") {
        return res.status(400).json({ error: "Invalid id" });
    }

    selectQueue.add(id);
    deselectQueue.delete(id);

    res.json({ success: true });
});

// DESELECT
app.post("/api/deselect", (req, res) => {
    const { id } = req.body;

    if (typeof id !== "number") {
        return res.status(400).json({ error: "Invalid id" });
    }

    deselectQueue.add(id);
    selectQueue.delete(id);

    res.json({ success: true });
});

// =======================
// ⭐️ CORE FIX ⭐️
// MOVE ITEM (drag & drop)
// =======================

app.post("/api/move-item", (req, res) => {
    const { movedId, beforeId } = req.body;

    if (typeof movedId !== "number") {
        return res.status(400).json({ error: "Invalid movedId" });
    }

    const fromIndex = selectedOrder.indexOf(movedId);
    if (fromIndex === -1) {
        return res.status(404).json({ error: "Item not found" });
    }

    // remove
    selectedOrder.splice(fromIndex, 1);

    let toIndex;

    if (beforeId === null) {
        // move to end
        toIndex = selectedOrder.length;
    } else {
        toIndex = selectedOrder.indexOf(beforeId);
        if (toIndex === -1) {
            toIndex = selectedOrder.length;
        }
    }

    selectedOrder.splice(toIndex, 0, movedId);

    // sync selectedItemsSet
    // No need to sync, selectedItemsSet only cares about existence, not order.

    res.json({ success: true });
});

// ❌ DEPRECATED
app.post("/api/update-order", (_, res) => {
    res.status(410).json({
        error: "update-order is deprecated. Use /move-item",
    });
});

// STATE (debug)
app.get("/api/state", (_, res) => {
    res.json({
        selectedOrder,
        selectedCount: selectedOrder.length,
        nextId,
    });
});

app.get("/", (_, res) => {
    res.send("OK");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
