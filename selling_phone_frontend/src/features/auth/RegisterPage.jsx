import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import authBanner from '../../assets/auth-banner.png';

// Che bớt email: te***@gmail.com
function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length <= 2 ? local : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

// SVG icon con mắt
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

export function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setType('error');
      setMessage('Mật khẩu nhập lại không khớp.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setType('success');
      setMessage(response.message || 'Mã OTP đã được gửi đến email của bạn.');
      setStep('otp');
      setCountdown(300);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setType('error');
      setMessage(error.message || 'Gửi mã OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;
    const digits = pastedData.split('');
    setOtp(digits);
    otpRefs.current[5]?.focus();
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setType('error');
      setMessage('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.registerVerify({
        email: form.email,
        otp: otpString,
      });
      setType('success');
      setMessage(response.message || 'Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' },
        });
      }, 2000);
    } catch (error) {
      setType('error');
      setMessage(error.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setType('success');
      setMessage(response.message || 'Mã OTP mới đã được gửi đến email của bạn.');
      setCountdown(300);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setType('error');
      setMessage(error.message || 'Gửi lại mã OTP thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setMessage('');
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
  };

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-banner">
          <img src={authBanner} alt="Shopping illustration" />
        </div>
        <div className="auth-form-side">
          {step === 'form' && (
            <form className="auth-form register-step-animate" onSubmit={handleSendOtp}>
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
              <div className="auth-field auth-field-password">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="auth-actions">
                <button className="auth-submit-btn" type="submit" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Nhận mã OTP'}
                </button>
              </div>

              <div className="auth-switch">
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form className="auth-form register-step-animate" onSubmit={handleVerifyOtp}>
              <button
                type="button"
                className="otp-back-btn"
                onClick={handleBackToForm}
                title="Quay lại"
              >
                ← Quay lại
              </button>

              <h1>Xác thực OTP</h1>
              <p className="auth-subtitle">
                Nhập mã 6 chữ số đã gửi đến <strong>{maskEmail(form.email)}</strong>
              </p>

              {message && (
                <div className={type === 'success' ? 'auth-success' : 'auth-error'}>
                  {message}
                </div>
              )}

              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-digit-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {countdown > 0 && (
                <p className="otp-countdown">
                  Mã có hiệu lực trong <strong>{formatCountdown(countdown)}</strong>
                </p>
              )}

              <div className="auth-actions otp-actions">
                <button className="auth-submit-btn" type="submit" disabled={loading}>
                  {loading ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>

              <div className="otp-resend">
                {countdown > 0 ? (
                  <span className="otp-resend-disabled">
                    Gửi lại mã sau {formatCountdown(countdown)}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
