# Authentication Module Implementation Guide

## Overview
The Authentication Module has been successfully implemented for the Task Management Application. This document provides a complete guide to the new authentication system.

## Backend Implementation Summary

### 1. **User Model** (`backend/src/main/java/com/taskmanager/backend/models/User.java`)
- MongoDB document with fields: id, name, email, password, avatar, roles, createdAt, updatedAt
- Uses Lombok annotations for cleaner code
- Already configured with @Document annotation

### 2. **User Repository** (`backend/src/main/java/com/taskmanager/backend/repository/UserRepository.java`)
- Extends MongoRepository<User, String>
- Methods: `findByEmail(String email)`, `existsByEmail(String email)`
- Used for user lookup and duplicate email validation

### 3. **Auth Controller** (`backend/src/main/java/com/taskmanager/backend/controller/AuthController.java`)
- **POST /api/auth/login**: Authenticates user and returns JWT token
- **POST /api/auth/signup**: Creates new user account
- Uses Spring Security for authentication
- Returns JwtResponse with token and user details

### 4. **JWT Security Configuration**
- **JwtUtils.java**: Generates and validates JWT tokens
- **AuthTokenFilter.java**: Intercepts requests to validate JWT
- **UserDetailsImpl.java**: Custom UserDetails implementation
- **UserDetailsServiceImpl.java**: Loads user by email
- **AuthEntryPointJwt.java**: Handles unauthorized access

### 5. **Password Encryption**
- BCryptPasswordEncoder for secure password hashing
- Applied during signup and verified during login

### 6. **API Endpoints**

#### Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "roles": ["ROLE_USER"]
}
```

#### Signup
```
POST /api/auth/signup
Content-Type: application/json

Request:
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully!"
}
```

## Frontend Implementation Summary

### 1. **Auth Store** (`frontend/src/store/useAuthStore.js`)
- Zustand store with persistent middleware
- State: user, token, isAuthenticated, loading, error
- Methods:
  - `login(email, password)`: Authenticates user
  - `signup(name, email, password)`: Creates new account
  - `logout()`: Clears auth state
  - `clearError()`: Resets error messages
  - `initAuth()`: Restores auth from localStorage

### 2. **Auth Service** (`frontend/src/services/authService.js`)
- Utility service for auth operations
- Handles token and user storage
- Methods: login, signup, logout, getToken, getUser

### 3. **Axios Interceptor** (`frontend/src/api/axios.js`)
- Automatically adds JWT token to request headers
- Base URL: http://localhost:8080/api
- Format: Authorization: Bearer {token}

### 4. **Login Page** (`frontend/src/pages/Login.jsx`)
**Features:**
- Email and password fields
- Show/hide password toggle
- Remember me checkbox
- Forgot password link (placeholder)
- Real-time validation
- Loading states
- Error/success messages
- Responsive design with glassmorphism
- Smooth animations with Framer Motion
- Auto-redirect to dashboard on success

**Design:**
- Dark theme with gradient background
- Glassmorphic card with blur effect
- Animated background blobs
- Smooth entrance animations
- Staggered input animations

### 5. **Signup Page** (`frontend/src/pages/Signup.jsx`)
**Features:**
- Full name field
- Email field
- Password field with strength indicator
- Confirm password field with match validation
- Real-time validation feedback
- Password strength visualization
- Error handling
- Loading states
- Success notifications
- Auto-redirect to login on success

**Design:**
- Similar to login page
- Password strength color coding (red → orange → yellow → green)
- Confirmation match indicator
- Professional typography
- Framer Motion animations

### 6. **Protected Route** (`frontend/src/routes/ProtectedRoute.jsx`)
- Redirects unauthenticated users to /login
- Allows authenticated users to access protected pages
- Uses `<Outlet />` for nested routes

### 7. **Updated App.jsx** (`frontend/src/App.jsx`)
- Imports Login and Signup components
- Initializes auth on mount
- Routes:
  - `/login` - Public, redirects to dashboard if authenticated
  - `/signup` - Public, redirects to dashboard if authenticated
  - `/dashboard` - Protected route
  - `/board` - Protected route
  - `/` - Redirects based on auth status

### 8. **CSS Animations** (`frontend/src/index.css`)
- Blob animations for background elements
- Float animations
- Slide animations
- Shimmer effect for loading states

## Validation Implementation

### Backend Validation
- **LoginRequest**: email and password are @NotBlank
- **SignupRequest**:
  - name: @NotBlank, 3-50 characters
  - email: @NotBlank, @Email, max 50 characters
  - password: @NotBlank, 6-40 characters

### Frontend Validation
- **Login**:
  - Email: required, valid format
  - Password: required, min 6 characters

- **Signup**:
  - Name: required, min 3 characters
  - Email: required, valid format
  - Password: required, min 6 characters
  - Confirm Password: required, must match password

## State Management Flow

```
User enters credentials
        ↓
