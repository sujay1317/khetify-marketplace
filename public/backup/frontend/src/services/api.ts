// Khetify REST API Client — connects to .NET 10 Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    if (!this.token) this.token = localStorage.getItem('auth_token');
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }); }
  put<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }); }
  patch<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }

  async upload<T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers, body: formData });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }
}

export const apiClient = new ApiClient();

// ─── Auth ────────────────────────────────────────────
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; fullName: string; phone?: string; }
export interface AuthResponse { token: string; user: { id: string; email: string; role: string; fullName: string; }; }

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/auth/register', data),
  me: () => apiClient.get<AuthResponse['user']>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => apiClient.post('/auth/change-password', data),
};

// ─── Products ────────────────────────────────────────
export interface ProductDto {
  id: string; name: string; nameHi?: string; description?: string; descriptionHi?: string;
  price: number; originalPrice?: number; image?: string; category: string;
  stock: number; unit: string; sellerId: string; sellerName?: string;
  isOrganic: boolean; isApproved: boolean; isFeatured?: boolean;
  freeDelivery?: boolean; rating?: number; reviews?: number;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string; description?: string; price: number; originalPrice?: number;
  unit?: string; category: string; image?: string; isOrganic?: boolean; stock?: number;
}

export const productsApi = {
  getAll: (params?: { category?: string; approved?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.approved !== undefined) query.set('approved', String(params.approved));
    return apiClient.get<ProductDto[]>(`/products?${query}`);
  },
  getById: (id: string) => apiClient.get<ProductDto>(`/products/${id}`),
  getBySeller: (sellerId: string) => apiClient.get<ProductDto[]>(`/products/seller/${sellerId}`),
  getImages: (productId: string) => apiClient.get<{ id: string; imageUrl: string; displayOrder: number }[]>(`/products/${productId}/images`),
  create: (data: CreateProductRequest) => apiClient.post<ProductDto>('/products', data),
  update: (id: string, data: Partial<CreateProductRequest>) => apiClient.put<ProductDto>(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  approve: (id: string, approved: boolean) => apiClient.patch(`/products/${id}/approve`, { isApproved: approved }),
  getFeatured: () => apiClient.get<ProductDto[]>('/products/featured'),
};

// ─── Orders ──────────────────────────────────────────
export interface OrderDto {
  id: string; customerId: string; total: number; status: string;
  paymentMethod: string; shippingAddress: any; createdAt: string;
  items?: OrderItemDto[];
}
export interface OrderItemDto {
  id: string; orderId: string; productId?: string; productName: string;
  quantity: number; price: number; sellerId?: string; sellerName?: string;
}
export interface CreateOrderRequest {
  total: number; paymentMethod: string; shippingAddress: any;
  items: { productId: string; productName: string; quantity: number; price: number; sellerId: string }[];
}

export const ordersApi = {
  getAll: () => apiClient.get<OrderDto[]>('/orders'),
  getById: (id: string) => apiClient.get<OrderDto>(`/orders/${id}`),
  getMyOrders: () => apiClient.get<OrderDto[]>('/orders/my'),
  getSellerOrders: () => apiClient.get<OrderItemDto[]>('/orders/seller'),
  getOrderItems: (orderId: string) => apiClient.get<OrderItemDto[]>(`/orders/${orderId}/items`),
  create: (data: CreateOrderRequest) => apiClient.post<OrderDto>('/orders', data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/orders/${id}/status`, { status }),
};

// ─── Reviews ─────────────────────────────────────────
export interface ReviewDto {
  id: string; userId: string; productId: string; rating: number;
  comment?: string; createdAt: string; userName?: string;
}

export const reviewsApi = {
  getByProduct: (productId: string) => apiClient.get<ReviewDto[]>(`/reviews/product/${productId}`),
  create: (data: { productId: string; rating: number; comment?: string }) => apiClient.post<ReviewDto>('/reviews', data),
  update: (id: string, data: { rating: number; comment?: string }) => apiClient.put<ReviewDto>(`/reviews/${id}`, data),
  delete: (id: string) => apiClient.delete(`/reviews/${id}`),
};

// ─── Users / Profiles ────────────────────────────────
export interface ProfileDto {
  userId: string; fullName?: string; phone?: string; avatarUrl?: string;
  shopImage?: string; freeDelivery?: boolean;
}
export interface UserWithRoleDto {
  id: string; userId: string; role: string; createdAt: string;
  profile?: { fullName?: string; phone?: string };
}

export const usersApi = {
  getProfile: () => apiClient.get<ProfileDto>('/users/profile'),
  updateProfile: (data: { fullName?: string; phone?: string }) => apiClient.put('/users/profile', data),
  getAllUsers: () => apiClient.get<UserWithRoleDto[]>('/users'),
  updateRole: (userId: string, role: string) => apiClient.patch(`/users/${userId}/role`, { role }),
  getSellerPublicInfo: (sellerId: string) => apiClient.get<ProfileDto>(`/users/seller/${sellerId}/public`),
  getSellers: () => apiClient.get<ProfileDto[]>('/users/sellers'),
  createSeller: (data: { email: string; password: string; fullName: string; phone?: string; freeDelivery?: boolean }) => apiClient.post('/users/create-seller', data),
  changeUserPassword: (userId: string, newPassword: string) => apiClient.post('/users/change-password', { userId, newPassword }),
  deleteUser: (userId: string) => apiClient.delete(`/users/${userId}`),
};

// ─── Wishlist ────────────────────────────────────────
export interface WishlistItemDto { id: string; productId: string; createdAt: string; }

export const wishlistApi = {
  getAll: () => apiClient.get<WishlistItemDto[]>('/wishlist'),
  add: (productId: string) => apiClient.post<WishlistItemDto>('/wishlist', { productId }),
  remove: (id: string) => apiClient.delete(`/wishlist/${id}`),
};

// ─── Coupons ─────────────────────────────────────────
export interface CouponDto {
  id: string; code: string; discountType: string; discountValue: number;
  minOrderAmount?: number; maxUses?: number; usedCount?: number;
  isActive: boolean; validFrom?: string; validUntil?: string;
}

export const couponsApi = {
  getAll: () => apiClient.get<CouponDto[]>('/coupons'),
  create: (data: Partial<CouponDto>) => apiClient.post<CouponDto>('/coupons', data),
  update: (id: string, data: Partial<CouponDto>) => apiClient.put<CouponDto>(`/coupons/${id}`, data),
  toggle: (id: string) => apiClient.patch(`/coupons/${id}/toggle`),
  delete: (id: string) => apiClient.delete(`/coupons/${id}`),
  validate: (code: string, orderAmount: number) => apiClient.post<CouponDto>('/coupons/validate', { code, orderAmount }),
};

// ─── Notifications ───────────────────────────────────
export interface NotificationDto {
  id: string; title: string; message: string; type: string;
  isRead: boolean; orderId?: string; createdAt: string;
}

export const notificationsApi = {
  getAll: () => apiClient.get<NotificationDto[]>('/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

// ─── Forum ───────────────────────────────────────────
export interface ForumPostDto {
  id: string; userId: string; title: string; content: string; category: string;
  likesCount: number; commentsCount: number; isPinned: boolean;
  createdAt: string; userName?: string; userLiked?: boolean;
}
export interface ForumCommentDto {
  id: string; postId: string; userId: string; content: string;
  likesCount: number; createdAt: string; userName?: string;
}

export const forumApi = {
  getPosts: (params?: { category?: string; sortBy?: string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    return apiClient.get<ForumPostDto[]>(`/forum/posts?${query}`);
  },
  createPost: (data: { title: string; content: string; category: string }) => apiClient.post<ForumPostDto>('/forum/posts', data),
  deletePost: (id: string) => apiClient.delete(`/forum/posts/${id}`),
  getComments: (postId: string) => apiClient.get<ForumCommentDto[]>(`/forum/posts/${postId}/comments`),
  createComment: (postId: string, content: string) => apiClient.post<ForumCommentDto>(`/forum/posts/${postId}/comments`, { content }),
  toggleLike: (postId: string) => apiClient.post(`/forum/posts/${postId}/like`),
};

// ─── Upload ──────────────────────────────────────────
export const uploadApi = {
  productImage: (file: File) => apiClient.upload<{ url: string }>('/upload/product-image', file, 'image'),
  shopImage: (file: File) => apiClient.upload<{ url: string }>('/upload/shop-image', file, 'image'),
};
