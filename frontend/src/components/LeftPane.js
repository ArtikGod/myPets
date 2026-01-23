import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";

import { API_BASE_URL } from "../constants/app.constants";

const LeftPane = ({ onUpdate, refreshTrigger, deselectedId }) => {
    const [filter, setFilter] = useState("");

    const [loadedItems, setLoadedItems] = useState([]);

    const [hasMore, setHasMore] = useState(true);

    const [offset, setOffset] = useState(0);

    const [newId, setNewId] = useState("");

    const loadItems = useCallback(
        async (currentOffset, append = false) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/left-items`, {
                    params: { filter, limit: 20, offset: currentOffset },
                });
                if (append) {
                    setLoadedItems((prev) => [...prev, ...response.data.items]);
                } else {
                    setLoadedItems(response.data.items);
                }
                setHasMore(response.data.items.length === 20);
            } catch (error) {
                console.error(error);
            }
        },
        [filter]
    );

    const selectItem = async (id) => {
        setLoadedItems((prev) => prev.filter((i) => i.id !== id));
        try {
            await axios.post(`${API_BASE_URL}/select`, { id });
            setTimeout(() => {
                onUpdate();
            }, 1200);
        } catch (error) {
            console.error(error);
            setTimeout(() => {
                onUpdate();
            }, 1200);
        }
    };

    const addItem = async () => {
        if (!newId) return;

        try {
            await axios.post(`${API_BASE_URL}/add-item`, {
                id: parseInt(newId),
            });

            setNewId("");
            loadItems(0, false);
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const loadMore = () => {
        if (hasMore) {
            setOffset((prev) => prev + 20);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
            loadMore();
        }
    };

    useEffect(() => {
        setOffset(0);
        loadItems(0, false);
    }, [filter, loadItems]);

    useEffect(() => {
        if (offset > 0) {
            loadItems(offset, true);
        }
    }, [offset, loadItems]);

    useEffect(() => {
        if (deselectedId) {
            setLoadedItems((prev) => {
                const exists = prev.some((item) => item.id === deselectedId);
                if (!exists) {
                    const newItem = { id: deselectedId };
                    const updated = [newItem, ...prev];
                    if (filter === "") {
                        return updated.sort((a, b) => a.id - b.id);
                    }
                    return updated;
                }
                return prev;
            });
        }
    }, [deselectedId, filter]);

    useEffect(() => {
        if (refreshTrigger !== undefined && refreshTrigger > 0) {
            const timer = setTimeout(() => {
                if (filter === "") {
                    setOffset(0);
                    loadItems(0, false);
                }
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [refreshTrigger, filter, loadItems]);

    return (
        <div style={{ width: "50%", padding: "10px" }}>
            <h2>Left Pane</h2>

            <input
                type="text"
                placeholder="Filter by ID"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />

            <br />

            <input
                type="number"
                placeholder="New ID"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
            />

            <button onClick={addItem}>Add</button>

            <div
                style={{ height: "400px", overflow: "auto" }}
                onScroll={handleScroll}
            >
                {loadedItems.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            padding: "8px",
                            margin: "4px",
                            background: "lightblue",
                            border: "1px solid black",
                        }}
                        onClick={() => selectItem(item.id)}
                    >
                        {item.id}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeftPane;
