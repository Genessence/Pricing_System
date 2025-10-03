# Pricing System Frontend

A React TypeScript application with Material-UI (MUI) components, role-based authentication, and comprehensive error handling.

## Features

- ✅ **Material-UI (MUI)** - Modern, accessible UI components
- ✅ **React Router** with protected routes
- ✅ **Role-based access control** (Super Admin, Admin, Manager, User, Viewer)
- ✅ **Authentication context** with localStorage persistence
- ✅ **Comprehensive error handling** system
- ✅ **Notification system** with snackbars
- ✅ **Error pages** (404, 500, 403, Maintenance)
- ✅ **Error dialogs** and popups for different error types
- ✅ **TypeScript** for type safety
- ✅ **Mock authentication** for development

## Error Handling System

The application includes a comprehensive error handling system with multiple levels:

### 1. **Notifications (Snackbar)**

- Quick feedback for user actions
- Success, error, warning, and info notifications
- Auto-dismiss with customizable duration

### 2. **Error Dialogs**

- Modal dialogs for important errors
- Support for error, warning, and info severity levels
- Retry functionality and detailed error information

### 3. **Server Error Popup**

- Specialized popup for server errors (400, 401, 403, 404, 500, etc.)
- Technical details and retry options
- User-friendly error messages

### 4. **Error Pages**

- Full-page error displays for major issues
- 404 (Not Found), 500 (Server Error), 403 (Unauthorized)
- Maintenance page for system downtime

### 5. **Error Boundary**

- Catches JavaScript errors in React components
- Graceful fallback UI with retry option
- Development mode shows detailed error information

## Folder Structure

```
src/
├── assets/
│   └── images/          # Static images
├── components/
│   ├── common/          # Reusable components
│   │   ├── ErrorDialog.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ServerErrorPopup.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── LoadingSpinner.tsx
│   └── pages/           # Page-specific components
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   └── useErrorHandler.ts
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── NotFound.tsx
│   ├── ServerError.tsx
│   ├── Unauthorized.tsx
│   ├── Maintenance.tsx
│   └── Demo.tsx
├── services/            # API services
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Demo Credentials

The application includes mock authentication with the following demo users:

| Role        | Email               | Password    |
| ----------- | ------------------- | ----------- |
| Super Admin | admin@example.com   | password123 |
| Admin       | manager@example.com | password123 |
| User        | user@example.com    | password123 |

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

4. Visit [http://localhost:5173/demo](http://localhost:5173/demo) to see the error handling demo

## User Roles & Permissions

### Super Admin

- Full system access
- User management
- System configuration
- Role & Permission Management
- System Analytics
- Backup & Recovery

### Admin

- User management
- Content management
- Reports & analytics
- Settings configuration

### Manager

- Team management
- Project overview
- Performance reports
- Resource planning

### User

- Personal tasks
- Profile management
- Basic reports

### Viewer

- Read-only access
- Basic reports

## Protected Routes

- `/dashboard` - Requires authentication
- `/admin/*` - Requires Admin or Super Admin role
- `/super-admin/*` - Requires Super Admin role

## Error Handling Usage

### Notifications

```typescript
import { useNotification } from "../context/NotificationContext";

const { showSuccess, showError, showWarning, showInfo } = useNotification();

// Show notifications
showSuccess("Operation completed successfully!");
showError("Something went wrong!");
showWarning("Please check your input");
showInfo("Here's some information");
```

### Error Handler Hook

```typescript
import { useErrorHandler } from "../hooks/useErrorHandler";

const { handleError, handleServerError, ErrorDialogComponent } =
  useErrorHandler();

// Handle errors
handleError(new Error("Something went wrong"), { showDialog: true });
handleServerError(500, "Internal Server Error", "Details...");

// Render error components
return (
  <div>
    {ErrorDialogComponent}
    {/* Your content */}
  </div>
);
```

## API Integration

The application is set up with mock authentication for development. To integrate with your backend:

1. Update `src/services/authService.ts` to use real API endpoints
2. Configure `API_BASE_URL` in your environment variables
3. Update the login method to remove mock data usage

## Environment Variables

The application uses Vite's environment variable system. Create the appropriate environment files:

### Environment Files (in order of priority)

1. **`.env`** - Default values (committed to git)
2. **`.env.local`** - Local overrides (ignored by git)
3. **`.env.[mode]`** - Mode-specific values (development, production, staging, test)
4. **`.env.[mode].local`** - Mode-specific local overrides (ignored by git)

### Available Modes

- **development** - `npm run dev` (default)
- **staging** - `npm run dev:staging` or `npm run build:staging`
- **production** - `npm run build:production`
- **test** - `npm run test`

### Quick Setup

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Customize your local settings in `.env.local`

### Key Environment Variables

```bash
# Application
VITE_APP_NAME=Pricing System
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_MOCK_AUTH=true
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_ANALYTICS=false

# Security
VITE_TOKEN_STORAGE_KEY=pricing_system_auth_token
VITE_USER_DATA_STORAGE_KEY=pricing_system_user_data
VITE_SESSION_TIMEOUT=3600000

# Error Handling
VITE_ERROR_REPORTING_ENABLED=false
VITE_MAX_ERROR_NOTIFICATIONS=5
```

## Available Scripts

### Development

- `npm run dev` - Start development server (default mode)
- `npm run dev:staging` - Start development server in staging mode

### Building

- `npm run build` - Build for production
- `npm run build:staging` - Build for staging
- `npm run build:production` - Build for production (explicit)

### Preview

- `npm run preview` - Preview production build
- `npm run preview:staging` - Preview staging build
- `npm run preview:production` - Preview production build

### Testing

- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

### Code Quality

- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI components
- **React Router DOM** - Routing
- **Emotion** - CSS-in-JS styling
- **Vite** - Build tool
- **ESLint** - Code linting

## Error Handling Best Practices

1. **Use notifications** for quick user feedback
2. **Use dialogs** for errors that require user attention
3. **Use error pages** for major system issues
4. **Always provide retry options** when possible
5. **Show user-friendly messages** with technical details in development
6. **Log errors** for debugging and monitoring

## Demo Page

Visit `/demo` to see all error handling components in action:

- Notification examples
- Error dialog demonstrations
- Server error popup examples
- Links to error pages
