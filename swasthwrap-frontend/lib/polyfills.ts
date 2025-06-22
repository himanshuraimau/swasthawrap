// Polyfills for Node.js modules in browser environment

// Buffer polyfill
if (typeof window !== 'undefined' && !window.Buffer) {
  try {
    const { Buffer } = require('buffer')
    window.Buffer = Buffer
  } catch (e) {
    // Buffer not available, create minimal polyfill
    window.Buffer = {
      from: (data: any) => new Uint8Array(data),
      isBuffer: (obj: any) => obj instanceof Uint8Array,
    } as any
  }
}

// Process polyfill
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    version: '',
    platform: 'browser',
  } as any
}

// Global polyfill
if (typeof window !== 'undefined' && !window.global) {
  window.global = window
}

export {}
