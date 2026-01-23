import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableItem = ({ id }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        // ВАЖНО: без этого dnd-kit часто «липнет» к краям
        animateLayoutChanges: () => true,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // фикс: браузер должен понимать реальные границы элемента
        touchAction: "none",
        userSelect: "none",

        // чисто визуально
        padding: "8px 12px",
        border: "1px solid #ccc",
        background: isDragging ? "#e0f0ff" : "#fff",
        marginBottom: 4,
        cursor: "grab",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {id}
        </div>
    );
};
