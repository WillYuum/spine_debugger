import { NumberArrayLike, RegionAttachment, Spine } from "@esotericsoftware/spine-pixi-v8";
import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { TimelinePlayer } from "./TimelinePlayer"; // Adjust the import path as needed
import { ControlPanelController } from "./ControlPanelController";

export class SpineController extends Container {
    private _spine: Spine;
    private graphics: Graphics;
    private _attachmentBounds: Graphics;
    private _boundsDebugGraphics: Graphics;
    private _loop: boolean = true;

    get isLooping() {
        return this._loop;
    }

    constructor(parent: Container, private timelinePlayer: TimelinePlayer) {
        super();

        this.label = 'SpineRender';

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

        // Play button changes
        this.timelinePlayer.onPlayChange((isPlaying) => {
            this._spine.state.timeScale = isPlaying ? 1 : 0;
        });

        // Timeline value changes
        this.timelinePlayer.onTimeChange((value) => {

            if (this.timelinePlayer.isChangingTimeManually()) {
                // If the time is being changed manually, we can update the spine state directly
                const currentAnim = this._spine.state.getCurrent(0);

                if (currentAnim) {
                    currentAnim.trackTime = value;
                    this._spine.state.update(0.016);
                }
            }
        });

        Ticker.shared.add(this.onUpdate, this);

        const controlPanel = new ControlPanelController();
        controlPanel.setToggle('enableLoop', this._loop);
    }

    onUpdate(ticker?: Ticker): void {
        if (!this.timelinePlayer.getIsPlaying()) return;

        const currentEntry = this._spine.state.getCurrent(0);
        if (currentEntry) {
            const currentTime = currentEntry.getAnimationTime();
            this.timelinePlayer.setTime(currentTime);
        }
    }

    public play(animName: string) {
        const trackEntry = this._spine.state.setAnimation(0, animName, this._loop);
        const duration = trackEntry.animationEnd - trackEntry.animationStart;

        this.timelinePlayer.setDuration(duration);
        this.timelinePlayer.setTime(0);
    }

    public toggleLoop(loop: boolean) {
        this._loop = loop;
        const currentEntry = this._spine.state.getCurrent(0);
        if (currentEntry) {
            currentEntry.loop = loop;
        }

    }

    public getAnimationNames() {
        return this._spine.skeleton.data.animations.map(anim => anim.name);
    }

    public destroy() {
        this._spine.destroy();
        // this.timelinePlayer.dispose();
        Ticker.shared.remove(this.onUpdate, this);
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

    public clearDrawBoundsForAttachment() {
        this._boundsDebugGraphics.clear();
        this.graphics.clear();
    }

    public getVertsCount() {
        let count = 0;
        this._spine.skeleton.slots.forEach(slot => {
            const attachment = slot.getAttachment();

            if (attachment instanceof RegionAttachment) {
                const regionAttachment = attachment as RegionAttachment;
                const vertCount = this.getVertCounFromUv(regionAttachment.uvs);
                count += vertCount;
            } else {
                console.log("Unknown attachment type");
            }
        });
        return count;
    }

    getVertCounFromUv(uv: NumberArrayLike) {
        return uv.length / 2;
    }
}
