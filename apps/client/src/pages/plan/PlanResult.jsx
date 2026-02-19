import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './PlanResult.css';
import Header from '../../components/Header';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:8080';

const PlanResult = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const hasSaved = useRef(false);

    const finalPlanData = location.state?.finalPlanData || {};
    const selectedKeywords = finalPlanData.keywords || ["#힐링"];
    const subRegion = finalPlanData.sub_region || "";

    const [parentRegionDbId, setParentRegionDbId] = useState(finalPlanData.parent_region_db_id || null);
    const [regionName, setRegionName] = useState(finalPlanData.region_name || finalPlanData.regionName || "지역미정");
    const [startDate, setStartDate] = useState(finalPlanData.start_date || '');
    const [endDate, setEndDate] = useState(finalPlanData.end_date || '');
    const [peopleCount, setPeopleCount] = useState(finalPlanData.people_count || 1);

    const [savedPlanId, setSavedPlanId] = useState(null);

    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(1);

    const [accommodation, setAccommodation] = useState(null);
    const [activity, setActivity] = useState(null);
    const [ticket, setTicket] = useState(null);

    // ✨ [추가] 자동 저장 함수: 추천받은 즉시 DB에 기록
    // PlanResult.js 내 해당 함수 찾아서 수정
    const savePlanAutomatically = async (formattedDetails) => {
    console.log("자동 저장 시도 시작..."); // 👈 확인용
    console.log("현재 유저 정보:", user); // 👈 유저 ID가 찍히는지 확인
    console.log("데이터 개수:", formattedDetails.length);

    if (hasSaved.current) return;
    if (!user?.id) {
        console.warn("⚠️ 유저 ID가 없어 저장을 중단합니다.");
        return;
    }
    if (planId) return; // 이미 저장된 글을 보는 중이라면 중단

    const planPayload = {
        userId: user.id,
        regionName: regionName,
        startDate: finalPlanData.start_date,
        endDate: finalPlanData.end_date,
        peopleCount: finalPlanData.people_count || 1,
        spots: formattedDetails.map(d => ({ spotId: d.id, day: d.day }))
    };

    try {
        hasSaved.current = true;
        const response = await api.post('/plans/save', planPayload);
        const raw = response.data;
        const id = typeof raw === 'number' ? raw : (raw?.id ?? raw?.planId ?? raw?.data);
        console.log("✅ DB 자동 저장 성공! 생성된 ID:", id);
        if (id) {
            setSavedPlanId(id);
            api.post(`/plans/${id}/view`).catch(() => {});
        }
    } catch (error) {
        console.error("❌ 자동 저장 실패:", error.response?.data || error.message);
    }
};

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

            if (scheduleMap) {
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
                                imageUrl: spot.imageUrl || "기본이미지...",
                                is_selected: true
                            });
                        });
                    }
                });
            }

            // 1. 화면을 그리기 위해 스테이트 업데이트
            setDetails(formattedDetails);

            if (formattedDetails.length > 0) {
                savePlanAutomatically(formattedDetails);
            }

            // 3. 첫 번째 날짜 탭 활성화
            if (formattedDetails.length > 0) {
                setActiveDay(Math.min(...formattedDetails.map(d => d.day)));
            }
        } catch (error) {
            console.error("API 에러 발생:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (location.state?.finalPlanData) {
                    await fetchRealPlan();
                } else if (planId) {
                    const res = await api.get(`/plans/${planId}?userId=${user?.id}`);
                    const data = res.data;

                    if (data.regionId) setParentRegionDbId(data.regionId);
                    if (data.region) setRegionName(data.region);
                    if (data.peopleCount) setPeopleCount(data.peopleCount);
                    if (data.travelDate) {
                        setStartDate(data.travelDate);
                        if (data.durationDays) {
                            const end = new Date(data.travelDate);
                            end.setDate(end.getDate() + data.durationDays - 1);
                            setEndDate(end.toISOString().split('T')[0]);
                        }
                    }

                    if (data.schedule) {
                        const formattedDetails = [];
                        Object.entries(data.schedule).forEach(([dayStr, spots]) => {
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
                                        imageUrl: spot.imageUrl || "기본이미지URL",
                                        is_selected: true
                                    });
                                });
                            }
                        });
                        setDetails(formattedDetails);
                        if (formattedDetails.length > 0) {
                            setActiveDay(Math.min(...formattedDetails.map(d => d.day)));
                        }
                    }
                }
            } catch (err) {
                console.error("데이터 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [planId]);


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

    const accomTotal = (accommodation?.pricePerNight || 0) * 2;
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;
    const totalPrice = details.filter(item => item.is_selected).reduce((sum, item) => sum + (item.price || 0), 0) + accomTotal + activityTotal + ticketTotal;

    const handleGoToCheckout = () => {
        const selectedOnly = details.filter(item => item.is_selected);
        if (selectedOnly.length === 0) { alert("선택된 일정이 없습니다."); return; }
        navigate('/reserve/check', { state: { finalPlanData: { ...finalPlanData, plan_id: savedPlanId, total_amount: totalPrice, confirmed_details: selectedOnly, selected_accommodation: accommodation, selected_activity: activity, selected_ticket: ticket } } });
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
                <div className="combined-result-card">
                    <div className="itinerary-section">
                        <div className="result-header">
                            <h2>{regionName} {subRegion && `${subRegion}`} 여행 스케줄 관리</h2>
                            <p>{startDate} ~ {endDate} ({peopleCount}명)</p>
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