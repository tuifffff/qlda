import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="site-footer-v2">
      <div className="footer-inner">
        <div className="footer-col footer-subscribe">
          <h3 className="footer-brand">Selling Phone</h3>
          <p className="footer-label">Đăng ký nhận tin</p>
          <p className="footer-desc">Nhận ưu đãi 10% cho đơn hàng đầu tiên</p>
          <form className="footer-email-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="submit" aria-label="Gửi">
              <Send size={18} />
            </button>
          </form>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <p>120 Yên Lãng, TP. Hà Nội</p>
          <p>sellingphone@gmail.com</p>
          <p>+84 123-456-789</p>
        </div>

        <div className="footer-col">
          <h4>Tài khoản</h4>
          <ul>
            <li><Link to="/profile">Tài khoản của tôi</Link></li>
            <li><Link to="/login">Đăng nhập / Đăng ký</Link></li>
            <li><Link to="/cart">Giỏ hàng</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Liên kết</h4>
          <ul>
            <li><Link to="/">Chính sách bảo mật</Link></li>
            <li><Link to="/">Điều khoản sử dụng</Link></li>
            <li><Link to="/">FAQ</Link></li>
            <li><Link to="/">Liên hệ</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Selling Phone. All rights reserved.</p>
      </div>
    </footer>
  );
}
