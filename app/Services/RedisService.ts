// app/Services/RedisService.ts
export default class RedisService {
  // Используем простое хранилище в памяти для демонстрации
  private static storage: Record<string, string> = {};

  /**
   * Получение значения из Redis
   */
  public static async get(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  /**
   * Сохранение значения в Redis
   */
  public static async set(key: string, value: string, ttl?: number): Promise<void> {
    this.storage[key] = value;
    
    // Имитируем TTL, если он указан
    if (ttl) {
      setTimeout(() => {
        delete this.storage[key];
      }, ttl * 1000);
    }
  }

  /**
   * Удаление значения из Redis
   */
  public static async delete(key: string): Promise<void> {
    delete this.storage[key];
  }

  /**
   * Очистка кеша для определенного префикса
   */
  public static async clearByPrefix(prefix: string): Promise<void> {
    const keysToDelete = Object.keys(this.storage).filter(key => key.startsWith(prefix));
    keysToDelete.forEach(key => delete this.storage[key]);
  }
}