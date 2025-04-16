// index.ts
import http from 'http'
import routes from './start/routes'

// Настройка порта
const PORT = process.env.PORT || 3333

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
  
  // Обрабатываем тело запроса для POST и PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        extendedReq.body = JSON.parse(body);
        routes.handle(extendedReq, extendedRes);
      } catch (error) {
        extendedRes.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } else {
    routes.handle(extendedReq, extendedRes);
  }
});

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});