import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PlanResult.css';
import Header from '../../components/Header';

const API_BASE = 'http://localhost:8080';

const PlanResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const finalPlanData = location.state?.finalPlanData || {};
    const selectedKeywords = finalPlanData.keywords || ["#힐링"];
    const regionName = finalPlanData.region_name || finalPlanData.regionName || "지역미정";
    const parentRegionDbId = finalPlanData.parent_region_db_id || null;
    const subRegion = finalPlanData.sub_region || "";

    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(1);

    const [accommodation, setAccommodation] = useState(null);
    const [activity, setActivity] = useState(null);
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        const fetchRealPlan = async () => {
            try {
                const SHORT_TO_FULL = {
                    "서울": "서울", "부산": "부산", "대구": "대구", "인천": "인천",
                    "광주": "광주", "대전": "대전", "울산": "울산", "세종": "세종",
                    "경기": "경기", "강원": "강원",
                    "충북": "충청북도", "충남": "충청남도",
                    "전북": "전라북도", "전남": "전라남도",
                    "경북": "경상북도", "경남": "경상남도",
                    "제주": "제주"
                };
                const resolvedRegion = SHORT_TO_FULL[regionName] || regionName;
                const searchRegion = subRegion || resolvedRegion;

                const response = await axios.post(`${API_BASE}/api/plans/recommend`, {
                    keyword: selectedKeywords,
                    region: searchRegion
                });

                const scheduleMap = response.data.schedule;
                const formattedDetails = [];

                Object.entries(scheduleMap).forEach(([dayStr, spots]) => {
                    const dayNum = parseInt(dayStr.replace(/[^0-9]/g, '')) || 1;
                    if (Array.isArray(spots)) {
                        spots.forEach(spot => {
                            formattedDetails.push({
                                id: spot.id,
                                day: dayNum,
                                type: spot.spotKeywords?.[0]?.keyword?.name || '관광',
                                name: spot.name,
                                address: spot.address,
                                price: 0,
                                imageUrl: spot.imageUrl || "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27150%27 height=%27150%27%3E%3Crect width=%27150%27 height=%27150%27 fill=%27%23ddd%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23999%27 font-size=%2714%27%3ENo Image%3C/text%3E%3C/svg%3E",
                                is_selected: true
                            });
                        });
                    }
                });

                setDetails(formattedDetails);
                if (formattedDetails.length > 0) {
                    setActiveDay(Math.min(...formattedDetails.map(d => d.day)));
                }
            } catch (error) {
                console.error("API 에러 발생:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRealPlan();
    }, [regionName, subRegion, JSON.stringify(selectedKeywords)]);

    useEffect(() => {
        if (!parentRegionDbId) return;
        const pickByKeyword = (list, keywords) => {
            if (list.length === 0) return null;
            const scored = list.map(item => {
                const itemKws = (item.keywords || '').split(',').map(k => k.trim());
                const matchCount = keywords.filter(kw => itemKws.some(ik => ik.includes(kw) || kw.includes(ik))).length;
                return { item, matchCount };
            });
            scored.sort((a, b) => b.matchCount - a.matchCount);
            return scored[0]?.item || null;
        };

        const fetchProducts = async () => {
            try {
                const [accomRes, activityRes, ticketRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/accommodations`, { params: { regionId: parentRegionDbId } }),
                    axios.get(`${API_BASE}/api/activities`, { params: { regionId: parentRegionDbId } }),
                    axios.get(`${API_BASE}/api/tickets`, { params: { regionId: parentRegionDbId } }),
                ]);
                const cleanKeywords = selectedKeywords.map(k => k.replace('#', ''));
                setAccommodation(pickByKeyword(accomRes.data?.data || [], cleanKeywords));
                setActivity(pickByKeyword(activityRes.data?.data || [], cleanKeywords));
                setTicket(pickByKeyword(ticketRes.data?.data || [], cleanKeywords));
            } catch (error) {
                console.error("상품 데이터 로드 실패:", error);
            }
        };
        fetchProducts();
    }, [parentRegionDbId, JSON.stringify(selectedKeywords)]);

    const toggleItem = (id) => {
        setDetails(prev => prev.map(item =>
            item.id === id ? { ...item, is_selected: !item.is_selected } : item
        ));
    };

    const peopleCount = finalPlanData.people_count || 1;
    const accomTotal = (accommodation?.pricePerNight || 0) * 2;
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;
    const totalPrice = details.filter(item => item.is_selected).reduce((sum, item) => sum + (item.price || 0), 0) + accomTotal + activityTotal + ticketTotal;

    const handleGoToCheckout = () => {
        const selectedOnly = details.filter(item => item.is_selected);
        if (selectedOnly.length === 0) { alert("선택된 일정이 없습니다."); return; }
        navigate('/reserve/check', { state: { finalPlanData: { ...finalPlanData, total_amount: totalPrice, confirmed_details: selectedOnly, selected_accommodation: accommodation, selected_activity: activity, selected_ticket: ticket } } });
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>AI가 {regionName} 맞춤형 일정을 구성 중입니다...</p>
        </div>
    );

    return (
        <div className="result-layout">
            <Header />
            
            <div className="result-main-container">
                {/* 하나의 흰색 카드 컨테이너 */}
                <div className="combined-result-card">
                    
                    {/* 왼쪽 일정 섹션 */}
                    <div className="itinerary-section">
                        <div className="result-header">
                            <h2>{regionName} {subRegion && `${subRegion}`} 여행 스케줄 관리</h2>
                            <p>{finalPlanData.start_date} ~ {finalPlanData.end_date} ({peopleCount}명)</p>
                        </div>

                        {details.length === 0 ? (
                            <div className="no-data">
                                <p>해당 조건에 맞는 일정을 찾지 못했습니다.</p>
                                <button className="back-btn" onClick={() => navigate(-1)}>뒤로 가기</button>
                            </div>
                        ) : (
                            <>
                                <div className="day-tabs">
                                    {[...new Set(details.map(item => item.day))].sort((a, b) => a - b).map(day => (
                                        <button key={day} className={activeDay === day ? 'active' : ''} onClick={() => setActiveDay(day)}>
                                            {day}일차
                                        </button>
                                    ))}
                                </div>
                                <div className="itinerary-list">
                                    {details.filter(item => item.day === activeDay).map(item => (
                                        <div key={item.id} className={`itinerary-card ${!item.is_selected ? 'removed' : ''}`}>
                                            <div className="place-image"><img src={item.imageUrl} alt={item.name} /></div>
                                            <div className="place-info">
                                                <span className="item-tag">{item.type}</span>
                                                <h4>{item.name}</h4>
                                                <p className="address">{item.address}</p>
                                            </div>
                                            <div className="item-right-side">
                                                <div className="price-tag">{item.price.toLocaleString()} 원</div>
                                                <button className={`toggle-btn ${item.is_selected ? 'remove' : 'add'}`} onClick={() => toggleItem(item.id)}>
                                                    {item.is_selected ? '일정 제거' : '일정 추가'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 오른쪽 상품 섹션 */}
                    <div className="product-section">
                        <h3 className="section-title">추천 여행 상품</h3>
                        <div className="product-scroll-area">
                            {accommodation && (
                                <div className="product-card">
                                    <div className="product-label">숙소</div>
                                    <img className="product-img" src={accommodation.imageUrl} alt={accommodation.name} />
                                    <div className="product-body">
                                        <h4>{accommodation.name}</h4>
                                        <div className="product-price">{accomTotal.toLocaleString()}원</div>
                                    </div>
                                </div>
                            )}
                            {activity && (
                                <div className="product-card">
                                    <div className="product-label">액티비티</div>
                                    <img className="product-img" src={activity.imageUrl} alt={activity.name} />
                                    <div className="product-body">
                                        <h4>{activity.name}</h4>
                                        <div className="product-price">{activityTotal.toLocaleString()}원</div>
                                    </div>
                                </div>
                            )}
                            {ticket && (
                                <div className="product-card">
                                    <div className="product-label">티켓</div>
                                    <img className="product-img" src={ticket.imageUrl} alt={ticket.name} />
                                    <div className="product-body">
                                        <h4>{ticket.name}</h4>
                                        <div className="product-price">{ticketTotal.toLocaleString()}원</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 결제 바 (카드 바로 아래 배치) */}
                <div className="bottom-checkout-bar">
                    <div className="checkout-content">
                        <div className="total-price-info">
                            <span className="label">총 결제 예상 금액</span>
                            <span className="price">{totalPrice.toLocaleString()}원</span>
                        </div>
                        <button className="final-book-btn" onClick={handleGoToCheckout}>예약하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanResult;