import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Configure Vite for development
process.env.VITE_ALLOW_ORIGIN = "*";
process.env.VITE_FORCE_DEV_SERVER = "true";
process.env.VITE_DEV_SERVER_HOSTNAME = "0.0.0.0";
process.env.VITE_HMR_PROTOCOL = "wss";
process.env.VITE_CLIENT_HOSTNAME = "0.0.0.0";
process.env.VITE_WS_HOST = "0.0.0.0";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', true);

// Enhanced CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://moroccan-transport-lhbibbaiga.replit.app',
    'https://moroccan-transport-lhbibbaiga.username.repl.co'
  ];

  const origin = req.headers.origin;

  // In development, allow all origins including Replit dev domains
  if (process.env.NODE_ENV !== 'production') {
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add request logging middleware with more detailed logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture JSON responses for logging
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

      // Add request headers to debug CORS issues
      logLine += ` | Origin: ${req.headers.origin || 'none'}`;
      logLine += ` | Host: ${req.headers.host || 'none'}`;

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
  const PORT = parseInt(process.env.PORT || "3000", 10);

  const startServer = async () => {
    try {
      const server = await registerRoutes(app);

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Error:', err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });

      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }

      server.listen(PORT, "0.0.0.0", () => {
        log(`Server running on port ${PORT}`);
        log(`Application available at http://0.0.0.0:${PORT}`);
        log(`API Documentation available at http://0.0.0.0:${PORT}/api-docs`);
      });

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