import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Express } from 'express';
import { randomBytes } from 'crypto';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
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
  // Basic security headers with WebSocket support
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"]
      }
    }
  }));

  // Rate limiting
  app.use('/api/', limiter);

  // API key authentication
  app.use('/api/', validateApiKey);

  // Audit logging
  app.use('/api/', auditLog);

  // CORS setup for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
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