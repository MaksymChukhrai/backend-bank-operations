import Queue from './Queue.js';
import { DateTime } from 'luxon';

export default class TransactionQueue extends Queue {
  private static instance: TransactionQueue;

  private constructor() {
    super('transactions');
    
    // Set up the job handler
    this.process(async (job) => {
      const { transactionId, balanceChange, timestamp } = job.data;
      
      console.log(`Recalculating balances after transaction ${transactionId} with change ${balanceChange}`);
      
      // Logic for recalculating balances will go here
      const result = await this.recalculateBalances(transactionId, balanceChange);
      
      // Return the result for "log completed"
      return {
        processed: true,
        transactionId,
        executionTime: DateTime.now().diff(DateTime.fromISO(timestamp)).milliseconds,
        affectedTransactions: result.count
      };
    });
  }

  /**
   * Get the queue instance (Singleton pattern)
   */
  public static getInstance(): TransactionQueue {
    if (!TransactionQueue.instance) {
      TransactionQueue.instance = new TransactionQueue();
    }
    return TransactionQueue.instance;
  }

  /**
   * Adds a job to recalculate balance
   */
  async addRecalculationJob(transactionId: number, balanceChange: number): Promise<void> {
    await this.add({
      transactionId,
      balanceChange,
      timestamp: DateTime.now().toISO()
    }, {
      attempts: 3,  // Number of attempts in case of failure
      backoff: {    // Retry strategy
        type: 'exponential',
        delay: 1000  // Initial delay of 1 second
      },
      removeOnComplete: 100,  // Keep only the last 100 completed jobs
      removeOnFail: 100       // Keep only the last 100 failed jobs
    });
  }

  /**
   * Method for recalculating balances
   * In a real application, this would contain database logic
   */
  private async recalculateBalances(transactionId: number, balanceChange: number): Promise<{ count: number }> {
    // Simulate a long-running operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Balances recalculated for transactions after ID ${transactionId}`);
    
    // In a real application, this would update balances in the DB
    return { count: Math.floor(Math.random() * 100) + 1 };  // Simulate the number of updated records
  }
}
