import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Application, Assets } from 'pixi.js';

(async () => {
    // Create a PixiJS application.
    const app = new Application();

    // Initialize the application.
    await app.init({ background: '#1099bb', resizeTo: window });

    // Add the application's canvas to the DOM body.
    document.body.appendChild(app.canvas);

    const handleOnProgress = (v: any) => {
        console.log('progress', v);
    }

    Assets.load([
        { alias: 'spineSkeleton', src: './assets_to_test/spineboy-ess.json' },
        { alias: 'spineAtlas', src: './assets_to_test/spineboy.atlas' },
        { alias: 'spineImage', src: './assets_to_test/spineboy.alias' },

    ], handleOnProgress).then(() => {
        console.log("Setting up spine");



        const spine = Spine.from({
            atlas: "spineAtlas",
            skeleton: "spineSkeleton",
        });

        spine.x = app.screen.width / 2;
        spine.y = app.screen.height;

        app.stage.addChild(spine);
    }).catch(error => {
        console.error("Failed to load assets", error);
    });
})();
