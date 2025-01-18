import { Spine, RegionAttachment, NumberArrayLike } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets } from 'pixi.js';


(async () => {
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });

    document.body.appendChild(app.canvas);


    const drawCallsElement = document.getElementById('draw-calls');
    const vertexCountElement = document.getElementById('vertex-count')!;
    const trianglesElement = document.getElementById('triangles')!;




    let drawCount = 0;

    const renderer = app.renderer as any;
    const drawElements = renderer.gl.drawElements;
    renderer.gl.drawElements = (...args: any[]) => {
        drawElements.call(renderer.gl, ...args);
        drawCount++;
    }; // Rewrite drawElements to count draws

    app.ticker.add(() => {
        if (drawCallsElement) {
            drawCallsElement.textContent = drawCount.toString();
        }
        drawCount = 0; // Clear count per frame
    });

    const handleOnProgress = (v: any) => {
        console.log('progress', v);
    };

    Assets.load([
        { alias: 'spineSkeleton', src: './assets_to_test/spineboy-ess.json' },
        { alias: 'spineAtlas', src: './assets_to_test/spineboy.atlas' },
        { alias: 'spineImage', src: './assets_to_test/spineboy.png' },

        // { alias: 'owl_spineSkeleton', src: './assets_to_test/owl-pro.json' },
        // { alias: 'owl_spineAtlas', src: './assets_to_test/owl.atlas' },
        // { alias: 'owl_spineImage', src: './assets_to_test/owl.png' },

    ], handleOnProgress).then(() => {
        const spine = Spine.from({
            atlas: "spineAtlas",
            skeleton: "spineSkeleton",
        });


        const animName = getAnimationNames(spine);
        console.log("animName", animName);


        window.addEventListener("message", (event) => {
            const message = event.data;
            console.log("message", message);
            if (checkIfAnimationExists(spine, message)) {
                playAnimation(spine, message);
            }
        });


        const vertexCount = getVertsCount(spine);
        const triangles = vertexCount / 2;

        vertexCountElement.textContent = vertexCount.toString();
        trianglesElement.textContent = triangles.toString();


        spine.x = app.screen.width / 2;
        spine.y = app.screen.height;

        app.stage.addChild(spine);
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