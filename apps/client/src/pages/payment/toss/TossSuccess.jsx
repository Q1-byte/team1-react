// src/domain/payment/toss/TossSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
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

                if (!paymentKey || !orderId || !amount) {
                    throw new Error("결제 정보 파라미터가 부족합니다.");
                }

                // 2. 백엔드 TossPaymentService.confirmPayment 호출
                const response = await api.post('/api/payment/toss/confirm', {
                    paymentKey,
                    orderId,
                    amount: parseInt(amount, 10) // 숫자로 변환해서 전달
                });

                if (response.status === 200 || response.data) {
                    console.log("토스 결제 승인 완료:", response.data);
                    
                    // 처리 완료 상태로 변경
                    setIsProcessing(false);
                    
                    // 로컬스토리지에 저장했던 임시 데이터가 있다면 여기서 삭제
                    localStorage.removeItem('temp_plan_data');

                    // 🧾 영수증 페이지로 이동 (우리가 설정한 중첩 라우트 경로)
                    // 바로 이동하면 유저가 완료 메시지를 못 볼 수 있으니 살짝 지연 후 이동
                    setTimeout(() => {
                        navigate('/reserve/receipt', { 
                            replace: true, // 뒤로가기 방지
                            state: { paymentResult: response.data } 
                        });
                    }, 1500);
                }
            } catch (error) {
                console.error("토스 승인 오류:", error);
                alert("결제 승인 중 문제가 발생했습니다.");
                // 실패 시에는 reserve 밖의 실패 페이지로 이동
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
                    <>
                        <div className="success-icon">✅</div>
                        <h2>결제가 완료되었습니다!</h2>
                        <p>영수증 페이지로 이동 중입니다...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default TossSuccess;