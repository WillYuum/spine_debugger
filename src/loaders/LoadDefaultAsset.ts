import { Assets } from "pixi.js";

export function EnableLoadDefaultSpineButton(cb: CallableFunction) {
    const button = document.getElementById('default_spine_button');

    button?.addEventListener('click', () => {
        LoadDefaultAnimaton().then(v => {
            cb();
        });
    });
}

export function toggleDisableDefaultButton(disable: boolean) {
    const button = document.getElementById('default_spine_button') as HTMLElement;
    if (disable) {
        console.log("Hiding default spine button");
        button.style.display = 'none';
    } else {
        button.style.display = '';
    }
}

function LoadDefaultAnimaton() {

    const onLoad = Assets.load([
        {
            alias: 'atlas',
            src: './assets/spineboy.atlas',
        },
        {
            alias: 'spineSkeleton',
            src: './assets/spineboy-ess.json',
        },
        {
            alias: 'spineImage',
            src: './assets/spineboy.png',
        },
    ]);


    onLoad.then((results) => {
        // console.log("Loaded default animation", results);
    });

    return onLoad;
}