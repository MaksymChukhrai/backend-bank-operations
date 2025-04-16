// start/routes.ts
import TransactionsController from '../app/Controllers/Http/TransactionsController'

// Создаем объект для маршрутов
const routes = {
  // Определяем обработчики запросов
  handlers: {
    '/': async (req: any, res: any) => {
      res.json({ hello: 'world' });
    },
    '/transactions': {
      get: async (req: any, res: any) => {
        const controller = new TransactionsController();
        await controller.index({ response: res });
      },
      put: async (req: any, res: any) => {
        if (req.params && req.params.id) {
          const controller = new TransactionsController();
          await controller.update({
            params: { id: req.params.id },
            request: {
              params: req.params,
              only: (fields: string[]) => {
                const result: Record<string, any> = {};
                for (const field of fields) {
                  if (req.body && field in req.body) {
                    result[field] = req.body[field];
                  }
                }
                return result;
              }
            },
            response: res
          });
        } else {
          res.status(400).json({ error: 'Missing id parameter' });
        }
      }
    }
  },

  // Метод для обработки запросов
  handle(req: any, res: any) {
    const { url, method } = req;
    if (!url) return res.status(404).json({ error: 'Not found' });
    
    const urlParts = url.split('/');
    const resourceId = urlParts.length > 2 ? urlParts[2] : null;
    
    if (url === '/') {
      return this.handlers['/'](req, res);
    }
    
    if (url.startsWith('/transactions')) {
      if (resourceId) {
        req.params = { id: resourceId };
        if (method === 'PUT') {
          return this.handlers['/transactions'].put(req, res);
        }
      } else {
        if (method === 'GET') {
          return this.handlers['/transactions'].get(req, res);
        }
      }
    }
    
    res.status(404).json({ error: 'Not found' });
  }
};

export default routes;