import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { productApi } from '../../api/productApi.js';
import { useCartStore } from '../../stores/cartStore.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { phonePlaceholder, withImageFallback } from '../../utils/imageFallback.js';

export function ProductDetailPage() {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productApi
      .getById(id)
      .then((response) => {
        if (!mounted) return;
        const data = response.data;
        setProduct(data);
        // Chọn storage đầu tiên
        const firstStorage = data.versions?.[0]?.storage || null;
        setSelectedStorage(firstStorage);
        setSelectedVersionId(data.versions?.[0]?.versionId || null);
      })
      .catch((error) => setMessage(error.message || 'Không thể tải chi tiết sản phẩm'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  // Danh sách bộ nhớ không trùng lặp
  const uniqueStorages = useMemo(() => {
    if (!product?.versions) return [];
    const seen = new Set();
    return product.versions
      .filter((v) => {
        if (seen.has(v.storage)) return false;
        seen.add(v.storage);
        return true;
      })
      .map((v) => v.storage);
  }, [product]);

  // Các version theo storage đã chọn
  const colorVersions = useMemo(() => {
    if (!product?.versions || !selectedStorage) return [];
    return product.versions.filter((v) => v.storage === selectedStorage);
  }, [product, selectedStorage]);

  const selectedVersion = useMemo(
    () => product?.versions?.find((version) => version.versionId === selectedVersionId),
    [product, selectedVersionId],
  );

  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.imageUrls || [])].filter(Boolean);
  }, [product]);

  const handleSelectStorage = (storage) => {
    setSelectedStorage(storage);
    // Tự động chọn version đầu tiên của storage mới
    const firstVersion = product?.versions?.find((v) => v.storage === storage);
    if (firstVersion) {
      setSelectedVersionId(firstVersion.versionId);
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVersion) return;
    addItem({
      productId: product.id,
      versionId: selectedVersion.versionId,
      name: product.name,
      image: selectedVersion.imageUrl || product.image,
      colour: selectedVersion.colour,
      storage: selectedVersion.storage,
      price: Number(selectedVersion.price),
      quantity,
      stock: selectedVersion.stock,
    });
    setMessage('Đã thêm vào giỏ hàng');
  };

  if (loading) return <div className="page-section loading">Đang tải chi tiết...</div>;
  if (!product) return <div className="page-section form-message error">{message}</div>;

  return (
    <section className="page-section product-detail">
      <div className="detail-gallery">
        <img
          className="main-product-image"
          src={selectedVersion?.imageUrl || product.image || phonePlaceholder}
          alt={product.name}
          onError={withImageFallback}
        />
        <div className="thumbnail-row">
          {gallery.map((image) => (
            <img key={image} src={image} alt={product.name} onError={withImageFallback} />
          ))}
        </div>
      </div>

      <div className="detail-info">
        <p className="eyebrow">{product.brandName}</p>
        <h1>{product.name}</h1>
        <p className="detail-description">{product.description}</p>
        <strong className="detail-price">{formatCurrency(selectedVersion?.price)}</strong>

        {/* Chọn bộ nhớ */}
        {uniqueStorages.length > 0 && (
          <>
            <p className="version-section-label">Bộ nhớ</p>
            <div className="version-list">
              {uniqueStorages.map((storage) => (
                <button
                  key={storage}
                  className={storage === selectedStorage ? 'version-option active' : 'version-option'}
                  type="button"
                  onClick={() => handleSelectStorage(storage)}
                >
                  <span>{storage}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Chọn màu sắc */}
        {colorVersions.length > 0 && (
          <>
            <p className="version-section-label">Màu sắc</p>
            <div className="version-list">
              {colorVersions.map((version) => (
                <button
                  key={version.versionId}
                  className={version.versionId === selectedVersionId ? 'version-option active' : 'version-option'}
                  type="button"
                  onClick={() => {
                    setSelectedVersionId(version.versionId);
                    setQuantity(1);
                  }}
                >
                  <span>{version.colour}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="purchase-row">
          <div className="quantity-stepper">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus size={16} />
            </button>
            <input readOnly value={quantity} />
            <button
              type="button"
              onClick={() => setQuantity(Math.min(selectedVersion?.stock || 1, quantity + 1))}
            >
              <Plus size={16} />
            </button>
          </div>
          <button className="primary-button" type="button" onClick={handleAddToCart} disabled={!selectedVersion}>
            <ShoppingCart size={18} />
            Thêm vào giỏ
          </button>
        </div>
        <p className="stock-line">Còn lại: {selectedVersion?.stock ?? 0}</p>
        {message && <div className="form-message success">{message}</div>}
      </div>

      {product.specs && (
        <div className="spec-panel">
          <h2>Thông số kỹ thuật</h2>
          <dl>
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value || 'Đang cập nhật'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
