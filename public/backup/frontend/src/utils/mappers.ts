import { ProductDto } from '@/services/api';
import { Product } from '@/contexts/CartContext';

/**
 * Maps a .NET backend ProductDto to the frontend Product type.
 * Use this helper everywhere products are fetched from the API.
 */
export function mapProductDto(dto: ProductDto, sellerFreeDelivery = false): Product {
  return {
    id: dto.id,
    name: dto.name,
    nameHi: dto.nameHi || dto.name,
    nameMr: dto.nameHi || dto.name,
    description: dto.description || '',
    price: dto.price,
    originalPrice: dto.originalPrice || undefined,
    image: dto.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
    category: dto.category,
    stock: dto.stock,
    unit: dto.unit,
    sellerId: dto.sellerId,
    sellerName: dto.sellerName || 'Unknown Seller',
    rating: dto.averageRating,
    reviews: dto.reviewCount,
    isOrganic: dto.isOrganic,
    isFeatured: false,
    freeDelivery: sellerFreeDelivery,
  };
}

/**
 * Maps an array of ProductDto to Product[]
 */
export function mapProductDtos(dtos: ProductDto[], sellerFreeDeliveryMap?: Record<string, boolean>): Product[] {
  return dtos.map(dto => mapProductDto(dto, sellerFreeDeliveryMap?.[dto.sellerId] || false));
}
