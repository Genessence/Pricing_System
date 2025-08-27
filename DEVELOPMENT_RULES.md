# QuoteFlow Pro - Development Rules & Standards

## 📋 Overview

This document establishes development rules, coding standards, and architectural patterns for QuoteFlow Pro. All developers must follow these guidelines to maintain code quality and consistency.

## 🏗️ Architecture Rules

### Component Structure
```jsx
// ✅ CORRECT: Functional component structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2, children }) => {
  // 1. Hooks at the top
  const [state, setState] = useState(initialValue);
  
  // 2. Effects after state
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 3. Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // 4. Render logic
  return (
    <div className="component-wrapper">
      {children}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  children: PropTypes.node
};

export default ComponentName;
```

### File Organization
```
src/
├── components/
│   ├── ui/                    # Base UI components
│   └── feature/               # Feature-specific components
├── pages/                     # Page components
│   ├── feature-name/
│   │   ├── components/        # Page-specific components
│   │   ├── hooks/            # Custom hooks
│   │   └── index.jsx         # Main page component
├── hooks/                     # Global custom hooks
├── utils/                     # Global utilities
├── constants/                 # Application constants
└── styles/                    # Global styles
```

### Naming Conventions
- **Components**: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- **Hooks**: `camelCase.js` with `use` prefix (e.g., `useAuth.js`)
- **Utilities**: `camelCase.js` (e.g., `formatCurrency.js`)
- **Tests**: `ComponentName.test.jsx`
- **Stories**: `ComponentName.stories.jsx`

## 🎨 Styling Rules

### Tailwind CSS Guidelines
```jsx
// ✅ CORRECT: Organized Tailwind classes
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-4 space-y-2",
  // Typography
  "text-sm font-medium text-gray-900",
  // Background & Borders
  "bg-white border border-gray-200 rounded-lg",
  // Responsive
  "md:p-6 lg:text-base",
  // Conditional classes
  isActive && "bg-blue-50 border-blue-200"
)}>
```

### Responsive Design
- **Mobile-first approach** with Tailwind breakpoints
- **Use `cn()` utility** for conditional classes
- **Avoid custom CSS** when possible
- **CSS custom properties** for theme values

## 🔧 State Management Rules

### Local State Guidelines
```jsx
// ✅ CORRECT: State organization
const [formData, setFormData] = useState({
  title: '',
  description: '',
  category: ''
});

const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});

// ✅ CORRECT: State updates
const updateFormData = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};
```

### Custom Hooks Structure
```jsx
// ✅ CORRECT: Custom hook structure
const useRFQManagement = (initialRFQs = []) => {
  const [rfqs, setRFQs] = useState(initialRFQs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addRFQ = useCallback((newRFQ) => {
    setRFQs(prev => [...prev, newRFQ]);
  }, []);

  const activeRFQs = useMemo(() => 
    rfqs.filter(rfq => rfq.status === 'active'), 
    [rfqs]
  );

  return { rfqs, loading, error, addRFQ, activeRFQs };
};
```

## 📝 Code Quality Rules

### ESLint Configuration
```json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "react/prop-types": "error",
    "react/jsx-key": "error",
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

### Performance Rules
- **Memoize expensive calculations** with `useMemo`
- **Memoize callback functions** with `useCallback`
- **Use React.memo** for frequently re-rendering components
- **Lazy load** large components and routes
- **Avoid inline objects and functions** in render

### Error Handling
```jsx
// ✅ CORRECT: Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 🧪 Testing Rules

### Test Structure
```jsx
// ✅ CORRECT: Component test
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    title: 'Test Title',
    onAction: jest.fn()
  };

  it('renders correctly', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when clicked', async () => {
    const user = userEvent.setup();
    render(<ComponentName {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(defaultProps.onAction).toHaveBeenCalled();
  });
});
```

### Testing Guidelines
- **Test user interactions**, not implementation details
- **Use semantic queries** (getByRole, getByLabelText)
- **Test accessibility** with screen readers
- **Mock external dependencies**
- **Maintain 80%+ code coverage**

## 🔐 Security Rules

### Input Validation
```jsx
// ✅ CORRECT: Form validation
const validateRFQForm = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (data.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  return errors;
};
```

