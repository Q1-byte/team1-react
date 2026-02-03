import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlanResult.css';

const PlanResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. 이전 페이지에서 넘어온 데이터 (Keyword에서 처음 왔거나, Checkout에서 복귀했거나)
    const finalPlanData = location.state?.finalPlanData || {};

    // 2. 초기값 설정: Checkout에서 복귀 시 original_details가 있다면 그것을 우선 사용
    const [details, setDetails] = useState(() => {
        return finalPlanData.confirmed_details || [];
    });
    
    // 3. 데이터 존재 여부에 따른 로딩 상태 초기화
    const [loading, setLoading] = useState(details.length === 0); 
    const [activeDay, setActiveDay] = useState(1); 

    useEffect(() => {
        // 처음 진입하여 데이터가 없는 경우에만 AI 시뮬레이션 실행
        if (details.length === 0) {
            const mockData = [
                { id: 1, day: 1, type: '관광', name: '동백섬', address: '부산광역시 해운대구...', price: 30000, is_required: false, is_selected: true },
                { id: 2, day: 1, type: '관광', name: '해운대', address: '부산광역시 해운대구...', price: 20000, is_required: false, is_selected: true },
                { id: 3, day: 2, type: '숙소', name: '그랜드 오션 호텔', address: '부산광역시...', price: 150000, is_required: true, is_selected: true },
                { id: 4, day: 3, type: '카페', name: '기장 웨이브온', address: '부산광역시 기장군...', price: 15000, is_required: false, is_selected: true },
            ];

            const timer = setTimeout(() => {
                setDetails(mockData);
                setLoading(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [details.length]);

    const toggleItem = (id) => {
        setDetails(prev => prev.map(item =>
            item.id === id ? { ...item, is_selected: !item.is_selected } : item
        ));
    };

    const getDayTotal = (day) => details
        .filter(item => item.day === day && item.is_selected)
        .reduce((sum, item) => sum + item.price, 0);

    const totalPrice = details
        .filter(item => item.is_selected)
        .reduce((sum, item) => sum + item.price, 0);

    // [핵심 수정] 결제창으로 이동하는 핸들러
    const handleGoToCheckout = () => {
        if (totalPrice === 0) {
            alert("선택된 일정이 없습니다. 일정을 추가해주세요!");
            return;
        }

        // 선택된(is_selected: true) 항목만 추출
        const selectedOnly = details.filter(item => item.is_selected);

        navigate('/checkout', { 
            state: { 
                finalPlanData: {
                    ...finalPlanData,
                    total_amount: totalPrice,
                    // 결제창 보여주기용 (확정된 것만)
                    confirmed_details: selectedOnly, 
                    // 복귀 시 복원용 (전체 리스트 - 선택 안 한 것 포함)
                    original_details: details 
                } 
            } 
        });
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>🤖 AI가 {finalPlanData.region_name || '지역'} 맞춤형 일정을 구성 중입니다...</p>
        </div>
    );

    return (
        <div className="result-layout">
            <div className="itinerary-section">
                <div className="result-header">
                    <h2>{finalPlanData.region_name} 여행 스케줄 관리</h2>
                    <p>{finalPlanData.start_date} ~ {finalPlanData.end_date} ({finalPlanData.people_count}명)</p>
                </div>
                
                <div className="day-tabs">
                    {[...new Set(details.map(item => item.day))].sort().map(day => (
                        <button 
                            key={day} 
                            className={activeDay === day ? 'active' : ''} 
                            onClick={() => setActiveDay(day)}
                        >
                            {day}일차
                        </button>
                    ))}
                </div>

                <div className="itinerary-list">
                    {details.filter(item => item.day === activeDay).map(item => (
                        <div key={item.id} className={`itinerary-card ${!item.is_selected ? 'removed' : ''}`}>
                            <div className="place-info">
                                <span className="item-tag">{item.type}</span>
                                <h4>{item.name}</h4>
                                <p className="address">{item.address}</p>
                            </div>
                            <div className="item-right-side">
                                <div className="price-tag">{item.price.toLocaleString()} 원</div>
                                <button 
                                    className={`toggle-btn ${item.is_selected ? 'remove' : 'add'}`} 
                                    onClick={() => toggleItem(item.id)}
                                >
                                    {item.is_selected ? '일정 제거' : '일정 추가'} 
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cost-summary-card">
                <h3>여행 경비 요약</h3>
                <div className="cost-list">
                    {[...new Set(details.map(item => item.day))].sort().map(day => (
                        <div className="cost-row" key={day}>
                            <span>{day}일차 경비</span>
                            <span>{getDayTotal(day).toLocaleString()} 원</span>
                        </div>
                    ))}
                    
                    <div className="cost-row total">
                        <span>총 결제 예상 금액</span>
                        <span className="total-price">{totalPrice.toLocaleString()} 원</span>
                    </div>
                </div>
                
                <div className="summary-notice">
                    <p>* AI가 추천한 최적의 경로입니다.</p>
                    <p>* 일정 제거 시 총 금액이 자동 차감됩니다.</p>
                </div>

                <button className="book-btn" onClick={handleGoToCheckout}>
                    최종 예약 및 결제하기 
                </button>
            </div>
        </div>
    );
};

export default PlanResult;