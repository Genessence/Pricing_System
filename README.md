
# QuoteFlow Pro

A modern procurement management system built with React, Tailwind CSS, and Vite.

## 🚀 Features

- **User Authentication**: Role-based access control (User/Admin)
- **Procurement Dashboard**: Comprehensive admin interface with performance metrics
- **RFQ Management**: Create and manage Request for Quotations
- **Quotation Comparison**: Compare supplier quotes with interactive tables
- **Admin Approval Workflow**: Streamlined approval process
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Analytics**: Interactive charts and metrics

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS, CSS Variables
- **Build Tool**: Vite
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **State Management**: React Context API

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quoteflow_pro
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Start development server**

   ```bash
   npm start
   ```
4. **Build for production**

   ```bash
   npm run build
   ```

## 🌐 Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Connect to Vercel**

   - Push your code to GitHub/GitLab
   - Connect your repository to Vercel
   - Vercel will automatically detect the React configuration
2. **Automatic Deployment**

   - Every push to main branch triggers a new deployment
   - Vercel automatically runs `npm run build`
   - Static assets are served with optimal caching
3. **Custom Domain**

   - Add your custom domain in Vercel dashboard
   - SSL certificates are automatically provisioned

### Manual Deployment

1. **Build the project**

   ```bash
   npm run build
   ```
2. **Deploy build folder**

   - Upload the `build/` folder to your hosting provider
   - Ensure all routes redirect to `index.html` for SPA routing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=your_api_endpoint
REACT_APP_ENVIRONMENT=production
```

### Build Configuration

The project uses Vite for building. Key configurations:

- **Output Directory**: `build/` (configured in `vite.config.mjs`)
- **Source Maps**: Enabled for production builds
- **Chunk Size**: Warning limit set to 2000KB

## 📱 Available Routes

- `/login` - Authentication page
- `/user-dashboard` - User dashboard (protected)
- `/procurement-dashboard` - Admin dashboard (protected)
- `/quotation-comparison-table` - Quote comparison (protected)
- `/admin-approval-screen` - Admin approval workflow (protected)

## 🔐 Authentication

### Demo Credentials

**Admin User:**

- Username: `admin`
- Password: `admin123`

**Regular User:**

- Username: `user`
- Password: `user123`

## 🎨 Styling

The project uses Tailwind CSS with custom CSS variables for theming:

- **Color Scheme**: Light/Dark mode support
- **Responsive**: Mobile-first design approach
- **Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions and micro-interactions

## 📊 Performance

- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Vite optimizations enabled
- **Asset Caching**: Static assets cached for 1 year
- **Lighthouse Score**: Optimized for Core Web Vitals

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

- **Component API**: JSDoc comments for all components
- **Development Rules**: See `DEVELOPMENT_RULES.md`
- **Code Standards**: ESLint configuration included

## 🤝 Contributing

1. Follow the development rules in `DEVELOPMENT_RULES.md`
2. Use conventional commit messages
3. Ensure all tests pass
4. Update documentation as needed

## 📄 License

This project is proprietary software. All rights reserved.

---

**QuoteFlow Pro** - Streamlining procurement processes with modern technology.
