import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.successMessage || '';

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate('/'); // 로그인 성공 시 메인 페이지로
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = (provider) => {
    // 백엔드 OAuth2 URL로 리다이렉트
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <div className="auth-page-wrapper">
      <Header />
      <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">여행 계획을 시작하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="divider-section">
          <span className="divider-text">또는</span>
        </div>

        <div className="social-login-section">
          <button
            type="button"
            className="social-btn kakao"
            onClick={() => handleSocialLogin('kakao')}
            disabled={loading}
          >
            <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 3C6.48 3 2 6.58 2 11.15c0 2.92 1.94 5.5 4.86 6.96-.21.76-.78 2.75-.89 3.18-.14.55.2.54.42.39.17-.12 2.71-1.84 3.81-2.59.59.09 1.19.13 1.8.13 5.52 0 10-4.08 10-8.07C22 6.58 17.52 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>

          <button
            type="button"
            className="social-btn google"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" className="social-icon" />
            구글로 로그인
          </button>
        </div>

        <div className="auth-links">
          <Link to="/register" className="link">회원가입</Link>
          <span className="divider">|</span>
          <Link to="/find-password" className="link">비밀번호 찾기</Link>
        </div>
      </div>
    </div>
      <Footer />
    </div>
  );
}

export default Login;