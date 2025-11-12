declare module 'async-queue' {
    export interface AsyncQueueOptions {
      concurrency?: number;
    }
  
    export default class AsyncQueue {
      constructor(options?: AsyncQueueOptions);
      push(fn: () => Promise<any>): Promise<any>;
      length(): number;
      concurrency: number;
    }
  }