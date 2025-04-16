// config/redis.ts
const redisConfig = {
  connection: process.env.REDIS_CONNECTION || "local",

  connections: {
    local: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || null,
      db: 0,
    },
  },
};

export default redisConfig;
