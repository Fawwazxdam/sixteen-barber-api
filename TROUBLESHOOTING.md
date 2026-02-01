# Troubleshooting Guide

This guide helps you resolve common issues with the Sixteen Barber API, especially related to CORS, cookies, and HTTPS deployment.

## CORS Issues

### Error: "Access-Control-Allow-Origin header is missing"

**Symptoms:**
- Browser console shows CORS error
- API requests fail from frontend

**Causes:**
1. Frontend domain not in `FRONTEND_URL` environment variable
2. `NODE_ENV` not set correctly
3. Server not restarted after configuration changes

**Solutions:**

1. **Check FRONTEND_URL:**
```bash
# In .env file
FRONTEND_URL=https://your-frontend-domain.com
```

2. **Verify NODE_ENV:**
```bash
# For production
NODE_ENV=production

# For development
NODE_ENV=development
```

3. **Restart the server:**
```bash
# If using PM2
pm2 restart sixteen-barber-api

# If running directly
# Stop and restart the application
```

4. **Clear browser cache:**
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

### Error: "CORS header 'Access-Control-Allow-Origin' does not match"

**Symptoms:**
- CORS error with specific origin mentioned
- Request blocked despite CORS being configured

**Causes:**
1. Origin mismatch (trailing slash, protocol difference)
2. Multiple origins not properly separated
3. Case sensitivity in domain names

**Solutions:**

1. **Check exact origin match:**
```typescript
// In src/main.ts
origin: ["http://localhost:3000", "https://next-barber-phi.vercel.app"]
// Note: No trailing slash!
```

2. **Verify frontend URL:**
```bash
# Check browser address bar for exact URL
# It should match exactly what's in FRONTEND_URL
```

3. **Use environment variable:**
```typescript
// In src/main.ts
origin: process.env.FRONTEND_URL?.split(',') || ["http://localhost:3000"]
```

## Cookie Issues

### Error: "Cookie has been rejected because it is in a cross-site context"

**Symptoms:**
- Login succeeds but cookie not set
- Subsequent requests fail authentication

**Causes:**
1. Frontend and backend on different domains/protocols
2. `sameSite` attribute not set correctly
3. `secure` attribute mismatch

**Solutions:**

1. **For Development (HTTP):**
```typescript
// In src/auth/auth.service.ts
res.cookie("access_token", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
});
```

2. **For Production (HTTPS):**
```typescript
// In src/auth/auth.service.ts
res.cookie("access_token", token, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  path: "/",
});
```

3. **Use dynamic configuration (Recommended):**
```typescript
// In src/auth/auth.service.ts
res.cookie("access_token", token, {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: "/",
});
```

### Error: "Cookie will soon be rejected because it is foreign and does not have the 'Partitioned' attribute"

**Symptoms:**
- Warning in browser console
- Cookie may be rejected in future browser versions

**Causes:**
1. Cookie set across different domains
2. Missing `partitioned` attribute
3. Browser enforcing CHIPS (Cookies Having Independent Partitioned State)

**Solutions:**

1. **Add partitioned attribute for production:**
```typescript
// In src/auth/auth.service.ts
res.cookie("access_token", token, {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: "/",
  partitioned: process.env.NODE_ENV === 'production',
});
```

2. **Update clearCookie as well:**
```typescript
// In src/auth/auth.controller.ts
res.clearCookie("access_token", {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: "/",
  partitioned: process.env.NODE_ENV === 'production',
});
```

3. **Ensure both frontend and backend use HTTPS in production**

## HTTPS/SSL Issues

### Error: "SSL certificate has expired"

**Symptoms:**
- Browser shows security warning
- API requests fail

**Solutions:**

1. **Renew certificate with Certbot:**
```bash
sudo certbot renew
```

2. **Check auto-renewal:**
```bash
sudo certbot renew --dry-run
```

3. **Verify certificate:**
```bash
sudo certbot certificates
```

