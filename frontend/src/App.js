import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";

import LeftPane from "./components/LeftPane";

import RightPane from "./components/RightPane";

import { API_BASE_URL } from "./constants/app.constants";

import "./App.css";

function App() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [leftPaneRefresh, setLeftPaneRefresh] = useState(0);
    const [deselectedId, setDeselectedId] = useState(null);

    const loadSelected = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/selected-items`, {
                params: { limit: 1000000 },
            });
            setSelectedItems(response.data.items);
            const order = response.data.items.map((item) => item.id);
            localStorage.setItem("selectedOrder", JSON.stringify(order));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const refreshLeftPane = useCallback((id) => {
        if (id) {
            setDeselectedId(id);
            setTimeout(() => {
                setDeselectedId(null);
            }, 100);
        }
        setLeftPaneRefresh((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const savedOrder = localStorage.getItem("selectedOrder");
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder);
                axios
                    .post(`${API_BASE_URL}/update-order`, { order })
                    .then(() => {
                        loadSelected();
                    })
                    .catch(() => {
                        loadSelected();
                    });
            } catch (error) {
                loadSelected();
            }
        } else {
            loadSelected();
        }
    }, [loadSelected]);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <LeftPane
                onUpdate={loadSelected}
                refreshTrigger={leftPaneRefresh}
                deselectedId={deselectedId}
            />
            <RightPane
                selectedItems={selectedItems}
                onUpdate={loadSelected}
                refreshTrigger={selectedItems.length}
                onDeselect={refreshLeftPane}
            />
        </div>
    );
}

export default App;
