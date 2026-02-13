// src/domain/payment/toss/TossFail.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../PaymentStatus.css';

const TossFail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // 토스에서 보내주는 에러 메시지 추출
    const errorCode = searchParams.get('code');
    const errorMessage = searchParams.get('message') || "결제 중 오류가 발생했습니다.";

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <div className="status-icon fail">✕</div>
                
                <h2>토스 결제 실패</h2>
                <p className="error-msg">{errorMessage}</p>
                <p className="sub-text">에러 코드: {errorCode}</p>
                
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

export default TossFail;