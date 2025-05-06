# Banking Transactions API

🇺🇦 [Read in Ukrainian](README.uk.md)

API for working with banking transactions, created as this assignment. The system allows storing transactions, updating them, automatically recalculating account balances, and optimizing the processing of large volumes of operations using caching and a task queue system.

## Functionality

- Storing and managing banking transactions
- Automatic balance recalculation when transactions change
- Caching for performance optimization

## Tech Stack

- Node.js / TypeScript
- PostgreSQL (data model)
- Redis (for caching)
- Queue System for background data processing

## Project Improvements

### Performance Optimization

- The system limits the number of simultaneously executed tasks to prevent server overload
- Implemented caching to reduce database load
- Used asynchronous processing for long-running operations

### Security

- Implemented input data validation to prevent errors and attacks
- Added error handling with appropriate HTTP statuses
- Used typing to ensure code stability

### Scalability

- The project architecture allows for easy scaling of additional features
- The task queue system is designed to handle large volumes of data
- Redis can be used to distribute load between multiple servers

## Project Structure

```
adonis-project/
├── app/                           # Main application code
│   ├── Controllers/               # Controllers for request handling
│   │   └── Http/                  # HTTP controllers
│   │       └── TransactionsController.ts # Transactions controller
│   ├── Models/                    # Data models
│   │   ├── BankAccount.ts         # Bank account model
│   │   └── Transaction.ts         # Transaction model
│   └── Services/                  # Services
│       ├── QueueService.ts        # Service for task queue management
│       └── RedisService.ts        # Service for Redis operations
├── config/                        # Конфігураційні файли
│   └── database.ts                # Configuration files
├── database/                      # Database settings
│   ├── migrations/                # Database files
│   │   ├── 1_bank_accounts.ts     # Migration for bank_accounts table
│   │   └── 2_transactions.ts      # Migration for transactions table
│   └── seeders/                   # Database seeders
│       ├── BankAccountSeeder.ts   # Seeder for creating bank accounts
│       └── TransactionSeeder.ts   # Seeder for creating transactions
├── start/                         # Application startup files
│   └── routes.ts                  # Route configuration
├── .env                           # Environment variables
├── .gitignore                     # Git ignore file
├── index.ts                       # Main application file
├── package.json                   # Project dependencies
├── README.md                      # Project documentation (English version)
├── README.uk.md                   # Project documentation (Ukrainian version)
└── tsconfig.json                  # TypeScript configuration
```

## Key Features

- CRUD operations for transactions
- Automatic balance recalculation when transactions change
- Caching intermediate results in Redis
- Background balance recalculation through a task queue system

## API Endpoints

- `GET /transactions` — get list of transactions
- `GET /transactions/:id` — get specific transaction (e.g., GET /transactions/1)
- `PUT /transactions/:id` — update transaction by ID

## Caching with Redis (simulated)

* When updating a transaction, we store the balance in cache
* We use cache to optimize balance recalculations

## Task Queue System

* Background processing of balance recalculations
* Limits on the number of simultaneously executed tasks
* API for getting task status:
     - GET /jobs — get a list of all tasks
     - GET /jobs/:id — get the status of a specific task (e.g., GET /jobs/m9lem3u8xn3jk)

## Project Structure Based on MVC Pattern

- Models (simplified)
- Controllers for handling HTTP requests
- Services for separating business logic

## Installation and Launch

1. Clone this repository: `git clone https://github.com/MaksymChukhrai/backend-test-task.git`
2. Configure the environment:
   Create an `.env` file and specify the necessary data for connecting to PostgreSQL and Redis:

       ```
       PORT=3333
       HOST=0.0.0.0
       NODE_ENV=development
       DB_CONNECTION=pg
       PG_HOST=localhost
       PG_PORT=5432
       PG_USER=postgres
       PG_PASSWORD=postgres
       PG_DB_NAME=adonis_bank
       REDIS_CONNECTION=local
       REDIS_HOST=127.0.0.1
       REDIS_PORT=6379
       REDIS_PASSWORD=null
       ```

3. Install dependencies: `npm install`
4. Run migrations and data seeding:

   `npm run migrate`

   `npm run seed`


5. Start the server: `npm run dev`
6. The server will be available at: `http://localhost:3333`

## Functionality Testing

To test the API and queue system, execute the following commands in a separate terminal console:

**1. Getting the home page:**

`curl http://localhost:3333`  

*Expected result: {"message":"Welcome to Bank Transactions API"}*

**2. Getting a list of all transactions:**

`curl http://localhost:3333/transactions`

*Expected result: a list of 10 test transactions*

**3. Getting a single transaction:**

`curl http://localhost:3333/transactions/1`

*Expected result: data about the transaction with id=1*

**4. Updating a transaction:**

`curl -X PUT -H "Content-Type: application/json" -d '{"price":1500}' http://localhost:3333/transactions/1`

*Expected result: a list of all tasks in the system*

**6. Checking the status of a specific task:**

`curl http://localhost:3333/jobs/JOBID` where `JOBID` is replaced with the task identifier from the previous operation.

*Expected result: the task status should change to "completed" and contain the calculation result*

**7. Checking background calculation completion:**

During testing, observe the information output in the server console. You should see messages about:

    7.1. Task processing start

    7.2. Balance recalculation for the next 5 transactions

    7.3. Redis balance updates

    7.4. Successful task completion

This background processing demonstrates how the system can efficiently handle large volumes of transactions without blocking the main execution flow.

### Implementation of Assignment Requirements

1. ✅ Created migrations for transactions and bank_accounts tables
2. ✅ Written a seed to generate 10,000 records in the transactions table
3. ✅ Implemented logic for balance recalculation when updating transactions
4. ✅ Connected Redis for caching intermediate results
5. ✅ Added a queue system for background processing with a large number of transactions

### Potential Improvements

In a full-scale project, the following could be added:

- Full integration with PostgreSQL through Lucid ORM
- Full integration with Redis for caching
- Improved authentication and authorization system
- Unit and integration tests
- API documentation (Swagger/OpenAPI)
- Containerization (Docker) for simplified deployment

**Author: [Maksym Chukhrai](https://www.mchukhrai.com/)**