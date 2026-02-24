import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import './PlanCheckout.css';

const PlanCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login', { state: { from: location.pathname } }); 
        }
    }, [user, loading, navigate]);

    const { finalPlanData } = location.state || {};
    const confirmedDetails = finalPlanData?.confirmed_details || [];
    const totalPrice = finalPlanData?.total_amount || 0;
    const displayDetails = confirmedDetails;

    const accommodation = finalPlanData?.selected_accommodation;
    const activity = finalPlanData?.selected_activity;
    const ticket = finalPlanData?.selected_ticket;
    const peopleCount = finalPlanData?.people_count || 1;
    const accomTotal = (accommodation?.pricePerNight || 0) * 2;
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;

    const [selectedMethod, setSelectedMethod] = useState('kakaopay');
    const [userPoint, setUserPoint] = useState(user?.point || 0);
    const [usePoints, setUsePoints] = useState(0);

    const finalAmount = Math.max(0, totalPrice - usePoints);

    useEffect(() => {
        if (user?.id) {
            api.get('/api/mypage').then(res => {
                const data = res.data?.data || res.data;
                setUserPoint(data?.user?.point ?? user?.point ?? 0);
            }).catch(() => {
                setUserPoint(user?.point || 0);
            });
        }
    }, [user?.id]);

    const handlePointInput = (value) => {
        const num = parseInt(value) || 0;
        const max = Math.min(userPoint, totalPrice);
        setUsePoints(Math.min(Math.max(0, num), max));
    };

    const groupedDetails = confirmedDetails.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {});

    const paymentMethods = [
        { id: 'kakaopay', name: '카카오페이', icon: '🟡' },
        { id: 'toss', name: '토스페이', icon: '🔵' },
        { id: 'card', name: '신용/체크카드', icon: '💳' },
        { id: 'vbank', name: '무통장 입금', icon: '🏦' },
    ];

    const handleBackToResult = () => {
        navigate('/reserve/result', {
            state: {
                finalPlanData: {
                    ...finalPlanData,
                    confirmed_details: finalPlanData.original_details || confirmedDetails
                }
            }
        });
    };

    // 💡 수정된 통합 결제 처리 로직
    const handlePayment = async () => {
        if (finalAmount === 0 && usePoints === 0) {
            alert("결제 금액이 0원입니다. 일정을 다시 확인해주세요.");
            return;
        }

        if (!user?.id) {
            alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
            navigate('/login');
            return;
        }

        // [핵심!] 토스/카카오로 떠나기 전, 모든 필수 정보를 localStorage에 안전하게 보관합니다.
        localStorage.setItem('user_id', String(user.id)); // <-- 이 부분이 TossSuccess 에러를 해결합니다.
        localStorage.setItem('temp_plan_data', JSON.stringify(finalPlanData));
        if (finalPlanData?.plan_id) {
            localStorage.setItem('plan_id', String(finalPlanData.plan_id));
        }
        localStorage.setItem('use_points', String(usePoints));

        // --- [방식 1] 카카오페이 ---
        if (selectedMethod === 'kakaopay') {
            try {
                const response = await api.post('/payment/ready', {
                    item_name: `${finalPlanData?.region_name || '지역'} AI 맞춤 여행 일정`,
                    total_amount: finalAmount,
                    partner_order_id: `order_${new Date().getTime()}`,
                    partner_user_id: String(user.id),
                    user_id: user.id,
                    plan_id: finalPlanData?.plan_id,
                    use_point: usePoints,
                    plan_items: displayDetails
                });

                const { next_redirect_pc_url, tid } = response.data;
                localStorage.setItem('kakao_tid', tid);
                window.location.href = next_redirect_pc_url;
            } catch (error) {
                console.error("카카오 결제 실패:", error);
                alert("카카오페이 서버와 통신 중 오류가 발생했습니다.");
            }

        // --- [방식 2, 3, 4] 토스페이먼츠 ---
        } else {
            try {
                const tossPayments = await loadTossPayments("test_ck_kYG57Eba3GmDmmW4wpMwrpWDOxmA");
                const orderId = `order_${new Date().getTime()}`;
                const orderName = `${finalPlanData?.region_name || '지역'} 여행 일정 결제`;

                const baseConfig = {
                    amount: finalAmount,
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
            <div className="checkout-page-container">
                <div className="checkout-box">
                    <div className="checkout-title">
                        <h2>💳 최종 예약 확인 및 결제</h2>
                    </div>
                    
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
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p className="empty-msg">선택된 일정이 없습니다.</p>
                            )}
                        </div>

                        <div className="product-price-list">
                            {accommodation && (
                                <div className="selected-item-row">
                                    <div className="item-info">
                                        <span className="item-type">[숙소]</span>
                                        <span className="item-name">{accommodation.name}</span>
                                    </div>
                                    <span className="item-price">{accomTotal.toLocaleString()}원 <small>(1실 x 2박)</small></span>
                                </div>
                            )}
                            {activity && (
                                <div className="selected-item-row">
                                    <div className="item-info">
                                        <span className="item-type">[액티비티]</span>
                                        <span className="item-name">{activity.name}</span>
                                    </div>
                                    <span className="item-price">{activityTotal.toLocaleString()}원 <small>({peopleCount}명)</small></span>
                                </div>
                            )}
                            {ticket && (
                                <div className="selected-item-row">
                                    <div className="item-info">
                                        <span className="item-type">[티켓]</span>
                                        <span className="item-name">{ticket.name}</span>
                                    </div>
                                    <span className="item-price">{ticketTotal.toLocaleString()}원 <small>({peopleCount}명)</small></span>
                                </div>
                            )}
                        </div>

                        <div className="receipt-footer">
                            {usePoints > 0 ? (
                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>상품 금액</span>
                                        <span>{totalPrice.toLocaleString()}원</span>
                                    </div>
                                    <div className="price-row discount">
                                        <span>포인트 할인</span>
                                        <span>- {usePoints.toLocaleString()} P</span>
                                    </div>
                                    <div className="price-row final">
                                        <span>최종 결제 금액</span>
                                        <span className="price-amount">{finalAmount.toLocaleString()}원</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span>총 결제 금액</span>
                                    <span className="price-amount">{totalPrice.toLocaleString()}원</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="point-section">
                        <div className="point-header">
                            <span className="point-label">🎁 포인트 사용</span>
                            <span className="point-balance">보유 포인트: <strong>{userPoint.toLocaleString()} P</strong></span>
                        </div>
                        <div className="point-input-row">
                            <input
                                type="number"
                                className="point-input"
                                value={usePoints || ''}
                                min={0}
                                max={Math.min(userPoint, totalPrice)}
                                placeholder="사용할 포인트 입력"
                                onChange={(e) => handlePointInput(e.target.value)}
                            />
                            <button
                                className="point-all-btn"
                                onClick={() => setUsePoints(Math.min(userPoint, totalPrice))}
                            >
                                전액 사용
                            </button>
                            {usePoints > 0 && (
                                <button className="point-reset-btn" onClick={() => setUsePoints(0)}>취소</button>
                            )}
                        </div>
                        {usePoints > 0 && (
                            <p className="point-discount-msg">{usePoints.toLocaleString()} P 할인 적용 → {finalAmount.toLocaleString()}원 결제</p>
                        )}
                    </div>

                    <div className="payment-method-section">
                        <p className="method-label">결제 수단 선택</p>
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

                    <div className="checkout-actions">
                        <button className="main-pay-btn" onClick={handlePayment}>
                            {finalAmount.toLocaleString()}원 결제하기
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