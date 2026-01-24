# Testing Guide

This project uses [Vitest](https://vitest.dev/) as the testing framework.

## Running Tests

### Run tests in watch mode
```bash
npm test
```

### Run tests once
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

Tests are located alongside source files with `.test.ts` or `.spec.ts` extensions:

```
src/
  core/
    LifeCycle.ts
    LifeCycle.test.ts       # Tests for LifeCycle
  state/
    RxStores.ts
    RxStores.test.ts        # Tests for RxStores
  loaders/
    SpineLoader.ts
    SpineLoader.test.ts     # Tests for SpineLoader
  __tests__/
    setup.ts                # Global test setup
    helpers.ts              # Test utilities
```

## Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should do something', () => {
    const component = new MyComponent();
    expect(component).toBeDefined();
  });
});
```

### Using Test Helpers

```typescript
import { createMockFile, waitFor, flushPromises } from '../__tests__/helpers';

it('should handle file upload', async () => {
  const file = createMockFile('test.json', '{"test": true}');
  // ... test logic
});
```

### Mocking Dependencies

PixiJS and Spine are automatically mocked in [setup.ts](src/__tests__/setup.ts). Additional mocks can be added using `vi.mock()`:

```typescript
import { vi } from 'vitest';

vi.mock('./dependency', () => ({
  default: vi.fn(),
}));
```

## Current Test Coverage

- ✅ State Management (StateManager, ToolState transitions)
- ✅ RxJS Stores (BehaviorSubjects)
- ✅ SpineLoader (File loading utilities)

## Adding More Tests

To add tests for a new component:

1. Create a `.test.ts` file next to your component
2. Import the testing utilities from vitest
3. Write your tests using `describe`, `it`, and `expect`
4. Run `npm test` to verify

## CI/CD Integration

Add this to your CI pipeline:

```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## Tips

- Use `beforeEach` to reset state between tests
- Mock external dependencies (APIs, file systems, DOM elements)
- Test both success and error cases
- Keep tests focused and isolated
- Use descriptive test names
