import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/app.constants";

const LeftPane = ({ updateTrigger, onSelectionChange }) => {
    const [filter, setFilter] = useState("");
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newId, setNewId] = useState("");

    const fetchData = useCallback(async (currentOffset, append = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/left-items`, {
                params: { filter, limit: 20, offset: currentOffset },
            });
            if (append) {
                setItems((prev) => [...prev, ...response.data.items]);
            } else {
                setItems(response.data.items);
            }
            setHasMore(response.data.items.length === 20);
        } catch (err) {
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const selectItem = async (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
        try {
            await axios.post(`${API_BASE_URL}/select`, { id });
            onSelectionChange();
        } catch (error) {
            fetchData(0);
        }
    };

    const addItem = async () => {
        if (!newId) return;
        try {
            await axios.post(`${API_BASE_URL}/add-item`, {
                id: parseInt(newId),
            });
            setNewId("");
            setTimeout(() => fetchData(0), 1000);
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
        fetchData(0);
    }, [filter, updateTrigger, fetchData]);

    useEffect(() => {
        if (offset > 0) {
            fetchData(offset, true);
        }
    }, [offset, fetchData]);

    return (
        <div style={{ width: "50%", padding: "10px", display: "flex", flexDirection: "column" }}>
            <h2>Left Pane</h2>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Filter by ID"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="number"
                    placeholder="New ID"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                />
                <button onClick={addItem}>Add</button>
            </div>

            {loading && offset === 0 && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ height: "500px", overflow: "auto", flex: 1 }} onScroll={handleScroll}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="list-item"
                        onClick={() => selectItem(item.id)}
                    >
                        {item.id}
                    </div>
                ))}
                {loading && offset > 0 && <p>Loading more...</p>}
            </div>
        </div>
    );
};

export default LeftPane;
