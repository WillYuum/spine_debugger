import { Application } from "pixi.js";
import { LifeCycleStateHandlers } from "../core/LifeCycle";
import { VisualComponent } from "../core/VisualComponent";
import { pixiApp$ } from "../state/RxStores";



export class PixiInitializer extends VisualComponent {
    private app: Application;

    getApp(): Application {
        return this.app;
    }

    constructor() {
        super();
        this.app = new Application();
    }

    async HandleInitUI() {
        const canvasContainer = document.getElementById('canvas_editor')!;

        await this.app.init({
            background: '#1099bb',
            resizeTo: canvasContainer,
            width: 1440,
            height: 1080,
        });

        pixiApp$.next(this.app);
    }

    async HandleEmptyDisplay() {

    }

    async HandleLoadSpine() {

    }

    async HandleActiveDisplay() {

    }

    async HandleReplaceSpine() {

    }

    async HandleClearSpine() {

    }

}
