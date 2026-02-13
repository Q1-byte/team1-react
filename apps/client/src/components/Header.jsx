import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    // 💡 현재 페이지가 메인인지 확인
    const isMainPage = location.pathname === '/';

    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const isLoginPage = location.pathname === '/login';

    const handleLogin = () => navigate('/login');
    const handleJoin = () => navigate('/register');
    const handleMyPage = () => navigate('/mypage');
    const handleAdminPage = () => navigate('/admin');

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            logout();
            alert('로그아웃 되었습니다.');
        }
    };

    // 💡 메인일 때와 아닐 때의 글자색 결정
    const dynamicColor = isMainPage ? '#fff' : '#333';

    return (
        <header
            className="header"
            style={{
                width: '100%',
                zIndex: 1000,
                backgroundColor: isMainPage ? 'transparent' : '#ffffff',
                borderBottom: isMainPage ? 'none' : '1px solid #eee',
                boxShadow: isMainPage ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        >
            <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '100%', padding: '20px 40px', boxSizing: 'border-box' }}>

                <div className="header-left">
                    <img 
                        src="/banner/logo.jpg" 
                        alt="Logo" 
                        onClick={() => navigate('/')} 
                        style={{ cursor: 'pointer', height: '100px', width: 'auto', borderRadius: '50%', marginLeft: '80px' }} 
                    />
                </div>

                <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <div className="user-zone" style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="user-greeting" style={{ marginRight: '20px', whiteSpace: 'nowrap', color: dynamicColor, fontWeight: '500' }}>
                                <strong>{user?.nickname}</strong>님 안녕하세요
                                {isAdmin && (
                                    <span style={{ color: '#ff4d4f', fontWeight: '900', marginLeft: '8px' }}>(관리자)</span>
                                )}
                            </span>

                            {/* 👇 MYPAGE: 'white'를 dynamicColor로 바꾸고 borderColor를 추가했습니다 */}
                            <button onClick={handleMyPage} className="nav-btn" style={{ color: dynamicColor, borderColor: dynamicColor }}>MYPAGE</button>

                            {isAdmin && (
                                <button onClick={handleAdminPage} className="nav-btn admin-btn" style={{ color: dynamicColor, borderColor: dynamicColor }}>ADMIN</button>
                            )}

                            <button onClick={handleLogout} className="nav-btn" style={{ color: dynamicColor, borderColor: dynamicColor }}>LOGOUT</button>
                        </div>
                    ) : (
                        !isLoginPage && (
                            <div className="header-auth-zone" style={{ display: 'flex' }}>
                                <button onClick={handleLogin} className="nav-btn" style={{ color: dynamicColor, borderColor: dynamicColor }}>LOGIN</button>
                                <button onClick={handleJoin} className="nav-btn" style={{ color: dynamicColor, borderColor: dynamicColor }}>JOIN</button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}