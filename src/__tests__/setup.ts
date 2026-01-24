// Test setup file - runs before all tests
import { vi } from 'vitest';

// Mock PixiJS since it requires WebGL context
vi.mock('pixi.js', () => ({
  Application: vi.fn().mockImplementation(() => ({
    stage: { addChild: vi.fn(), removeChild: vi.fn() },
    renderer: { render: vi.fn() },
    ticker: { add: vi.fn(), remove: vi.fn() },
    destroy: vi.fn(),
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    removeChild: vi.fn(),
    children: [],
    destroy: vi.fn(),
  })),
  Graphics: vi.fn().mockImplementation(() => ({
    clear: vi.fn(),
    drawRect: vi.fn(),
    drawCircle: vi.fn(),
    lineStyle: vi.fn(),
    beginFill: vi.fn(),
    endFill: vi.fn(),
    destroy: vi.fn(),
  })),
  Rectangle: vi.fn().mockImplementation((x, y, w, h) => ({
    x, y, width: w, height: h,
  })),
  Ticker: {
    shared: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

// Mock Spine since it requires WebGL context and specific assets
vi.mock('@esotericsoftware/spine-pixi-v8', () => ({
  Spine: {
    from: vi.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      state: {
        setAnimation: vi.fn().mockReturnValue({
          animationStart: 0,
          animationEnd: 1,
          getAnimationTime: vi.fn().mockReturnValue(0),
          trackTime: 0,
        }),
        getCurrent: vi.fn().mockReturnValue(null),
        timeScale: 1,
        update: vi.fn(),
      },
      skeleton: {
        data: {
          animations: [],
        },
      },
    })),
  },
  NumberArrayLike: {},
  RegionAttachment: vi.fn(),
  EventTimeline: vi.fn(),
}));

// Mock dropzone for file upload tests
vi.mock('dropzone', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Add global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
