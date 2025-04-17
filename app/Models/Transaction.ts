// app/Models/Transaction.ts
import { DateTime } from 'luxon';
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import BankAccount from './BankAccount.js';

export type TransactionType = 'income' | 'expense';

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column.date()
  declare date: DateTime;

  @column()
  declare type: TransactionType;

  @column()
  declare price: number;

  @column()
  declare balance_after: number;

  @column()
  declare bankAccountId: number;

  @belongsTo(() => BankAccount)
  declare bankAccount: BelongsTo<typeof BankAccount>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}