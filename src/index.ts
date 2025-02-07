import { NumberArrayLike, RegionAttachment, Spine, SpineTexture, TextureAtlas } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets, Container, Graphics, Point, Rectangle } from 'pixi.js';
import { EnableDragAndDrop } from "./DragAndDrop";
import { SpineLoader } from './SpineLoader';

const playButton = createPlayButton();

function createPlayButton() {
    const playButton = document.getElementById('play-button')!;
    let isPlaying = false;

    const updateButtonText = () => {
        playButton.textContent = isPlaying ? "Pause" : "Play";
    };

    const listeners: ((isPlaying: boolean) => void)[] = [];

    const onChange = (callback: (isPlaying: boolean) => void) => {
        listeners.push(callback);
    };

    const notifyListeners = () => {
        listeners.forEach(callback => callback(isPlaying));
    };

    const onClick = () => {
        isPlaying = !isPlaying;
        updateButtonText();
        notifyListeners();
    };

    playButton.addEventListener('click', onClick);

    const forceChange = (value: boolean) => {
        isPlaying = value;
        updateButtonText();
        notifyListeners();
    };

    return {
        get isPlaying() { return isPlaying; },
        forceChange,
        onChange
    };
}


(async () => {
    const app = new Application();
    const canvasContainer = document.getElementById('canvas_editor')!;
    await app.init({
        background: '#1099bb',
        resizeTo: canvasContainer,
        width: 800,
        height: 600,
    });

    EnableDragAndDrop(canvasContainer, async (jsonFile, atlasFile, pngFile) => {
        canvasContainer.appendChild(app.canvas);

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

        const handleOnProgress = (v: any) => {
            console.log('progress', v);
        };

        const spineRenderContainer = new SpineRenderContainer();
        app.stage.addChild(spineRenderContainer);

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

            const spineController = new SpineController(spineRenderContainer);

            const animNames = spineController.getAnimationNames();
            populateAnimationsList(animNames, (animName) => {
                spineController.play(animName);
                playButton.forceChange(true);
            });

            app.ticker.add(() => {
                spineController.drawRect();
                // spineController.drawBoundsForAttachment();
                spineController.drawBoundsForAttachment();
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

function getVertCounFromUv(uv: NumberArrayLike) {
    return uv.length / 2;
}

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

        console.log("boundsArea", boundsArea);

        this.graphics
            .rect(boundsArea.left, boundsArea.top, boundsArea.width, boundsArea.height)
            .stroke({ color: 0x008000, pixelLine: true });
    }
}

class SpineController extends Container {
    private _spine: Spine;
    private graphics: Graphics;
    private _attachmentBounds: Graphics;
    private _boundsDebugGraphics: Graphics;

    constructor(parent: Container) {
        super();

        const spineParent = new Container();
        const debugParent = new Container();

        parent.addChild(spineParent);
        parent.addChild(debugParent);

        this._spine = Spine.from({
            atlas: "atlas",
            skeleton: "spineSkeleton",
        });

        spineParent.addChild(this._spine);

        this.graphics = new Graphics();
        debugParent.addChild(this.graphics);

        this._attachmentBounds = new Graphics();
        debugParent.addChild(this._attachmentBounds);

        this._boundsDebugGraphics = new Graphics();
        debugParent.addChild(this._boundsDebugGraphics);

        this.boundsArea = new Rectangle(this._spine.x, this._spine.y, this._spine.width, this._spine.height);


        playButton.onChange((isPlaying) => {
            if (isPlaying) {
                this._spine.state.timeScale = 1;
            } else {
                this._spine.state.timeScale = 0;
            }
        });
    }

    public play(animName: string) {
        const trackEntry = this._spine.state.setAnimation(0, animName, true);

        // const timeline = document.getElementById("timeline").ele;
        // const duration = this._spine.state.trackEntry(trackEntry, ); // Get animation duration
        // if (timeline != null) {
        // timeline.max = dtrackEntry.duration * 100;
        // }
    }

    public getAnimationNames() {
        return this._spine.skeleton.data.animations.map(anim => anim.name);
    }

    public drawRect() {
        const rect = this.boundsArea;
        this.graphics.clear();

        this.graphics
            .rect(rect.x, rect.y, rect.width, rect.height)
            .stroke({ color: 0x008000, pixelLine: true });

        this.graphics.x = -this._spine.width / 2;
        this.graphics.y = -this._spine.height;
    }

    public drawBoundsForAttachment() {
        this._boundsDebugGraphics.clear();

        this._spine.skeleton.slots.forEach((slot) => {
            const attachment = slot.getAttachment();
            if (attachment instanceof RegionAttachment) {
                const regionAttachment = attachment as RegionAttachment;

                const vertices = new Float32Array(8);
                regionAttachment.computeWorldVertices(slot, vertices, 0, 2);

                this._boundsDebugGraphics.stroke({
                    color: 0x0000ff,
                    width: 1,
                });

                this._boundsDebugGraphics.moveTo(vertices[0], vertices[1]);
                for (let i = 2; i < vertices.length; i += 2) {
                    this._boundsDebugGraphics.lineTo(vertices[i], vertices[i + 1]);
                }
                this._boundsDebugGraphics.closePath();
            }
        });
    }

    public getVertsCount() {
        let count = 0;
        this._spine.skeleton.slots.forEach(slot => {
            const attachment = slot.getAttachment();

            if (attachment instanceof RegionAttachment) {
                const regionAttachment = attachment as RegionAttachment;
                const vertCount = getVertCounFromUv(regionAttachment.uvs);
                count += vertCount;
            } else {
                console.log("Unknown attachment type");
            }
        });
        return count;
    }
}
