import { Link } from 'react-router-dom';
import { ShoppingCart, Flame, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { phonePlaceholder, resolveProductImage, withImageFallback } from '../../utils/imageFallback.js';

export function ProductCard({ product, isFlashSale = false, discountPercent = 0 }) {
  const imgSrc = resolveProductImage(product.image);
  const originalPrice = isFlashSale && discountPercent > 0 && product.minPrice 
    ? Math.round(product.minPrice * (1 + discountPercent / 100))
    : null;

  return (
    <article className={`product-card ${isFlashSale ? 'flash-card' : ''}`}>
      {isFlashSale && (
        <span className="badge-discount">
          <Flame size={12} /> -{discountPercent}%
        </span>
      )}
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={imgSrc} alt={product.name} onError={withImageFallback} loading="lazy" />
      </Link>
      <div className="product-card-body">
        <p className="product-meta">
          {product.brandName || 'Thương hiệu'} / {product.categoryName || 'Danh mục'}
        </p>
        <Link to={`/products/${product.id}`} className="product-name" title={product.name}>
          {product.name}
        </Link>
        
        <div className="product-card-bottom">
          <div className="price-block">
            <strong className="main-price">{formatCurrency(product.minPrice)}</strong>
            {originalPrice && (
              <span className="old-price">{formatCurrency(originalPrice)}</span>
            )}
          </div>
          <Link className="icon-button compact" to={`/products/${product.id}`} title="Xem chi tiết">
            <ShoppingCart size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

