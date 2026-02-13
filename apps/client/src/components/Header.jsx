import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    // :bulb: 현재 페이지가 메인인지 확인
    const isMainPage = location.pathname === '/';

    const { user, logout, isAuthenticated, isAdmin } = useAuth();
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

    // :bulb: 메인일 때와 아닐 때의 글자색 결정
    const dynamicColor = isMainPage ? '#fff' : '#333';

    return (
        <header
            className="header"
            style={{
                width: '100%',
                zIndex: 1000,
                // 1. 배경색: 메인만 투명하게, 나머지는 흰색
                backgroundColor: isMainPage ? 'transparent' : '#FFFFFF',
                // 2. 경계선 및 그림자: 메인이 아닐 때만 표시
                borderBottom: isMainPage ? 'none' : '1px solid #eee',
                boxShadow: isMainPage ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                // 3. 전환 효과
                transition: 'all 0.3s ease',
                // 4. 위치 설정: 컨텐츠 위로 겹치기 위함
                position: 'absolute',
                top: 0,
                left: 0
            }}
        >
<<<<<<< HEAD
            <div className="header-inner">
                <div className="header-left">
                    <img
                        src="/banner/logo.jpg"
                        alt="Logo"
                        onClick={() => navigate('/')}
                        className="main-logo"
                        style={{ cursor: 'pointer' }}
                    />
                </div>

                <div className="header-right">
                    {isAuthenticated ? (
                        <div className="user-zone">
                            <span className="user-greeting" style={{ color: dynamicColor }}>
                                <strong>{user?.id}</strong>님 안녕하세요
                                {isAdmin && <span className="admin-tag">(관리자)</span>}
                            </span>
                            <button onClick={handleMyPage} className="nav-btn" style={{ color: dynamicColor }}>MYPAGE</button>
                            {isAdmin && (
                                <button onClick={handleAdminPage} className="nav-btn admin-btn" style={{ color: dynamicColor }}>ADMIN</button>
                            )}
                            <button onClick={handleLogout} className="nav-btn" style={{ color: dynamicColor }}>LOGOUT</button>
                        </div>
                    ) : (
                        !isLoginPage && (
                            <div className="header-auth-zone">
                                <button onClick={handleLogin} className="nav-btn" style={{ color: dynamicColor }}>LOGIN</button>
                                <button onClick={handleJoin} className="nav-btn" style={{ color: dynamicColor }}>JOIN</button>
                            </div>
                        )
=======
        <div className="header-inner">
        <div className="header-left">
            <img
                src="/banner/logo.jpg"
                alt="Logo"
                onClick={() => navigate('/')}
                className="main-logo"
            />
        </div>

        <div className="header-right">
            {isAuthenticated ? (
                <div className="user-zone">
                    <span className="user-greeting" style={{ color: dynamicColor }}>
                        <strong>{user?.nickname}</strong>님 안녕하세요
                        {isAdmin && <span className="admin-tag">(관리자)</span>}
                    </span>
                    <button onClick={handleMyPage} className="nav-btn" style={{ color: dynamicColor }}>MYPAGE</button>
                    {isAdmin && (
                        <button onClick={handleAdminPage} className="nav-btn admin-btn" style={{ color: dynamicColor }}>ADMIN</button>
>>>>>>> 92ecf336b8a1803fd638b83e7a8b98c9fa2f5609
                    )}
                </div>
            </div>
        </header>
    );
}