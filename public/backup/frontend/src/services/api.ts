// Khetify REST API Client — connects to .NET 10 Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

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
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
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
// Backend /auth/me now returns { id, email, role }
export interface AuthMeResponse { id: string; email: string; role: string; }

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/auth/register', data),
  me: () => apiClient.get<AuthMeResponse>('/auth/me'),
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

// Backend supports: ?category, ?search, ?isOrganic, ?sort, ?page, ?pageSize
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; isOrganic?: boolean; sort?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.isOrganic !== undefined) query.set('isOrganic', String(params.isOrganic));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    return apiClient.get<ProductDto[]>(`/products?${query}`);
  },
  getById: (id: string) => apiClient.get<ProductDto>(`/products/${id}`),
  getBySeller: (sellerId: string) => apiClient.get<ProductDto[]>(`/products/seller/${sellerId}`),
  getMyProducts: () => apiClient.get<ProductDto[]>('/products/my-products'),
  getPending: () => apiClient.get<ProductDto[]>('/products/pending'),
  create: (data: CreateProductRequest) => apiClient.post<ProductDto>('/products', data),
  update: (id: string, data: Partial<CreateProductRequest>) => apiClient.put<ProductDto>(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  // Backend uses POST not PATCH for approve
  approve: (id: string) => apiClient.post(`/products/${id}/approve`),
  // Upload image to specific product (returns image record)
  uploadImage: (productId: string, file: File, displayOrder = 0) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    const token = apiClient.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_URL}/products/${productId}/images?displayOrder=${displayOrder}`, {
      method: 'POST', headers, body: formData,
    }).then(r => r.json());
  },
  deleteImage: (imageId: string) => apiClient.delete(`/products/images/${imageId}`),
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

export interface SellerOrderReportDto {
  totalOrders: number;
  totalRevenue: number;
  dailyReports: DailyReportDto[];
}
export interface DailyReportDto {
  date: string;
  orderCount: number;
  totalRevenue: number;
  orders: SellerReportOrderDto[];
}
export interface SellerReportOrderDto {
  id: string;
  customerName: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItemDto[];
}

export const ordersApi = {
  // Admin: get all orders
  getAll: () => apiClient.get<OrderDto[]>('/orders/all'),
  getById: (id: string) => apiClient.get<OrderDto>(`/orders/${id}`),
  // Customer: get my orders
  getMyOrders: () => apiClient.get<OrderDto[]>('/orders/my-orders'),
  // Seller: get seller orders
  getSellerOrders: () => apiClient.get<OrderItemDto[]>('/orders/seller-orders'),
  create: (data: CreateOrderRequest) => apiClient.post<OrderDto>('/orders', data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/orders/${id}/status`, { status }),
  addTracking: (id: string, data: { status: string; description?: string }) => apiClient.post(`/orders/${id}/tracking`, data),
  // Admin: seller order report
  getSellerOrderReport: (sellerId: string, date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiClient.get<SellerOrderReportDto>(`/orders/seller/${sellerId}/report${query}`);
  },
  getOrderItems: (orderId: string) => apiClient.get<OrderItemDto[]>(`/orders/${orderId}/items`),
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
  uploadAvatar: (file: File) => apiClient.upload<ProfileDto>('/users/profile/avatar', file, 'file'),
  uploadShopImage: (file: File) => apiClient.upload<ProfileDto>('/users/profile/shop-image', file, 'file'),
  // Public endpoints
  getSellerPublicInfo: (sellerId: string) => apiClient.get<ProfileDto>(`/users/sellers/${sellerId}`),
  getSellers: () => apiClient.get<ProfileDto[]>('/users/sellers'),
  // Admin endpoints
  getAllUsers: () => apiClient.get<UserWithRoleDto[]>('/users/admin/all'),
  createSeller: (data: { email: string; password: string; fullName: string; phone?: string; freeDelivery?: boolean }) => apiClient.post('/users/admin/create-seller', data),
  changeUserPassword: (data: { userId: string; newPassword: string }) => apiClient.post('/users/admin/update-password', data),
  deleteUser: (userId: string) => apiClient.delete(`/users/admin/${userId}`),
};

// ─── Wishlist ────────────────────────────────────────
// Backend uses productId as route param, not request body
export interface WishlistItemDto { id: string; productId: string; createdAt: string; }

export const wishlistApi = {
  getAll: () => apiClient.get<WishlistItemDto[]>('/wishlist'),
  add: (productId: string) => apiClient.post<WishlistItemDto>(`/wishlist/${productId}`),
  // Backend DELETE uses productId, not wishlist item id
  remove: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
};

// ─── Coupons ─────────────────────────────────────────
export interface CouponDto {
  id: string; code: string; discountType: string; discountValue: number;
  minOrderAmount?: number; maxUses?: number; usedCount?: number;
  isActive: boolean; validFrom?: string; validUntil?: string;
}

export const couponsApi = {
  // Admin: get all coupons
  getAll: () => apiClient.get<CouponDto[]>('/coupons'),
  // Public: get active coupons
  getActive: () => apiClient.get<CouponDto[]>('/coupons/active'),
  create: (data: Partial<CouponDto>) => apiClient.post<CouponDto>('/coupons', data),
  update: (id: string, data: Partial<CouponDto>) => apiClient.put<CouponDto>(`/coupons/${id}`, data),
  delete: (id: string) => apiClient.delete(`/coupons/${id}`),
  validate: (code: string, orderAmount: number) => apiClient.post<CouponDto>('/coupons/validate', { code, orderAmount }),
  // Note: No toggle endpoint on backend — use update with isActive field instead
};

// ─── Notifications ───────────────────────────────────
export interface NotificationDto {
  id: string; title: string; message: string; type: string;
  isRead: boolean; orderId?: string; createdAt: string;
}

export const notificationsApi = {
  getAll: () => apiClient.get<NotificationDto[]>('/notifications'),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
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
  getPosts: (params?: { category?: string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    return apiClient.get<ForumPostDto[]>(`/forum/posts?${query}`);
  },
  getPost: (id: string) => apiClient.get<ForumPostDto>(`/forum/posts/${id}`),
  createPost: (data: { title: string; content: string; category: string }) => apiClient.post<ForumPostDto>('/forum/posts', data),
  updatePost: (id: string, data: { title?: string; content?: string; category?: string }) => apiClient.put<ForumPostDto>(`/forum/posts/${id}`, data),
  deletePost: (id: string) => apiClient.delete(`/forum/posts/${id}`),
  togglePin: (id: string) => apiClient.post(`/forum/posts/${id}/pin`),
  // Comments
  getComments: (postId: string) => apiClient.get<ForumCommentDto[]>(`/forum/posts/${postId}/comments`),
  createComment: (postId: string, content: string) => apiClient.post<ForumCommentDto>(`/forum/posts/${postId}/comments`, { content }),
  updateComment: (id: string, content: string) => apiClient.put<ForumCommentDto>(`/forum/comments/${id}`, { content }),
  deleteComment: (id: string) => apiClient.delete(`/forum/comments/${id}`),
  // Likes
  togglePostLike: (postId: string) => apiClient.post(`/forum/posts/${postId}/like`),
  toggleCommentLike: (commentId: string) => apiClient.post(`/forum/comments/${commentId}/like`),
};

// ─── Upload ──────────────────────────────────────────
export const uploadApi = {
  productImage: (file: File) => apiClient.upload<{ url: string }>('/upload/product-image', file, 'file'),
  shopImage: (file: File) => apiClient.upload<{ url: string }>('/upload/shop-image', file, 'file'),
};
