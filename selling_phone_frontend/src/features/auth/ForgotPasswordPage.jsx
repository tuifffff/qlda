import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import authBanner from '../../assets/auth-banner.png';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authApi.forgotPassword({ email });
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      setMessage(error.message || 'Không thể gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-banner">
          <img src={authBanner} alt="Shopping illustration" />
        </div>
        <div className="auth-form-side">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h1>Quên mật khẩu</h1>
            <p className="auth-subtitle">Nhập email để nhận mã OTP khôi phục mật khẩu</p>

            {message && <div className="auth-error">{message}</div>}

            <div className="auth-field">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="auth-actions">
              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi OTP'}
              </button>
            </div>

            <div className="auth-switch">
              Quay lại <Link to="/login">Đăng nhập</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
