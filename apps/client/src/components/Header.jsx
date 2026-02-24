import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
    const [showAd, setShowAd] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const isLoginPage = location.pathname === '/login';

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            logout();
            alert('로그아웃 되었습니다.');
        }
    };

    return (
        <div className="header-wrapper">
            {showAd && (
                <div className="top-ad-bar">
                    <p className="ad-text">"당신의 설렘만 준비하세요, 나머지는 저희가 채울게요. ✨"</p>
                    <button className="close-ad-btn" onClick={() => setShowAd(false)}>×</button>
                </div>
            )}
            {/* 중복된 header 태그를 하나로 통합 */}
            <header className="header">
                <div className="header-inner">
                    <div className="header-left">
                        <img 
                            src="/banner/logo.jpg" 
                            alt="Logo" 
                            className="main-logo"
                            onClick={() => navigate('/')} 
                        />
                    </div>
                    <div className="header-right">
                        {isAuthenticated ? (
                            <div className="user-zone">
                                <span className="user-greeting">
                                    <strong>{user?.nickname}</strong>님 안녕하세요
                                </span>
                                <button onClick={() => navigate('/mypage')} className="nav-btn">MYPAGE</button>
                                {isAdmin && <button onClick={() => navigate('/admin')} className="nav-btn admin-btn">ADMIN</button>}
                                <button onClick={handleLogout} className="nav-btn">LOGOUT</button>
                            </div>
                        ) : (
                            !isLoginPage && (
                                <div className="header-auth-zone">
                                    <button onClick={() => navigate('/login')} className="nav-btn">LOGIN</button>
                                    <button onClick={() => navigate('/register')} className="nav-btn">JOIN</button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}