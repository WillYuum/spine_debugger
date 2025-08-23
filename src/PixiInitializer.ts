import { Application } from "pixi.js";
import { LifeCycleStateHandlers } from "./LifeCycle";



export class PixiInitializer implements LifeCycleStateHandlers {
    private app: Application;

    getApp(): Application {
        return this.app;
    }

    constructor() {
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

async function initPixi() {
    const app = new Application();
    const canvasContainer = document.getElementById('canvas_editor')!;
    await app.init({
        background: '#1099bb',
        resizeTo: canvasContainer,
        width: 1440,
        height: 1080,
    });
}
