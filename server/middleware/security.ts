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
  // Basic security headers with WebSocket support
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:", "http:", "*"],
        frameSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  }));

  // Rate limiting
  app.use('/api/', limiter);

  // API key authentication
  app.use('/api/', validateApiKey);

  // Audit logging
  app.use('/api/', auditLog);

  // CORS setup for Replit and development
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow Replit domains and local development
    if (origin && (
      origin.endsWith('.repl.co') || 
      origin.endsWith('.replit.dev') || 
      origin === 'http://localhost:5000' ||
      origin === 'http://localhost:3000'
    )) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

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