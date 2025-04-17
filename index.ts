// index.ts
import http from 'node:http';
import url from 'node:url';
import TransactionsController from './app/Controllers/Http/TransactionsController.js';

// Создаем экземпляр контроллера
const transactionsController = new TransactionsController();

// Настройка порта
const PORT = process.env.PORT || 3333;

// Маршрутизация запросов
async function handleRequest(req: any, res: any) {
  try {
    // Парсим URL
    const parsedUrl = url.parse(req.url || '/', true);
    const path = parsedUrl.pathname || '/';
    const method = req.method || 'GET';
    
    console.log(`${method} ${path}`);
    
    // Маршруты
    if (path === '/' && method === 'GET') {
      return res.json({
        message: 'Welcome to Bank Transactions API'
      });
    }
    
    // Маршруты для транзакций
    if (path === '/transactions' && method === 'GET') {
      return await transactionsController.index({ 
        request: req, 
        response: res 
      });
    }
    
    // Получение одной транзакции
    if (path.match(/^\/transactions\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      req.params = { id };
      return await transactionsController.show({ 
        params: req.params, 
        request: req,
        response: res 
      });
    }
    
    // Обновление транзакции
    if (path.match(/^\/transactions\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      req.params = { id };
      return await transactionsController.update({ 
        params: req.params, 
        request: req, 
        response: res 
      });
    }
    
    // Получение всех задач
    if (path === '/jobs' && method === 'GET') {
      return await transactionsController.getJobs({
        request: req,
        response: res
      });
    }
    
    // Получение статуса конкретной задачи
    if (path.match(/^\/jobs\/[a-z0-9]+$/) && method === 'GET') {
      const id = path.split('/')[2];
      req.params = { id };
      return await transactionsController.getJobStatus({
        params: req.params,
        request: req,
        response: res
      });
    }
    
    // Если маршрут не найден
    return res.status(404).json({ 
      error: 'Not found' 
    });
    
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}

// Создаем сервер
const server = http.createServer((req, res) => {
  // Расширяем объекты запроса и ответа
  const extendedReq = req as any;
  const extendedRes = res as any;
  
  // Добавляем методы для response
  extendedRes.status = function(code: number) {
    this.statusCode = code;
    return {
      json: (data: any) => {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
      }
    };
  };
  
  extendedRes.json = function(data: any) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
  };
  
  extendedRes.ok = function(data: any) {
    return this.status(200).json(data);
  };
  
  extendedRes.notFound = function(data: any) {
    return this.status(404).json(data);
  };
  
  extendedRes.badRequest = function(data: any) {
    return this.status(400).json(data);
  };
  
  // Добавляем методы для request
  extendedReq.input = function(name: string, defaultValue: any = null) {
    // Парсим URL для получения query params
    const parsedUrl = url.parse(this.url || '/', true);
    return parsedUrl.query[name] || defaultValue;
  };
  
  extendedReq.only = function(fields: string[]) {
    const result: Record<string, any> = {};
    for (const field of fields) {
      if (this.body && field in this.body) {
        result[field] = this.body[field];
      }
    }
    return result;
  };
  
  // Обрабатываем тело запроса для POST и PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        extendedReq.body = JSON.parse(body);
        handleRequest(extendedReq, extendedRes);
      } catch (error) {
        extendedRes.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } else {
    handleRequest(extendedReq, extendedRes);
  }
});

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});