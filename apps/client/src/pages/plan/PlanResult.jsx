import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './PlanResult.css';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

// sessionStorage에서 마지막으로 저장된 planId를 찾는 헬퍼
const getLastSavedPlanIdFromSession = () => {
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('saved_plan_')) {
            const val = sessionStorage.getItem(key);
            if (val) return Number(val);
        }
    }
    return null;
};

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
    const [productsSaved, setProductsSaved] = useState(false); // localStorage 복원 여부

    // ✨ [추가] 자동 저장 함수: 추천받은 즉시 DB에 기록
    // PlanResult.js 내 해당 함수 찾아서 수정
    const savePlanAutomatically = async (formattedDetails) => {
        if (hasSaved.current) return;
        if (!user?.id) return;
        if (planId) return; // 이미 저장된 계획 조회 중

        // 컴포넌트 remount 시 중복 저장 방지: sessionStorage에 저장된 planId 확인
        const sessionKey = `saved_plan_${user.id}_${finalPlanData.start_date}_${regionName}`;
        const existingId = sessionStorage.getItem(sessionKey);
        if (existingId) {
            setSavedPlanId(Number(existingId));
            return;
        }

        const planPayload = {
            userId: user.id,
            regionName: regionName,
            regionId: finalPlanData.parent_region_db_id || null,
            startDate: finalPlanData.start_date,
            endDate: finalPlanData.end_date,
            peopleCount: finalPlanData.people_count || 1,
            spots: formattedDetails.map(d => ({ spotId: Number(d.id), day: d.day }))
        };

        try {
            hasSaved.current = true;
            const response = await api.post('/plans/save', planPayload);
            const raw = response.data;
            const id = typeof raw === 'number' ? raw : (raw?.id ?? raw?.planId ?? raw?.data);
            if (id) {
                setSavedPlanId(id);
                sessionStorage.setItem(sessionKey, String(id)); // remount 시 중복 방지
            }
        } catch (error) {
            console.error("자동 저장 실패:", error.response?.data || error.message);
            hasSaved.current = false; // 실패 시 재시도 허용
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

    // ✅ savedPlanId가 세팅되면 URL을 /reserve/:planId로 교체 (새로고침 대응)
    useEffect(() => {
        if (savedPlanId && !planId) {
            navigate(`/reserve/${savedPlanId}`, { replace: true });
        }
    }, [savedPlanId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (location.state?.finalPlanData) {
                    await fetchRealPlan();
                } else if (planId) {
                    const res = await api.get(`/plans/${planId}?userId=${user?.id}`);

                    console.log("백엔드 응답 전체:", res);
                    console.log("백엔드 실제 데이터:", res.data);
                    const data = res.data;

                    // 1. 지역 ID 세팅 (추천 상품 불러오기용)
                    if (data.regionId) {
                        setParentRegionDbId(data.regionId);
                    }

                    // 2. 지역 이름 세팅 (화면 표시 및 ID 없을 때 검색용)
                    if (data.region) {
                        setRegionName(data.region);
                    } else if (data.title && data.title.includes(' ')) {
                        const extracted = data.title.split(' ')[0];
                        setRegionName(extracted);
                    } else {
                        setRegionName("지역 미정");
                    }

                    // 3. 인원 세팅
                    if (data.peopleCount) setPeopleCount(data.peopleCount);

                    // 4. 날짜 로직
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

                    // 저장된 상품 복원
                    const saved = localStorage.getItem(`plan_products_${planId}`);
                    if (saved) {
                        const { accommodation: a, activity: act, ticket: t } = JSON.parse(saved);
                        if (a) setAccommodation(a);
                        if (act) setActivity(act);
                        if (t) setTicket(t);
                        setProductsSaved(true);
                    }
                } else {
                    // ✅ state도 없고 planId URL param도 없는 경우 → sessionStorage에서 복원 시도
                    const fallbackId = getLastSavedPlanIdFromSession();
                    if (fallbackId) {
                        console.log('[PlanResult] fallback planId from sessionStorage:', fallbackId);
                        navigate(`/reserve/${fallbackId}`, { replace: true });
                        return; // navigate 후 useEffect가 다시 실행됨
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error("데이터 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        // user?.id를 의존성에 추가해서 로그인 후 재로드 대응
    }, [planId, user?.id]);


    // user가 details보다 늦게 로드될 경우를 대비한 재시도 저장
    // (인증 컨텍스트가 비동기로 로드될 때 savePlanAutomatically가 user=null로 건너뛰는 경우 방지)
    useEffect(() => {
        if (!user?.id || details.length === 0 || planId || savedPlanId || hasSaved.current) return;
        const sessionKey = `saved_plan_${user.id}_${finalPlanData.start_date}_${regionName}`;
        const existingId = sessionStorage.getItem(sessionKey);
        if (existingId) {
            setSavedPlanId(Number(existingId));
            return;
        }
        savePlanAutomatically(details);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, details.length]);

    useEffect(() => {
        // 계획 데이터 로딩 중에는 상품 조회 금지 (기본값 null/"지역미정"으로 잘못 조회되는 것 방지)
        if (loading) return;
        if (!parentRegionDbId && !regionName) return;

        const pickByKeyword = (list, keywords) => {
            if (!list || list.length === 0) return null;
            const scored = list.map(item => {
                const itemKws = (item.keywords || '').split(',').map(k => k.trim());
                const matchCount = keywords.filter(kw => itemKws.some(ik => ik.includes(kw) || kw.includes(ik))).length;
                return { item, matchCount };
            });
            scored.sort((a, b) => b.matchCount - a.matchCount);
            return scored[0]?.item || null;
        };

        if (productsSaved) return; // 저장된 상품이 있으면 재요청 안 함

        const fetchProducts = async () => {
            try {
                // [로그 추가] 실제로 어떤 값으로 요청을 보내는지 확인용
                console.log("상품 조회 시도 - ID:", parentRegionDbId, "이름:", regionName);

                // 파라미터 구성: ID가 있으면 ID로, 없으면 이름으로 (백엔드 대응 확인 필요)
                const queryParams = parentRegionDbId
                    ? { regionId: parentRegionDbId }
                    : { regionName: regionName.split(' ')[0] }; // "인천광역시" -> "인천" 식으로 잘라서 보낼 수도 있음

                const [accomRes, activityRes, ticketRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/accommodations`, { params: queryParams }),
                    axios.get(`${API_BASE}/api/activities`, { params: queryParams }),
                    axios.get(`${API_BASE}/api/tickets`, { params: queryParams }),
                ]);

                const cleanKeywords = selectedKeywords.map(k => k.replace('#', ''));

                const bestAccom = pickByKeyword(accomRes.data?.data, cleanKeywords);
                const bestActivity = pickByKeyword(activityRes.data?.data, cleanKeywords);
                const bestTicket = pickByKeyword(ticketRes.data?.data, cleanKeywords);

                // 최종 할당: 키워드 매칭 안 되면 그냥 첫 번째 데이터라도 보여줌
                setAccommodation(bestAccom || (accomRes.data?.data && accomRes.data.data[0]) || null);
                setActivity(bestActivity || (activityRes.data?.data && activityRes.data.data[0]) || null);
                setTicket(bestTicket || (ticketRes.data?.data && ticketRes.data.data[0]) || null);

            } catch (error) {
                console.error("상품 데이터 로드 실패:", error);
            }
        };

        fetchProducts();
    }, [loading, parentRegionDbId, regionName, JSON.stringify(selectedKeywords), productsSaved]);

    const toggleItem = (id) => {
        setDetails(prev => prev.map(item =>
            item.id === id ? { ...item, is_selected: !item.is_selected } : item
        ));
    };

    const accomTotal = (accommodation?.pricePerNight || 0) * 2;
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;
    const totalPrice = details.filter(item => item.is_selected).reduce((sum, item) => sum + (item.price || 0), 0) + accomTotal + activityTotal + ticketTotal;

    const handleGoToCheckout = async () => {
        const selectedOnly = details.filter(item => item.is_selected);
        if (selectedOnly.length === 0) { alert("선택된 일정이 없습니다."); return; }

        let idToSave = savedPlanId || (planId ? Number(planId) : null);
        console.log('[예약하기] savedPlanId:', savedPlanId, '| planId:', planId, '| idToSave:', idToSave, '| user:', user?.id);

        // savedPlanId가 없으면 직접 저장 시도 (자동 저장 실패 케이스 대비)
        if (!idToSave && user?.id && details.length > 0) {
            try {
                const planPayload = {
                    userId: user.id,
                    regionName: regionName,
                    regionId: parentRegionDbId || null,
                    startDate: finalPlanData.start_date,
                    endDate: finalPlanData.end_date,
                    peopleCount: finalPlanData.people_count || 1,
                    spots: details.map(d => ({ spotId: Number(d.id), day: d.day }))
                };
                const response = await api.post('/plans/save', planPayload);
                const raw = response.data;
                idToSave = typeof raw === 'number' ? raw : (raw?.id ?? raw?.planId ?? raw?.data);
                if (idToSave) setSavedPlanId(idToSave);
            } catch (e) {
                console.error('계획 저장 실패:', e);
            }
        }

        if (idToSave) {
            localStorage.setItem(`plan_products_${idToSave}`, JSON.stringify({
                accommodation,
                activity,
                ticket
            }));
            if (user?.id) {
                api.post(`/plans/${idToSave}/view?userId=${user.id}`)
                    .then(() => console.log('[예약하기] view 기록 성공 planId:', idToSave))
                    .catch((e) => console.error('[예약하기] view 기록 실패:', e.response?.status, e.message));
            }
        }

        navigate('/reserve/check', { state: { finalPlanData: { ...finalPlanData, plan_id: idToSave, total_amount: totalPrice, confirmed_details: selectedOnly, selected_accommodation: accommodation, selected_activity: activity, selected_ticket: ticket } } });
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>AI가 {regionName} 맞춤형 일정을 구성 중입니다...</p>
        </div>
    );

    return (
        <div className="result-layout">
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