const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// =======================
// CONSTANTS
// =======================

const STATE_PATH = path.join(__dirname, "state.json");

// =======================
// DATA (REQUIRED BY TZ)
// =======================

// 1 000 000 элементов — по ТЗ
const allItemsMap = new Map(
    Array.from({ length: 1_000_000 }, (_, i) => [i + 1, { id: i + 1 }]),
);

// =======================
// PERSISTED STATE
// =======================

let selectedItemsSet = new Set();
let selectedOrder = [];
let nextId = 1_000_001;

// ---------- LOAD STATE ----------
if (fs.existsSync(STATE_PATH)) {
    try {
        const saved = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));

        selectedOrder = Array.isArray(saved.selectedOrder)
            ? saved.selectedOrder
            : [];

        selectedItemsSet = new Set(selectedOrder);
        nextId = typeof saved.nextId === "number" ? saved.nextId : nextId;
    } catch (e) {
        console.error("Failed to load state.json", e);
    }
}

// ---------- SAVE STATE ----------
function persistState() {
    fs.writeFileSync(
        STATE_PATH,
        JSON.stringify(
            {
                selectedOrder,
                nextId,
            },
            null,
            2,
        ),
    );
}

// =======================
// QUEUES (KEPT, BUT SAFE)
// =======================

let addQueue = new Set();
let selectQueue = new Set();
let deselectQueue = new Set();

// =======================
// BACKGROUND QUEUES
// =======================

setInterval(() => {
    if (addQueue.size === 0) return;

    for (const id of addQueue) {
        if (!allItemsMap.has(id)) {
            allItemsMap.set(id, { id });
            nextId = Math.max(nextId, id + 1);
        }
    }

    addQueue.clear();
    persistState();
}, 10_000);

setInterval(() => {
    let changed = false;

    for (const id of selectQueue) {
        if (!selectedItemsSet.has(id)) {
            selectedItemsSet.add(id);
            selectedOrder.push(id);
            changed = true;
        }
    }

    for (const id of deselectQueue) {
        if (selectedItemsSet.has(id)) {
            selectedItemsSet.delete(id);
            selectedOrder = selectedOrder.filter((x) => x !== id);
            changed = true;
        }
    }

    selectQueue.clear();
    deselectQueue.clear();

    if (changed) persistState();
}, 1_000);

// =======================
// API
// =======================

// LEFT ITEMS
app.get("/api/left-items", (req, res) => {
    const { filter = "", limit = 20, offset = 0 } = req.query;

    let items = [];

    for (const item of allItemsMap.values()) {
        if (!selectedItemsSet.has(item.id)) {
            if (!filter || item.id.toString().startsWith(filter)) {
                items.push(item);
            }
        }
    }

    const start = Number(offset);
    const end = start + Number(limit);

    res.json({
        items: items.slice(start, end),
        total: items.length,
    });
});

// SELECTED ITEMS (ORDER IS IMPORTANT)
app.get("/api/selected-items", (req, res) => {
    const { filter = "", limit = 20, offset = 0 } = req.query;

    let items = selectedOrder.map((id) => allItemsMap.get(id)).filter(Boolean);

    if (filter) {
        items = items.filter((item) => item.id.toString().startsWith(filter));
    }

    const start = Number(offset);
    const end = start + Number(limit);

    res.json({
        items: items.slice(start, end),
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

// MOVE ITEM (DRAG & DROP)
app.post("/api/move-item", (req, res) => {
    const { movedId, beforeId } = req.body;

    if (typeof movedId !== "number") {
        return res.status(400).json({ error: "Invalid movedId" });
    }

    const fromIndex = selectedOrder.indexOf(movedId);
    if (fromIndex === -1) {
        return res.status(404).json({ error: "Item not found" });
    }

    selectedOrder.splice(fromIndex, 1);

    let toIndex =
        beforeId === null
            ? selectedOrder.length
            : selectedOrder.indexOf(beforeId);

    if (toIndex === -1) toIndex = selectedOrder.length;

    selectedOrder.splice(toIndex, 0, movedId);

    persistState();

    res.json({ success: true });
});

// STATE (DEBUG)
app.get("/api/state", (_, res) => {
    res.json({
        selectedCount: selectedOrder.length,
        nextId,
    });
});

// =======================
// FRONTEND
// =======================

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

// =======================
// START
// =======================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
