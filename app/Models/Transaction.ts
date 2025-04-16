// app/Models/Transaction.ts
import { DateTime } from 'luxon'

export type TransactionType = 'income' | 'expense'

export default class Transaction {
  id: number = 0
  date: DateTime = DateTime.now()
  type: TransactionType = 'income'
  price: number = 0
  balance_after: number = 0
  createdAt: DateTime = DateTime.now()
  updatedAt: DateTime = DateTime.now()

  constructor(data: Partial<Transaction> = {}) {
    Object.assign(this, data)
  }

  static async find(id: number): Promise<Transaction | null> {
    return null // Заглушка
  }

  static async createMany(data: Partial<Transaction>[]): Promise<Transaction[]> {
    return data.map(item => new Transaction(item)) // Заглушка
  }

  static query() {
    return {
      where: () => ({
        orderBy: () => ({
          limit: () => [],
          first: () => null
        })
      }),
      orderBy: () => ({
        limit: () => []
      })
    }
  }

  async save(): Promise<Transaction> {
    return this // Заглушка
  }
}