import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 관리자 권한 체크
  if (user && user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>접근 권한이 없습니다</h2>
        <p>관리자만 접근할 수 있는 페이지입니다.</p>
        <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 사이드바 */}
      <aside style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '30px' }}>관리자 페이지</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/admin" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            대시보드
          </Link>
          <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            회원 관리
          </Link>
          <Link to="/admin/spots" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            여행지 관리
          </Link>
          <Link to="/admin/payments" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            결제 관리
          </Link>
          <Link to="/admin/events" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            이벤트 관리
          </Link>
          <Link to="/admin/reviews" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            리뷰 관리
          </Link>
          <Link to="/admin/inquiries" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
            문의 관리
          </Link>
        </nav>

        <div style={{ marginTop: '50px', borderTop: '1px solid #fff', paddingTop: '20px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '10px' }}>
            ← 사이트로 돌아가기
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1' }}>
        <Outlet />
      </main>
    </div>
  );
}
