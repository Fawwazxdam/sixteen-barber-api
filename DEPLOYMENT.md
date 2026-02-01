# Deployment Guide

This guide covers deploying the Sixteen Barber API with HTTPS and proper security configurations.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database with SSL support
- Domain name for the API (e.g., `api.yourdomain.com`)
- SSL certificate (Let's Encrypt recommended)
- Frontend application deployed with HTTPS

## Environment Variables

Create a `.env.production` file with the following variables:

```env
NODE_ENV=production
APP_PORT=4001
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
JWT_SECRET=your-very-strong-secret-key-min-32-characters-long
FRONTEND_URL=https://your-frontend-domain.com
```

### Important Notes:

1. **NODE_ENV=production** - This is critical for proper cookie configuration
2. **DATABASE_URL** - Must include `sslmode=require` for secure database connections
3. **JWT_SECRET** - Use a strong, random string (minimum 32 characters)
4. **FRONTEND_URL** - Must be the exact HTTPS URL of your frontend

## Cookie Configuration

The API automatically configures cookies based on `NODE_ENV`:

### Production Settings (NODE_ENV=production)
```typescript
{
  httpOnly: true,
  sameSite: "none",      // Allows cross-site requests
  secure: true,          // Requires HTTPS
  partitioned: true,     // CHIPS compliance
  path: "/"
}
```

### Development Settings (NODE_ENV=development)
```typescript
{
  httpOnly: true,
  sameSite: "lax",       // Same-site only
  secure: false,         // Works with HTTP
  partitioned: false,    // No partitioning
  path: "/"
}
```

## CORS Configuration

The API accepts requests from origins defined in `FRONTEND_URL`. Multiple origins can be separated by commas:

```env
FRONTEND_URL=https://app1.example.com,https://app2.example.com
```

## Deployment Options

### Option 1: PM2 (Recommended for Node.js)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Build the application:
```bash
npm run build
```

3. Start with PM2:
```bash
pm2 start dist/main.js --name sixteen-barber-api
```

4. Configure PM2 to start on boot:
```bash
pm2 startup
pm2 save
```

### Option 2: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4001

CMD ["node", "dist/main.js"]
```

Build and run:
```bash
docker build -t sixteen-barber-api .
docker run -p 4001:4001 --env-file .env.production sixteen-barber-api
```

### Option 3: Nginx Reverse Proxy

Configure Nginx as a reverse proxy with SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL Certificate Setup

### Using Let's Encrypt with Certbot

1. Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

3. Auto-renewal is configured automatically

## Security Checklist

Before going live, ensure:

- [ ] `NODE_ENV=production` is set
- [ ] Strong `JWT_SECRET` is configured
- [ ] Database uses SSL (`sslmode=require`)
- [ ] Frontend URL is correctly set in `FRONTEND_URL`
- [ ] SSL certificate is valid and auto-renewing
- [ ] Firewall allows only necessary ports (443, 80 for ACME)
- [ ] Database firewall allows only API server IP
- [ ] Swagger docs are disabled in production (optional)
- [ ] Rate limiting is configured (optional)
- [ ] Logging is properly set up (optional)

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `FRONTEND_URL` includes the exact frontend domain
2. Ensure both frontend and backend use HTTPS
3. Verify `NODE_ENV=production` is set
4. Clear browser cache and cookies

### Cookie Errors

If cookies are rejected:
1. Verify `NODE_ENV=production` is set
2. Ensure both frontend and backend use HTTPS
3. Check that `secure: true` is set in production
4. Verify `partitioned: true` is set for CHIPS compliance
5. Clear browser cookies and try again

### Database Connection Errors

If database connection fails:
1. Verify `DATABASE_URL` includes `sslmode=require`
2. Check database firewall allows API server IP
3. Ensure PostgreSQL SSL is enabled
4. Test connection with `psql` command

## Monitoring

Consider setting up:
- Application monitoring (PM2 Plus, New Relic, etc.)
- Error tracking (Sentry, Rollbar, etc.)
- Log aggregation (ELK stack, CloudWatch, etc.)
- Uptime monitoring (UptimeRobot, Pingdom, etc.)

## Backup Strategy

Implement regular backups:
- Database backups (daily, with retention policy)
- Application code backups (git repository)
- Environment variables backup (secure storage)

## Support

For issues or questions:
- Check the main README.md for API documentation
- Review logs for error messages
- Verify all environment variables are correctly set
