// start/routes.ts
import router from '@adonisjs/core/services/router';

// Маршруты для корня
router.get('/', async ({ response }: { response: any }) => {
  return response.json({
    message: 'Welcome to Bank Transactions API'
  });
});

// Группа маршрутов для транзакций
router.group(() => {
  router.get('/', 'TransactionsController.index');
  router.get('/:id', 'TransactionsController.show');
  router.put('/:id', 'TransactionsController.update');
}).prefix('/transactions');

export default router;