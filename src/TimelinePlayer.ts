type PlayChangeCallback = (isPlaying: boolean) => void;
type TimeChangeCallback = (time: number) => void;

export class TimelinePlayer {
    private playButton: HTMLButtonElement;
    private currentTimeEl: HTMLElement;
    private totalTimeEl: HTMLElement;
    private track: HTMLElement;
    private progress: HTMLElement;
    private thumb: HTMLElement;

    private isPlaying: boolean = false;
    private isDragging = false;
    private duration: number = 10.0;
    private currentTime: number = 0.0;

    private playListeners: PlayChangeCallback[] = [];
    private timeListeners: TimeChangeCallback[] = [];

    constructor() {
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;
        this.currentTimeEl = document.getElementById('current-time')!;
        this.totalTimeEl = document.getElementById('total-duration')!;
        this.track = document.getElementById('timeline-track')!;
        this.progress = document.getElementById('timeline-progress')!;
        this.thumb = document.getElementById('timeline-thumb')!;

        this.initPlayButton();
        this.initTimelineDragging();
        this.renderTime();
        this.renderProgress();
    }

    private initPlayButton() {
        this.playButton.addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            this.updatePlayButtonText();
            this.notifyPlayListeners();
        });
        this.updatePlayButtonText();
    }

    private initTimelineDragging() {

        const onMouseMove = (e: MouseEvent) => {
            if (!this.isDragging) return
            const rect = this.track.getBoundingClientRect();
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
        this.playButton.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    }

    private renderTime() {
        this.currentTimeEl.textContent = `${this.currentTime.toFixed(1)}s`;
        this.totalTimeEl.textContent = `${this.duration.toFixed(1)}s`;
    }

    private renderProgress() {
        const percent = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        this.progress.style.width = `${percent}%`;
        this.thumb.style.left = `${percent}%`;
    }

    private notifyPlayListeners() {
        this.playListeners.forEach(cb => cb(this.isPlaying));
    }

    private notifyTimeListeners() {
        this.timeListeners.forEach(cb => cb(this.currentTime));
    }

    public onPlayChange(callback: PlayChangeCallback) {
        this.playListeners.push(callback);
    }

    public onTimeChange(callback: TimeChangeCallback) {
        this.timeListeners.push(callback);
    }

    public setPlaying(playing: boolean) {
        this.isPlaying = playing;
        this.updatePlayButtonText();
        this.notifyPlayListeners();
    }

    public setTime(time: number) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.renderTime();
        this.renderProgress();
        this.notifyTimeListeners();
    }

    public setDuration(duration: number) {
        this.duration = duration;
        this.renderTime();
        this.renderProgress();
    }

    public getTime() {
        return this.currentTime;
    }

    public getDuration() {
        return this.duration;
    }

    public getIsPlaying() {
        return this.isPlaying;
    }

    public isChangingTimeManually() {
        return this.isDragging;
    }
}