// ============================================================
// API Service Layer for .NET Backend
// Replaces all Supabase SDK calls with REST API calls
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('khetify_token', token);
    } else {
      localStorage.removeItem('khetify_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('khetify_token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    if (response.status === 204) return null as T;
    return response.json();
  }

  get<T>(path: string) { return this.request<T>(path); }
  
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }
  
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }
  
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  }
  
  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T>(path: string, file: File, fieldName = 'file'): Promise<T> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// ===== Auth API =====
export const authApi = {
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),

  resetPassword: (email: string) =>
    apiClient.post('/auth/reset-password', { email }),

  getMe: () => apiClient.get<{ id: string; role: string }>('/auth/me'),
};

// ===== Products API =====
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; isOrganic?: boolean; sort?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.isOrganic !== undefined) query.set('isOrganic', String(params.isOrganic));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    return apiClient.get<PaginatedResult<ProductDto>>(`/products?${query}`);
  },

  getById: (id: string) => apiClient.get<ProductDto>(`/products/${id}`),

  getSellerProducts: (sellerId: string) => apiClient.get<ProductDto[]>(`/products/seller/${sellerId}`),

  getMyProducts: () => apiClient.get<ProductDto[]>('/products/my-products'),

  getPending: () => apiClient.get<ProductDto[]>('/products/pending'),

  create: (data: CreateProductDto) => apiClient.post<ProductDto>('/products', data),

  update: (id: string, data: Partial<CreateProductDto & { isApproved?: boolean }>) =>
    apiClient.put<ProductDto>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/products/${id}`),

  approve: (id: string) => apiClient.post<ProductDto>(`/products/${id}/approve`),

  uploadImage: (productId: string, file: File, displayOrder = 0) =>
    apiClient.upload<{ id: string; imageUrl: string; displayOrder: number }>(
      `/products/${productId}/images?displayOrder=${displayOrder}`, file
    ),

  deleteImage: (imageId: string) => apiClient.delete(`/products/images/${imageId}`),
};

// ===== Orders API =====
export const ordersApi = {
  create: (data: CreateOrderDto) => apiClient.post<OrderDto>('/orders', data),

  getById: (id: string) => apiClient.get<OrderDto>(`/orders/${id}`),

  getMyOrders: () => apiClient.get<OrderDto[]>('/orders/my-orders'),

  getSellerOrders: () => apiClient.get<OrderDto[]>('/orders/seller-orders'),

  getAll: () => apiClient.get<OrderDto[]>('/orders/all'),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<OrderDto>(`/orders/${id}/status`, { status }),

  addTracking: (id: string, data: { status: string; description?: string }) =>
    apiClient.post(`/orders/${id}/tracking`, data),
};

// ===== Users API =====
export const usersApi = {
  getProfile: () => apiClient.get<ProfileDto>('/users/profile'),

  updateProfile: (data: Partial<ProfileDto>) => apiClient.put<ProfileDto>('/users/profile', data),

  uploadAvatar: (file: File) => apiClient.upload<ProfileDto>('/users/profile/avatar', file),

  uploadShopImage: (file: File) => apiClient.upload<ProfileDto>('/users/profile/shop-image', file),

  getSellers: () => apiClient.get<ProfileDto[]>('/users/sellers'),

  getSellerInfo: (sellerId: string) => apiClient.get<ProfileDto>(`/users/sellers/${sellerId}`),

  // Admin
  getAllUsers: () => apiClient.get<AdminUserDto[]>('/users/admin/all'),

  createSeller: (data: { email: string; password: string; fullName: string; phone?: string; freeDelivery: boolean }) =>
    apiClient.post<AdminUserDto>('/users/admin/create-seller', data),

  updateUserPassword: (userId: string, newPassword: string) =>
    apiClient.post('/users/admin/update-password', { userId, newPassword }),

  deleteUser: (userId: string) => apiClient.delete(`/users/admin/${userId}`),
};

// ===== Reviews API =====
export const reviewsApi = {
  getProductReviews: (productId: string) =>
    apiClient.get<ReviewDto[]>(`/reviews/product/${productId}`),

  create: (data: { productId: string; rating: number; comment?: string }) =>
    apiClient.post<ReviewDto>('/reviews', data),

  update: (id: string, data: { rating?: number; comment?: string }) =>
    apiClient.put<ReviewDto>(`/reviews/${id}`, data),

  delete: (id: string) => apiClient.delete(`/reviews/${id}`),
};

// ===== Wishlist API =====
export const wishlistApi = {
  getAll: () => apiClient.get<WishlistItemDto[]>('/wishlist'),
  add: (productId: string) => apiClient.post<WishlistItemDto>(`/wishlist/${productId}`),
  remove: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
};

// ===== Coupons API =====
export const couponsApi = {
  getActive: () => apiClient.get<CouponDto[]>('/coupons/active'),
  getAll: () => apiClient.get<CouponDto[]>('/coupons'),
  create: (data: CreateCouponDto) => apiClient.post<CouponDto>('/coupons', data),
  update: (id: string, data: Partial<CreateCouponDto & { isActive?: boolean }>) =>
    apiClient.put<CouponDto>(`/coupons/${id}`, data),
  delete: (id: string) => apiClient.delete(`/coupons/${id}`),
  validate: (code: string, orderTotal: number) =>
    apiClient.post<CouponValidationResult>('/coupons/validate', { code, orderTotal }),
};

// ===== Notifications API =====
export const notificationsApi = {
  getAll: () => apiClient.get<NotificationDto[]>('/notifications'),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
};

// ===== Forum API =====
export const forumApi = {
  getPosts: (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return apiClient.get<ForumPostDto[]>(`/forum/posts${query}`);
  },
  getPost: (id: string) => apiClient.get<ForumPostDto>(`/forum/posts/${id}`),
  createPost: (data: { title: string; content: string; category: string }) =>
    apiClient.post<ForumPostDto>('/forum/posts', data),
  updatePost: (id: string, data: { title?: string; content?: string; category?: string }) =>
    apiClient.put<ForumPostDto>(`/forum/posts/${id}`, data),
  deletePost: (id: string) => apiClient.delete(`/forum/posts/${id}`),
  togglePin: (id: string) => apiClient.post(`/forum/posts/${id}/pin`),

  getComments: (postId: string) => apiClient.get<ForumCommentDto[]>(`/forum/posts/${postId}/comments`),
  createComment: (postId: string, content: string) =>
    apiClient.post<ForumCommentDto>(`/forum/posts/${postId}/comments`, { content }),
  updateComment: (id: string, content: string) =>
    apiClient.put<ForumCommentDto>(`/forum/comments/${id}`, { content }),
  deleteComment: (id: string) => apiClient.delete(`/forum/comments/${id}`),

  togglePostLike: (postId: string) => apiClient.post(`/forum/posts/${postId}/like`),
  toggleCommentLike: (commentId: string) => apiClient.post(`/forum/comments/${commentId}/like`),
};

// ===== File Upload API =====
export const uploadApi = {
  productImage: (file: File) => apiClient.upload<{ url: string }>('/upload/product-image', file),
  shopImage: (file: File) => apiClient.upload<{ url: string }>('/upload/shop-image', file),
};

// ===== Types =====
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string | null;
  };
}

export interface ProfileDto {
  userId: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  shopImage: string | null;
  freeDelivery: boolean;
  email: string | null;
  role: string | null;
}

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface ProductDto {
  id: string;
  sellerId: string;
  name: string;
  nameHi: string | null;
  description: string | null;
  descriptionHi: string | null;
  price: number;
  originalPrice: number | null;
  category: string;
  image: string | null;
  unit: string;
  stock: number;
  isOrganic: boolean;
  isApproved: boolean;
  sellerName: string | null;
  averageRating: number;
  reviewCount: number;
  images: { id: string; imageUrl: string; displayOrder: number }[];
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  nameHi?: string;
  description?: string;
  descriptionHi?: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  unit: string;
  stock: number;
  isOrganic: boolean;
}

export interface OrderDto {
  id: string;
  customerId: string;
  customerName: string | null;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: any;
  items: OrderItemDto[];
  tracking: OrderTrackingDto[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string | null;
  sellerId: string | null;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderTrackingDto {
  id: string;
  status: string;
  description: string | null;
  createdAt: string;
}

export interface CreateOrderDto {
  total: number;
  paymentMethod: string;
  shippingAddress: any;
  items: {
    productId?: string;
    sellerId?: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export interface ReviewDto {
  id: string;
  userId: string;
  userName: string | null;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface WishlistItemDto {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image: string | null;
  createdAt: string;
}

export interface CouponDto {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
}

export interface CreateCouponDto {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string | null;
  discountAmount: number;
  coupon: CouponDto | null;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ForumPostDto {
  id: string;
  userId: string;
  userName: string | null;
  title: string;
  content: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface ForumCommentDto {
  id: string;
  postId: string;
  userId: string;
  userName: string | null;
  content: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
