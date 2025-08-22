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
    private handlers: LifeCycleStateHandlers[] = [];

    constructor(handlers: LifeCycleStateHandlers | LifeCycleStateHandlers[]) {
        // Normalize to array
        this.handlers = Array.isArray(handlers) ? handlers : [handlers];
    }

    async switchState(nextState: ToolState): Promise<boolean> {
        const allowed = validTransitions[this.currentState];
        if (!allowed.includes(nextState)) {
            console.warn(`❌ Invalid transition: ${this.currentState} ➝ ${nextState}`);
            return false;
        }

        console.log(`✅ Transition: ${this.currentState} ➝ ${nextState}`);
        this.currentState = nextState;

        // Run the state handler on all instances
        const promises = this.handlers.map(handler => {
            const methodName = `Handle${nextState}` as keyof LifeCycleStateHandlers;
            const method = handler[methodName];
            if (method) return Promise.resolve(method.call(handler));
            return Promise.resolve(); // safety fallback
        });

        await Promise.all(promises);

        return true;
    }
}

// 5. Entry point
export async function startCycle() {
    console.log("Tool starting...");

    const pixiInitializer = new PixiInitializer();
    const testHandlers = new TestHandlers();

    // Pass multiple handlers to the state manager
    const stateManager = new StateManager([pixiInitializer, testHandlers]);

    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
}
