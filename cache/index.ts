import NodeCache = require("node-cache");

const cache = new NodeCache({ checkperiod: 1 });

export const getCache = (key: string) => {
  return cache.get(key);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setCache = (key: string, value: any, ttl: number) => {
  cache.set(key, value, ttl);
};

export const setCacheEvent = (event: string, callback: (key: string, value: string) => void) => {
  cache.on(event, (key, value) => callback(key, value));
};
