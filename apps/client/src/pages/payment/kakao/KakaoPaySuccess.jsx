import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
import '../PaymentStatus.css';

const KakaoPaySuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const isApproving = useRef(false); // StrictMode 이중 실행 방지

    useEffect(() => {
        if (isApproving.current) return;
        isApproving.current = true;

        const queryParams = new URLSearchParams(location.search);
        const pg_token = queryParams.get('pg_token');

        // 1. 저장해뒀던 TID 가져오기
        const tid = localStorage.getItem('kakao_tid');
        const tempPlanData = JSON.parse(localStorage.getItem('temp_plan_data') || 'null');

        if (!pg_token || !tid) {
            alert("결제 정보가 유효하지 않거나 만료되었습니다.");
            navigate('/reserve/check');
            return;
        }

        const approvePayment = async () => {
            try {
                // 2. 백엔드 카카오 결제 승인 API 호출
                const planId = localStorage.getItem('plan_id');
                const usePoints = parseInt(localStorage.getItem('use_points') || '0', 10);
                const response = await api.post('/payment/approve', {
                    tid: tid,
                    pg_token: pg_token,
                    plan_id: planId ? parseInt(planId, 10) : null,
                    use_point: usePoints
                });

                if (response.data) {
                    console.log("카카오 결제 승인 완료:", response.data);

                    // 성공 후 처리
                    setIsProcessing(false);

                    // 포인트 적립 알림
                    const earnedPoint = response.data.earnedPoint;
                    if (earnedPoint > 0) {
                        alert(`${earnedPoint.toLocaleString()}포인트 적립되었습니다!`);
                    }

                    // 결제 상세 내역을 planId 키로 영구 보존 (마이페이지 영수증 조회용)
                    // use_points를 포함해 저장해야 영수증에서 포인트 할인 표시 가능
                    if (planId) {
                        const detail = JSON.parse(localStorage.getItem('temp_plan_data') || '{}');
                        detail.used_points = usePoints;
                        localStorage.setItem(`payment_detail_${planId}`, JSON.stringify(detail));
                    }

                    // 임시 데이터 삭제
                    localStorage.removeItem('kakao_tid');
                    localStorage.removeItem('temp_plan_data');
                    localStorage.removeItem('plan_id');
                    localStorage.removeItem('use_points');

                    setTimeout(() => {
                        navigate('/reserve/receipt', {
                            replace: true,
                            state: {
                                finalPlanData: { ...tempPlanData, used_points: usePoints },
                                paymentResult: response.data
                            }
                        });
                    }, 1500);
                }
            } catch (error) {
                const status = error.response?.status;
                const msg = error.response?.data?.message || error.response?.data || error.message;
                console.error("카카오 승인 오류:", status, msg);

                if (status === 500) {
                    alert(`결제 승인 중 서버 오류가 발생했습니다.\n이미 처리된 결제이거나 서버 문제일 수 있습니다.\n관리자에게 문의해주세요.`);
                } else {
                    alert("결제 승인 처리 중 문제가 발생했습니다. 로그인 상태를 확인해주세요.");
                }
                navigate('/reserve/check');
            }
        };

        approvePayment();
    }, [location, navigate]);

    return (
        <div className="payment-status-container">
            <div className="status-card">
                {isProcessing ? (
                    <>
                        <div className="spinner"></div>
                        <h2>카카오페이 결제 승인 중...</h2>
                        <p>결제 정보를 확인하고 있습니다.</p>
                        <p className="sub-text">잠시만 기다려 주세요.</p>
                    </>
                ) : (
                    <>
                        <div className="success-icon" style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
                        <h2>결제가 완료되었습니다!</h2>
                        <p>영수증 페이지로 이동 중입니다...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default KakaoPaySuccess;