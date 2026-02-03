import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentStatus.css'; // 성공/실패 공용 스타일

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        // 1. URL 쿼리 스트링에서 pg_token 추출
        const queryParams = new URLSearchParams(location.search);
        const pg_token = queryParams.get('pg_token');
        
        // 2. localStorage에 저장해뒀던 TID와 여행 데이터 가져오기
        const tid = localStorage.getItem('kakao_tid');
        const tempPlanData = JSON.parse(localStorage.getItem('temp_plan_data'));

        if (!pg_token || !tid) {
            alert("결제 정보가 유효하지 않습니다.");
            navigate('/checkout');
            return;
        }

        // 3. 서버에 최종 승인 요청 (Approve API)
        const approvePayment = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/payment/approve', {
                    tid,
                    pg_token,
                    partner_order_id: `order_${new Date().getTime()}`, // 결제 준비 시와 동일해야 함 (실무에선 DB 저장 권장)
                    partner_user_id: "user_1234"
                });

                if (response.data) {
                    // 승인 성공! 임시 데이터 삭제 후 결과 페이지로 이동
                    localStorage.removeItem('kakao_tid');
                    localStorage.removeItem('temp_plan_data');
                    
                    setIsProcessing(false);
                    // AI 일정 생성 페이지로 최종 데이터 전달
                    navigate('/result', { state: { finalPlanData: tempPlanData, paymentResult: response.data } });
                }
            } catch (error) {
                console.error("결제 승인 오류:", error);
                alert("결제 승인 처리 중 문제가 발생했습니다.");
                navigate('/checkout');
            }
        };

        approvePayment();
    }, [location, navigate]);

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <div className="spinner"></div>
                <h2>결제 승인 중...</h2>
                <p>카카오페이로부터 결제 정보를 확인하고 있습니다.</p>
                <p className="sub-text">잠시만 기다려 주시면 AI 일정 생성을 시작합니다.</p>
            </div>
        </div>
    );
};

export default PaymentSuccess;