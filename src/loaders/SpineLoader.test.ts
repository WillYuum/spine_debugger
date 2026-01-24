import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpineLoader } from './SpineLoader';
import { createMockFile } from '../__tests__/helpers';

// Mock Assets from pixi.js
vi.mock('pixi.js', () => ({
  Assets: {
    load: vi.fn().mockResolvedValue({
      atlas: 'mock-atlas',
      skeleton: 'mock-skeleton',
      image: 'mock-image',
    }),
  },
}));

describe('SpineLoader', () => {
  let loader: SpineLoader;

  beforeEach(() => {
    loader = new SpineLoader();
    vi.clearAllMocks();
  });

  it('should create an instance', () => {
    expect(loader).toBeDefined();
    expect(loader).toBeInstanceOf(SpineLoader);
  });

  describe('loadSpineAssets', () => {
    it('should load spine assets with valid files', async () => {
      const atlasFile = createMockFile('spineboy.atlas', 'atlas content', 'text/plain');
      const jsonFile = createMockFile('spineboy.json', '{"skeleton":{}}', 'application/json');
      const pngFile = createMockFile('spineboy.png', 'png data', 'image/png');

      const result = await loader.loadSpineAssets({
        atlasFile,
        jsonFile,
        pngFile,
      });

      expect(result).toBeDefined();
    });

    it('should handle missing files gracefully', async () => {
      const atlasFile = null as any;
      const jsonFile = null as any;
      const pngFile = null as any;

      await expect(
        loader.loadSpineAssets({ atlasFile, jsonFile, pngFile })
      ).rejects.toThrow();
    });
  });
});
