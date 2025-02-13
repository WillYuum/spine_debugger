import { NumberArrayLike, RegionAttachment, Spine } from "@esotericsoftware/spine-pixi-v8";
import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { PlayButtonType, TimelineTrackerType } from ".";

export class SpineController extends Container {
    private _spine: Spine;
    private graphics: Graphics;
    private _attachmentBounds: Graphics;
    private _boundsDebugGraphics: Graphics;

    constructor(parent: Container, private timelineTracker: TimelineTrackerType, private playButton: PlayButtonType) {
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


        this.playButton.onChange((isPlaying) => {
            if (isPlaying) {
                this._spine.state.timeScale = 1;
            } else {
                this._spine.state.timeScale = 0;
            }
        });

        timelineTracker.onChange((value) => {
            const currentAnim = this._spine.state.getCurrent(0)
            if (currentAnim) {
                currentAnim.trackTime = value;
                this._spine.state.update(0.016);
            }

            if (this.playButton.isPlaying) {
                this.playButton.forceChange(false);

                this._spine.state.timeScale = 0;
            }
        });


        Ticker.shared.add(this.onUpdate, this);
    }

    onUpdate(ticker?: Ticker): void {
        const isPlaying = this.playButton.isPlaying;

        if (isPlaying == false) {
            return;
        }

        const currentEntry = this._spine.state.getCurrent(0);
        if (currentEntry) {
            const currentTime = currentEntry.getAnimationTime();
            this.timelineTracker.updateTimeline(currentTime);
        }

    }

    public play(animName: string) {
        const trackEntry = this._spine.state.setAnimation(0, animName, true);

        const duration = trackEntry.animationEnd - trackEntry.animationStart;
        this.timelineTracker.setNewAnimation(0, duration);
        this.timelineTracker.updateTimeline(0);
    }

    public getAnimationNames() {
        return this._spine.skeleton.data.animations.map(anim => anim.name);
    }

    public destroy() {
        this._spine.destroy();
        this.timelineTracker.clearListeners();
        this.playButton.clearListeners();
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