### API Security
```jsx
// ✅ CORRECT: Secure API client
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Security Guidelines
- **Validate all user inputs** on client and server
- **Sanitize data** before rendering
- **Use HTTPS** for all API calls
- **Implement proper authentication**
- **Protect against XSS** and CSRF attacks

## 📱 Accessibility Rules

### ARIA Guidelines
```jsx
// ✅ CORRECT: Accessible component
const AccessibleButton = ({ children, onClick, disabled, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
};
```

### Accessibility Rules
- **Use semantic HTML** elements
- **Provide alt text** for images
- **Ensure keyboard navigation** works
- **Maintain color contrast** ratios (4.5:1 minimum)
- **Use ARIA labels** when necessary
- **Test with screen readers**

## 🚀 Performance Rules

### Code Splitting
```jsx
// ✅ CORRECT: Route-based code splitting
const ProcurementDashboard = React.lazy(() => 
  import('./pages/procurement-dashboard')
);


```

### Bundle Optimization
- **Implement code splitting** for routes and heavy components
- **Optimize images** and assets
- **Use webpack bundle analyzer** to monitor size
- **Implement caching strategies**
- **Monitor Core Web Vitals**

## 🔄 Git Workflow Rules

### Branch Naming
```
feature/rfq-management          # New features
bugfix/login-validation         # Bug fixes
hotfix/security-patch           # Critical fixes
refactor/component-structure    # Code refactoring
```

### Commit Messages
```
type(scope): description

feat(rfq): add bulk export functionality
fix(auth): resolve login redirect issue
refactor(components): extract common form logic
docs(readme): update installation instructions
```

### Commit Types
- **feat**: New features
- **fix**: Bug fixes
- **refactor**: Code refactoring
- **docs**: Documentation changes
- **test**: Test additions or updates
- **chore**: Maintenance tasks

## 📚 Documentation Rules

### JSDoc Comments
```jsx
/**
 * RFQ Management component for creating and editing RFQs
 * 
 * @param {Object} props - Component props
 * @param {string} props.rfqId - Unique RFQ identifier
 * @param {Function} props.onSave - Callback when RFQ is saved
 * @returns {JSX.Element} RFQ management form
 */
const RFQManagement = ({ rfqId, onSave }) => {
  // Component implementation
};
```

### Documentation Guidelines
- **Document complex functions** with JSDoc
- **Explain business logic** in comments
- **Keep README files** up to date
- **Document API changes** in changelog
- **Provide usage examples** for components

## 🎯 Import/Export Rules

### Import Order
```jsx
// 1. React and core libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Third-party libraries
import { Helmet } from 'react-helmet';
import axios from 'axios';

// 3. Internal components (absolute imports)
import Button from 'components/ui/Button';
import TopNavigationBar from 'components/ui/TopNavigationBar';

// 4. Internal utilities and constants
import { formatCurrency } from 'utils/formatters';
import { API_ENDPOINTS } from 'constants/api';

// 5. Relative imports (same directory)
import './ComponentName.css';
```

### Export Rules
- **Default exports** for components and pages
- **Named exports** for utilities, constants, and hooks
- **Barrel exports** for component directories

## 🔮 Future Considerations

### TypeScript Migration
- **Gradual migration** starting with new components
- **Type existing components** incrementally
- **Use JSDoc comments** as interim type documentation

### State Management Evolution
```jsx
// ✅ CORRECT: Redux Toolkit slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchRFQs = createAsyncThunk(
  'rfq/fetchRFQs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/rfqs');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const rfqSlice = createSlice({
  name: 'rfq',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRFQs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      });
  }
});
```

## 📋 Compliance Checklist

Before submitting any code, ensure:

- [ ] **Architecture rules** followed
- [ ] **Component structure** adheres to guidelines
- [ ] **Styling rules** implemented
- [ ] **State management** patterns used
- [ ] **Code quality** standards met
- [ ] **Performance** optimizations applied
- [ ] **Security** measures implemented
- [ ] **Accessibility** requirements met
- [ ] **Testing** coverage adequate
- [ ] **Documentation** updated
- [ ] **Git workflow** followed

---

**Remember**: These rules are living guidelines. They should evolve with the project and team needs. Regular reviews and updates ensure they remain relevant and effective.
