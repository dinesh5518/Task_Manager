# Authentication Module - Quick Start Guide

## Prerequisites

- Java 17+
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Git

## Backend Setup

### 1. Start MongoDB
```bash
# If using MongoDB Atlas, ensure connection string is in application.properties
# If using local MongoDB
mongod
```

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?appName=Cluster0
taskmanager.app.jwtSecret=your-secret-key-with-min-32-chars
taskmanager.app.jwtExpirationMs=86400000
```

### 3. Run Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend runs on http://localhost:8080
```

Wait for:
```
Started BackendApplication in X.XXX seconds
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## Testing the Application

### Test Account Flow

1. **Open Browser**: http://localhost:5173

2. **Signup (Create Account)**
   - Click "Create one" link on login page OR go to `/signup`
   - Fill in:
     - Name: "Test User"
     - Email: "test@example.com"
     - Password: "Test123!@#"
     - Confirm: "Test123!@#"
   - Click "Create Account"
   - Should redirect to login after success

3. **Login**
   - Email: "test@example.com"
   - Password: "Test123!@#"
   - Click "Sign In"
   - Should redirect to dashboard

4. **Access Protected Route**
   - Logged in user can access /dashboard
   - Logout or delete token from localStorage
   - Try accessing /dashboard
   - Should redirect to login

## API Testing with Postman

### Signup Request
```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login Request
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response** (copy the token):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["ROLE_USER"]
}
```

### Use Token for Protected Routes
```
Header: Authorization: Bearer <token>
GET http://localhost:8080/api/tasks
```

## Verify Integration

### Frontend
- [ ] Login page loads and is styled correctly
- [ ] Signup page loads with password strength indicator
- [ ] Form validation works in real-time
- [ ] Can create new account
- [ ] Can login with created account
- [ ] Redirects to dashboard after login
- [ ] Token stored in localStorage
- [ ] Can access protected routes

### Backend
- [ ] User saved to MongoDB
- [ ] Password is hashed (not plain text)
- [ ] JWT token returned on login
- [ ] Token has correct user data
- [ ] Protected routes return 401 without token
- [ ] Protected routes work with valid token

## Common Issues

### "Connection refused" on Backend Startup
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Start MongoDB: `mongod`
- OR verify MongoDB Atlas connection string in application.properties

### "CORS error" when Frontend calls Backend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Backend CORS is configured at `/api/auth/**`
- Ensure frontend URL matches backend CORS origins
- Check backend is running on port 8080

### "Unauthorized" on Protected Routes
```
401: Full authentication is required
```
**Solution**:
- Ensure JWT token is in localStorage with key "token"
- Token may have expired (24 hours default)
- Login again to get new token

### Frontend shows blank page
**Solution**:
- Check browser console for errors
- Verify frontend is running: http://localhost:5173
- Clear cache: Ctrl+Shift+Delete (Chrome)
- Restart dev server: `npm run dev`

## Database Inspection

### MongoDB Atlas
1. Go to: https://cloud.mongodb.com
2. Select your cluster
3. Click "Browse Collections"
4. Look for `taskmanager` database → `users` collection
5. Verify users are being saved

### Local MongoDB with Compass
```bash
# Download: https://www.mongodb.com/products/compass
# Connect to: mongodb://localhost:27017
# Browse taskmanager.users collection
```

## Production Checklist

Before deploying to production:
- [ ] Change JWT secret to strong random value
- [ ] Use environment variables for sensitive data
- [ ] Set CORS origins to specific domain (not *)
- [ ] Enable HTTPS
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add rate limiting to auth endpoints
- [ ] Enable audit logging
- [ ] Set JWT expiration appropriately
- [ ] Add refresh token rotation

## Environment Variables

### Backend (.env or environment)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

## Next Development Tasks

1. **User Profile Page**: View and edit user details
2. **Logout Button**: Add logout functionality to navbar
3. **Forgot Password**: Email-based password reset
4. **Email Verification**: Verify email during signup
5. **Two-Factor Auth**: Optional 2FA for security
6. **Social Login**: Google, GitHub OAuth integration
7. **Session Management**: Auto-logout on inactivity
8. **Audit Logging**: Track authentication events

## Support & Debugging

### Enable Debug Logging
**Backend** (application.properties):
```
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

**Frontend** (src/api/axios.js):
```javascript
// Add response logging
axiosInstance.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### Inspect JWT Token
1. Visit: https://jwt.io
2. Paste token in "Encoded" section
3. View decoded payload

### Check Application Flow
1. Open DevTools → Network tab
2. Watch requests/responses
3. Check headers for Authorization token
4. Verify response status codes

## Useful Commands

```bash
# Backend
cd backend
./mvnw clean install        # Build project
./mvnw spring-boot:run      # Run application
./mvnw test                 # Run tests

# Frontend
cd frontend
npm install                 # Install dependencies
npm run dev                 # Development server
npm run build               # Production build
npm run lint                # Check code quality
npm run preview             # Preview build
```

## Documentation

- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Questions?

Check the logs, read error messages, and use the documentation. Most issues are configuration-related.
