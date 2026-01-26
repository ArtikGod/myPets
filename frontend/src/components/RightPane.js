import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { API_BASE_URL } from "../constants/app.constants";

const RightPane = ({ updateTrigger, onSelectionChange }) => {
    const [filter, setFilter] = useState("");
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (currentOffset, append = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/selected-items`, {
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

    const deselectItem = async (id) => {
        setItems(prev => {
            const newItems = prev.filter(i => i.id !== id);
            if (newItems.length < 20 && hasMore) {
                loadMore();
            }
            return newItems;
        });
        try {
            await axios.post(`${API_BASE_URL}/deselect`, { id });
            onSelectionChange();
        } catch (error) {
            fetchData(0);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const newItems = Array.from(items);
        const [moved] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, moved);
        setItems(newItems);

        const beforeItem = newItems[result.destination.index + 1] || null;

        try {
            await axios.post(`${API_BASE_URL}/move-item`, {
                movedId: moved.id,
                beforeId: beforeItem ? beforeItem.id : null,
            });
        } catch (error) {
            fetchData(0);
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
            <h2>Right Pane</h2>
            <input
                type="text"
                placeholder="Filter by ID"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            {loading && offset === 0 && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="droppable-list">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ height: "500px", overflow: "auto", flex: 1 }}
                            onScroll={handleScroll}
                        >
                            {items.map((item, index) => (
                                <Draggable draggableId={item.id.toString()} index={index} key={item.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`list-item ${snapshot.isDragging ? "is-dragging" : ""}`}
                                        >
                                            {item.id}
                                            <button onClick={() => deselectItem(item.id)} className="deselect-btn">X</button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            {loading && offset > 0 && <p>Loading more...</p>}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default RightPane;