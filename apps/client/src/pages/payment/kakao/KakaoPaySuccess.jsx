import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../PaymentStatus.css';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

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
            navigate('/checkout');
            return;
        }

        const approvePayment = async () => {
            try {
                // [핵심 수정] axios.post 대신 팀에서 정의한 api.post를 사용합니다.
                // 주소도 설정파일에 베이스 URL이 있다면 '/api/payment/kakao/approve'만 써도 될 수 있습니다.
                const response = await api.post('/api/payment/kakao/approve', {
                    tid: tid,
                    pg_token: pg_token
                });

                if (response.data) {
                    console.log("카카오 결제 승인 완료:", response.data);
                    
                    localStorage.removeItem('kakao_tid');
                    localStorage.removeItem('temp_plan_data');
                    
                    setIsProcessing(false);
                    
                    alert("결제가 완료되었습니다! AI 일정을 생성합니다.");
                    navigate('/result', { 
                        state: { 
                            finalPlanData: tempPlanData, 
                            paymentResult: response.data 
                        } 
                    });
                }
            } catch (error) {
                console.error("카카오 승인 오류:", error);
                // [참고] api 설정 덕분에 401 에러(권한 없음) 발생 시 
                // 자동으로 처리될 수도 있지만, 수동 알럿도 남겨둡니다.
                alert("결제 승인 처리 중 문제가 발생했습니다. 로그인 상태를 확인해주세요.");
                navigate('/checkout');
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
                    </>
                ) : (
                    <h2>결제 완료! 페이지를 이동합니다.</h2>
                )}
            </div>
        </div>
    );
};

export default KakaoPaySuccess;