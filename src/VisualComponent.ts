import { LifeCycleStateHandlers, StateManager, ToolState } from "./LifeCycle";

// 5. Base class for visual components
export abstract class VisualComponent implements LifeCycleStateHandlers {

    constructor() {

    }

    protected async changeState(next: ToolState): Promise<boolean> {
        return StateManager.getInstance().switchState(next);
    }

    abstract HandleInitUI(): Promise<void>;
    abstract HandleEmptyDisplay(): Promise<void>;
    abstract HandleLoadSpine(): Promise<void>;
    abstract HandleActiveDisplay(): Promise<void>;
    abstract HandleReplaceSpine(): Promise<void>;
    abstract HandleClearSpine(): Promise<void>;
}