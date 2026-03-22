// tests/event-bus.test.js
// Unit tests for event bus pub/sub functionality

const { emit, on, off, clear } = require('../src/core/event-bus');

describe('EventBus', () => {
  beforeEach(() => {
    clear();
  });

  test('on() subscribes handler that receives emitted data', () => {
    const handler = jest.fn();
    on('test-event', handler);

    emit('test-event', { value: 42 });

    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  test('on() returns unsubscribe function', () => {
    const handler = jest.fn();
    const unsubscribe = on('test-event', handler);

    unsubscribe();
    emit('test-event', { value: 42 });

    expect(handler).not.toHaveBeenCalled();
  });

  test('off() removes specific handler', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    on('test-event', handler1);
    on('test-event', handler2);

    off('test-event', handler1);
    emit('test-event', { value: 42 });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith({ value: 42 });
  });

  test('emit() calls multiple handlers for same event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    on('test-event', handler1);
    on('test-event', handler2);

    emit('test-event', 'data');

    expect(handler1).toHaveBeenCalledWith('data');
    expect(handler2).toHaveBeenCalledWith('data');
  });

  test('emit() does nothing for unregistered events', () => {
    expect(() => emit('no-handlers', {})).not.toThrow();
  });

  test('clear() removes all handlers', () => {
    const handler = jest.fn();
    on('test-event', handler);

    clear();
    emit('test-event', {});

    expect(handler).not.toHaveBeenCalled();
  });
});
