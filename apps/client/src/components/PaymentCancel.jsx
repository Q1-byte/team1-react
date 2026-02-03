import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <div className="status-icon cancel">!</div>
                <h2>결제가 취소되었습니다</h2>
                <p>결제를 중단하셨습니다. <br/>다시 결제하시려면 아래 버튼을 눌러주세요.</p>
                
                <div className="status-button-group">
                    <button className="retry-btn" onClick={() => navigate('/checkout')}>
                        다시 결제하기
                    </button>
                    <button className="home-btn" onClick={() => navigate('/')}>
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;