// src/domain/payment/toss/TossSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
import { useAuth } from '../../../context/AuthContext';
import '../PaymentStatus.css';

const TossSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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
                const planId = localStorage.getItem('plan_id');
                const usePoints = parseInt(localStorage.getItem('use_points') || '0', 10);
                const response = await api.post('/api/payment/toss/confirm', {
                    paymentKey,
                    orderId,
                    amount: parseInt(amount, 10),
                    planId: planId ? parseInt(planId, 10) : null,
                    userId: user?.id ?? null,
                    usePoint: usePoints
                });

                if (response.status === 200 || response.data) {
                    console.log("토스 결제 승인 완료:", response.data);

                    // 처리 완료 상태로 변경
                    setIsProcessing(false);

                    // 포인트 적립 알림
                    const earnedPoint = response.data?.earnedPoint;
                    if (earnedPoint > 0) {
                        alert(`${earnedPoint.toLocaleString()}포인트 적립되었습니다!`);
                    }

                    // 결제 상세 내역 읽기 (삭제 전)
                    const tempPlanData = JSON.parse(localStorage.getItem('temp_plan_data') || '{}');

                    // planId 키로 영구 보존 (use_points 포함 — 영수증 포인트 할인 표시용)
                    if (planId) {
                        const detail = { ...tempPlanData, used_points: usePoints };
                        localStorage.setItem(`payment_detail_${planId}`, JSON.stringify(detail));
                    }

                    // 임시 데이터 삭제
                    localStorage.removeItem('temp_plan_data');
                    localStorage.removeItem('plan_id');
                    localStorage.removeItem('use_points');

                    setTimeout(() => {
                        navigate('/reserve/receipt', {
                            replace: true,
                            state: { finalPlanData: { ...tempPlanData, used_points: usePoints }, paymentResult: response.data }
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