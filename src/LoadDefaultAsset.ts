import { Assets } from "pixi.js";

export function EnableLoadDefaultSpineButton(cb: CallableFunction) {
    const button = document.getElementById('default_spine_button');

    button?.addEventListener('click', () => {
        LoadDefaultAnimaton().then(v => {
            cb();
        });
    });
}

function LoadDefaultAnimaton() {
    console.log("Loading default animation");
    // const jsonDir = './assets/'


    const onLoad = Assets.load([
        {
            alias: 'spineAtlas',
            src: './assets/spineboy.atlas',
        },
        {
            alias: 'spineSkeleton',
            src: './assets/spineboy.json',
        },
        {
            alias: 'spineImage',
            src: './assets/spineboy.png',
        },
    ]);


    onLoad.then((results) => {

    });

    return onLoad;
}