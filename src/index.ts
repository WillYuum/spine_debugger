import { Spine, DebugUtils, Attachment, VertexAttachment, RegionAttachment, NumberArrayLike, Vector2 } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets } from 'pixi.js';

(async () => {
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });

    document.body.appendChild(app.canvas);

    const handleOnProgress = (v: any) => {
        console.log('progress', v);
    }

    Assets.load([
        { alias: 'spineSkeleton', src: './assets_to_test/spineboy-ess.json' },
        { alias: 'spineAtlas', src: './assets_to_test/spineboy.atlas' },
        { alias: 'spineImage', src: './assets_to_test/spineboy.alias' },

    ], handleOnProgress).then(() => {
        const spine = Spine.from({
            atlas: "spineAtlas",
            skeleton: "spineSkeleton",
        });

        const verCount = getVertsCount(spine);
        const triangles = verCount / 2;

        console.log("verCount", verCount, "triangles", triangles);

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
