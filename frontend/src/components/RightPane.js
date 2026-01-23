import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { API_BASE_URL } from "../constants/app.constants";

const DROPPABLE_ID = "right-pane-droppable";

const RightPane = ({ selectedItems, onUpdate, refreshTrigger, onDeselect }) => {
    const [filter, setFilter] = useState("");
    const [loadedItems, setLoadedItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Загрузка элементов
    const loadItems = useCallback(
        async (currentOffset = 0, append = false) => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/selected-items`,
                    {
                        params: {
                            filter,
                            limit: filter ? 10000 : 20,
                            offset: currentOffset,
                        },
                    }
                );

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

    // Удаление элемента
    const deselectItem = async (id) => {
        setLoadedItems((prev) => prev.filter((item) => item.id !== id));
        if (onDeselect) onDeselect(id);

        try {
            await axios.post(`${API_BASE_URL}/deselect`, { id });
            setTimeout(() => {
                onUpdate();
                setOffset(0);
                loadItems(0, false);
            }, 1200);
        } catch (error) {
            console.error(error);
            if (!filter) {
                setOffset(0);
                loadItems(0, false);
            }
        }
    };

    // Подгрузка следующей страницы
    const loadMore = () => {
        if (hasMore) setOffset((prev) => prev + 20);
    };

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 10) loadMore();
    };

    // Drag & Drop
    const handleDragEnd = useCallback(
        async (result) => {
            setIsDragging(false);
            if (!result.destination) return;
            if (result.source.index === result.destination.index) return;

            const newItems = Array.from(loadedItems);
            const [moved] = newItems.splice(result.source.index, 1);
            newItems.splice(result.destination.index, 0, moved);
            setLoadedItems(newItems); // обновляем локально сразу

            // Определяем beforeId / afterId для глобального API
            const beforeItem = newItems[result.destination.index + 1] || null;
            const afterItem = newItems[result.destination.index - 1] || null;

            try {
                await axios.post(`${API_BASE_URL}/move-item`, {
                    movedId: moved.id,
                    beforeId: beforeItem ? beforeItem.id : null,
                    afterId: afterItem ? afterItem.id : null,
                });
                onUpdate();
            } catch (error) {
                console.error(error);
            }
        },
        [loadedItems, onUpdate]
    );

    // Загрузка элементов при фильтре
    useEffect(() => {
        setOffset(0);
        setLoadedItems([]);
        loadItems(0, false);
    }, [filter, loadItems]);

    // Подгрузка следующей страницы при изменении offset
    useEffect(() => {
        if (offset > 0) loadItems(offset, true);
    }, [offset, loadItems]);

    // Обновление при refreshTrigger
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!filter) {
                setOffset(0);
                loadItems(0, false);
            }
        }, 1200);
        return () => clearTimeout(timer);
    }, [refreshTrigger, filter, loadItems]);

    return (
        <div style={{ width: "50%", padding: "10px" }}>
            <h2>Right Pane</h2>

            <input
                type="text"
                placeholder="Filter by ID"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
            />

            <DragDropContext
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
            >
                <Droppable droppableId={DROPPABLE_ID}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                                height: "400px",
                                overflow: "auto",
                                backgroundColor: snapshot.isDraggingOver
                                    ? "lightblue"
                                    : "transparent",
                            }}
                            onScroll={isDragging ? undefined : handleScroll}
                        >
                            {loadedItems.map((item, index) => (
                                <Draggable
                                    key={item.id.toString()}
                                    draggableId={item.id.toString()}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps
                                                    .style,
                                                padding: "8px",
                                                margin: "4px",
                                                background: snapshot.isDragging
                                                    ? "lightgreen"
                                                    : "lightgray",
                                                border: "1px solid black",
                                                cursor: "grab",
                                            }}
                                            onDoubleClick={() =>
                                                deselectItem(item.id)
                                            }
                                        >
                                            {item.id}
                                        </div>
                                    )}
                                </Draggable>
                            ))}

                            {loadedItems.length === 0 && (
                                <div
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                        color: "gray",
                                    }}
                                >
                                    No items selected
                                </div>
                            )}

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default RightPane;
