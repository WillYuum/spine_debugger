import { Application, Container, Graphics, Point, Rectangle } from "pixi.js";
import { LifeCycleStateHandlers, ToolState } from "../LifeCycle";
import { EnableDragAndDrop } from "../DragAndDrop";
import { SpineLoader } from "../SpineLoader";
import { EnableLoadDefaultSpineButton } from "../LoadDefaultAsset";
import { SpineController } from "../Spine/SpineController";
import { VisualComponent } from "../VisualComponent";
import { animationList$, selectedAnimation$ } from "../RxStores";




export class MainViewPort extends VisualComponent {
    private pixiApp: Application;

    constructor(application: Application) {
        super();
        this.pixiApp = application;
    }


    private _spineController!: SpineController;

    async HandleInitUI(): Promise<void> {
        console.log("Aolouuuu: HandleInitUI");

    }

    async HandleEmptyDisplay(): Promise<void> {
        console.log("MainViewPort: HandleEmptyDisplay");
        EnableLoadDefaultSpineButton(() => {
            console.log("Load default spine button clicked");
            this.changeState(ToolState.LOAD_SPINE);

        });

    }

    async HandleLoadSpine(): Promise<void> {

        const canvasContainer = document.getElementById('canvas_editor')!;

        canvasContainer.appendChild(this.pixiApp.canvas);

        const spineRenderContainer = new SpineRenderContainer();
        this.pixiApp.stage.addChild(spineRenderContainer);


        EnableCanvasControls(canvasContainer, spineRenderContainer);

        spineRenderContainer.x = this.pixiApp.screen.width / 2;
        spineRenderContainer.y = this.pixiApp.screen.height / 2;

        spineRenderContainer.boundsArea = new Rectangle(0, 0, this.pixiApp.screen.width, this.pixiApp.screen.height);

        this._spineController = new SpineController(spineRenderContainer);


        document.getElementById('drop_message')?.remove();
        document.getElementById('default_spine_button')?.remove();


        const animations = this._spineController.getAnimationNames();

        animationList$.next(animations);
        this.changeState(ToolState.ACTIVE_DISPLAY);
    }

    async HandleActiveDisplay(): Promise<void> {
        selectedAnimation$.subscribe(animName => {
            console.log('Selected animation:', animName);
            if (animName !== null) {
                this._spineController.play(animName);
            }

        });
    }

    async HandleReplaceSpine(): Promise<void> {

    }

    async HandleClearSpine(): Promise<void> {

    }
}


class SpineRenderContainer extends Container {
    private zoomLevel: number;
    private graphics: Graphics;

    constructor() {
        super();
        const defaultZoomLevel = 1;
        this.zoomLevel = defaultZoomLevel;

        this.graphics = new Graphics();
        this.graphics.zIndex = 1000;
        this.addChild(this.graphics);
    }

    handleZoom(zoomFactor: number) {
        this.zoomLevel *= zoomFactor;
        this.scale.set(this.zoomLevel);
    }

    handleMove(deltaX: number, deltaY: number) {
        this.x += deltaX;
        this.y += deltaY;
    }

    public drawBounds() {
        this.graphics.clear();
        const boundsArea = this.boundsArea;

        this.graphics
            .rect(boundsArea.left, boundsArea.top, boundsArea.width, boundsArea.height)
            .stroke({ color: 0x008000, pixelLine: true });
    }
}



function EnableCanvasControls(canvasContainer: HTMLElement, spineRenderContainer: SpineRenderContainer) {
    let isDragging = false;
    let dragStart = new Point();

    canvasContainer.addEventListener('wheel', (event) => {
        event.preventDefault();
        const zoomFactor = 1.1; // Adjust this factor for faster/slower zooming
        if (event.deltaY < 0) {
            spineRenderContainer.handleZoom(zoomFactor);
        } else {
            spineRenderContainer.handleZoom(1 / zoomFactor);
        }
    });

    canvasContainer.addEventListener('mousedown', (event) => {
        const leftMouseButton = 0;
        if (event.button === leftMouseButton) {
            isDragging = true;
            const rect = canvasContainer.getBoundingClientRect();
            dragStart.set(event.clientX - rect.left, event.clientY - rect.top);
        }
    });

    canvasContainer.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const rect = canvasContainer.getBoundingClientRect();
            const currentMousePosition = new Point(
                event.clientX - rect.left,
                event.clientY - rect.top
            );

            const deltaX = currentMousePosition.x - dragStart.x;
            const deltaY = currentMousePosition.y - dragStart.y;

            spineRenderContainer.handleMove(deltaX, deltaY);
            dragStart = currentMousePosition;
        }
    });

    canvasContainer.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            isDragging = false;
        }
    });

    canvasContainer.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}