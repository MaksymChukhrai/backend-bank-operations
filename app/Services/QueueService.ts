// app/Services/QueueService.ts
import AsyncQueue from 'async-queue';
import RedisService from './RedisService.js';

// Объявляем интерфейс для задачи
export interface Job {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}

export default class QueueService {
  private static instance: QueueService;
  private jobs: Map<string, Job> = new Map();
  private concurrency: number = 2; // Количество одновременно выполняемых задач
  private activeJobs: number = 0;
  private jobQueue: Array<() => Promise<void>> = [];

  constructor() {
    console.log(`QueueService started with concurrency: ${this.concurrency}`);
    this.processQueue();
  }

  // Singleton паттерн
  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  // Добавление задачи в очередь
  public async addJob(type: string, data: any): Promise<Job> {
    const job: Job = {
      id: this.generateJobId(),
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Сохраняем информацию о задаче
    this.jobs.set(job.id, job);
    
    // Создаем функцию-обработчик для задачи
    const jobHandler = async (): Promise<void> => {
      try {
        // Обновляем статус
        job.status = 'processing';
        job.updatedAt = new Date();
        
        console.log(`Processing job ${job.id} of type ${job.type}`);
        
        // Выполняем соответствующую операцию в зависимости от типа задачи
        if (job.type === 'recalculateBalances') {
          job.result = await this.processRecalculateBalances(job.data);
        } else {
          throw new Error(`Unknown job type: ${job.type}`);
        }
        
        // Обновляем статус после успешного выполнения
        job.status = 'completed';
        job.updatedAt = new Date();
        
        console.log(`Job ${job.id} completed successfully`);
      } catch (error) {
        // Обрабатываем ошибку
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : String(error);
        job.updatedAt = new Date();
        
        console.error(`Job ${job.id} failed:`, error);
      } finally {
        // Уменьшаем счетчик активных задач
        this.activeJobs--;
        
        // Запускаем обработку очереди
        this.processQueue();
      }
    };
    
    // Добавляем задачу в очередь
    this.jobQueue.push(jobHandler);
    
    // Запускаем обработку очереди
    this.processQueue();
    
    return job;
  }

  // Обработка очереди задач
  private processQueue(): void {
    // Проверяем, есть ли задачи в очереди и есть ли свободные слоты для выполнения
    while (this.jobQueue.length > 0 && this.activeJobs < this.concurrency) {
      // Извлекаем задачу из очереди
      const jobHandler = this.jobQueue.shift();
      
      if (jobHandler) {
        // Увеличиваем счетчик активных задач
        this.activeJobs++;
        
        // Запускаем задачу
        jobHandler().catch(error => {
          console.error('Error executing job:', error);
          this.activeJobs--; // Уменьшаем счетчик активных задач в случае ошибки
          this.processQueue(); // Запускаем обработку очереди
        });
      }
    }
  }

  // Получение информации о задаче
  public getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  // Получение всех задач
  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Генерация уникального ID для задачи
  private generateJobId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Обработка задачи пересчета балансов
  private async processRecalculateBalances(data: { 
    transactionId: number, 
    balanceChange: number 
  }): Promise<{ updatedCount: number }> {
    const { transactionId, balanceChange } = data;
    
    console.log(`Recalculating balances after transaction ${transactionId} with change ${balanceChange}`);
    
    // Имитация долгой операции (в реальном приложении здесь был бы код для работы с БД)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // В реальном приложении здесь бы выполнялся запрос к БД для получения всех транзакций
    // после указанной и пересчета их балансов
    const updatedCount = Math.floor(Math.random() * 100); // Имитация количества обновленных записей
    
    for (let i = 1; i <= 5; i++) {
      const nextTransactionId = transactionId + i;
      
      // Имитация получения и обновления данных каждой транзакции
      const cachedBalance = await RedisService.get(`transaction:${nextTransactionId}:balance`);
      const newBalance = cachedBalance ? parseFloat(cachedBalance) + balanceChange : balanceChange * i;
      
      // Сохранение обновленного баланса в Redis
      await RedisService.set(`transaction:${nextTransactionId}:balance`, newBalance.toString());
      
      console.log(`Updated balance for transaction ${nextTransactionId}: ${newBalance}`);
    }
    
    return { updatedCount };
  }
}