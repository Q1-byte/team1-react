import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { verifyUserApi, resetPasswordApi } from '../../api/authApi';
import './Auth.css';

function FindPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 본인확인, 2: 새 비밀번호 입력
  const [verifyData, setVerifyData] = useState({ username: '', email: '' });
  const [passwordData, setPasswordData] = useState({ password: '', passwordConfirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyChange = (e) => {
    const { name, value } = e.target;
    setVerifyData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyData.username || !verifyData.email) {
      setError('아이디와 이메일을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyUserApi(verifyData.username, verifyData.email);
      setStep(2);
    } catch (err) {
      setError(err.message || '아이디 또는 이메일이 일치하지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.password || !passwordData.passwordConfirm) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }
    if (passwordData.password !== passwordData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPasswordApi(verifyData.username, passwordData.password);
      navigate('/login', { state: { successMessage: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' } });
    } catch (err) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Header />
      <div className="auth-container">
        <div className="auth-box">
          <h1 className="auth-title">비밀번호 찾기</h1>
          <p className="auth-subtitle">
            {step === 1 ? '가입 시 등록한 아이디와 이메일을 입력하세요' : '새 비밀번호를 입력하세요'}
          </p>

          {step === 1 ? (
            <form onSubmit={handleVerifySubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="username">아이디</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={verifyData.username}
                  onChange={handleVerifyChange}
                  placeholder="아이디를 입력하세요"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={verifyData.email}
                  onChange={handleVerifyChange}
                  placeholder="이메일을 입력하세요"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '확인 중...' : '본인 확인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="password">새 비밀번호</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  placeholder="새 비밀번호를 입력하세요"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="passwordConfirm">비밀번호 확인</label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={passwordData.passwordConfirm}
                  onChange={handlePasswordChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )}

          <div className="auth-links">
            <Link to="/login" className="link">로그인</Link>
            <span className="divider">|</span>
            <Link to="/register" className="link">회원가입</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default FindPassword;
