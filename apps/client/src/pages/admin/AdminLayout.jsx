import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 관리자 권한 체크
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="access-denied">
        <h2>🚫 접근 권한이 없습니다</h2>
        <p>관리자만 접근할 수 있는 페이지입니다.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    
    <div style={{ display: 'flex'}}>
      {/* 사이드바 */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🛠️ Admin</h2>
          <span>관리자 시스템</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
            📊 대시보드
          </Link>
          <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
            👥 회원 관리
          </Link>
          <Link to="/admin/spots" className={isActive('/admin/spots') ? 'active' : ''}>
            🗺️ 여행지 관리
          </Link>
          <Link to="/admin/payments" className={isActive('/admin/payments') ? 'active' : ''}>
            💳 결제 관리
          </Link>
          <Link to="/admin/events" className={isActive('/admin/events') ? 'active' : ''}>
            🎉 이벤트 관리
          </Link>
          <Link to="/admin/reviews" className={isActive('/admin/reviews') ? 'active' : ''}>
            ⭐ 리뷰 관리
          </Link>
          <Link to="/admin/inquiries" className={isActive('/admin/inquiries') ? 'active' : ''}>
            💬 문의 관리
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="back-to-site-btn">사이트로 돌아가기</Link>
          <button onClick={handleLogout} className="logout-btn">
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
