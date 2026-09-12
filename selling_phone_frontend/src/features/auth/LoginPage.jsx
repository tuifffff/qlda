import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { useAuthStore } from '../../stores/authStore.js';
import authBanner from '../../assets/auth-banner.png';

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMsgType('success');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

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
      setMsgType('error');
      setMessage(error.message || 'Đăng nhập thất bại');
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

            {message && (
              <div className={msgType === 'success' ? 'auth-success' : 'auth-error'}>
                {message}
              </div>
            )}

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
            <div className="auth-field auth-field-password">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={form.password}
                onChange={updateField}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
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
