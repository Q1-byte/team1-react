import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. Context에서 정의된 변수들을 그대로 가져옵니다.
    const { user, logout, isAuthenticated, isAdmin } = useAuth();

    // 현재 페이지가 로그인 페이지인지 확인
    const isLoginPage = location.pathname === '/login';

    const handleLogin = () => navigate('/login');
    const handleJoin = () => navigate('/register');
    const handleMyPage = () => navigate('/mypage');
    const handleAdminPage = () => navigate('/admin');

    const handleLogout = () => {
        if(window.confirm('로그아웃 하시겠습니까?')) {
            logout();
            alert('로그아웃 되었습니다.');
        }
    };

    return (
        <header className="header" style={{ width: '100%', zIndex: 100, backgroundColor: 'transparent', borderBottom: 'none', boxShadow: 'none' }}>
            <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '100%', padding: '20px 40px', boxSizing: 'border-box' }}>
                
                <div className="header-left">
                    <img src="/banner/logo.jpg" alt="Logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', height: '100px', width: 'auto', borderRadius: '50%' , marginLeft: '80px'}} />
                </div>
                
                <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
                    {/* 2. user.isLoggedIn 대신 Context의 isAuthenticated를 사용 */}
                    {isAuthenticated ? (
                        <div className="user-zone" style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="user-greeting" style={{ marginRight: '20px', whiteSpace: 'nowrap', color: '#fff', fontWeight: '500', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                                <strong>{user?.username}</strong>님 안녕하세요
                                {isAdmin && (
                                    <span style={{ color: '#ff4d4f', fontWeight: '900', marginLeft: '8px' }}>(관리자)</span>
                                )}
                            </span>

                            <button onClick={handleMyPage} className="header-btn">MYPAGE</button>

                            {/* 3. isAdmin 변수를 그대로 사용하여 버튼 노출 결정 */}
                            {isAdmin && (
                                <button onClick={handleAdminPage} className="header-btn admin-btn">ADMIN</button>
                            )}

                            <button onClick={handleLogout} className="header-btn">LOGOUT</button>
                        </div>
                    ) : (
                        !isLoginPage && (
                            <div className="header-auth-zone">
                                <button onClick={handleLogin} className="header-btn">LOGIN</button>
                                <button onClick={handleJoin} className="header-btn">JOIN</button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
