import { type ProductDto } from '@/services/api';
import { type Product } from '@/contexts/CartContext';

export const mapProductDtoToProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  name: dto.name,
  nameHi: dto.nameHi || dto.name,
  nameMr: dto.nameHi || dto.name,
  description: dto.description || '',
  price: dto.price,
  originalPrice: dto.originalPrice,
  image: dto.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
  category: dto.category,
  stock: dto.stock || 0,
  unit: dto.unit || 'kg',
  sellerId: dto.sellerId,
  sellerName: dto.sellerName || 'Unknown Seller',
  rating: dto.rating || 0,
  reviews: dto.reviews || 0,
  isOrganic: dto.isOrganic || false,
  isFeatured: dto.isFeatured || false,
  freeDelivery: dto.freeDelivery || false,
});
