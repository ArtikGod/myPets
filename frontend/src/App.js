import React, { useState, useCallback } from "react";
import LeftPane from "./components/LeftPane";
import RightPane from "./components/RightPane";
import "./App.css";

function App() {
    const [leftPaneTrigger, setLeftPaneTrigger] = useState(0);
    const [rightPaneTrigger, setRightPaneTrigger] = useState(0);

    const triggerLeftPaneUpdate = useCallback(() => {
        setLeftPaneTrigger(c => c + 1);
    }, []);

    const triggerRightPaneUpdate = useCallback(() => {
        setRightPaneTrigger(c => c + 1);
    }, []);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <LeftPane
                updateTrigger={leftPaneTrigger}
                onSelectionChange={triggerRightPaneUpdate}
            />
            <RightPane
                updateTrigger={rightPaneTrigger}
                onSelectionChange={triggerLeftPaneUpdate}
            />
        </div>
    );
}

export default App;
