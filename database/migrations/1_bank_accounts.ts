// database/migrations/1_bank_accounts.ts
const bankAccountsMigration = {
  async up(db: any) {
    await db.schema.createTable("bank_accounts", (table: any) => {
      table.increments("id");
      table.string("account_name").notNullable();
      table.decimal("balance", 12, 2).notNullable().defaultTo(0);
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  },

  async down(db: any) {
    await db.schema.dropTable("bank_accounts");
  },
};

export default bankAccountsMigration;
