import http from 'node:http';
import url from 'node:url';
import TransactionsController from './app/Controllers/Http/TransactionsController.js';

// Create a controller instance
const transactionsController = new TransactionsController();

// Port configuration
const PORT = process.env.PORT || 3333;

// Request routing
async function handleRequest(req: any, res: any) {
  try {
     // Parse the URL
    const parsedUrl = url.parse(req.url || '/', true);
    const path = parsedUrl.pathname || '/';
    const method = req.method || 'GET';
    
    console.log(`${method} ${path}`);
    
    // Routes
    if (path === '/' && method === 'GET') {
      return res.json({
        message: 'Welcome to Bank Transactions API'
      });
    }
    
    // Routes for transactions
    if (path === '/transactions' && method === 'GET') {
      return await transactionsController.index({ 
        request: req, 
        response: res 
      });
    }
    
    // Get a single transaction
    if (path.match(/^\/transactions\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      req.params = { id };
      return await transactionsController.show({ 
        params: req.params, 
        request: req,
        response: res 
      });
    }
    
    // Update a transaction
    if (path.match(/^\/transactions\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      req.params = { id };
      return await transactionsController.update({ 
        params: req.params, 
        request: req, 
        response: res 
      });
    }
    
    // Get all tasks
    if (path === '/jobs' && method === 'GET') {
      return await transactionsController.getJobs({
        request: req,
        response: res
      });
    }
    
    // Get the status of a specific task
    if (path.match(/^\/jobs\/[a-z0-9]+$/) && method === 'GET') {
      const id = path.split('/')[2];
      req.params = { id };
      return await transactionsController.getJobStatus({
        params: req.params,
        request: req,
        response: res
      });
    }
    
    // If the route is not found
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

// Create a server
const server = http.createServer((req, res) => {
  // Extend request and response objects
  const extendedReq = req as any;
  const extendedRes = res as any;
  
  // Add methods for response
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
  
  // Add methods for request
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
  
  // Process the request body for POST and PUT
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

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});