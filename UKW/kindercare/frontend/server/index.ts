import express, { Request, Response, NextFunction } from 'express';
import { setupVite } from './vite';
import { registerRoutes } from './routes';

async function createServer() {
  const app = express();
  const port = process.env.PORT || 5001;
  
  // Add middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // API routes
  const server = await registerRoutes(app);
  
  // API info route
  app.get('/api', (req: Request, res: Response) => {
    res.send(`
      <h1>KinderCare API</h1>
      <p>Welcome to the KinderCare API. This is a RESTful API for the KinderCare application.</p>
      <h2>Available Endpoints</h2>
      <ul>
        <li><code>POST /api/login</code> - Doctor login</li>
        <li><code>POST /api/patient-login</code> - Patient login</li>
      </ul>
    `);
  });
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    res.status(status).json({ message });
    throw err;
  });
  
  // For development mode, setup Vite middleware
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  }
  
  // Start the server
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  return app;
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
});
