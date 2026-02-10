import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
import '../PaymentStatus.css';

const KakaoPaySuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const pg_token = queryParams.get('pg_token');
        
        // 1. 저장해뒀던 TID 가져오기
        const tid = localStorage.getItem('kakao_tid');
        const tempPlanData = JSON.parse(localStorage.getItem('temp_plan_data'));

        if (!pg_token || !tid) {
            alert("결제 정보가 유효하지 않거나 만료되었습니다.");
            navigate('/reserve/check'); // 결제 페이지로 복귀
            return;
        }

        const approvePayment = async () => {
            try {
                // 2. 백엔드 카카오 결제 승인 API 호출
                const response = await api.post('/payment/approve', {
                    tid: tid,
                    pg_token: pg_token
                });

                if (response.data) {
                    console.log("카카오 결제 승인 완료:", response.data);
                    
                    // 성공 후 처리
                    setIsProcessing(false);
                    
                    // 사용한 임시 데이터 삭제
                    localStorage.removeItem('kakao_tid');
                    localStorage.removeItem('temp_plan_data');
                    
                    // 🧾 영수증 페이지로 이동 (중첩 라우트 경로)
                    // 유저가 완료 메시지를 인지할 수 있도록 1.5초 후 이동
                    setTimeout(() => {
                        navigate('/reserve/receipt', { 
                            replace: true, 
                            state: { 
                                finalPlanData: tempPlanData, 
                                paymentResult: response.data 
                            } 
                        });
                    }, 1500);
                }
            } catch (error) {
                console.error("카카오 승인 오류:", error);
                alert("결제 승인 처리 중 문제가 발생했습니다. 로그인 상태를 확인해주세요.");
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