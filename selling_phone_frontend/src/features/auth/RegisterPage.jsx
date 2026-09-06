import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import authBanner from '../../assets/auth-banner.png';

export function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.register(form);
      setType('success');
      setMessage(response.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      setForm({ username: '', email: '', password: '' });
    } catch (error) {
      setType('error');
      setMessage(error.message || 'Đăng ký thất bại');
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
            <h1>Tạo tài khoản</h1>
            <p className="auth-subtitle">Nhập thông tin để đăng ký</p>

            {message && (
              <div className={type === 'success' ? 'auth-success' : 'auth-error'}>
                {message}
              </div>
            )}

            <div className="auth-field">
              <input
                name="username"
                type="text"
                placeholder="Tên đăng nhập"
                value={form.username}
                onChange={updateField}
                required
              />
            </div>
            <div className="auth-field">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
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
                {loading ? 'Đang tạo...' : 'Đăng Ký'}
              </button>
            </div>

            <div className="auth-switch">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
