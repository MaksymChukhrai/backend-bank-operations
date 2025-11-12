export default class RedisService {
  // Use a simple in-memory storage for demonstration purposes
  private static storage: Record<string, string> = {};

  /**
   * Get a value from Redis
   */
  public static async get(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  /**
   * Save a value in Redis
   */
  public static async set(key: string, value: string, ttl?: number): Promise<void> {
    this.storage[key] = value;
    
    // Simulate TTL if provided
    if (ttl) {
      setTimeout(() => {
        delete this.storage[key];
      }, ttl * 1000);
    }
  }

  /**
   * Delete a value from Redis
   */
  public static async delete(key: string): Promise<void> {
    delete this.storage[key];
  }

  /**
   * Clear cache for a specific prefix
   */
  public static async clearByPrefix(prefix: string): Promise<void> {
    const keysToDelete = Object.keys(this.storage).filter(key => key.startsWith(prefix));
    keysToDelete.forEach(key => delete this.storage[key]);
  }
}
