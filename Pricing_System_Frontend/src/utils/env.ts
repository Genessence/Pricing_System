// Environment variable utilities
// This file provides type-safe access to environment variables

// Vite's built-in environment variables
interface ViteEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

// Global constants defined in vite.config.ts
declare const __APP_MODE__: string;
declare const __APP_COMMAND__: string;
declare const __NODE_ENV__: string;

interface AppConfig {
  // Application
  appTitle: string;
  appName: string;
  appVersion: string;
  appDescription: string;
  appEnv: string;

  // API
  apiUrl: string;
  apiTimeout: number;

  // Feature Flags
  enableMockAuth: boolean;
  enableDebugLogs: boolean;
  enableAnalytics: boolean;
  enableDevTools: boolean;

  // UI
  showDevInfo: boolean;
  devPanelEnabled: boolean;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  defaultPageSize: number;

  // Security
  tokenStorageKey: string;
  userDataStorageKey: string;
  sessionTimeout: number;

  // Error Handling
  errorReportingEnabled: boolean;
  errorReportingUrl: string;
  maxErrorNotifications: number;
  showErrorStack: boolean;

  // Performance
  enablePerformanceMonitoring: boolean;
  enableReactDevtools: boolean;

  // Build
  buildSourcemap: boolean;
  buildMinify: boolean;

  // Vite Environment
  mode: string;
  baseUrl: string;
  isProd: boolean;
  isDev: boolean;
  isSSR: boolean;

  // Global Constants
  appMode: string;
  appCommand: string;
  nodeEnv: string;
}

// Helper function to get environment variable with fallback
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return import.meta.env[key] || defaultValue;
};

// Helper function to get boolean environment variable
const getBooleanEnvVar = (
  key: string,
  defaultValue: boolean = false
): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
};

// Helper function to get number environment variable
const getNumberEnvVar = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Application configuration object
export const config: AppConfig = {
  // Application
  appTitle: getEnvVar("VITE_APP_TITLE", "Pricing System"),
  appName: getEnvVar("VITE_APP_NAME", "Pricing System"),
  appVersion: getEnvVar("VITE_APP_VERSION", "1.0.0"),
  appDescription: getEnvVar(
    "VITE_APP_DESCRIPTION",
    "Modern pricing system with role-based access control"
  ),
  appEnv: getEnvVar("VITE_APP_ENV", import.meta.env.MODE || "development"),

  // API
  apiUrl: getEnvVar("VITE_API_URL", "http://localhost:5000/api"),
  apiTimeout: getNumberEnvVar("VITE_API_TIMEOUT", 10000),

  // Feature Flags
  enableMockAuth: getBooleanEnvVar("VITE_ENABLE_MOCK_AUTH", true),
  enableDebugLogs: getBooleanEnvVar("VITE_ENABLE_DEBUG_LOGS", false),
  enableAnalytics: getBooleanEnvVar("VITE_ENABLE_ANALYTICS", false),
  enableDevTools: getBooleanEnvVar("VITE_ENABLE_DEV_TOOLS", false),

  // UI
  showDevInfo: getBooleanEnvVar("VITE_SHOW_DEV_INFO", false),
  devPanelEnabled: getBooleanEnvVar("VITE_DEV_PANEL_ENABLED", false),
  themePrimaryColor: getEnvVar("VITE_THEME_PRIMARY_COLOR", "#667eea"),
  themeSecondaryColor: getEnvVar("VITE_THEME_SECONDARY_COLOR", "#764ba2"),
  defaultPageSize: getNumberEnvVar("VITE_DEFAULT_PAGE_SIZE", 10),

  // Security
  tokenStorageKey: getEnvVar(
    "VITE_TOKEN_STORAGE_KEY",
    "pricing_system_auth_token"
  ),
  userDataStorageKey: getEnvVar(
    "VITE_USER_DATA_STORAGE_KEY",
    "pricing_system_user_data"
  ),
  sessionTimeout: getNumberEnvVar("VITE_SESSION_TIMEOUT", 3600000),

  // Error Handling
  errorReportingEnabled: getBooleanEnvVar(
    "VITE_ERROR_REPORTING_ENABLED",
    false
  ),
  errorReportingUrl: getEnvVar("VITE_ERROR_REPORTING_URL", ""),
  maxErrorNotifications: getNumberEnvVar("VITE_MAX_ERROR_NOTIFICATIONS", 5),
  showErrorStack: getBooleanEnvVar("VITE_SHOW_ERROR_STACK", false),

  // Performance
  enablePerformanceMonitoring: getBooleanEnvVar(
    "VITE_ENABLE_PERFORMANCE_MONITORING",
    false
  ),
  enableReactDevtools: getBooleanEnvVar("VITE_ENABLE_REACT_DEVTOOLS", false),

  // Build
  buildSourcemap: getBooleanEnvVar("VITE_BUILD_SOURCEMAP", false),
  buildMinify: getBooleanEnvVar("VITE_BUILD_MINIFY", true),

  // Vite Environment
  mode: import.meta.env.MODE || "development",
  baseUrl: import.meta.env.BASE_URL || "/",
  isProd: import.meta.env.PROD || false,
  isDev: import.meta.env.DEV || true,
  isSSR: import.meta.env.SSR || false,

  // Global Constants
  appMode:
    typeof __APP_MODE__ !== "undefined"
      ? __APP_MODE__
      : import.meta.env.MODE || "development",
  appCommand:
    typeof __APP_COMMAND__ !== "undefined" ? __APP_COMMAND__ : "unknown",
  nodeEnv: typeof __NODE_ENV__ !== "undefined" ? __NODE_ENV__ : "development",
};

