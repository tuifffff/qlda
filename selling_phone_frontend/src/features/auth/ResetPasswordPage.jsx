import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import authBanner from '../../assets/auth-banner.png';

export function ResetPasswordPage() {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    resetToken: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.verifyOtp({ email: form.email, otp: form.otp });
      setForm({ ...form, resetToken: response.data });
      setType('success');
      setMessage(response.message || 'OTP hợp lệ');
    } catch (error) {
      setType('error');
      setMessage(error.message || 'OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.resetPassword({
        email: form.email,
        resetToken: form.resetToken,
        newPassword: form.newPassword,
      });
      setType('success');
      setMessage(response.message || 'Đổi mật khẩu thành công');
    } catch (error) {
      setType('error');
      setMessage(error.message || 'Đổi mật khẩu thất bại');
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
          <form className="auth-form" onSubmit={resetPassword}>
            <h1>Đặt lại mật khẩu</h1>
            <p className="auth-subtitle">Nhập mã OTP và mật khẩu mới</p>

            {message && (
              <div className={type === 'success' ? 'auth-success' : 'auth-error'}>
                {message}
              </div>
            )}

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
            <div className="auth-field auth-field-inline">
              <input
                name="otp"
                type="text"
                placeholder="Mã OTP"
                value={form.otp}
                onChange={updateField}
                required
              />
              <button
                type="button"
                className="auth-verify-btn"
                onClick={verifyOtp}
                disabled={loading}
              >
                Xác thực
              </button>
            </div>
            <div className="auth-field">
              <input
                name="newPassword"
                type="password"
                placeholder="Mật khẩu mới"
                value={form.newPassword}
                onChange={updateField}
                required
                disabled={!form.resetToken}
              />
            </div>

            <div className="auth-actions">
              <button className="auth-submit-btn" type="submit" disabled={loading || !form.resetToken}>
                Đổi mật khẩu
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
