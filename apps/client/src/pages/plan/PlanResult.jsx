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
    const parentRegionDbId = finalPlanData.region_id || finalPlanData.regionId || null;
    const subRegion = finalPlanData.sub_region || "";

    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(1);

    // 숙소, 액티비티, 티켓 (각 1개씩)
    const [accommodation, setAccommodation] = useState(null);
    const [activity, setActivity] = useState(null);
    const [ticket, setTicket] = useState(null);

    // 일정 데이터 로드
    useEffect(() => {
    const fetchRealPlan = async () => {
        try {
            // 한글 이름이 직접 넘어온다면 굳이 Map을 거칠 필요가 없습니다.
            const searchRegion = subRegion || regionName; 

            const response = await axios.post(`${API_BASE}/api/plans/recommend`, {
                keyword: selectedKeywords,
                region: searchRegion // 이제 "충청북도"가 그대로 전달됩니다!
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
                                imageUrl: spot.imageUrl || 'https://via.placeholder.com/150?text=No+Image',
                                is_required: false,
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

    // 숙소, 액티비티, 티켓 각 1개씩 로드 (지역 + 키워드 매칭)
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
            const topScore = scored[0].matchCount;
            const topItems = scored.filter(s => s.matchCount === topScore);
            return topItems[Math.floor(Math.random() * topItems.length)].item;
        };

        const fetchProducts = async () => {
            try {
                const [accomRes, activityRes, ticketRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/accommodations`, { params: { regionId: parentRegionDbId } }),
                    axios.get(`${API_BASE}/api/activities`, { params: { regionId: parentRegionDbId } }),
                    axios.get(`${API_BASE}/api/tickets`, { params: { regionId: parentRegionDbId } }),
                ]);

                const accoms = accomRes.data?.data || [];
                const acts = activityRes.data?.data || [];
                const tkts = ticketRes.data?.data || [];

                const cleanKeywords = selectedKeywords.map(k => k.replace('#', ''));

                console.log("상품 조회 regionId:", parentRegionDbId, "키워드:", cleanKeywords);
                console.log("숙소:", accoms.length, "액티비티:", acts.length, "티켓:", tkts.length);

                setAccommodation(pickByKeyword(accoms, cleanKeywords));
                setActivity(pickByKeyword(acts, cleanKeywords));
                setTicket(pickByKeyword(tkts, cleanKeywords));
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

    const accomTotal = (accommodation?.pricePerNight || 0) * 2; // 1실 2박
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;

    const totalPrice = details
        .filter(item => item.is_selected)
        .reduce((sum, item) => sum + (item.price || 0), 0)
        + accomTotal + activityTotal + ticketTotal;

    const handleGoToCheckout = () => {
        const selectedOnly = details.filter(item => item.is_selected);
        if (selectedOnly.length === 0) {
            alert("선택된 일정이 없습니다.");
            return;
        }
        navigate('/reserve/check', {
            state: {
                finalPlanData: {
                    ...finalPlanData,
                    total_amount: totalPrice,
                    confirmed_details: selectedOnly,
                    selected_accommodation: accommodation,
                    selected_activity: activity,
                    selected_ticket: ticket,
                }
            }
        });
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
            <div className="itinerary-section">
                <div className="result-header">
                    <h2>{regionName} {subRegion && `${subRegion}`} 여행 스케줄 관리</h2>
                    <p>{finalPlanData.start_date} ~ {finalPlanData.end_date} ({finalPlanData.people_count || 1}명)</p>
                </div>

                {details.length === 0 ? (
                    <div className="no-data">
                        <p>해당 조건에 맞는 일정을 찾지 못했습니다. 키워드나 지역을 다시 확인해주세요.</p>
                        <button className="back-btn" onClick={() => navigate(-1)}>뒤로 가기</button>
                    </div>
                ) : (
                    <>
                        <div className="day-tabs">
                            {[...new Set(details.map(item => item.day))].sort((a, b) => a - b).map(day => (
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
                                    <div className="place-image">
                                        <img src={item.imageUrl} alt={item.name} />
                                    </div>
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
                    </>
                )}
            </div>

            {/* 오른쪽: 숙소 / 액티비티 / 티켓 각 1개 */}
            <div className="product-section">
                {accommodation && (
                    <div className="product-card">
                        <div className="product-label">숙소</div>
                        <img
                            className="product-img"
                            src={accommodation.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                            alt={accommodation.name}
                        />
                        <div className="product-body">
                            <span className="product-type">{accommodation.type}</span>
                            <h4>{accommodation.name}</h4>
                            <p className="product-desc">{accommodation.description}</p>
                            <div className="product-price">
                                {accomTotal.toLocaleString()}원 <small>(1실 x 2박)</small>
                            </div>
                        </div>
                    </div>
                )}

                {activity && (
                    <div className="product-card">
                        <div className="product-label">액티비티</div>
                        <img
                            className="product-img"
                            src={activity.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                            alt={activity.name}
                        />
                        <div className="product-body">
                            <span className="product-type">{activity.category}</span>
                            <h4>{activity.name}</h4>
                            <p className="product-desc">{activity.description}</p>
                            {activity.durationMinutes && <small className="product-duration">{activity.durationMinutes}분 소요</small>}
                            <div className="product-price">
                                {activityTotal.toLocaleString()}원 <small>({peopleCount}명)</small>
                            </div>
                        </div>
                    </div>
                )}

                {ticket && (
                    <div className="product-card">
                        <div className="product-label">티켓</div>
                        <img
                            className="product-img"
                            src={ticket.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                            alt={ticket.name}
                        />
                        <div className="product-body">
                            <span className="product-type">{ticket.category}</span>
                            <h4>{ticket.name}</h4>
                            <p className="product-desc">{ticket.description}</p>
                            <div className="product-price">
                                {ticketTotal.toLocaleString()}원 <small>({peopleCount}명)</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* 총 금액 + 예약 버튼 */}
                <div className="product-summary">
                    <div className="summary-row total">
                        <span>총 금액</span>
                        <span>{totalPrice.toLocaleString()}원</span>
                    </div>
                    <button className="book-btn" onClick={handleGoToCheckout}>예약하기</button>
                </div>
            </div>
        </div>
    );
};

export default PlanResult;
