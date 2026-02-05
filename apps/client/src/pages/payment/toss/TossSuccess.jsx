// src/domain/payment/toss/TossSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../PaymentStatus.css';

const TossSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const confirmPayment = async () => {
            try {
                // 1. 토스에서 보내준 쿼리 파라미터 추출
                const paymentKey = searchParams.get('paymentKey');
                const orderId = searchParams.get('orderId');
                const amount = searchParams.get('amount');

                // 2. 백엔드 TossPaymentService.confirmPayment 호출
                const response = await api.post('/api/payment/toss/confirm', {
                    paymentKey,
                    orderId,
                    amount: parseInt(amount, 10) // 숫자로 변환해서 전달
                });

                if (response.data) {
                    console.log("토스 결제 승인 완료:", response.data);
                    setIsProcessing(false);
                    
                    // 로컬스토리지에 저장했던 임시 데이터가 있다면 여기서 삭제
                    localStorage.removeItem('temp_plan_data');

                    alert("토스 결제가 완료되었습니다!");
                    navigate('/result', { 
                        state: { paymentResult: response.data } 
                    });
                }
            } catch (error) {
                console.error("토스 승인 오류:", error);
                alert("결제 승인 중 문제가 발생했습니다.");
                navigate('/payment/toss/fail');
            }
        };

        confirmPayment();
    }, [searchParams, navigate]);

    return (
        <div className="payment-status-container">
            <div className="status-card">
                {isProcessing ? (
                    <>
                        <div className="spinner"></div>
                        <h2>토스페이먼츠 승인 중...</h2>
                        <p>안전하게 결제 정보를 확인하고 있습니다.</p>
                        <p className="sub-text">잠시만 기다려 주세요.</p>
                    </>
                ) : (
                    <h2>결제 완료! 페이지를 이동합니다.</h2>
                )}
            </div>
        </div>
    );
};

export default TossSuccess;