// Environment checks using Vite's built-in environment variables
export const isDevelopment = config.mode === "development" || config.isDev;
export const isProduction = config.mode === "production" || config.isProd;
export const isStaging = config.mode === "staging";
export const isTest = config.mode === "test";
export const isTesting = config.mode === "testing";

// Debug logging utility
export const debugLog = (...args: any[]) => {
  if (config.enableDebugLogs) {
    console.log(`[${config.appMode}]`, ...args);
  }
};

// Error reporting utility
export const reportError = (error: Error, context?: string) => {
  if (config.errorReportingEnabled && config.errorReportingUrl) {
    // In a real application, you would send this to your error reporting service
    debugLog("Error reported:", error, context);
  }
};

// Environment info for debugging
export const getEnvInfo = () => {
  return {
    appTitle: config.appTitle,
    appName: config.appName,
    appVersion: config.appVersion,
    appEnv: config.appEnv,
    apiUrl: config.apiUrl,
    enableMockAuth: config.enableMockAuth,
    enableDebugLogs: config.enableDebugLogs,
    enableAnalytics: config.enableAnalytics,
    showDevInfo: config.showDevInfo,
    errorReportingEnabled: config.errorReportingEnabled,
    mode: config.mode,
    isProd: config.isProd,
    isDev: config.isDev,
    appMode: config.appMode,
    appCommand: config.appCommand,
    nodeEnv: config.nodeEnv,
  };
};

// Environment validation
export const validateEnvironment = () => {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push("VITE_API_URL is required");
  }

  if (config.apiTimeout < 1000) {
    errors.push("VITE_API_TIMEOUT should be at least 1000ms");
  }

  if (config.maxErrorNotifications < 1) {
    errors.push("VITE_MAX_ERROR_NOTIFICATIONS should be at least 1");
  }

  if (errors.length > 0) {
    console.error("Environment validation errors:", errors);
    if (isProduction) {
      throw new Error(`Environment validation failed: ${errors.join(", ")}`);
    }
  }

  return errors.length === 0;
};

// Export individual config values for convenience
export const {
  appTitle,
  appName,
  appVersion,
  appDescription,
  appEnv,
  apiUrl,
  apiTimeout,
  enableMockAuth,
  enableDebugLogs,
  enableAnalytics,
  enableDevTools,
  showDevInfo,
  devPanelEnabled,
  themePrimaryColor,
  themeSecondaryColor,
  defaultPageSize,
  tokenStorageKey,
  userDataStorageKey,
  sessionTimeout,
  errorReportingEnabled,
  errorReportingUrl,
  maxErrorNotifications,
  showErrorStack,
  enablePerformanceMonitoring,
  enableReactDevtools,
  buildSourcemap,
  buildMinify,
  mode,
  baseUrl,
  isProd,
  isDev,
  isSSR,
  appMode,
  appCommand,
  nodeEnv,
} = config;
