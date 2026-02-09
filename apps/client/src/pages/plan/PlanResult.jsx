import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlanResult.css';
import Header from '../../components/Header';

const PlanResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. 이전 페이지(Keyword)에서 넘어온 데이터 수신
    const finalPlanData = location.state?.finalPlanData || {};

    // 2. 초기 상태 설정: 결제 페이지에서 돌아왔을 때 데이터가 있다면 복원
    const [details, setDetails] = useState(() => {
        return finalPlanData.confirmed_details || [];
    });
    
    // 3. 로딩 상태 및 현재 선택된 일차(Day) 관리
    const [loading, setLoading] = useState(details.length === 0); 
    const [activeDay, setActiveDay] = useState(1); 

    useEffect(() => {
        // 데이터가 없는 경우에만 AI 시뮬레이션(Mock Data) 실행
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

    // 일정 선택/해제 핸들러
    const toggleItem = (id) => {
        setDetails(prev => prev.map(item =>
            item.id === id ? { ...item, is_selected: !item.is_selected } : item
        ));
    };

    // 총 결제 예상 금액 계산
    const totalPrice = details
        .filter(item => item.is_selected)
        .reduce((sum, item) => sum + item.price, 0);

    // [핵심] 결제 확인 페이지(/check)로 이동하는 핸들러
    // PlanResult.jsx 내의 이동 함수
const handleGoToCheckout = () => {
    if (totalPrice === 0) {
        alert("선택된 일정이 없습니다.");
        return;
    }

    // 필터링된 데이터 준비
    const selectedOnly = details.filter(item => item.is_selected);

    // 💡 핵심: '/reserve/check'로 보낼 때 객체 구조를 정확히 맞춥니다.
    navigate('/reserve/check', { 
        state: { 
            finalPlanData: {
                region_name: finalPlanData.region_name, // 지역명
                start_date: finalPlanData.start_date,   // 날짜
                end_date: finalPlanData.end_date,
                total_amount: totalPrice,               // 총 금액
                confirmed_details: selectedOnly         // 선택된 리스트
            } 
        } 
    });
};

    

    if (loading) return (
        <>
            <Header />
            <div className="loading-container">
                <div className="spinner"></div>
                <p>🤖 AI가 {finalPlanData.region_name || '지역'} 맞춤형 일정을 구성 중입니다...</p>
            </div>
        </>
    );

    return (
      <> 
      <Header />
        <div className="result-layout">
            {/* 왼쪽: 일차별 일정 리스트 영역 */}
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
            
            {/* 오른쪽: 요약 정보 카드 (상세 내역 삭제 버전) */}
            {/* --- 우측 사이드바: 디자인 강화 버전 --- */}
            <div className="cost-summary-card">
                <div className="summary-ticket-effect">
                    <h3>Trip Summary</h3>
                    <div className="ticket-divider"></div>
                    
                    <div className="summary-info">
                        <div className="info-row">
                            <span>장소</span>
                            <strong>{finalPlanData.region_name}</strong>
                        </div>
                        <div className="info-row">
                            <span>기간</span>
                            <span>{finalPlanData.start_date?.slice(5)} - {finalPlanData.end_date?.slice(5)}</span>
                        </div>
                        <div className="info-row">
                            <span>인원</span>
                            <span>{finalPlanData.people_count}명</span>
                        </div>
                    </div>

                    <div className="ticket-divider-dashed"></div>

                    <div className="cost-list">
                        <div className="cost-row total-only">
                            <span className="label">총 결제 금액</span>
                            <span className="total-price">{totalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>

                <div className="summary-notice">
                    <p>선택하신 {details.filter(item => item.is_selected).length}개의 일정이 반영되었습니다.</p>
                </div>

                <button className="book-btn" onClick={handleGoToCheckout}>
                    결제 단계로 이동하기
                </button>
            </div>
        </div>
      </>
    );
};

export default PlanResult;