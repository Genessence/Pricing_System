// API service for QuoteFlow Pro Backend
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(username, password, userType) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        userType
      }),
    });

    // Store tokens
    this.setToken(response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('userType', userType);

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      this.setToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    }
  }

  // User endpoints
  async getCurrentUser() {
    return await this.request('/users/me');
  }

  // ERP Items endpoints
  async searchERPItems(query, category = null, limit = 20) {
    const params = new URLSearchParams({ q: query, limit });
    if (category) params.append('category', category);
    
    return await this.request(`/erp-items/search?${params}`);
  }

  async getERPItems(skip = 0, limit = 100, category = null, isActive = true) {
    const params = new URLSearchParams({ skip, limit, isActive });
    if (category) params.append('category', category);
    
    return await this.request(`/erp-items/?${params}`);
  }

  async createERPItem(itemData) {
    return await this.request('/erp-items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async getERPItem(itemId) {
    return await this.request(`/erp-items/${itemId}`);
  }

  // RFQ endpoints
  async getRFQs(skip = 0, limit = 100, status = null, commodityType = null) {
    const params = new URLSearchParams({ skip, limit });
    if (status) params.append('status', status);
    if (commodityType) params.append('commodity_type', commodityType);
    
    return await this.request(`/rfqs/?${params}`);
  }

  async getRFQ(rfqId) {
    return await this.request(`/rfqs/${rfqId}`);
  }

  async createRFQ(rfqData) {
    return await this.request('/rfqs/', {
      method: 'POST',
      body: JSON.stringify(rfqData),
    });
  }

  async updateRFQ(rfqId, rfqData) {
    return await this.request(`/rfqs/${rfqId}`, {
      method: 'PUT',
      body: JSON.stringify(rfqData),
    });
  }

  async deleteRFQ(rfqId) {
    return await this.request(`/rfqs/${rfqId}`, {
      method: 'DELETE',
    });
  }

  async approveRFQ(rfqId, comments) {
    return await this.request(`/rfqs/${rfqId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