### Error: "Mixed Content: The page was loaded over HTTPS but requested an insecure resource"

**Symptoms:**
- Browser blocks requests
- Console shows mixed content error

**Causes:**
1. Frontend HTTPS but backend HTTP
2. HTTP resources referenced in HTTPS page

**Solutions:**

1. **Ensure backend uses HTTPS:**
```env
# In .env.production
NODE_ENV=production
```

2. **Update API base URL in frontend:**
```typescript
// Frontend configuration
const API_BASE_URL = 'https://api.yourdomain.com';
```

3. **Use relative URLs or protocol-relative URLs:**
```typescript
// Instead of http://api.example.com
// Use //api.example.com (will use current protocol)
```

## Database Issues

### Error: "Connection refused" or "Connection timeout"

**Symptoms:**
- API fails to start
- Database queries fail

**Solutions:**

1. **Check DATABASE_URL:**
```env
# Ensure correct format
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
```

2. **Test database connection:**
```bash
psql "postgresql://user:password@host:port/dbname?sslmode=require"
```

3. **Check firewall rules:**
```bash
# Allow API server IP to access database
# Example for PostgreSQL
sudo ufw allow from <api-server-ip> to any port 5432
```

4. **Verify SSL is enabled:**
```sql
-- In PostgreSQL
SHOW ssl;
-- Should return 'on'
```

## Authentication Issues

### Error: "Unauthorized" or "Invalid token"

**Symptoms:**
- Login succeeds but subsequent requests fail
- JWT token not recognized

**Solutions:**

1. **Check JWT_SECRET:**
```env
# Ensure same secret used across all instances
JWT_SECRET=your-very-strong-secret-key
```

2. **Verify token expiration:**
```typescript
// In src/auth/auth.service.ts
const token = this.jwt.sign({
  sub: user.id,
  role: user.role,
}, {
  expiresIn: '1d', // Adjust as needed
});
```

3. **Check cookie is being sent:**
```javascript
// In browser DevTools
// Application tab > Cookies
// Look for access_token cookie
```

4. **Verify JWT strategy:**
```typescript
// In src/auth/jwt.strategy.ts
// Ensure secret is correctly loaded
jwtFromRequest: ExtractJwt.fromExtractors([
  (request) => {
    return request?.cookies?.access_token;
  },
]),
```

## Performance Issues

### Slow API Response Times

**Solutions:**

1. **Enable database query logging:**
```typescript
// In drizzle.config.ts
logger: true,
```

2. **Add database indexes:**
```sql
-- Example: Add index to frequently queried columns
CREATE INDEX idx_bookings_barber_id ON bookings(barber_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
```

3. **Implement caching:**
```typescript
// Consider using Redis for caching
npm install @nestjs/cache-manager cache-manager
```

4. **Use connection pooling:**
```env
# In DATABASE_URL
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require&pool_size=10
```

## Debugging Tips

### Enable Debug Logging

1. **Set log level:**
```env
LOG_LEVEL=debug
```

2. **Add logging to controllers:**
```typescript
import { Logger } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Post('login')
  login(@Body() body: any) {
    this.logger.debug(`Login attempt for email: ${body.email}`);
    // ...
  }
}
```

### Check Network Requests

1. **Open browser DevTools (F12)**
2. **Go to Network tab**
3. **Filter by XHR/Fetch**
4. **Check request/response headers**
5. **Look for CORS headers and cookies**

### Server Logs

1. **PM2 logs:**
```bash
pm2 logs sixteen-barber-api
```

2. **Docker logs:**
```bash
docker logs <container-id>
```

3. **Application logs:**
```bash
# If using file logging
tail -f logs/app.log
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs** for error messages
2. **Verify environment variables** are correctly set
3. **Review the DEPLOYMENT.md** for configuration details
4. **Test with curl** to isolate the issue:
```bash
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

5. **Check browser console** for client-side errors
6. **Verify network connectivity** between frontend and backend
