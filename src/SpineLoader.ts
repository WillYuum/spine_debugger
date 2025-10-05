import { Assets } from 'pixi.js';

interface SpineAssets {
    atlasFile: File;
    jsonFile: File;
    pngFile: File;
}

export class SpineLoader {

    constructor() { }

    async loadSpineAssets({ atlasFile, jsonFile, pngFile }: SpineAssets) {
        try {
            const jsonURL = URL.createObjectURL(jsonFile);
            const imageURL = URL.createObjectURL(pngFile);
            const atlasBase64 = await this.fileToBase64(atlasFile);



            return await Assets.load([
                {
                    alias: 'spineAtlas',
                    src: atlasBase64,
                    format: 'atlas',
                    parser: 'loadTxt'
                },
                {
                    alias: 'spineSkeleton',
                    src: jsonURL,
                    format: 'json',
                    parser: 'loadJson',
                },
                {
                    alias: 'spineImage',
                    src: imageURL,
                    format: 'png',
                    parser: 'loadTextures',
                },
            ], this.onSpineProgress);

        } catch (error) {
            console.error('Error loading spine assets:', error);
            throw error;
        }
    }


    private onSpineProgress(v: any) {
        console.log("Spine load progress: ", v);
    }


    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

}
