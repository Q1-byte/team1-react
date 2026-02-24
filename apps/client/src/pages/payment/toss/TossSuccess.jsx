import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
import { useAuth } from '../../../context/AuthContext';
import '../PaymentStatus.css';

const TossSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);
    
    // 💡 중복 실행 방지를 위한 Ref
    const hasCalledConfirm = useRef(false);

    useEffect(() => {
        const confirmPayment = async () => {
            // 💡 이미 실행 중이거나 실행 완료했다면 리턴
            if (hasCalledConfirm.current) return;

            try {
                // 1. 토스 쿼리 파라미터 추출
                const paymentKey = searchParams.get('paymentKey');
                const orderId = searchParams.get('orderId');
                const amount = searchParams.get('amount');

                console.log("1. 토스 파라미터 확인:", { paymentKey, orderId, amount });

                if (!paymentKey || !orderId || !amount) {
                    throw new Error("결제 정보 파라미터가 부족합니다.");
                }

                // 2. 데이터 복구 (localStorage 우선 순위)
                const planId = localStorage.getItem('plan_id');
                const usePoints = parseInt(localStorage.getItem('use_points') || '0', 10);
                const storedUserId = localStorage.getItem('user_id');

                console.log("2. 로컬 스토리지 복구 확인:", { planId, usePoints, storedUserId });
                
                // Context의 user.id가 있으면 사용하고, 없으면 localStorage에서 가져옴
                const finalUserId = user?.id || (storedUserId ? parseInt(storedUserId, 10) : null);

                // 유저 정보가 아직 로드되지 않았다면 함수 종료 (다음 useEffect cycle에서 실행됨)
                if (!finalUserId) {
                    console.log("3. 유저 정보 로딩 대기 중...");
                    return;
                }

                // 💡 중복 호출 방지 플래그 설정
                hasCalledConfirm.current = true;
                console.log("🚀 결제 승인 요청 시작");

                // 3. 백엔드 승인 요청
                const response = await api.post('/payment/toss/confirm', {
                    paymentKey,
                    orderId,
                    amount: parseInt(amount, 10),
                    planId: planId ? parseInt(planId, 10) : null,
                    userId: finalUserId,
                    usePoint: usePoints
                });

                if (response.status === 200 || response.data) {
                    processSuccess(response.data, planId, usePoints);
                }
            } catch (error) {
                // 💡 이미 처리된 요청인 경우(중복 호출 시) 에러로 처리하지 않고 성공 로직 진행
                const errorCode = error.response?.data?.code;
                if (errorCode === 'ALREADY_PROCESSING_REQUEST') {
                    console.log("이미 처리 중인 결제입니다. 성공 처리를 진행합니다.");
                    // 이미 성공했다면 로컬 스토리지는 비워져있을 것이므로 안전하게 처리
                    setIsProcessing(false);
                    return;
                }

                console.error("토스 승인 오류 발생:", error);
                const errorMessage = error.response?.data?.message || error.message || "결제 승인 중 문제가 발생했습니다.";
                alert(errorMessage);
                navigate('/payment/toss/fail');
            }
        };

        // 성공 시 공통 처리 로직 분리
        const processSuccess = (data, planId, usePoints) => {
            console.log("4. 토스 결제 승인 성공:", data);
            setIsProcessing(false);

            // 포인트 알림
            const earnedPoint = data?.earnedPoint;
            if (earnedPoint > 0) {
                alert(`${earnedPoint.toLocaleString()}포인트 적립되었습니다!`);
            }

            // 상세 내역 보존
            const tempPlanData = JSON.parse(localStorage.getItem('temp_plan_data') || '{}');
            if (planId) {
                const detail = { ...tempPlanData, used_points: usePoints };
                localStorage.setItem(`payment_detail_${planId}`, JSON.stringify(detail));
            }

            // 정리 작업
            localStorage.removeItem('temp_plan_data');
            localStorage.removeItem('plan_id');
            localStorage.removeItem('use_points');
            localStorage.removeItem('user_id');

            setTimeout(() => {
                navigate('/reserve/receipt', {
                    replace: true,
                    state: { 
                        finalPlanData: { ...tempPlanData, used_points: usePoints }, 
                        paymentResult: data 
                    }
                });
            }, 1500);
        };

        confirmPayment();
    }, [searchParams, navigate, user]);

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