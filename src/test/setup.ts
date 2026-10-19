import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock window.scrollTo and scroll
window.scrollTo = () => {};
window.scroll = () => {};

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0;
  state = 'running';
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }
  resume() {
    return Promise.resolve();
  }
}

(window as any).AudioContext = MockAudioContext;
(window as any).webkitAudioContext = MockAudioContext;

// Mock BroadcastChannel if missing or incomplete in test environment
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: any) => void) | null = null;
  static channels = new Map<string, Set<MockBroadcastChannel>>();

  constructor(name: string) {
    this.name = name;
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, new Set());
    }
    MockBroadcastChannel.channels.get(name)!.add(this);
  }

  postMessage(data: any) {
    const set = MockBroadcastChannel.channels.get(this.name);
    if (set) {
      set.forEach((ch) => {
        if (ch !== this && ch.onmessage) {
          ch.onmessage({ data } as any);
        }
      });
    }
  }

  close() {
    const set = MockBroadcastChannel.channels.get(this.name);
    if (set) {
      set.delete(this);
    }
  }
}

(globalThis as any).BroadcastChannel = MockBroadcastChannel;
(window as any).BroadcastChannel = MockBroadcastChannel;
