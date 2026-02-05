import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../PaymentStatus.css'; // common 폴더 내 CSS 경로로 수정

const KakaoPayFail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 카카오페이는 보통 실패 시 구체적인 사유를 쿼리스트링으로 직접 주지는 않지만,
    // 혹시 모르니 받아올 수 있도록 유지합니다.
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('message') || "결제 진행 중 오류가 발생했습니다.";

    return (
        <div className="payment-status-container">
            <div className="status-card">
                {/* 실패를 나타내는 아이콘 (CSS에서 .fail 스타일 적용 필요) */}
                <div className="status-icon fail">✕</div>
                
                <h2>카카오페이 결제 실패</h2>
                <p className="error-msg">{errorMessage}</p>
                <p>사용자 취소, 카드 한도 초과, 잔액 부족 등이 원인일 수 있습니다.</p>
                
                <div className="status-button-group">
                    <button className="retry-btn" onClick={() => navigate('/checkout')}>
                        다시 시도하기
                    </button>
                    <button className="home-btn" onClick={() => navigate('/')}>
                        메인으로 이동
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KakaoPayFail;