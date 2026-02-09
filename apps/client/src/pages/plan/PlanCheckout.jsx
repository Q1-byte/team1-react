import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import './PlanCheckout.css';

const PlanCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { finalPlanData } = location.state || {};
    const confirmedDetails = finalPlanData?.confirmed_details || [];
    const totalPrice = finalPlanData?.total_amount || 0;

    const [paymentMethod, setPaymentMethod] = useState('kakao');

    // 💡 데이터를 일차(day)별로 그룹화하는 함수
    const groupedDetails = confirmedDetails.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {});

    const handlePayment = () => {
        if (totalPrice === 0) {
            alert("결제할 금액이 없습니다.");
            return;
        }
        alert(`${paymentMethod} 결제를 시작합니다.`);
    };

    return (
        <>
            <Header />
            <div className="checkout-page-container">
                <div className="checkout-box">
                    <h2>최종 예약 확인</h2>
                    
                    <div className="receipt-section">
                        <div className="trip-basic-info">
                            <strong>{finalPlanData?.region_name || '부산광역시'} 여행</strong>
                            <p>{finalPlanData?.start_date} ~ {finalPlanData?.end_date}</p>
                        </div>

                        {/* 💡 일차별로 그룹화된 리스트 출력 */}
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
                            <span>{totalPrice.toLocaleString()}원</span>
                        </div>
                    </div>

                    <div className="payment-method-section">
                        <p className="method-label">결제 수단 선택</p>
                        <div className="method-grid">
                            <button className={paymentMethod === 'kakao' ? 'active' : ''} onClick={() => setPaymentMethod('kakao')}>카카오페이</button>
                            <button className={paymentMethod === 'toss' ? 'active' : ''} onClick={() => setPaymentMethod('toss')}>토스페이</button>
                        </div>
                    </div>

                    <div className="checkout-actions">
                        <button className="main-pay-btn" onClick={handlePayment}>
                            {totalPrice.toLocaleString()}원 결제하기
                        </button>
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            일정 수정하러 가기
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlanCheckout;