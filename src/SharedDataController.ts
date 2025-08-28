// SharedDataController.ts

type Subscriber<T> = (data: T) => void;

export class SharedDataController<T extends object> {
    private data: T;
    private subscribers: Subscriber<T>[] = [];

    constructor(initialData: T) {
        this.data = initialData;
    }

    // Read the current data
    get() {
        return this.data;
    }

    // Update some part of the data
    update(partial: Partial<T>) {
        this.data = { ...this.data, ...partial };
        this.notify();
    }

    // Subscribe to any change
    subscribe(callback: Subscriber<T>): () => void {
        this.subscribers.push(callback);
        callback(this.data); // optional: notify immediately with current state
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    private notify() {
        this.subscribers.forEach(sub => sub(this.data));
    }
}
