import RedisService from './RedisService.js';

// Define the job interface
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
  private concurrency: number = 2; // Number of concurrently executed jobs
  private activeJobs: number = 0;
  private jobQueue: Array<() => Promise<void>> = [];

  constructor() {
    console.log(`QueueService started with concurrency: ${this.concurrency}`);
    this.processQueue();
  }

  // Singleton pattern
  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  // Add a job to the queue
  public async addJob(type: string, data: any): Promise<Job> {
    const job: Job = {
      id: this.generateJobId(),
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save job information
    this.jobs.set(job.id, job);
    
    // Create a handler function for the job
    const jobHandler = async (): Promise<void> => {
      try {
        // Update status
        job.status = 'processing';
        job.updatedAt = new Date();
        
        console.log(`Processing job ${job.id} of type ${job.type}`);
        
        // Execute the corresponding operation depending on job type
        if (job.type === 'recalculateBalances') {
          job.result = await this.processRecalculateBalances(job.data);
        } else {
          throw new Error(`Unknown job type: ${job.type}`);
        }
        
        // Update status after successful completion
        job.status = 'completed';
        job.updatedAt = new Date();
        
        console.log(`Job ${job.id} completed successfully`);
      } catch (error) {
        // Handle errors
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : String(error);
        job.updatedAt = new Date();
        
        console.error(`Job ${job.id} failed:`, error);
      } finally {
        // Decrease the number of active jobs
        this.activeJobs--;
        
        // Start processing the next job in the queue
        this.processQueue();
      }
    };
    
    // Add job to the queue
    this.jobQueue.push(jobHandler);
    
    // Start processing the queue
    this.processQueue();
    
    return job;
  }

  // Process the job queue
  private processQueue(): void {
    // Check if there are jobs in the queue and available execution slots
    while (this.jobQueue.length > 0 && this.activeJobs < this.concurrency) {
      // Retrieve a job from the queue
      const jobHandler = this.jobQueue.shift();
      
      if (jobHandler) {
        // Increase the number of active jobs
        this.activeJobs++;
        
        // Execute the job
        jobHandler().catch(error => {
          console.error('Error executing job:', error);
          this.activeJobs--; // Decrease the number of active jobs in case of error
          this.processQueue(); // Continue processing the queue
        });
      }
    }
  }

  // Get information about a job
  public getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Generate a unique job ID
  private generateJobId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Process a balance recalculation job
  private async processRecalculateBalances(data: { 
    transactionId: number, 
    balanceChange: number 
  }): Promise<{ updatedCount: number }> {
    const { transactionId, balanceChange } = data;
    
    console.log(`Recalculating balances after transaction ${transactionId} with change ${balanceChange}`);
    
    // Simulate a long operation (in a real app, this would interact with a DB)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would query the DB for all transactions
    // after the specified one and recalculate their balances
    const updatedCount = Math.floor(Math.random() * 100); // Simulate the number of updated records
    
    for (let i = 1; i <= 5; i++) {
      const nextTransactionId = transactionId + i;
      
      // Simulate fetching and updating each transaction
      const cachedBalance = await RedisService.get(`transaction:${nextTransactionId}:balance`);
      const newBalance = cachedBalance ? parseFloat(cachedBalance) + balanceChange : balanceChange * i;
      
      // Save the updated balance in Redis
      await RedisService.set(`transaction:${nextTransactionId}:balance`, newBalance.toString());
      
      console.log(`Updated balance for transaction ${nextTransactionId}: ${newBalance}`);
    }
    
    return { updatedCount };
  }
}
