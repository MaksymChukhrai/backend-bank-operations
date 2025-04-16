// database/migrations/2_transactions.ts
const transactionsMigration = {
    async up(db: any) {
      await db.schema.createTable('transactions', (table: any) => {
        table.increments('id')
        table.date('date').notNullable()
        table.enum('type', ['income', 'expense']).notNullable()
        table.decimal('price', 12, 2).notNullable()
        table.decimal('balance_after', 12, 2).notNullable()
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
    },
  
    async down(db: any) {
      await db.schema.dropTable('transactions')
    }
  }
  
  export default transactionsMigration