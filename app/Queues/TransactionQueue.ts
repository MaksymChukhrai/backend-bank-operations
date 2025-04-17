// app/Queues/TransactionQueue.ts
import Queue from './Queue.js';
import { DateTime } from 'luxon';

export default class TransactionQueue extends Queue {
  private static instance: TransactionQueue;

  private constructor() {
    super('transactions');
    
    // Настраиваем обработчик задач
    this.process(async (job) => {
      const { transactionId, balanceChange, timestamp } = job.data;
      
      console.log(`Recalculating balances after transaction ${transactionId} with change ${balanceChange}`);
      
      // Здесь будет логика пересчета балансов
      const result = await this.recalculateBalances(transactionId, balanceChange);
      
      // Возвращаем результат для log completed
      return {
        processed: true,
        transactionId,
        executionTime: DateTime.now().diff(DateTime.fromISO(timestamp)).milliseconds,
        affectedTransactions: result.count
      };
    });
  }

  /**
   * Получение экземпляра очереди (Singleton pattern)
   */
  public static getInstance(): TransactionQueue {
    if (!TransactionQueue.instance) {
      TransactionQueue.instance = new TransactionQueue();
    }
    return TransactionQueue.instance;
  }

  /**
   * Добавляет задачу на пересчет баланса
   */
  async addRecalculationJob(transactionId: number, balanceChange: number): Promise<void> {
    await this.add({
      transactionId,
      balanceChange,
      timestamp: DateTime.now().toISO()
    }, {
      attempts: 3,  // Количество попыток выполнения в случае ошибки
      backoff: {    // Стратегия повторных попыток
        type: 'exponential',
        delay: 1000  // Начальная задержка 1 секунда
      },
      removeOnComplete: 100,  // Хранить только 100 последних завершенных задач
      removeOnFail: 100       // Хранить только 100 последних проваленных задач
    });
  }

  /**
   * Метод для пересчета балансов
   * В реальном приложении здесь будет логика работы с базой данных
   */
  private async recalculateBalances(transactionId: number, balanceChange: number): Promise<{ count: number }> {
    // Имитация выполнения длительной операции
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Balances recalculated for transactions after ID ${transactionId}`);
    
    // В реальном приложении здесь будет код для обновления балансов в БД
    return { count: Math.floor(Math.random() * 100) + 1 };  // Имитация количества обновленных записей
  }
}