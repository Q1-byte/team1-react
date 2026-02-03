import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PlanCheckout.css';

const PlanCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Result 페이지에서 전달한 데이터 추출
    const { finalPlanData } = location.state || {};

    // Result 페이지에서 계산되어 넘어온 최종 금액
    const totalPrice = finalPlanData?.total_amount || 0;
    
    // [추가] 화면 표시용 데이터: 필터링된 '확정 일정'만 사용
    const displayDetails = finalPlanData?.confirmed_details || [];

    // 2. 결제 수단 상태 관리
    const [selectedMethod, setSelectedMethod] = useState('kakaopay');

    const paymentMethods = [
        { id: 'kakaopay', name: '카카오페이', icon: '🟡' },
        { id: 'toss', name: '토스페이', icon: '🔵' },
        { id: 'card', name: '신용/체크카드', icon: '💳' },
        { id: 'vbank', name: '무통장 입금', icon: '🏦' },
    ];

    // [핵심 수정] 이전으로 돌아갈 때 '원본 데이터(original_details)'를 복원해서 전달
    const handleBackToResult = () => {
        navigate('/result', { 
            state: { 
                finalPlanData: {
                    ...finalPlanData,
                    // Checkout에 올 때 백업해둔 전체 리스트를 다시 confirmed_details 위치로 복구
                    confirmed_details: finalPlanData.original_details 
                } 
            } 
        });
    };

    // 3. 결제 처리 로직
    const handlePayment = async () => {
        if (totalPrice === 0) {
            alert("결제 금액이 0원입니다. 일정을 다시 확인해주세요.");
            return;
        }

        if (selectedMethod === 'kakaopay') {
            try {
                // 백엔드에는 '확정된' 정보 위주로 보냅니다.
                const response = await axios.post('http://localhost:5000/api/payment/ready', {
                    item_name: `${finalPlanData?.region_name || '지역'} AI 맞춤 여행 일정`,
                    total_amount: totalPrice,
                    partner_order_id: `order_${new Date().getTime()}`,
                    partner_user_id: "user_1234",
                    // DB 저장용으로는 확정된 일정(displayDetails)만 보내는 것이 효율적입니다.
                    plan_items: displayDetails 
                });

                const { next_redirect_pc_url, tid } = response.data;
                localStorage.setItem('kakao_tid', tid);
                localStorage.setItem('temp_plan_data', JSON.stringify(finalPlanData));

                window.location.href = next_redirect_pc_url;

            } catch (error) {
                console.error("결제 준비 요청 실패:", error);
                alert("서버와 통신 중 오류가 발생했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.");
            }
        } else {
            alert(`${selectedMethod} 결제는 현재 준비 중입니다. 카카오페이를 선택해주세요!`);
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

                {/* 여행 요약 정보 섹션 */}
                <div className="summary-section">
                    <div className="summary-info-box">
                        <div className="info-row">
                            <span>여행지</span>
                            <strong>
                                {finalPlanData.region_name} {finalPlanData.sub_region === 'all' ? '전체' : finalPlanData.sub_region}
                            </strong>
                        </div>
                        
                        {/* [추가된 부분] 선택된 장소 요약 리스트 */}
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

                {/* 결제 수단 선택 섹션 */}
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