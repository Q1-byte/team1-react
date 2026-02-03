import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  // 소셜 로그인 핸들러 (나중에 백엔드 연동)
  const handleSocialLogin = (provider) => {
    alert(`${provider} 로그인은 백엔드 연동 후 사용 가능합니다.`);
    // TODO: 백엔드 OAuth URL로 리다이렉트
    // window.location.href = `/api/oauth2/authorization/${provider}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">여행 계획을 시작하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <span className="social-icon">💬</span>
            카카오로 시작하기
          </button>

          <button
            type="button"
            className="social-btn google"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <span className="social-icon">G</span>
            구글로 시작하기
          </button>
        </div>

        <div className="auth-links">
          <Link to="/register" className="link">회원가입</Link>
          <span className="divider">|</span>
          <Link to="/find-password" className="link">비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
