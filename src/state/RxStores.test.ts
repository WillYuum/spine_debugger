import { describe, it, expect, beforeEach } from 'vitest';
import {
  animationTime$,
  animationList$,
  selectedAnimation$,
  spineMetaData$,
  pixiApp$,
  isPlaying$,
  totalAnimDuration$,
  animationTime$$,
  drawBoundsOnSpine$,
  enableLoopOnSpine$,
  eventsList$,
} from './RxStores';

describe('RxStores', () => {
  beforeEach(() => {
    // Reset all stores to initial values
    animationTime$.next(0);
    animationList$.next([]);
    selectedAnimation$.next(null);
    spineMetaData$.next(null);
    pixiApp$.next(null);
    isPlaying$.next(false);
    totalAnimDuration$.next(0);
    animationTime$$.next(0);
    drawBoundsOnSpine$.next(false);
    enableLoopOnSpine$.next(false);
    eventsList$.next([]);
  });

  describe('animationTime$', () => {
    it('should initialize with 0', () => {
      expect(animationTime$.value).toBe(0);
    });

    it('should update animation time', () => {
      animationTime$.next(5.5);
      expect(animationTime$.value).toBe(5.5);
    });
  });

  describe('animationList$', () => {
    it('should initialize with empty array', () => {
      expect(animationList$.value).toEqual([]);
    });

    it('should update animation list', () => {
      const animations = ['idle', 'walk', 'run'];
      animationList$.next(animations);
      expect(animationList$.value).toEqual(animations);
    });
  });

  describe('selectedAnimation$', () => {
    it('should initialize with null', () => {
      expect(selectedAnimation$.value).toBe(null);
    });

    it('should update selected animation', () => {
      selectedAnimation$.next('idle');
      expect(selectedAnimation$.value).toBe('idle');
    });
  });

  describe('spineMetaData$', () => {
    it('should initialize with null', () => {
      expect(spineMetaData$.value).toBe(null);
    });

    it('should update spine metadata', () => {
      const metadata = {
        drawCalls: 5,
        vertexCount: 100,
        triangleCount: 50,
      };
      spineMetaData$.next(metadata);
      expect(spineMetaData$.value).toEqual(metadata);
    });
  });

  describe('isPlaying$', () => {
    it('should initialize with false', () => {
      expect(isPlaying$.value).toBe(false);
    });

    it('should toggle playing state', () => {
      isPlaying$.next(true);
      expect(isPlaying$.value).toBe(true);

      isPlaying$.next(false);
      expect(isPlaying$.value).toBe(false);
    });
  });

  describe('totalAnimDuration$', () => {
    it('should initialize with 0', () => {
      expect(totalAnimDuration$.value).toBe(0);
    });

    it('should update total animation duration', () => {
      totalAnimDuration$.next(10.5);
      expect(totalAnimDuration$.value).toBe(10.5);
    });
  });

  describe('drawBoundsOnSpine$', () => {
    it('should initialize with false', () => {
      expect(drawBoundsOnSpine$.value).toBe(false);
    });

    it('should toggle draw bounds', () => {
      drawBoundsOnSpine$.next(true);
      expect(drawBoundsOnSpine$.value).toBe(true);
    });
  });

  describe('enableLoopOnSpine$', () => {
    it('should initialize with false', () => {
      expect(enableLoopOnSpine$.value).toBe(false);
    });

    it('should toggle loop state', () => {
      enableLoopOnSpine$.next(true);
      expect(enableLoopOnSpine$.value).toBe(true);
    });
  });

  describe('eventsList$', () => {
    it('should initialize with empty array', () => {
      expect(eventsList$.value).toEqual([]);
    });

    it('should update events list', () => {
      const events = [
        { name: 'event1', time: 0.5 },
        { name: 'event2', time: 1.0 },
      ];
      eventsList$.next(events as any);
      expect(eventsList$.value).toEqual(events);
    });
  });

  describe('Observable behavior', () => {
    it('should notify subscribers on value change', () => {
      return new Promise<void>((resolve) => {
        const subscription = animationTime$.subscribe((value) => {
          if (value === 3.14) {
            expect(value).toBe(3.14);
            subscription.unsubscribe();
            resolve();
          }
        });

        animationTime$.next(3.14);
      });
    });

    it('should emit current value to new subscribers', () => {
      isPlaying$.next(true);

      let receivedValue: boolean | null = null;
      const subscription = isPlaying$.subscribe((value) => {
        receivedValue = value;
      });

      expect(receivedValue).toBe(true);
      subscription.unsubscribe();
    });
  });
});
