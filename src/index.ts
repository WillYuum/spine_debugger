import { Spine, RegionAttachment, NumberArrayLike, Vector2 } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets, Container, Point, Graphics, Rectangle } from 'pixi.js';
import { EnableDragAndDrop } from "./DragAndDrop";




(async () => {
    const app = new Application();


    const canvasContainer = document.getElementById('canvas_editor')!;
    await app.init({
        background: '#1099bb',
        resizeTo: canvasContainer,
        width: 800,
        height: 600,
    });


    EnableDragAndDrop(canvasContainer, (jsonFile, atlasFile, pngFile) => {
        console.log("Files detected:", {
            json: jsonFile.name,
            atlas: atlasFile.name,
            png: pngFile.name
        });

        canvasContainer.appendChild(app.canvas);


        // app.canvas.toDataURL('')

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

        console.log("Loading assets...");
        console.log("jsonFile", jsonFile.webkitRelativePath);
        console.log("atlasFile", atlasFile.webkitRelativePath);
        console.log("pngFile", pngFile.webkitRelativePath);

        // Assets.loader.load(pngFile.).then(() => {
        //     console.log("Image loaded   ", pngFile.name);
        // });

        Assets.load([
            { alias: 'spineSkeleton', src: './assets_to_test/spineboy-ess.json' },
            { alias: 'spineAtlas', src: './assets_to_test/spineboy.atlas' },
            { alias: 'spineImage', src: './assets_to_test/spineboy.png' },
            // { alias: 'spineSkeleton', src: jsonFile.name },
            // { alias: 'spineAtlas', src: atlasFile.name },
            // { alias: 'spineImage', src: pngFile.name },
        ], handleOnProgress).then(() => {

            spineRenderContainer.x = app.screen.width / 2;
            spineRenderContainer.y = app.screen.height / 2;

            spineRenderContainer.boundsArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

            const spineController = new SpineController(spineRenderContainer);

            const animNames = spineController.getAnimationNames();
            populateAnimationsList(animNames, (animName) => {
                spineController.play(animName);
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
            atlas: "spineAtlas",
            skeleton: "spineSkeleton",
        });

        spineParent.addChild(this._spine);

        this.graphics = new Graphics();
        // this.graphics.y -= this._spine.height / 2;
        debugParent.addChild(this.graphics);

        this._attachmentBounds = new Graphics();
        debugParent.addChild(this._attachmentBounds);

        this._boundsDebugGraphics = new Graphics();
        debugParent.addChild(this._boundsDebugGraphics);

        this.boundsArea = new Rectangle(this._spine.x, this._spine.y, this._spine.width, this._spine.height);
    }

    public play(animName: string) {
        this._spine.state.setAnimation(0, animName, true);
    }

    public getAnimationNames() {
        return this._spine.skeleton.data.animations.map(anim => anim.name);
    }

    public drawRect() {
        const rect = this.boundsArea;
        this.graphics.clear();

        // this.graphics
        //     .rect(this._spine.x - this._spine.width / 2, this._spine.y - this._spine.height / 2, rect.width, rect.height)
        //     .stroke({ color: 0x008000, pixelLine: true });

        this.graphics
            .rect(rect.x, rect.y, rect.width, rect.height)
            .stroke({ color: 0x008000, pixelLine: true });

        this.graphics.x = -this._spine.width / 2;
        this.graphics.y = -this._spine.height;
        // this.graphics.width = this._spine.width;
        // this.graphics.height = this._spine.height;
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


// //Add function to create a directory from the file
// function createDirectory(file: File) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//         const arrayBuffer = reader.result as ArrayBuffer;
//         const uint8Array = new Uint8Array(arrayBuffer);
//         const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = file.name;
//         a.click();
//         URL.revokeObjectURL(url);
//     };
//     reader.readAsArrayBuffer(file);

//     reader.pa
//     return reader;
// }\