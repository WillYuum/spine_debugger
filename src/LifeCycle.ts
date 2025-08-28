import { PixiInitializer } from "./PixiInitializer";
import { TimelinePlayer } from "./visualComponents/TimelinePlayer";
import { AnimationList } from "./visualComponents/AnimationList";
import { MainViewPort } from "./visualComponents/MainViewPort";
import { SpineMetaData } from "./visualComponents/SpineMetaInfo";

// 1. Interface for visual component logic
export interface LifeCycleStateHandlers {
    HandleInitUI: () => Promise<void>;
    HandleEmptyDisplay: () => Promise<void>;
    HandleLoadSpine: () => Promise<void>;
    HandleActiveDisplay: () => Promise<void>;
    HandleReplaceSpine: () => Promise<void>;
    HandleClearSpine: () => Promise<void>;
}

// 4. Tool states
export enum ToolState {
    RUN_TOOL = "RUN_TOOL",
    INIT_UI = "INIT_UI",
    EMPTY_DISPLAY = "EMPTY_DISPLAY",
    LOAD_SPINE = "LOAD_SPINE",
    ACTIVE_DISPLAY = "ACTIVE_DISPLAY",
    CLEAR_SPINE = "CLEAR_SPINE",
    REPLACE_SPINE = "REPLACE_SPINE",
}

type HandlerMethodMap = {
    [K in ToolState]: keyof LifeCycleStateHandlers;
};

type TransitionMap = {
    [K in ToolState]: ToolState[];
};

const stateHandlerMap: HandlerMethodMap = {
    [ToolState.RUN_TOOL]: "HandleInitUI",       // optional: initial no-op or InitUI
    [ToolState.INIT_UI]: "HandleInitUI",
    [ToolState.EMPTY_DISPLAY]: "HandleEmptyDisplay",
    [ToolState.LOAD_SPINE]: "HandleLoadSpine",
    [ToolState.ACTIVE_DISPLAY]: "HandleActiveDisplay",
    [ToolState.CLEAR_SPINE]: "HandleClearSpine",
    [ToolState.REPLACE_SPINE]: "HandleReplaceSpine",
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



// 7. State manager (singleton)
export class StateManager {
    private static instance?: StateManager;
    private currentState: ToolState = ToolState.RUN_TOOL;
    private handlers: LifeCycleStateHandlers[] = [];

    constructor(handlers: LifeCycleStateHandlers | LifeCycleStateHandlers[]) {
        this.handlers = Array.isArray(handlers) ? handlers : [handlers];
        StateManager.instance = this; // register singleton
    }

    static getInstance(): StateManager {
        if (!StateManager.instance) {
            throw new Error("StateManager not initialized yet");
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

        const handlerMethodName = stateHandlerMap[nextState];

        const promises = this.handlers.map(handler => {
            const method = handler[handlerMethodName];
            if (method) return Promise.resolve(method.call(handler));
            return Promise.resolve();
        });

        await Promise.all(promises);
        return true;
    }

}

// 8. Entry point
export async function startCycle() {
    console.log("Tool starting...");

    const pixiInitializer = new PixiInitializer();
    const mainViewPort = new MainViewPort(pixiInitializer.getApp());
    const timelinePlayer = new TimelinePlayer();
    const animationList = new AnimationList();
    const spineMetaData = new SpineMetaData();

    const stateManager = new StateManager([
        pixiInitializer,
        // testHandlers,
        mainViewPort,
        timelinePlayer,
        animationList,
        spineMetaData
    ]);

    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
}
