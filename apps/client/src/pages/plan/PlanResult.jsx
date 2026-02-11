import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PlanResult.css';
import Header from '../../components/Header';

const PlanResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const finalPlanData = location.state?.finalPlanData || {};
    // 키워드에 #이 붙어있으므로 기본값도 형식을 맞춤
    const selectedKeywords = finalPlanData.keywords || ["#힐링"]; 
    const regionName = finalPlanData.region_name || "Busan";

    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [activeDay, setActiveDay] = useState(1); 

    useEffect(() => {
        const fetchRealPlan = async () => {
            try {
                // 🚀 지역명 매핑: 백엔드 DB의 'address' 컬럼에 포함될 가능성이 높은 단어로 보냅니다.
                // '부산광역시' 보다는 '부산'이 LIKE 검색에서 더 잘 걸립니다.
                const regionMap = {
                    "Busan": "부산",
                    "Seoul": "서울",
                    "Jeju": "제주",
                    "Incheon": "인천",
                    "Gangneung": "강릉"
                };

                const searchRegion = regionMap[regionName] || regionName;

                console.log("🚀 백엔드 요청:", { keyword: selectedKeywords, region: searchRegion });

                const response = await axios.post('http://localhost:8080/api/plans/recommend', {
                    keyword: selectedKeywords,
                    region: searchRegion
                });

                console.log("📦 백엔드 응답:", response.data);

                // schedule이 없는 경우 처리
                if (!response.data.schedule || Object.keys(response.data.schedule).length === 0) {
                    console.warn("⚠️ 조건에 맞는 일정이 없습니다.");
                    setDetails([]);
                    return;
                }

                const scheduleMap = response.data.schedule; 
                const formattedDetails = [];

                Object.entries(scheduleMap).forEach(([dayStr, spots]) => {
                    const dayNum = parseInt(dayStr.replace(/[^0-9]/g, '')) || 1;
                    if (Array.isArray(spots)) {
                        spots.forEach(spot => {
                            formattedDetails.push({
                                id: spot.id,
                                day: dayNum,
                                // DTO 구조에 맞춰 안전하게 접근
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
                    const minDay = Math.min(...formattedDetails.map(d => d.day));
                    setActiveDay(minDay);
                }

            } catch (error) {
                console.error("❌ API 에러 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRealPlan();
    // dependency array에서 객체/배열 비교 문제를 JSON.stringify로 해결
    }, [regionName, JSON.stringify(selectedKeywords)]);

    const toggleItem = (id) => {
        setDetails(prev => prev.map(item =>
            item.id === id ? { ...item, is_selected: !item.is_selected } : item
        ));
    };

    const totalPrice = details
        .filter(item => item.is_selected)
        .reduce((sum, item) => sum + (item.price || 0), 0);

    const handleGoToCheckout = () => {
        const selectedOnly = details.filter(item => item.is_selected);
        if (selectedOnly.length === 0) {
            alert("선택된 일정이 없습니다.");
            return;
        }
        navigate('/reserve/check', { 
            state: { 
                finalPlanData: { ...finalPlanData, total_amount: totalPrice, confirmed_details: selectedOnly } 
            } 
        });
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>🤖 AI가 {regionName} 맞춤형 일정을 구성 중입니다...</p>
        </div>
    );

    return (
        <div className="result-layout">
            <Header />
            <div className="itinerary-section">
                <div className="result-header">
                    <h2>{regionName} 여행 스케줄 관리</h2>
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
            {/* 요약 카드는 생략 (기존 코드와 동일) */}
        </div>
    );
};

export default PlanResult;