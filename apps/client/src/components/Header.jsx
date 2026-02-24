import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimWelcomeBonus } from '../api/mypageApi';
import './Header.css';

export default function Header() {
    const [showAd, setShowAd] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [welcoming, setWelcoming] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated, isAdmin, updateUser } = useAuth();
    const isLoginPage = location.pathname === '/login';

    useEffect(() => {
        if (!user) { setShowWelcome(false); return; }
        const key = `welcome_bonus_claimed_${user.id}`;
        if (!localStorage.getItem(key)) setShowWelcome(true);
    }, [user]);

    const handleClaimWelcome = async () => {
        if (welcoming) return;
        setWelcoming(true);
        try {
            const res = await claimWelcomeBonus();
            if (res.success) {
                updateUser({ point: res.data });
                localStorage.setItem(`welcome_bonus_claimed_${user.id}`, 'true');
                alert('🎉 가입 축하 포인트 1,000P가 지급되었습니다!');
            } else {
                localStorage.setItem(`welcome_bonus_claimed_${user.id}`, 'true');
            }
        } catch {
            localStorage.setItem(`welcome_bonus_claimed_${user.id}`, 'true');
        } finally {
            setShowWelcome(false);
            setWelcoming(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            logout();
            alert('로그아웃 되었습니다.');
        }
    };

    return (
        <div className="header-wrapper">
            {showWelcome ? (
                <div className="top-ad-bar top-ad-bar--welcome">
                    <p className="ad-text">🎁 신규 회원 혜택! 가입 축하 포인트 <strong>1,000P</strong> 를 받아가세요!</p>
                    <button className="welcome-claim-btn" onClick={handleClaimWelcome} disabled={welcoming}>
                        {welcoming ? '지급 중...' : '포인트 받기'}
                    </button>
                    <button className="close-ad-btn" onClick={() => { setShowWelcome(false); localStorage.setItem(`welcome_bonus_claimed_${user.id}`, 'true'); }}>×</button>
                </div>
            ) : showAd && (
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