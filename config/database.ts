// config/database.ts
const databaseConfig = {
    connection: process.env.DB_CONNECTION || 'pg',
  
    connections: {
      pg: {
        client: 'pg',
        connection: {
          host: process.env.PG_HOST || 'localhost',
          port: Number(process.env.PG_PORT) || 5432,
          user: process.env.PG_USER || 'postgres',
          password: process.env.PG_PASSWORD || '',
          database: process.env.PG_DB_NAME || 'adonis_bank',
        },
        migrations: {
          naturalSort: true,
          paths: ['./database/migrations']
        },
        seeders: {
          paths: ['./database/seeders']
        }
      }
    }
  }
  
  export default databaseConfig