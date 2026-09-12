import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bannerApi } from '../../api/bannerApi.js';

const defaultSlides = [
  {
    id: 'default-1',
    subtitle: 'Siêu phẩm 2024',
    title: 'iPhone 15 Pro Max',
    desc: 'Chip A17 Pro · Camera 48MP · Khung Titan siêu nhẹ · Pin cả ngày dài',
    cta: 'Khám phá ngay',
    linkUrl: '/?search=iPhone%2015%20Pro%20Max',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  {
    id: 'default-2',
    subtitle: 'Galaxy AI — Kỷ nguyên mới',
    title: 'Samsung Galaxy S24 Ultra',
    desc: 'Snapdragon 8 Gen 3 · S Pen tích hợp · Camera AI 200MP',
    cta: 'Mua ngay',
    linkUrl: '/?search=Samsung%20Galaxy%20S24%20Ultra',
    gradient: 'linear-gradient(135deg, #1a002e 0%, #3d1259 50%, #5b2c8e 100%)',
  },
  {
    id: 'default-3',
    subtitle: 'Ưu đãi lên đến 25%',
    title: 'Flash Sale Cuối Tuần',
    desc: 'Giảm giá toàn bộ sản phẩm. Số lượng có hạn. Nhanh tay kẻo lỡ!',
    cta: 'Xem ưu đãi',
    linkUrl: '/',
    gradient: 'linear-gradient(135deg, #2d0a0a 0%, #7c1d1d 50%, #db4444 100%)',
  },
];

export function Banner() {
  const [slides, setSlides] = useState(defaultSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerApi.getActive();
        const bannerList = response?.data || response;
        if (Array.isArray(bannerList) && bannerList.length > 0) {
          const formatted = bannerList.map((b) => {
            let parsedLink = b.linkUrl || b.linkURL || b.link_url || '/';
            parsedLink = parsedLink.trim();

            // If it's an absolute URL but points to our own domain, strip the origin
            try {
              if (parsedLink.startsWith('http')) {
                const urlObj = new URL(parsedLink);
                if (urlObj.origin === window.location.origin) {
                  parsedLink = urlObj.pathname + urlObj.search + urlObj.hash;
                }
              }
            } catch (e) {
              // ignore invalid URLs
            }
            
            // Normalize product link if it's just an ID or uses singular 'product/'
            if (/^\d+$/.test(parsedLink)) {
              parsedLink = `/products/${parsedLink}`;
            } else {
              if (parsedLink.includes('/product/')) {
                parsedLink = parsedLink.replace('/product/', '/products/');
              } else if (parsedLink.startsWith('product/')) {
                parsedLink = `/${parsedLink.replace('product/', 'products/')}`;
              }

              if (!parsedLink.startsWith('/') && !parsedLink.startsWith('http')) {
                parsedLink = `/${parsedLink}`;
              }
            }

            return {
              id: b.id,
              imageUrl: b.imageUrl || b.imageURL || b.image_url,
              linkUrl: parsedLink,
              title: b.title || '',
              subtitle: b.subtitle || '',
              desc: b.desc || b.description || '',
              cta: b.cta || (b.title ? 'Xem ngay' : ''),
            };
          });
          setSlides(formatted);
          setCurrent(0);
        }
      } catch (err) {
        console.error('Failed to load active banners from DB:', err);
      }
    };

    fetchBanners();
  }, []);

  const next = useCallback(() => {
    setSlides((prevSlides) => {
      if (prevSlides.length === 0) return prevSlides;
      setCurrent((prev) => (prev + 1) % prevSlides.length);
      return prevSlides;
    });
  }, []);

  const prev = useCallback(() => {
    setSlides((prevSlides) => {
      if (prevSlides.length === 0) return prevSlides;
      setCurrent((prev) => (prev - 1 + prevSlides.length) % prevSlides.length);
      return prevSlides;
    });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className="bn">
      <div className="bn-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, index) => {
          const isExternal = slide.linkUrl?.startsWith('http://') || slide.linkUrl?.startsWith('https://');

          const renderSlideBody = () => (
            <>
              {slide.imageUrl ? (
                <div className="bn-img-container">
                  <img src={slide.imageUrl} alt={slide.title || `Banner ${index + 1}`} className="bn-img" />
                  {(slide.title || slide.desc || slide.subtitle) && (
                    <div className="bn-slide-inner bn-overlay">
                      {slide.subtitle && <span className="bn-tag">{slide.subtitle}</span>}
                      {slide.title && <h2 className="bn-heading">{slide.title}</h2>}
                      {slide.desc && <p className="bn-desc">{slide.desc}</p>}
                      {slide.cta && <span className="bn-cta">{slide.cta}</span>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bn-slide-inner">
                  {slide.subtitle && <span className="bn-tag">{slide.subtitle}</span>}
                  {slide.title && <h2 className="bn-heading">{slide.title}</h2>}
                  {slide.desc && <p className="bn-desc">{slide.desc}</p>}
                  {slide.cta && <span className="bn-cta">{slide.cta}</span>}
                </div>
              )}
            </>
          );

          const slideStyle = slide.gradient
            ? { background: slide.gradient }
            : { background: '#111' };

          return (
            <div
              key={slide.id || index}
              className={`bn-slide ${slide.imageUrl ? 'has-image' : ''}`}
              style={slideStyle}
            >
              {slide.linkUrl && slide.linkUrl !== '#' ? (
                isExternal ? (
                  <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="bn-slide-link">
                    {renderSlideBody()}
                  </a>
                ) : (
                  <Link to={slide.linkUrl} className="bn-slide-link">
                    {renderSlideBody()}
                  </Link>
                )
              ) : (
                renderSlideBody()
              )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button className="bn-arrow bn-prev" onClick={prev} aria-label="Slide trước">
            <ChevronLeft size={24} />
          </button>
          <button className="bn-arrow bn-next" onClick={next} aria-label="Slide tiếp">
            <ChevronRight size={24} />
          </button>

          <div className="bn-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`bn-dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
