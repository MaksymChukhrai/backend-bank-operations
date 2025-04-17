// database/seeders/BankAccountSeeder.ts
import BankAccount from "../../app/Models/BankAccount.js";

const bankAccountsSeeder = {
  async run() {
    await BankAccount.create({
      account_name: "Main Account",
      balance: 0,
    });
  },
};

export default bankAccountsSeeder;
