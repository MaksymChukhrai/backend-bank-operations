// database/seeders/TransactionSeeder.ts
import { DateTime } from "luxon";
import Transaction, { TransactionType } from "../../app/Models/Transaction";
import BankAccount from "../../app/Models/BankAccount";

class TransactionSeeder {
  public async run() {
    // Получаем основной счет
    const account = await BankAccount.first();
    if (!account) {
      throw new Error("Bank account not found");
    }

    // Генерируем 10,000 транзакций
    let currentBalance = 0;
    const transactions = [];

    for (let i = 0; i < 10000; i++) {
      // Генерируем случайную дату за последние 365 дней
      const daysAgo = Math.floor(Math.random() * 365);
      const date = DateTime.now().minus({ days: daysAgo });

      // Определяем тип транзакции (явно указываем TransactionType)
      const type: TransactionType = Math.random() > 0.5 ? "income" : "expense";

      // Генерируем случайную сумму от 10 до 1000
      const price = parseFloat((Math.random() * 990 + 10).toFixed(2));

      // Обновляем баланс в зависимости от типа транзакции
      if (type === "income") {
        currentBalance += price;
      } else {
        currentBalance -= price;
      }

      transactions.push({
        date,
        type,
        price,
        balance_after: parseFloat(currentBalance.toFixed(2)),
      });
    }

    // Сортируем транзакции по дате
    transactions.sort((a, b) => {
      return a.date.toMillis() - b.date.toMillis();
    });

    // Пересчитываем balance_after с учетом сортировки
    currentBalance = 0;
    for (const transaction of transactions) {
      if (transaction.type === "income") {
        currentBalance += transaction.price;
      } else {
        currentBalance -= transaction.price;
      }
      transaction.balance_after = parseFloat(currentBalance.toFixed(2));
    }

    // Добавляем транзакции в БД по частям
    const chunkSize = 500;
    for (let i = 0; i < transactions.length; i += chunkSize) {
      const chunk = transactions.slice(i, i + chunkSize);
      // Явно приводим тип к Partial<Transaction>[]
      await Transaction.createMany(chunk as Partial<Transaction>[]);
    }

    // Обновляем баланс аккаунта
    account.balance = currentBalance;
    await account.save();
  }
}

export default TransactionSeeder;