Frontend validation
        ↓
API request (Axios)
        ↓
Backend authentication
        ↓
JWT token returned
        ↓
Store in localStorage & Zustand state
        ↓
Add to axios headers
        ↓
Redirect to dashboard
```

## Error Handling

### Backend
- Invalid credentials: 401 Unauthorized
- Email already exists: 400 Bad Request
- Validation errors: 400 Bad Request

### Frontend
- Network errors: Display error message
- Validation errors: Display field-specific errors
- Server errors: Display error message from response
- Error auto-clear on input change

## Security Features

1. **Password Security**
   - BCrypt hashing with salt
   - Never stored in plain text
   - No password in JWT

2. **JWT Token**
   - HS256 algorithm
   - Expiration time: 24 hours (configurable)
   - Stored securely in localStorage
   - Automatically added to request headers

3. **CORS**
   - Configured on backend
   - Allows frontend at localhost:3000/5173

4. **Protected Routes**
   - Auth check before allowing access
   - Automatic redirect to login if not authenticated
   - Token validation on each request

## Configuration

### Backend (application.properties)
```
taskmanager.app.jwtSecret=<secret-key>
taskmanager.app.jwtExpirationMs=86400000 (24 hours)
```

### Frontend
- API URL: http://localhost:8080/api
- Zustand store persisted to localStorage with key: "auth-storage"
- Token stored separately with key: "token"
- User info stored with key: "user"

## Testing

### Test Login Flow
1. Start backend: `mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Navigate to http://localhost:5173/signup
4. Create new account
5. Navigate to http://localhost:5173/login
6. Login with credentials
7. Should redirect to dashboard

### Test Protected Routes
1. Try accessing /dashboard without login
2. Should redirect to /login
3. Login with valid credentials
4. Should access /dashboard successfully

### Test JWT Validation
1. Open browser DevTools → Storage → LocalStorage
2. Check "token" key contains JWT
3. Try modifying token value
4. Protected routes should fail and redirect to login

## File Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js (Updated)
│   ├── pages/
│   │   ├── Login.jsx (New)
│   │   └── Signup.jsx (New)
│   ├── services/
│   │   └── authService.js (New)
│   ├── store/
│   │   └── useAuthStore.js (Updated)
│   ├── routes/
│   │   └── ProtectedRoute.jsx (Existing)
│   ├── App.jsx (Updated)
│   ├── index.css (Updated)
│   └── ...

backend/
├── src/main/java/com/taskmanager/backend/
│   ├── controller/
│   │   └── AuthController.java (Existing)
│   ├── models/
│   │   ├── User.java (Existing)
│   │   └── Role.java (Existing)
│   ├── repository/
│   │   └── UserRepository.java (Existing)
│   ├── dto/
│   │   ├── request/
│   │   │   ├── LoginRequest.java (Existing)
│   │   │   └── SignupRequest.java (Existing)
│   │   └── response/
│   │       ├── JwtResponse.java (Existing)
│   │       └── MessageResponse.java (Existing)
│   ├── security/
│   │   ├── WebSecurityConfig.java (Existing)
│   │   ├── jwt/
│   │   │   ├── JwtUtils.java (Existing)
│   │   │   ├── AuthTokenFilter.java (Existing)
│   │   │   └── AuthEntryPointJwt.java (Existing)
│   │   └── services/
│   │       ├── UserDetailsImpl.java (Existing)
│   │       └── UserDetailsServiceImpl.java (Existing)
│   └── resources/
│       └── application.properties (Existing)
```

## Next Steps

1. **Implement Logout Button**: Add logout button to dashboard/navbar
2. **Add Forgot Password**: Implement password reset functionality
3. **Email Verification**: Add email confirmation during signup
4. **Two-Factor Authentication**: Implement 2FA for enhanced security
5. **Social Login**: Add OAuth providers (Google, GitHub)
6. **User Profile**: Create user profile management page
7. **Session Management**: Implement session timeout

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify email and password are correct
- Check MongoDB connection
- Verify user exists in database

### Axios interceptor not adding token
- Check token is saved in localStorage with key "token"
- Verify axios instance is imported correctly
- Check browser DevTools → Network tab for Authorization header

### Protected routes redirect to login
- Verify token exists in localStorage
- Check token hasn't expired
- Verify backend JWT validation is working

### CORS errors
- Ensure backend CORS is configured
- Check frontend URL matches CORS origins
- Verify API base URL is correct

## Contributing

When modifying authentication:
1. Update backend validation first
2. Then update frontend validation
3. Test complete flow
4. Update this documentation

## Support

For issues or questions:
1. Check application logs
2. Verify configurations
3. Test with Postman (backend)
4. Check browser console (frontend)
