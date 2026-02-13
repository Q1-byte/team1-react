import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        // 토큰과 사용자 정보 저장
        setAuthData(user, token);

        // 메인 페이지로 이동
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth 콜백 처리 실패:', error);
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setAuthData]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <p>로그인 처리 중...</p>
    </div>
  );
}

export default OAuthCallback;
