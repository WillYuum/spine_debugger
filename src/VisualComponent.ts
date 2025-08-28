import { Subscription } from "rxjs";
import { LifeCycleStateHandlers, StateManager, ToolState } from "./LifeCycle";

// 5. Base class for visual components
export abstract class VisualComponent implements LifeCycleStateHandlers {

    // Container for reactive data subscriptions
    protected dataSub: Subscription = new Subscription();


    constructor() {

    }

    protected async changeState(next: ToolState): Promise<boolean> {
        return StateManager.getInstance().switchState(next);
    }


    /** Track a subscription for automatic cleanup */
    protected trackDataSub(subscription: Subscription) {
        this.dataSub.add(subscription);
    }

    /** Dispose all tracked subscriptions */
    protected disposeDataSub() {
        this.dataSub.unsubscribe();
        this.dataSub = new Subscription(); // reset for future use
    }


    abstract HandleInitUI(): Promise<void>;
    abstract HandleEmptyDisplay(): Promise<void>;
    abstract HandleLoadSpine(): Promise<void>;
    abstract HandleActiveDisplay(): Promise<void>;
    abstract HandleReplaceSpine(): Promise<void>;
    abstract HandleClearSpine(): Promise<void>;
}