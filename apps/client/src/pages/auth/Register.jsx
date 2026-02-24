import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Auth.css';

// 여행 성향 키워드 목록
const TRAVEL_KEYWORDS = [
  '힐링', '자연', '스릴',
  '추억', '예술', '체험',
  '데이트', '트레킹'
];

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    email: '',
    phone: '',
    keywords: [] // 선택된 키워드들
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? formatPhone(value) : value
    }));
    setError('');
  };

  const toggleKeyword = (keyword) => {
    setFormData(prev => {
      const keywords = prev.keywords.includes(keyword)
        ? prev.keywords.filter(k => k !== keyword)
        : [...prev.keywords, keyword];

      return { ...prev, keywords };
    });
  };

  const validateForm = () => {
    // 필수 항목 검사
    if (!formData.username || !formData.nickname || !formData.password || !formData.email) {
      return '필수 항목을 모두 입력해주세요.';
    }

    // 아이디 길이 검사
    if (formData.username.length < 4) {
      return '아이디는 4자 이상이어야 합니다.';
    }

    // 비밀번호 길이 검사
    if (formData.password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      return '비밀번호가 일치하지 않습니다.';
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return '올바른 이메일 형식이 아닙니다.';
    }

    // 전화번호 형식 검사 (선택사항이지만 입력된 경우)
    if (formData.phone) {
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        return '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        username: formData.username,
        nickname: formData.nickname,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        email: formData.email,
        phone: formData.phone || null,
        keyword_pref: formData.keywords.join(',') // 쉼표로 구분
      };

      await register(userData);
      navigate('/login'); // 회원가입 성공 시 로그인 페이지로
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Header />
      <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">여행의 시작을 함께하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">아이디 *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="4자 이상 입력하세요"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nickname">닉네임 *</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력하세요"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6자 이상 입력하세요"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">연락처</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-1234-5678 (선택사항)"
              disabled={loading}
            />
          </div>

          <div className="form-group keyword-section">
            <label>여행 성향 키워드</label>
            <p className="keyword-hint">관심있는 여행 스타일을 선택해주세요 (선택사항)</p>
            <div className="keyword-grid">
              {TRAVEL_KEYWORDS.map(keyword => (
                <div
                  key={keyword}
                  className={`keyword-chip ${formData.keywords.includes(keyword) ? 'selected' : ''}`}
                  onClick={() => !loading && toggleKeyword(keyword)}
                >
                  {keyword}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-links">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login" className="link">로그인</Link>
        </div>
      </div>
    </div>
      <Footer />
    </div>
  );
}

export default Register;
