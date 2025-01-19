import { Spine, RegionAttachment, NumberArrayLike } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets, Container, Point } from 'pixi.js';

(async () => {
    const app = new Application();

    const canvasContainer = document.getElementById('canvas_container')!;
    await app.init({
        background: '#1099bb',
        resizeTo: canvasContainer,
        width: 800,
        height: 600,
    });

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

    Assets.load([
        { alias: 'spineSkeleton', src: './assets_to_test/spineboy-ess.json' },
        { alias: 'spineAtlas', src: './assets_to_test/spineboy.atlas' },
        { alias: 'spineImage', src: './assets_to_test/spineboy.png' },
    ], handleOnProgress).then(() => {
        const spine = Spine.from({
            atlas: "spineAtlas",
            skeleton: "spineSkeleton",
        });

        spineRenderContainer.addChild(spine);

        const animNames = getAnimationNames(spine);
        populateAnimationsList(animNames, (animName) => {
            playAnimation(spine, animName);
        });

        const vertexCount = getVertsCount(spine);
        const triangles = vertexCount / 2;

        vertexCountElement.textContent = vertexCount.toString();
        trianglesElement.textContent = triangles.toString();

        spine.x = app.screen.width / 2;
        spine.y = app.screen.height;
    }).catch(error => {
        console.error("Failed to load assets", error);
    });
})();

function getVertsCount(spine: Spine) {
    let count = 0;
    spine.skeleton.slots.forEach(slot => {
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

function getVertCounFromUv(uv: NumberArrayLike) {
    return uv.length / 2;
}

function getAnimationNames(spine: Spine) {
    return spine.skeleton.data.animations.map(anim => anim.name);
}

function playAnimation(spine: Spine, animName: string) {
    spine.state.setAnimation(0, animName, true);
}

function checkIfAnimationExists(spine: Spine, animName: string) {
    return spine.skeleton.data.animations.some(anim => anim.name === animName);
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

    constructor() {
        super();
        const defaultZoomLevel = 1;
        this.zoomLevel = defaultZoomLevel;
    }

    handleZoom(zoomFactor: number) {
        this.zoomLevel *= zoomFactor;
        this.scale.set(this.zoomLevel);
    }

    handleMove(deltaX: number, deltaY: number) {
        this.x += deltaX;
        this.y += deltaY;
    }
}
