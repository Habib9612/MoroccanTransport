import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Express } from 'express';
import { randomBytes } from 'crypto';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  validate: false
});

// API key middleware
const apiKeys = new Map<string, string>(); // In production, use a database

export function generateApiKey(userId: string): string {
  const apiKey = randomBytes(32).toString('hex');
  apiKeys.set(apiKey, userId);
  return apiKey;
}

export function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.header('X-API-Key');
  if (!apiKey) {
    return next(); // Allow requests without API key to use session auth
  }

  const userId = apiKeys.get(apiKey);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKeyUserId = userId;
  next();
}

// Audit logging middleware
export function auditLog(req: any, res: any, next: any) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      user: req.user?.id || 'anonymous',
      apiKey: req.apiKeyUserId || null
    });
  });
  next();
}

export function setupSecurity(app: Express) {
  // Configure security headers for development
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false
  }));

  // Rate limiting
  app.use('/api/', limiter);

  // API key authentication
  app.use('/api/', validateApiKey);

  // Audit logging
  app.use('/api/', auditLog);

  // CORS configuration with support for CRA development server
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (process.env.NODE_ENV === 'development') {
      // In development, allow CRA development server
      res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      // In production, check against allowed origins
      const allowedOrigins = [
        /\.repl\.co$/,
        /\.replit\.dev$/,
        // Add your production domains here
      ];

      if (origin && allowedOrigins.some(pattern => pattern.test(origin))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Generate API key endpoint
  app.post('/api/generate-api-key', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Not authenticated');
    }

    const apiKey = generateApiKey(req.user!.id.toString());
    res.json({ apiKey });
  });
}