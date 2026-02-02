import React, { useState } from 'react';

export default function Header() {
    // 테스트를 위해 초기값을 바꿔가며 확인해보세요!
    const [user, setUser] = useState({
        isLoggedIn: true, 
        id: "TripMaster", 
        role: "admin" // "admin" 또는 "user"
    });

    // 버튼 클릭 이벤트 함수들
    const handleLogin = () => alert('로그인 페이지로 이동합니다.');
    const handleJoin = () => alert('회원가입 페이지로 이동합니다.');
    const handleMyPage = () => alert('마이페이지로 이동합니다.');
    const handleAdminPage = () => alert('관리자 전용 페이지로 이동합니다.');
    
    const handleLogout = () => {
        if(window.confirm('로그아웃 하시겠습니까?')) {
            setUser({ ...user, isLoggedIn: false });
            alert('로그아웃 되었습니다.');
        }
    };

    return (
        <header className="header">
            <div className="header-inner">
                {user.isLoggedIn ? (
                    /* -------------------------------------------
                        [ 1] 로그인 상태 (유저 공통 + 관리자 전용)
                    ---------------------------------------------- */
                    <div className="header-user-zone">
                        <span className="user-greeting">
                            <strong>{user.id}</strong>님 안녕하세요
                            <span className="greeting-spacer"></span>
                            {user.role === 'admin' && <span className="admin-badge">(관리자)</span>}
                        </span>
                    
                        
                        {/* 마이페이지는 로그인한 모든 유저에게 보임 */}
                        <button onClick={handleMyPage} className="header-btn">MYPAGE</button>
                        
                        {/* 관리자일 때만 추가로 보이는 버튼 */}
                        {user.role === 'admin' && (
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