import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // api 대신 axios를 직접 임포트
import '../PaymentStatus.css';

const VBankSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [accountInfo, setAccountInfo] = useState(null);

    useEffect(() => {
        const confirmVBank = async () => {
            try {
                const paymentKey = searchParams.get('paymentKey');
                const orderId = searchParams.get('orderId');
                const amount = searchParams.get('amount');

                // 백엔드의 가상계좌 승인 엔드포인트 호출
                const response = await api.post('/api/payment/toss/confirm', {
                    paymentKey,
                    orderId,
                    amount: parseInt(amount, 10)
                });

                if (response.data) {
                    // 가상계좌 정보 저장 (은행명, 계좌번호, 예금주 등)
                    setAccountInfo(response.data.virtualAccount); 
                    setIsProcessing(false);
                    localStorage.removeItem('temp_plan_data');
                }
            } catch (error) {
                console.error("가상계좌 신청 오류:", error);
                navigate('/payment/vbank/fail');
            }
        };

        confirmVBank();
    }, [searchParams, navigate]);

    if (isProcessing) return <div className="payment-status-container"><div className="spinner"></div><p>계좌 정보를 생성 중입니다...</p></div>;

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <h2>🏦 가상계좌 발급 완료</h2>
                <p>아래 계좌로 입금해 주시면 결제가 최종 완료됩니다.</p>
                <div className="account-details">
                    <p><strong>은행:</strong> {accountInfo?.bank}</p>
                    <p><strong>계좌번호:</strong> {accountInfo?.accountNumber}</p>
                    <p><strong>입금 금액:</strong> {Number(searchParams.get('amount')).toLocaleString()}원</p>
                    <p><strong>입금 기한:</strong> {accountInfo?.dueDate}</p>
                </div>
                <button className="confirm-btn" onClick={() => navigate('/result')}>확인</button>
            </div>
        </div>
    );
};

export default VBankSuccess;