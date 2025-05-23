// app/Models/BankAccount.ts
import { DateTime } from 'luxon';
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm';
import type { HasMany } from '@adonisjs/lucid/types/relations';
import Transaction from './Transaction.js';

export default class BankAccount extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare account_name: string;

  @column()
  declare balance: number;

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}