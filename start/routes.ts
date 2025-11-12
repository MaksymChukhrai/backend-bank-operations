import router from '@adonisjs/core/services/router';

// Root routes
router.get('/', async ({ response }: { response: any }) => {
  return response.json({
    message: 'Welcome to Bank Transactions API'
  });
});

// Transaction routes group
router.group(() => {
  router.get('/', 'TransactionsController.index');
  router.get('/:id', 'TransactionsController.show');
  router.put('/:id', 'TransactionsController.update');
}).prefix('/transactions');

export default router;
