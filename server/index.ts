import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set trust proxy for rate limiter to work behind reverse proxies
app.set('trust proxy', true);

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  let retries = 0;
  const maxRetries = 3;
  const PORT = process.env.PORT || 3000;

  const startServer = async () => {
    try {
      const server = registerRoutes(app);

      // Global error handler
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Error:', err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });

      // Setup static file serving and development middleware
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }

      server.listen(PORT, '0.0.0.0', () => {
        log(`Server running on port ${PORT}`);
        log(`Application available at http://0.0.0.0:${PORT}`);
        log(`API Documentation available at http://0.0.0.0:${PORT}/api-docs`);
      });

      // Handle server errors
      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use`);
          if (retries < maxRetries) {
            retries++;
            console.log(`Retrying with different port... (Attempt ${retries}/${maxRetries})`);
            setTimeout(startServer, 1000);
          } else {
            console.error('Max retries reached. Unable to start server.');
            process.exit(1);
          }
        } else {
          console.error('Server error:', error);
          process.exit(1);
        }
      });

    } catch (error) {
      console.error('Server startup error:', error);
      process.exit(1);
    }
  };

  await startServer();
})();