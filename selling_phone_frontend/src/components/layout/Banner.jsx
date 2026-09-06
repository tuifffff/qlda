import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    subtitle: 'Siêu phẩm 2024',
    title: 'iPhone 15 Pro Max',
    desc: 'Chip A17 Pro · Camera 48MP · Khung Titan siêu nhẹ · Pin cả ngày dài',
    cta: 'Khám phá ngay',
    link: '/',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  {
    id: 2,
    subtitle: 'Galaxy AI — Kỷ nguyên mới',
    title: 'Samsung Galaxy S24 Ultra',
    desc: 'Snapdragon 8 Gen 3 · S Pen tích hợp · Camera AI 200MP',
    cta: 'Mua ngay',
    link: '/',
    gradient: 'linear-gradient(135deg, #1a002e 0%, #3d1259 50%, #5b2c8e 100%)',
  },
  {
    id: 3,
    subtitle: 'Ưu đãi lên đến 25%',
    title: 'Flash Sale Cuối Tuần',
    desc: 'Giảm giá toàn bộ sản phẩm. Số lượng có hạn. Nhanh tay kẻo lỡ!',
    cta: 'Xem ưu đãi',
    link: '/',
    gradient: 'linear-gradient(135deg, #2d0a0a 0%, #7c1d1d 50%, #db4444 100%)',
  },
];

export function Banner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="bn">
      <div className="bn-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="bn-slide" style={{ background: slide.gradient }}>
            <div className="bn-slide-inner">
              <span className="bn-tag">{slide.subtitle}</span>
              <h2 className="bn-heading">{slide.title}</h2>
              <p className="bn-desc">{slide.desc}</p>
              <Link to={slide.link} className="bn-cta">{slide.cta}</Link>
            </div>
          </div>
        ))}
      </div>

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
    </section>
  );
}
