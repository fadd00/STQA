require('@testing-library/jest-dom');

// Mock global fetch agar tidak error di environment test
if (!global.fetch) {
  global.fetch = (...args) =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
      text: async () => "",
    });
}