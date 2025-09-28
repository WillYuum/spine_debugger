import { NumberArrayLike, RegionAttachment, Spine, SpineTexture, TextureAtlas } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets, Container, Graphics, Point, Rectangle, Ticker } from 'pixi.js';
import { EnableDragAndDrop } from "./DragAndDrop";
import { EnableLoadDefaultSpineButton } from './LoadDefaultAsset';
import { SpineLoader } from './SpineLoader';
import { SpineController } from './SpineController';

import { TimelinePlayer } from './TimelinePlayer';
import { ControlPanelController } from './ControlPanelController';

const player = new TimelinePlayer();

player.onPlayChange((isPlaying) => {
    // console.log('Play state changed:', isPlaying);
    // Hook into render logic here
});

player.onTimeChange((time) => {
    // Hook into render logic here
});

// Optional: set a new animation length
player.setDuration(15.0);

// Optional: seek to a specific time
player.setTime(3.5);


(async () => {
    const app = new Application();
    const canvasContainer = document.getElementById('canvas_editor')!;
    await app.init({
        background: '#1099bb',
        resizeTo: canvasContainer,
        width: 1440,
        height: 1080,
    });


    const drawCallsElement = document.getElementById('draw-calls');
    const vertexCountElement = document.getElementById('vertex-count')!;
    const trianglesElement = document.getElementById('triangles')!;

    let drawCount = 0;
    const renderer = app.renderer as any;
    const drawElements = renderer.gl.drawElements;
    renderer.gl.drawElements = (...args: any[]) => {
        drawElements.call(renderer.gl, ...args);
        drawCount++;
    };

    app.ticker.add(() => {
        if (drawCallsElement) {
            drawCallsElement.textContent = drawCount.toString();
        }
        drawCount = 0;
    });

    EnableLoadDefaultSpineButton(() => {
        canvasContainer.appendChild(app.canvas);

        const spineRenderContainer = new SpineRenderContainer();
        app.stage.addChild(spineRenderContainer);

        EnableCanvasControls(canvasContainer, spineRenderContainer);

        spineRenderContainer.x = app.screen.width / 2;
        spineRenderContainer.y = app.screen.height / 2;

        spineRenderContainer.boundsArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

        // TODO: Replace this stub with the actual timeline tracker instance if available
        // const timelineTracker = undefined as any;
        const spineController = new SpineController(spineRenderContainer, player);

        document.getElementById('drop_message')?.remove();
        document.getElementById('default_spine_button')?.remove();

        const animNames = spineController.getAnimationNames();
        populateAnimationsList(animNames, (animName) => {
            spineController.play(animName);
            player.setTime(0);                // Reset timeline to start
            player.setPlaying(true);
        });

        const control = new ControlPanelController();

        let drawBoundsEnabled = false;
        control.onToggle((key, enabled) => {
            switch (key) {
                case 'drawBounds':
                    // console.log(`Draw bounds toggled: ${enabled}`);
                    drawBoundsEnabled = enabled;
                    spineController.clearDrawBoundsForAttachment();
                    break;
                case 'enableLoop':
                    spineController.toggleLoop(enabled);
                default:
                    console.warn(`Unknown control key: ${key}`);
                    null;
            }
        });

        app.ticker.add(() => {
            if (drawBoundsEnabled) {
                spineController.drawRect();
                spineController.drawBoundsForAttachment();
            }
        });

        const vertexCount = spineController.getVertsCount();
        const triangles = vertexCount / 2;

        vertexCountElement.textContent = vertexCount.toString();

        trianglesElement.textContent = triangles.toString();

    });

    EnableDragAndDrop(canvasContainer, async (jsonFile, atlasFile, pngFile) => {
        canvasContainer.appendChild(app.canvas);

        const spineRenderContainer = new SpineRenderContainer();
        app.stage.addChild(spineRenderContainer);

        EnableCanvasControls(canvasContainer, spineRenderContainer);

        const spineLoader = new SpineLoader();
        const onLoadSpines = spineLoader.loadSpineAssets({
            atlasFile: atlasFile,
            jsonFile: jsonFile,
            pngFile: pngFile,
        });

        onLoadSpines.then((v) => {
            const { spineAtlas, spineImage } = v;

            const textureAtlas = new TextureAtlas(spineAtlas);
            Assets.cache.set('atlas', textureAtlas);

            for (const page of textureAtlas.pages) {
                const sprite = Assets.get('spineImage');
                page.setTexture(SpineTexture.from(sprite.source));
            }

            spineRenderContainer.x = app.screen.width / 2;
            spineRenderContainer.y = app.screen.height / 2;

            spineRenderContainer.boundsArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

            const spineController = new SpineController(spineRenderContainer, player);

            const animNames = spineController.getAnimationNames();
            populateAnimationsList(animNames, (animName) => {
                spineController.play(animName);
                player.setPlaying(true);
            });

            const control = new ControlPanelController();

            let drawBoundsEnabled = false;
            control.onToggle((key, enabled) => {
                switch (key) {
                    case 'drawBounds':
                        drawBoundsEnabled = enabled;
                        spineController.clearDrawBoundsForAttachment();
                        break;
                    case 'enableLoop':
                        spineController.toggleLoop(enabled);
                        break;
                    default:
                        null;
                }
            });

            app.ticker.add(() => {
                if (drawBoundsEnabled) {
                    spineController.drawRect();
                    spineController.drawBoundsForAttachment();
                }
            });
            const vertexCount = spineController.getVertsCount();
            const triangles = vertexCount / 2;

            vertexCountElement.textContent = vertexCount.toString();
            trianglesElement.textContent = triangles.toString();
        }).catch(error => {
            console.error("Failed to load assets", error);
        });
    });

})();


function populateAnimationsList(animNames: string[], onClick: (animName: string) => void) {
    const list = document.getElementById('animations-list')!;
    animNames.forEach((animName) => {
        const listItem = document.createElement('li');
        listItem.textContent = animName;
        listItem.addEventListener('click', () => onClick(animName));
        list.appendChild(listItem);
    });
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

        // console.log("boundsArea", boundsArea);

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