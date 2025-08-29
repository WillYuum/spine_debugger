import { VisualComponent } from "../VisualComponent";
import { animationTime$, animationTime$$, isPlaying$, selectedAnimation$, totalAnimDuration$ } from "../RxStores"; // new reactive stores
import { Subscription } from "rxjs";

export class TimelinePlayer extends VisualComponent {
    private playButton: HTMLButtonElement | null = null;
    private currentTimeEl: HTMLElement | null = null;
    private totalTimeEl: HTMLElement | null = null;
    private track: HTMLElement | null = null;
    private currentDuration: HTMLElement | null = null;
    private thumb: HTMLElement | null = null;

    private isDragging = false;
    private duration: number = 10.0;

    // Internal state is now derived from stores
    private currentTime: number = 0;
    private isPlaying: boolean = false;

    async HandleInitUI(): Promise<void> {
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;
        this.currentTimeEl = document.getElementById('current-time')!;
        this.totalTimeEl = document.getElementById('total-duration')!;
        this.track = document.getElementById('timeline-track')!;
        this.currentDuration = document.getElementById('timeline-progress')!;
        this.thumb = document.getElementById('timeline-thumb')!;

        this.initPlayButton();
        this.initTimelineDragging();
        this.renderTime();
        this.renderProgress();

        // Subscribe to reactive stores
        this.trackDataSub(animationTime$.subscribe(time => {
            if (!this.isDragging) {
                this.currentTime = time;
                this.renderTime();
                this.renderProgress();
            }
        }));

        this.trackDataSub(isPlaying$.subscribe(playing => {
            this.isPlaying = playing;
            this.updatePlayButtonText();
        }));

        // Reset timeline
        this.setTime(0);
        this.setPlaying(false);
    }

    private initPlayButton() {
        if (!this.playButton) return;

        this.playButton.addEventListener('click', () => {
            this.setPlaying(!this.isPlaying);
        });

        this.updatePlayButtonText();
    }

    private initTimelineDragging() {
        if (!this.track) return;

        const onMouseMove = (e: MouseEvent) => {
            if (!this.isDragging) return;

            if (this.isPlaying) {
                this.setPlaying(false);
                isPlaying$.next(false);
            }

            console.log("dragging");
            const rect = this.track!.getBoundingClientRect();
            const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            this.setTime(this.duration * percent);
        };

        const onMouseUp = () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };

        this.track.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            onMouseMove(e);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    private updatePlayButtonText() {
        if (!this.playButton) return;
        this.playButton.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    }

    private renderTime() {
        if (this.currentTimeEl && this.totalTimeEl) {
            this.currentTimeEl.textContent = `${this.currentTime.toFixed(1)}s`;
            this.totalTimeEl.textContent = `${this.duration.toFixed(1)}s`;
        }
    }

    private renderProgress() {
        if (!this.currentDuration || !this.thumb) return;

        // console.log("woop woop")

        const percent = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        this.currentDuration.style.width = `${percent}%`;
        this.thumb.style.left = `${percent}%`;
    }

    /** Updates both internal state and reactive stores */
    public setTime(time: number) {
        console.log("setting time");
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        animationTime$.next(this.currentTime); // reactive store update
        this.renderTime();
        this.renderProgress();
    }

    public setPlaying(playing: boolean) {
        this.isPlaying = playing;
        isPlaying$.next(this.isPlaying); // reactive store update
        this.updatePlayButtonText();
    }

    public setDuration(duration: number) {
        this.duration = duration;
        this.renderTime();
        this.renderProgress();

        // console.log('Current duration:', this.duration);
    }

    public getTime() { return this.currentTime; }
    public getIsPlaying() { return this.isPlaying; }
    public isChangingTimeManually() { return this.isDragging; }

    // Lifecycle handlers reset timeline
    async HandleEmptyDisplay(): Promise<void> { this.setPlaying(false); this.setTime(0); }
    async HandleLoadSpine(): Promise<void> { this.setPlaying(false); this.setTime(0); }
    async HandleActiveDisplay(): Promise<void> {
        this.setPlaying(true);


        totalAnimDuration$.subscribe(dur => this.setDuration(dur));
        animationTime$$.subscribe(dur => this.setTime(dur));
    }
    async HandleReplaceSpine(): Promise<void> { this.setPlaying(false); this.setTime(0); }
    async HandleClearSpine(): Promise<void> { this.setPlaying(false); this.setTime(0); }
}
