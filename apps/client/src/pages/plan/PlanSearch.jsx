import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './PlanSearch.css';

// 지역 데이터 (기존 유지)
const REGION_DATA = {
    "seoul": { name: "서울특별시", sub: ["강남구", "종로구", "마포구", "용산구"] },
    "busan": { name: "부산광역시", sub: ["해운대구", "기장군", "수영구"] },
    "jeju": { name: "제주특별자치도", sub: ["제주시", "서귀포시"] },
};

const PlanSearch = () => {
    const navigate = useNavigate();
    
    // 🔥 중요: 부모(TravelPlan)로부터 상태와 수정 함수를 가져옵니다.
    const { planConfig, handleConfigChange } = useOutletContext();

    const handleNext = () => {
        if (!planConfig.region_id || !planConfig.sub_region) {
            alert("지역과 세부 지역을 선택해주세요!");
            return;
        }
        // ✅ 다음 페이지(날짜/인원/키워드 설정)로 이동
        // 주소는 App.jsx 설정에 맞춰서 수정하세요! (예: /travel-plan/setup)
        navigate('/reserve/setup'); 
    };

    return (
        <div className="plan-search-container">
            <h2>어디로 떠나시나요?</h2>
            
            <div className="map-placeholder" style={{ 
                width: '100%', height: '300px', background: '#eee', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                marginBottom: '20px', borderRadius: '15px' 
            }}>
                📍 지도가 들어갈 공간입니다
            </div>

            <div className="search-main-card">
                <div className="selection-grid">
                    {/* 1. 지역 선택 */}
                    <div className="input-group">
                        <label>📍 지역</label>
                        <select 
                            value={planConfig.region_id || ""} 
                            onChange={(e) => {
                                const regionId = e.target.value;
                                handleConfigChange('region_id', regionId);
                                handleConfigChange('region_name', REGION_DATA[regionId]?.name || "");
                                handleConfigChange('sub_region', ""); // 지역 바뀔 때 상세지역 초기화
                            }}
                        >
                            <option value="">지역 선택</option>
                            {Object.keys(REGION_DATA).map(key => (
                                <option key={key} value={key}>{REGION_DATA[key].name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. 상세 지역 선택 */}
                    <div className="input-group">
                        <label>🗺️ 세부 지역</label>
                        <select 
                            value={planConfig.sub_region || ""} 
                            onChange={(e) => handleConfigChange('sub_region', e.target.value)}
                            disabled={!planConfig.region_id}
                        >
                            <option value="">상세 지역 선택</option>
                            {planConfig.region_id && REGION_DATA[planConfig.region_id].sub.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 3. 예산 설정 (슬라이더) */}
                    <div className="input-group budget-group" style={{ gridColumn: 'span 2' }}>
                        <label>
                            💰 최대 예산: <strong>
                                {(Number(planConfig.budget_range?.[1]) || 100000).toLocaleString()}원
                            </strong>
                        </label>
                        <input 
                            type="range" 
                            min="100000" 
                            max="5000000" 
                            step="10000" 
                            // 부모의 데이터를 가져와서 보여줌
                            value={Number(planConfig.budget_range?.[1]) || 100000}
                            // 부모의 데이터를 직접 수정함
                            onChange={(e) => handleConfigChange('budget_range', [planConfig.budget_range[0], Number(e.target.value)])}
                        />
                    </div>
                </div>
                
                <button className="next-button" onClick={handleNext}>
                    날짜 및 인원 설정하기
                </button>
            </div>
        </div>
    );
};

export default PlanSearch;