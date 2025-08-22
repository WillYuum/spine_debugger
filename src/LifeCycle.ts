import { PixiInitializer } from "./PixiInitializer";

// 1. Interface for visual component logic
export interface LifeCycleStateHandlers {
    HandleInitUI: () => Promise<void>;
    HandleEmptyDisplay: () => Promise<void>;
    HandleLoadSpine: () => Promise<void>;
    HandleActiveDisplay: () => Promise<void>;
    HandleReplaceSpine: () => Promise<void>;
    HandleClearSpine: () => Promise<void>;
}

// Example implementation
class TestHandlers implements LifeCycleStateHandlers {
    async HandleInitUI(): Promise<void> {
        console.log("Init UI");
    }
    async HandleEmptyDisplay(): Promise<void> {
        console.log("Empty display - waiting for user to load spine asset.");
    }
    async HandleLoadSpine(): Promise<void> {
        console.log("Loading Spine asset...");
    }
    async HandleActiveDisplay(): Promise<void> {
        console.log("Active display - showing Spine skeleton.");
    }
    async HandleReplaceSpine(): Promise<void> {
        console.log("Replacing Spine asset.");
    }
    async HandleClearSpine(): Promise<void> {
        console.log("Clearing Spine asset.");
    }
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

// 4. State manager
class StateManager {
    private currentState: ToolState = ToolState.RUN_TOOL;
    private handlers: LifeCycleStateHandlers;

    // Map ToolState enum to handler functions
    private stateHandlerMap: Partial<Record<ToolState, () => Promise<void>>>;

    constructor(handlers: LifeCycleStateHandlers) {
        this.handlers = handlers;

        // Automatically wrap all handler calls in Promise.resolve
        this.stateHandlerMap = {
            [ToolState.INIT_UI]: () => Promise.resolve(this.handlers.HandleInitUI()),
            [ToolState.EMPTY_DISPLAY]: () => Promise.resolve(this.handlers.HandleEmptyDisplay()),
            [ToolState.LOAD_SPINE]: () => Promise.resolve(this.handlers.HandleLoadSpine()),
            [ToolState.ACTIVE_DISPLAY]: () => Promise.resolve(this.handlers.HandleActiveDisplay()),
            [ToolState.CLEAR_SPINE]: () => Promise.resolve(this.handlers.HandleClearSpine()),
            [ToolState.REPLACE_SPINE]: () => Promise.resolve(this.handlers.HandleReplaceSpine()),
        };
    }

    async switchState(nextState: ToolState): Promise<boolean> {
        const allowed = validTransitions[this.currentState];
        if (!allowed.includes(nextState)) {
            console.warn(`❌ Invalid transition: ${this.currentState} ➝ ${nextState}`);
            return false;
        }

        console.log(`✅ Transition: ${this.currentState} ➝ ${nextState}`);
        this.currentState = nextState;

        const handler = this.stateHandlerMap[nextState];
        if (handler) await handler(); // always returns a promise

        return true;
    }
}

// 5. Entry point
export async function startCycle() {
    console.log("Tool starting...");

    const pixiInitializer = new PixiInitializer();

    const handlers = new TestHandlers();
    const stateManager = new StateManager(handlers);

    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
}
