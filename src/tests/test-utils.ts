import { vi } from 'vitest';

// Test utilities and mock helpers
export const createMockValidationContext = (overrides = {}) => ({
  fieldName: 'testField',
  value: 'test value',
  language: 'en' as const,
  formData: {},
  ...overrides
});

export const createMockValidationResult = (overrides = {}) => ({
  isValid: true,
  severity: 'success' as const,
  message: 'Validation passed',
  suggestion: undefined,
  rule: {
    id: 'test-rule',
    type: 'length' as const,
    severity: 'success' as const,
    message: { en: 'Test message' }
  },
  score: 100,
  ...overrides
});

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
};

export const mockApiResponse = <T>(data: T, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  } as Response);
};

export const mockApiError = (message = 'Network error', status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  } as Response);
};

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createDeferredPromise = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return {
    promise,
    resolve: resolve!,
    reject: reject!
  };
};

// Mock timer utilities
export const advanceTimersByTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

export const useFakeTimers = () => {
  vi.useFakeTimers();
};

export const useRealTimers = () => {
  vi.useRealTimers();
};

// Test data generators
export const generateTestPRD = () => ({
  title: "Test Product Requirements Document",
  problem: "Users are having difficulty managing their daily tasks efficiently",
  solution: "A comprehensive task management application with AI-powered suggestions",
  targetUsers: "Busy professionals aged 25-45 who need better task organization",
  features: [
    "Task creation and editing",
    "Priority-based sorting",
    "AI-powered task suggestions",
    "Calendar integration",
    "Progress tracking"
  ],
  successMetrics: [
    "80% user retention after 30 days",
    "Reduce task completion time by 25%",
    "Achieve 4.5+ star app store rating"
  ],
  timeline: "6 months development with MVP in 3 months"
});

export const generateTestValidationContext = (overrides = {}) => ({
  fieldName: 'testField',
  value: 'This is a comprehensive test value that should pass most validation rules',
  language: 'en' as const,
  formData: {},
  ...overrides
});

// Assertion helpers
export const expectWithinRange = (value: number, min: number, max: number) => {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

export const expectValidDate = (date: any) => {
  expect(date).toBeInstanceOf(Date);
  expect(date.getTime()).not.toBeNaN();
};

export const expectArrayOfLength = (array: any[], length: number) => {
  expect(Array.isArray(array)).toBe(true);
  expect(array).toHaveLength(length);
};

export const expectObjectWithKeys = (obj: any, keys: string[]) => {
  expect(obj).toBeInstanceOf(Object);
  keys.forEach(key => {
    expect(obj).toHaveProperty(key);
  });
};