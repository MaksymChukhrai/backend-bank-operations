import RedisService from '../../Services/RedisService.js';
import QueueService from '../../Services/QueueService.js';

// Define our own types
interface HttpRequest {
  input(name: string, defaultValue?: any): any;
  only(fields: string[]): any;
  params?: any;
  body?: any;
}

interface HttpResponse {
  ok(data: any): any;
  notFound(data: any): any;
  badRequest(data: any): any;
  json(data: any): any;
  status(code: number): { json(data: any): any };
}

interface ControllerContext {
  request: HttpRequest;
  response: HttpResponse;
  params?: any;
}

export default class TransactionsController {
  /**
    * Get a list of transactions with pagination
   */
  public async index({ request, response }: ControllerContext) {
    const page = request.input('page', 1);
    const limit = request.input('limit', 20);
    
      // Create test data for demonstration purposes
    const transactions = [];
    for (let i = 1; i <= 10; i++) {
      transactions.push({
        id: i,
        date: new Date().toISOString(),
        type: i % 2 === 0 ? 'income' : 'expense',
        price: i * 100,
        balance_after: i * 100
      });
    }
    
    return response.ok({
      data: transactions,
      meta: {
        total: 10,
        per_page: limit,
        current_page: page,
        last_page: 1
      }
    });
  }

  /**
  * Get a single transaction by ID
   */
  public async show({ params, response }: ControllerContext) {
    const id = parseInt(params.id);
    
    // Create a test transaction for demonstration purposes
    if (id > 0 && id <= 10) {
      const transaction = {
        id,
        date: new Date().toISOString(),
        type: id % 2 === 0 ? 'income' : 'expense',
        price: id * 100,
        balance_after: id * 100
      };
      
      return response.ok(transaction);
    }
    
    return response.notFound({ message: 'Transaction not found' });
  }

  /**
    * Get the status of all tasks
   */
  public async getJobs({ response }: ControllerContext) {
    const queueService = QueueService.getInstance();
    const jobs = queueService.getAllJobs();
    
    return response.ok({ jobs });
  }

  /**
    * Get the status of a specific task
   */
  public async getJobStatus({ params, response }: ControllerContext) {
    const jobId = params.id;
    const queueService = QueueService.getInstance();
    const job = queueService.getJob(jobId);
    
    if (!job) {
      return response.notFound({ message: 'Job not found' });
    }
    
    return response.ok({ job });
  }

  /**
    * Update a transaction
   */
  public async update({ params, request, response }: ControllerContext) {
    const id = parseInt(params.id);
    
       // Simple validation of incoming data
    const data = request.only(['price']);
    const newPrice = parseFloat(data.price);
    
    if (isNaN(newPrice) || newPrice <= 0) {
      return response.badRequest({ 
        message: 'Price must be a positive number' 
      });
    }
    
    // Create a test transaction for demonstration purposes
    if (id > 0 && id <= 10) {
      try {
       // Simulate transaction update
        const oldPrice = id * 100;  // Simulating the current price
        const priceDifference = newPrice - oldPrice;
        const balanceChange = id % 2 === 0 ? priceDifference : -priceDifference;
        
        // Updating the current transaction
        const transaction = {
          id,
          date: new Date().toISOString(),
          type: id % 2 === 0 ? 'income' : 'expense',
          price: newPrice,
          balance_after: id % 2 === 0 ? id * 100 + priceDifference : id * 100 - priceDifference
        };
        
        // Saving to Redis
        await RedisService.set(`transaction:${id}:balance`, transaction.balance_after.toString());
        
        // Creating a task to recalculate subsequent transactions in the background
        const queueService = QueueService.getInstance();
        const job = await queueService.addJob('recalculateBalances', {
          transactionId: id,
          balanceChange
        });
        
        return response.ok({
          message: 'Transaction updated successfully',
          transaction,
          jobId: job.id  
        });
      } catch (error) {
        console.error('Error updating transaction:', error);
        return response.status(500).json({ 
          error: 'Error updating transaction' 
        });
      }
    }
    
    return response.notFound({ message: 'Transaction not found' });
  }
}