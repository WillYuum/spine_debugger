import { PixiInitializer } from "./PixiInitializer";
import { MainViewPort } from "./visualComponents/MainViewPort";

// 1. Interface for visual component logic
export interface LifeCycleStateHandlers {
    HandleInitUI: () => Promise<void>;
    HandleEmptyDisplay: () => Promise<void>;
    HandleLoadSpine: () => Promise<void>;
    HandleActiveDisplay: () => Promise<void>;
    HandleReplaceSpine: () => Promise<void>;
    HandleClearSpine: () => Promise<void>;
}

// 2. Define all states as a TypeScript enum
export enum ToolState {
    RUN_TOOL = "RUN_TOOL",
    INIT_UI = "INIT_UI",
    EMPTY_DISPLAY = "EMPTY_DISPLAY",
    LOAD_SPINE = "LOAD_SPINE",
    ACTIVE_DISPLAY = "ACTIVE_DISPLAY",
    CLEAR_SPINE = "CLEAR_SPINE",
    REPLACE_SPINE = "REPLACE_SPINE",
}

// 3. Transition map
type TransitionMap = {
    [K in ToolState]: ToolState[];
};

const validTransitions: TransitionMap = {
    [ToolState.RUN_TOOL]: [ToolState.INIT_UI],
    [ToolState.INIT_UI]: [ToolState.EMPTY_DISPLAY],
    [ToolState.EMPTY_DISPLAY]: [ToolState.LOAD_SPINE],
    [ToolState.LOAD_SPINE]: [ToolState.ACTIVE_DISPLAY],
    [ToolState.ACTIVE_DISPLAY]: [ToolState.CLEAR_SPINE, ToolState.REPLACE_SPINE],
    [ToolState.CLEAR_SPINE]: [ToolState.EMPTY_DISPLAY],
    [ToolState.REPLACE_SPINE]: [ToolState.LOAD_SPINE],
};

const stateToHandlerMap: Record<ToolState, keyof LifeCycleStateHandlers> = {
    [ToolState.RUN_TOOL]: "HandleInitUI",        // or maybe no-op
    [ToolState.INIT_UI]: "HandleInitUI",
    [ToolState.EMPTY_DISPLAY]: "HandleEmptyDisplay",
    [ToolState.LOAD_SPINE]: "HandleLoadSpine",
    [ToolState.ACTIVE_DISPLAY]: "HandleActiveDisplay",
    [ToolState.CLEAR_SPINE]: "HandleClearSpine",
    [ToolState.REPLACE_SPINE]: "HandleReplaceSpine",
};

// 4. State manager (singleton-aware)
export class StateManager {
    private static instance?: StateManager;
    private currentState: ToolState = ToolState.RUN_TOOL;
    private handlers: LifeCycleStateHandlers[] = [];

    constructor(handlers: LifeCycleStateHandlers | LifeCycleStateHandlers[]) {
        this.handlers = Array.isArray(handlers) ? handlers : [handlers];
        StateManager.instance = this; // register globally
    }

    static getInstance(): StateManager {
        if (!StateManager.instance) {
            throw new Error("❌ StateManager not initialized yet");
        }
        return StateManager.instance;
    }

    async switchState(nextState: ToolState): Promise<boolean> {
        const allowed = validTransitions[this.currentState];
        if (!allowed.includes(nextState)) {
            console.warn(`❌ Invalid transition: ${this.currentState} ➝ ${nextState}`);
            return false;
        }

        console.log(`✅ Transition: ${this.currentState} ➝ ${nextState}`);
        this.currentState = nextState;

        const handlerMethod = stateToHandlerMap[nextState];

        const promises = this.handlers.map(handler => {
            const method = handler[handlerMethod];
            if (method) return Promise.resolve(method.call(handler));
            return Promise.resolve();
        });

        await Promise.all(promises);
        return true;
    }
}


// Example implementation (non-visual)
// class TestHandlers implements LifeCycleStateHandlers {
//     async HandleInitUI(): Promise<void> {
//         console.log("Init UI");
//     }
//     async HandleEmptyDisplay(): Promise<void> {
//         console.log("Empty display - waiting for user to load spine asset.");
//     }
//     async HandleLoadSpine(): Promise<void> {
//         console.log("Loading Spine asset...");
//     }
//     async HandleActiveDisplay(): Promise<void> {
//         console.log("Active display - showing Spine skeleton.");
//     }
//     async HandleReplaceSpine(): Promise<void> {
//         console.log("Replacing Spine asset.");
//     }
//     async HandleClearSpine(): Promise<void> {
//         console.log("Clearing Spine asset.");
//     }
// }

// 6. Entry point
export async function startCycle() {
    console.log("Tool starting...");

    const pixiInitializer = new PixiInitializer();
    // const testHandlers = new TestHandlers();
    const mainViewPort = new MainViewPort(pixiInitializer.getApp());

    // Pass multiple handlers to the state manager (auto-registers as singleton)
    const stateManager = new StateManager([
        pixiInitializer,
        // testHandlers,
        mainViewPort,
    ]);

    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
}
