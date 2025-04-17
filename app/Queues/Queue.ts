// app/Queues/Queue.ts
import Bull from 'bull';
import { EventEmitter } from 'events';

export default class Queue extends EventEmitter {
  private queue: Bull.Queue;
  private name: string;

  constructor(name: string, redisConfig: Bull.QueueOptions = {}) {
    super();
    this.name = name;
    
    // Настройки по умолчанию для Redis
    const defaultConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined
      }
    };
    
    // Создаем очередь с переданными настройками
    this.queue = new Bull(name, { ...defaultConfig, ...redisConfig });
    
    // Обработка событий
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
   * Добавляет задачу в очередь
   */
  async add(data: any, options: Bull.JobOptions = {}): Promise<Bull.Job> {
    return await this.queue.add(data, options);
  }

  /**
   * Устанавливает обработчик задач
   */
  process(handler: (job: Bull.Job) => Promise<any>): void {
    this.queue.process(async (job) => {
      console.log(`Processing job ${job.id} from queue ${this.name}`);
      return await handler(job);
    });
  }

  /**
   * Очищает очередь
   */
  async clear(): Promise<void> {
    await this.queue.empty();
  }

  /**
   * Получает список активных задач
   */
  async getActive(): Promise<Bull.Job[]> {
    return await this.queue.getActive();
  }

  /**
   * Получает список задач в очереди
   */
  async getWaiting(): Promise<Bull.Job[]> {
    return await this.queue.getWaiting();
  }

  /**
   * Получает список завершенных задач
   */
  async getCompleted(): Promise<Bull.Job[]> {
    return await this.queue.getCompleted();
  }

  /**
   * Получает список проваленных задач
   */
  async getFailed(): Promise<Bull.Job[]> {
    return await this.queue.getFailed();
  }
}