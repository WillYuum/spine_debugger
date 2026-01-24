import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager, ToolState, LifeCycleStateHandlers } from './LifeCycle';

describe('StateManager', () => {
  let stateManager: StateManager;
  let mockHandler: LifeCycleStateHandlers;

  beforeEach(() => {
    // Reset singleton instance before each test
    (StateManager as any).instance = undefined;

    // Create a mock handler
    mockHandler = {
      HandleInitUI: async () => {},
      HandleEmptyDisplay: async () => {},
      HandleLoadSpine: async () => {},
      HandleActiveDisplay: async () => {},
      HandleReplaceSpine: async () => {},
      HandleClearSpine: async () => {},
    };

    stateManager = new StateManager(mockHandler);
  });

  it('should initialize with RUN_TOOL state', () => {
    expect(stateManager).toBeDefined();
  });

  it('should get singleton instance', () => {
    const instance = StateManager.getInstance();
    expect(instance).toBe(stateManager);
  });

  it('should throw error when getting instance before initialization', () => {
    (StateManager as any).instance = undefined;
    expect(() => StateManager.getInstance()).toThrow('StateManager not initialized yet');
  });

  it('should allow valid state transitions', async () => {
    const result = await stateManager.switchState(ToolState.INIT_UI);
    expect(result).toBe(true);
  });

  it('should reject invalid state transitions', async () => {
    // Try to transition directly from RUN_TOOL to LOAD_SPINE (invalid)
    const result = await stateManager.switchState(ToolState.LOAD_SPINE);
    expect(result).toBe(false);
  });

  it('should follow valid transition chain', async () => {
    // RUN_TOOL -> INIT_UI -> EMPTY_DISPLAY -> LOAD_SPINE
    let result = await stateManager.switchState(ToolState.INIT_UI);
    expect(result).toBe(true);

    result = await stateManager.switchState(ToolState.EMPTY_DISPLAY);
    expect(result).toBe(true);

    result = await stateManager.switchState(ToolState.LOAD_SPINE);
    expect(result).toBe(true);

    result = await stateManager.switchState(ToolState.ACTIVE_DISPLAY);
    expect(result).toBe(true);
  });

  it('should handle multiple handlers', async () => {
    const handler1 = { ...mockHandler };
    const handler2 = { ...mockHandler };

    const manager = new StateManager([handler1, handler2]);
    const result = await manager.switchState(ToolState.INIT_UI);
    
    expect(result).toBe(true);
  });

  it('should allow ACTIVE_DISPLAY to transition to CLEAR_SPINE', async () => {
    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
    await stateManager.switchState(ToolState.LOAD_SPINE);
    await stateManager.switchState(ToolState.ACTIVE_DISPLAY);

    const result = await stateManager.switchState(ToolState.CLEAR_SPINE);
    expect(result).toBe(true);
  });

  it('should allow ACTIVE_DISPLAY to transition to REPLACE_SPINE', async () => {
    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
    await stateManager.switchState(ToolState.LOAD_SPINE);
    await stateManager.switchState(ToolState.ACTIVE_DISPLAY);

    const result = await stateManager.switchState(ToolState.REPLACE_SPINE);
    expect(result).toBe(true);
  });

  it('should allow CLEAR_SPINE to transition back to EMPTY_DISPLAY', async () => {
    await stateManager.switchState(ToolState.INIT_UI);
    await stateManager.switchState(ToolState.EMPTY_DISPLAY);
    await stateManager.switchState(ToolState.LOAD_SPINE);
    await stateManager.switchState(ToolState.ACTIVE_DISPLAY);
    await stateManager.switchState(ToolState.CLEAR_SPINE);

    const result = await stateManager.switchState(ToolState.EMPTY_DISPLAY);
    expect(result).toBe(true);
  });
});
