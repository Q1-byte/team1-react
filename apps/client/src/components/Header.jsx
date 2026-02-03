import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // 버튼 클릭 이벤트 함수들
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
        <header className="header">
            <div className="header-inner">
                {user ? (
                    /* -------------------------------------------
                        [ 1] 로그인 상태 (유저 공통 + 관리자 전용)
                    ---------------------------------------------- */
                    <div className="header-user-zone">
                        <span className="user-greeting">
                            <strong>{user.username}</strong>님 안녕하세요
                            <span className="greeting-spacer"></span>
                            {user.role === 'ADMIN' && <span className="admin-badge">(관리자)</span>}
                        </span>


                        {/* 마이페이지는 로그인한 모든 유저에게 보임 */}
                        <button onClick={handleMyPage} className="header-btn">MYPAGE</button>

                        {/* 관리자일 때만 추가로 보이는 버튼 */}
                        {user.role === 'ADMIN' && (
                            <button onClick={handleAdminPage} className="header-btn admin-btn">ADMIN</button>
                        )}

                        {/* 로그아웃은 로그인 상태라면 무조건 보임 */}
                        <button onClick={handleLogout} className="header-btn">LOGOUT</button>
                    </div>
                ) : (
                    /* -------------------------------------------
                        [2] 비로그인 상태 (기본 버튼)
                    ---------------------------------------------- */
                    <div className="header-auth-zone">
                        <button onClick={handleLogin} className="header-btn">LOGIN</button>
                        <button onClick={handleJoin} className="header-btn">JOIN</button>
                    </div>
                )}
            </div>
        </header>
    );
}
