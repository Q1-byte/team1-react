import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import './PlanCheckout.css';

const PlanCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // 데이터 추출
    const { finalPlanData } = location.state || {};
    const confirmedDetails = finalPlanData?.confirmed_details || [];
    const totalPrice = finalPlanData?.total_amount || 0;
    const displayDetails = confirmedDetails; // 기존 코드와의 호환성을 위해 유지

    const [selectedMethod, setSelectedMethod] = useState('kakaopay');

    // 💡 1. 데이터를 일차(day)별로 그룹화하는 함수 (첫 번째 코드 기능 유지)
    const groupedDetails = confirmedDetails.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {});

    // 💡 2. 4가지 결제 수단 리스트 (두 번째 코드 기능 유지)
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
                    confirmed_details: finalPlanData.original_details || confirmedDetails
                }
            }
        });
    };

    // 💡 3. 통합 결제 처리 로직 (기존 기능 보존)
    const handlePayment = async () => {
        if (totalPrice === 0) {
            alert("결제 금액이 0원입니다. 일정을 다시 확인해주세요.");
            return;
        }

        // 공통 데이터 백업
        localStorage.setItem('temp_plan_data', JSON.stringify(finalPlanData));

        // --- [방식 1] 카카오페이 로직 (기존 유지) ---
        if (selectedMethod === 'kakaopay') {
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
                window.location.href = next_redirect_pc_url;
            } catch (error) {
                console.error("카카오 결제 실패:", error);
                alert("카카오페이 서버와 통신 중 오류가 발생했습니다.");
            }

        // --- [방식 2, 3, 4] 토스페이먼츠 로직 (기존 유지) ---
        } else {
            try {
                const tossPayments = await loadTossPayments("test_ck_kYG57Eba3GmDmmW4wpMwrpWDOxmA");
                const orderId = `order_${new Date().getTime()}`;
                const orderName = `${finalPlanData?.region_name || '지역'} 여행 일정 결제`;

                const baseConfig = {
                    amount: totalPrice,
                    orderId: orderId,
                    orderName: orderName,
                };

                if (selectedMethod === 'toss') {
                    await tossPayments.requestPayment('TOSSPAY', {
                        ...baseConfig,
                        successUrl: `${window.location.origin}/payment/toss/success`,
                        failUrl: `${window.location.origin}/payment/toss/fail`,
                    });
                } else if (selectedMethod === 'card') {
                    await tossPayments.requestPayment('카드', {
                        ...baseConfig,
                        successUrl: `${window.location.origin}/payment/toss/success`,
                        failUrl: `${window.location.origin}/payment/toss/fail`,
                    });
                } else if (selectedMethod === 'vbank') {
                    await tossPayments.requestPayment('가상계좌', {
                        ...baseConfig,
                        customerName: user?.name || "홍길동",
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
        <>
            <Header />
            <div className="checkout-page-container">
                <div className="checkout-box">
                    <div className="checkout-title">
                        <h2>💳 최종 예약 확인 및 결제</h2>
                    </div>
                    
                    {/* 영수증 섹션: 일차별 그룹화 적용 */}
                    <div className="receipt-section">
                        <div className="trip-basic-info">
                            <strong>{finalPlanData?.region_name || '부산광역시'} 여행</strong>
                            <p>{finalPlanData?.start_date} ~ {finalPlanData?.end_date}</p>
                        </div>

                        <div className="selected-items-list">
                            {Object.keys(groupedDetails).length > 0 ? (
                                Object.keys(groupedDetails).sort().map((day) => (
                                    <div key={day} className="day-group">
                                        <h4 className="day-title">{day}일차</h4>
                                        {groupedDetails[day].map((item) => (
                                            <div key={item.id} className="selected-item-row">
                                                <div className="item-info">
                                                    <span className="item-type">[{item.type}]</span>
                                                    <span className="item-name">{item.name}</span>
                                                </div>
                                                <span className="item-price">{item.price.toLocaleString()}원</span>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p className="empty-msg">선택된 일정이 없습니다.</p>
                            )}
                        </div>

                        <div className="receipt-footer">
                            <span>총 결제 금액</span>
                            <span className="price-amount">{totalPrice.toLocaleString()}원</span>
                        </div>
                    </div>

                    {/* ✅ 수정된 결제 수단 선택 섹션: div를 button으로 변경하여 클릭 감도 상향 */}
                    <div className="payment-method-section">
                        <p className="method-label">결제 수단 선택</p>
                        <div className="method-grid">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    className={`method-item ${selectedMethod === method.id ? 'active' : ''}`}
                                    onClick={() => setSelectedMethod(method.id)}
                                >
                                    <span className="method-icon">{method.icon}</span>
                                    <span className="method-name">{method.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 하단 액션 버튼 */}
                    <div className="checkout-actions">
                        <button className="main-pay-btn" onClick={handlePayment}>
                            {totalPrice.toLocaleString()}원 결제하기
                        </button>
                        <button className="back-btn" onClick={handleBackToResult}>
                            일정 수정하러 가기
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlanCheckout;