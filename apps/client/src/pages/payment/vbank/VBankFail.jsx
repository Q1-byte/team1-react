import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../PaymentStatus.css';

const VBankFail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 토스페이먼츠에서 에러 발생 시 쿼리 파라미터로 보내주는 값들
    const errorCode = searchParams.get('code');
    const errorMessage = searchParams.get('message');

    return (
        <div className="payment-status-container">
            <div className="status-card fail">
                <div className="status-icon">❌</div>
                <h2>가상계좌 발급 실패</h2>
                <p className="error-msg">{errorMessage || "결제 진행 중 오류가 발생했습니다."}</p>
                
                <div className="error-details">
                    <p><strong>에러 코드:</strong> {errorCode}</p>
                </div>

                <div className="button-group">
                    <button 
                        className="retry-btn" 
                        onClick={() => navigate('/checkout')}
                    >
                        다시 시도하기
                    </button>
                    <button 
                        className="home-btn" 
                        onClick={() => navigate('/')}
                    >
                        홈으로 이동
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VBankFail;