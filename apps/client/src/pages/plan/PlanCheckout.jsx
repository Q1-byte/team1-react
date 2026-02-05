import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './PlanCheckout.css';

const PlanCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { finalPlanData } = location.state || {};
    const totalPrice = finalPlanData?.total_amount || 0;
    const displayDetails = finalPlanData?.confirmed_details || [];

    const [selectedMethod, setSelectedMethod] = useState('kakaopay');

    // 결제 수단 리스트
    const paymentMethods = [
        { id: 'kakaopay', name: '카카오페이', icon: '🟡' },
        { id: 'toss', name: '토스페이', icon: '🔵' },
        { id: 'card', name: '신용/체크카드', icon: '💳' },
        { id: 'vbank', name: '무통장 입금', icon: '🏦' },
    ];

    const handleBackToResult = () => {
        navigate('/result', { 
            state: { 
                finalPlanData: {
                    ...finalPlanData,
                    confirmed_details: finalPlanData.original_details 
                } 
            } 
        });
    };

    // 결제 처리 메인 로직
    const handlePayment = async () => {
        if (totalPrice === 0) {
            alert("결제 금액이 0원입니다. 일정을 다시 확인해주세요.");
            return;
        }

        // 1. 카카오페이 결제
        if (selectedMethod === 'kakaopay') {
            // 로그인 체크
            if (!user?.id) {
                alert("로그인이 필요합니다.");
                navigate('/login');
                return;
            }

            try {
                const response = await api.post('/payment/ready', {
                    item_name: `${finalPlanData?.region_name || '지역'} AI 맞춤 여행 일정`,
                    total_amount: totalPrice,
                    partner_order_id: `order_${new Date().getTime()}`,
                    partner_user_id: String(user.id),
                    user_id: user.id,
                    plan_id: finalPlanData?.plan_id || finalPlanData?.id || 1,
                    plan_items: displayDetails
                });

                const { next_redirect_pc_url, tid } = response.data;
                localStorage.setItem('kakao_tid', tid);
                localStorage.setItem('temp_plan_data', JSON.stringify(finalPlanData));
                window.location.href = next_redirect_pc_url;
            } catch (error) {
                console.error("카카오 결제 실패:", error);
                alert("카카오페이 서버와 통신 중 오류가 발생했습니다.");
            }

        // 2. 토스페이 / 3. 신용카드 / 4. 가상계좌 (토스 SDK 공통 사용)
        } else {
            try {
                const tossPayments = await loadTossPayments("test_ck_kYG57Eba3GmDmmW4wpMwrpWDOxmA"); 
                localStorage.setItem('temp_plan_data', JSON.stringify(finalPlanData));

                const orderId = `order_${new Date().getTime()}`;
                const orderName = `${finalPlanData?.region_name || '지역'} 여행 일정 결제`;

                if (selectedMethod === 'toss') {
                    // 토스페이 직접 호출
                    await tossPayments.requestPayment('TOSSPAY', {
                        amount: totalPrice,
                        orderId: orderId,
                        orderName: orderName,
                        successUrl: `${window.location.origin}/payment/toss/success`,
                        failUrl: `${window.location.origin}/payment/toss/fail`,
                    });
                } else if (selectedMethod === 'card') {
                    // [추가] 일반 신용/체크카드 결제창 호출
                    await tossPayments.requestPayment('카드', {
                        amount: totalPrice,
                        orderId: orderId,
                        orderName: orderName,
                        successUrl: `${window.location.origin}/payment/toss/success`,
                        failUrl: `${window.location.origin}/payment/toss/fail`,
                    });
                } else if (selectedMethod === 'vbank') {
                    // 가상계좌 호출
                    await tossPayments.requestPayment('가상계좌', {
                        amount: totalPrice,
                        orderId: orderId,
                        orderName: orderName,
                        customerName: "홍길동", 
                        successUrl: `${window.location.origin}/payment/vbank/success`,
                        failUrl: `${window.location.origin}/payment/vbank/fail`,
                    });
                }
            } catch (error) {
                console.error("토스 결제 호출 에러:", error);
                alert("결제창을 불러오는 중 오류가 발생했습니다.");
            }
        }
    };

    if (!finalPlanData) {
        return (
            <div className="checkout-container">
                <p>잘못된 접근입니다. 일정을 먼저 생성해주세요.</p>
                <button onClick={() => navigate('/')}>처음으로 돌아가기</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-card">
                <div className="checkout-title">
                    <h2>💳 최종 결제 확인</h2>
                    <p>선택하신 일정을 확정하기 위해 결제를 진행합니다.</p>
                </div>

                <div className="summary-section">
                    <div className="summary-info-box">
                        <div className="info-row">
                            <span>여행지</span>
                            <strong>
                                {finalPlanData.region_name} {finalPlanData.sub_region === 'all' ? '전체' : finalPlanData.sub_region}
                            </strong>
                        </div>
                        
                        <div className="selected-items-summary">
                            <p className="summary-label">선택된 장소 ({displayDetails.length}곳)</p>
                            <ul className="summary-list">
                                {displayDetails.map((item) => (
                                    <li key={item.id}>· {item.name} ({item.price.toLocaleString()}원)</li>
                                ))}
                            </ul>
                        </div>

                        <div className="info-row">
                            <span>최종 결제 금액</span>
                            <span className="price-amount">{totalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>

                <div className="method-section">
                    <h3>결제 수단 선택</h3>
                    <div className="method-grid">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`method-item ${selectedMethod === method.id ? 'active' : ''}`}
                                onClick={() => setSelectedMethod(method.id)}
                            >
                                <span className="method-icon">{method.icon}</span>
                                <span className="method-name">{method.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="pay-submit-btn" onClick={handlePayment}>
                    {totalPrice.toLocaleString()}원 결제하기
                </button>

                <button className="back-btn" onClick={handleBackToResult}>
                    이전으로 (일정 수정)
                </button>
            </div>
        </div>
    );
};

export default PlanCheckout;