// app/Queues/Queue.ts
import Bull from 'bull';
import { EventEmitter } from 'events';

export default class Queue extends EventEmitter {
  private queue: Bull.Queue;
  private name: string;

  constructor(name: string, redisConfig: Bull.QueueOptions = {}) {
    super();
    this.name = name;
    
    // Default settings for Redis
    const defaultConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined
      }
    };
    
    // Create a queue with the provided configuration
    this.queue = new Bull(name, { ...defaultConfig, ...redisConfig });
    
    // Event handling
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed with result:`, result);
      this.emit('completed', job, result);
    });
    
    this.queue.on('failed', (job, error) => {
      console.error(`Job ${job.id} failed with error:`, error);
      this.emit('failed', job, error);
    });
    
    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled`);
      this.emit('stalled', job);
    });
  }

  /**
   * Adds a job to the queue
   */
  async add(data: any, options: Bull.JobOptions = {}): Promise<Bull.Job> {
    return await this.queue.add(data, options);
  }

  /**
   * Sets a job processor
   */
  process(handler: (job: Bull.Job) => Promise<any>): void {
    this.queue.process(async (job) => {
      console.log(`Processing job ${job.id} from queue ${this.name}`);
      return await handler(job);
    });
  }

  /**
   * Clears the queue
   */
  async clear(): Promise<void> {
    await this.queue.empty();
  }

  /**
   * Gets a list of active jobs
   */
  async getActive(): Promise<Bull.Job[]> {
    return await this.queue.getActive();
  }

  /**
   * Gets a list of waiting jobs
   */
  async getWaiting(): Promise<Bull.Job[]> {
    return await this.queue.getWaiting();
  }

  /**
   * Gets a list of completed jobs
   */
  async getCompleted(): Promise<Bull.Job[]> {
    return await this.queue.getCompleted();
  }

  /**
   * Gets a list of failed jobs
   */
  async getFailed(): Promise<Bull.Job[]> {
    return await this.queue.getFailed();
  }
}
