const listeners = new Map();

function emit(event, data) {
  const handlers = listeners.get(event) || [];
  handlers.forEach(fn => fn(data));
}

function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(handler);
  return () => off(event, handler);
}

function off(event, handler) {
  const handlers = listeners.get(event) || [];
  listeners.set(event, handlers.filter(fn => fn !== handler));
}

function clear() {
  listeners.clear();
}

module.exports = { emit, on, off, clear };
