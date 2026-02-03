import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentFail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // URL에서 실패 사유(에러 메시지)를 받아올 수 있습니다.
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('message') || "알 수 없는 오류가 발생했습니다.";

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <div className="status-icon fail">X</div>
                <h2>결제에 실패했습니다</h2>
                <p className="error-msg">{errorMessage}</p>
                <p>카드 한도 초과, 잔액 부족 등이 원인일 수 있습니다.</p>
                
                <div className="status-button-group">
                    <button className="retry-btn" onClick={() => navigate('/checkout')}>
                        다시 시도
                    </button>
                    <button className="home-btn" onClick={() => navigate('/')}>
                        고객센터 문의
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFail;