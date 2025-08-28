// RxStores.ts
import { BehaviorSubject } from 'rxjs';

// Current animation time (seconds)
export const animationTime$ = new BehaviorSubject<number>(0);

// Available animations for the loaded Spine
export const animationList$ = new BehaviorSubject<string[]>([]);

// Currently selected animation
export const selectedAnimation$ = new BehaviorSubject<string | null>(null);
