import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { useAuthStore } from '../../stores/authStore.js';
import authBanner from '../../assets/auth-banner.png';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.login(form);
      setAuth(response.data);
      navigate('/');
    } catch (error) {
      setMessage(error.message || 'Dang nhap that bai');
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
            <h1>Đăng nhập vào Selling Phone</h1>
            <p className="auth-subtitle">Nhập thông tin tài khoản của bạn</p>

            {message && <div className="auth-error">{message}</div>}

            <div className="auth-field">
              <input
                name="username"
                type="text"
                placeholder="Email hoặc tên đăng nhập"
                value={form.username}
                onChange={updateField}
                required
              />
            </div>
            <div className="auth-field">
              <input
                name="password"
                type="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={updateField}
                required
              />
            </div>

            <div className="auth-actions">
              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </button>
              <Link to="/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
            </div>

            <div className="auth-switch">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
