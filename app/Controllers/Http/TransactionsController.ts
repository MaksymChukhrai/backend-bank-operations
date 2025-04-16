// app/Controllers/Http/TransactionsController.ts
import Transaction from "../../Models/Transaction";
import { DateTime } from "luxon";

// Создаем тип для запроса
interface HttpRequest {
  params: {
    id: string;
  };
  only(fields: string[]): any;
}

// Создаем тип для ответа
interface HttpResponse {
  status(code: number): {
    json(data: any): void;
  };
  json(data: any): void;
}

export default class TransactionsController {
  // Создаем хранилище для кеширования
  private static cache: Record<string, string> = {};

  /**
   * Получение списка транзакций
   */
  public async index({ response }: { response: HttpResponse }) {
    // Поскольку у нас есть заглушки, имитируем запрос к БД
    // В реальном приложении здесь был бы настоящий запрос к БД через Adonis Lucid
    const transactions = [];

    // Создаем несколько тестовых транзакций
    for (let i = 1; i <= 10; i++) {
      transactions.push(
        new Transaction({
          id: i,
          date: DateTime.now(), // Используем DateTime из Luxon
          type: i % 2 === 0 ? "income" : "expense",
          price: 100 * i,
          balance_after: i * 100,
        })
      );
    }

    return response.json(transactions);
  }

  /**
   * Обновление транзакции
   */
  public async update({
    params,
    request,
    response,
  }: {
    params: { id: string };
    request: HttpRequest;
    response: HttpResponse;
  }) {
    const id = parseInt(params.id);

    // В реальном приложении мы бы запросили транзакцию из БД
    // Сейчас создаем имитацию
    const transaction = new Transaction({
      id,
      date: DateTime.now(), // Используем DateTime из Luxon
      type: "income",
      price: 1000,
      balance_after: 1000,
    });

    if (!transaction) {
      return response.status(404).json({
        message: "Transaction not found",
      });
    }

    const { price } = request.only(["price"]);
    const newPrice = parseFloat(price);
    const oldPrice = transaction.price;
    const priceDifference = newPrice - oldPrice;

    // Обновляем текущую транзакцию
    transaction.price = newPrice;

    // Изменение баланса зависит от типа транзакции
    const balanceChange =
      transaction.type === "income" ? priceDifference : -priceDifference;

    // Имитируем получение предыдущей транзакции
    const previousTransaction = new Transaction({
      id: id - 1,
      date: DateTime.now().minus({ days: 1 }),
      type: "income",
      price: 500,
      balance_after: 500,
    });

    const previousBalance = previousTransaction
      ? previousTransaction.balance_after
      : 0;
    transaction.balance_after =
      previousBalance + (transaction.type === "income" ? newPrice : -newPrice);

    // Вместо Redis используем простое кеширование в памяти
    TransactionsController.cache[`transaction:${transaction.id}:balance`] =
      transaction.balance_after.toString();

    // Имитируем последующие транзакции
    const subsequentTransactions = [];
    for (let i = id + 1; i <= id + 3; i++) {
      subsequentTransactions.push(
        new Transaction({
          id: i,
          date: DateTime.now().plus({ days: i - id }),
          type: i % 2 === 0 ? "income" : "expense",
          price: 100,
          balance_after: 100 * i,
        })
      );
    }

    // Обновляем все последующие транзакции
    let currentBalance = transaction.balance_after;

    for (const nextTransaction of subsequentTransactions) {
      // Проверяем кеш
      const cachedBalance =
        TransactionsController.cache[
          `transaction:${nextTransaction.id}:balance`
        ];

      if (cachedBalance) {
        // Если есть кешированный баланс, используем его и добавляем изменение
        currentBalance = parseFloat(cachedBalance) + balanceChange;
      } else {
        // Иначе вычисляем заново
        currentBalance =
          currentBalance +
          (nextTransaction.type === "income"
            ? nextTransaction.price
            : -nextTransaction.price);
      }

      nextTransaction.balance_after = currentBalance;

      // Обновляем кеш
      TransactionsController.cache[
        `transaction:${nextTransaction.id}:balance`
      ] = currentBalance.toString();
    }

    return response.json({
      message: "Transaction updated successfully",
      transaction,
    });
  }
}
