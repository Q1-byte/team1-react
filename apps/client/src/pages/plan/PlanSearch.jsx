import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import KoreaMap from "../../components/KoreaMap";
import './PlanSearch.css';

const REGION_DATA = {
    seoul: { name: "서울특별시", sub: ["강남구", "종로구", "마포구", "용산구"] },
    gyeonggi: { name: "경기도", sub: ["수원시", "용인시", "성남시"] },
    gangwon: { name: "강원도", sub: ["춘천시", "강릉시"] },
    chungbuk: { name: "충청북도", sub: ["청주시", "충주시"] },
    chungnam: { name: "충청남도", sub: ["천안시", "아산시"] },
    jeonbuk: { name: "전라북도", sub: ["전주시", "군산시"] },
    jeonnam: { name: "전라남도", sub: ["여수시", "순천시"] },
    gyeongbuk: { name: "경상북도", sub: ["포항시", "경주시"] },
    gyeongnam: { name: "경상남도", sub: ["창원시", "진주시"] },
    busan: { name: "부산광역시", sub: ["해운대구", "기장군"] },
    jeju: { name: "제주특별자치도", sub: ["제주시", "서귀포시"] },
    incheon: { name: "인천광역시", sub: ["중구", "남동구"] },
    ulsan: { name: "울산광역시", sub: ["남구", "북구"] }
    };

    const PlanSearch = () => {
    const navigate = useNavigate();

    // 🔥 중요: 부모(TravelPlan)로부터 상태와 수정 함수를 가져옵니다.
    const { planConfig, handleConfigChange } = useOutletContext();

    // 🗺️ 지도에서 지역 클릭 시
    const handleRegionClick = (regionKey) => {
        const region = REGION_DATA[regionKey];
        if (!region) return;

        handleConfigChange("region_id", regionKey);
        handleConfigChange("region_name", region.name);
        handleConfigChange("sub_region", "");
    };

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

        {/* ✅ 상단 표시 */}
        <h2 className="search-title">
            {planConfig.region_name ? (
            <span className="selected-name-highlight">
                📍 {planConfig.region_name}
            </span>
            ) : (
            "어디로 떠나시나요?"
            )}
        </h2>

        <div className="content-segment">
            <div className="map-wrapper">
            <KoreaMap
                onRegionClick={handleRegionClick}
                selectedRegionId={planConfig.region_id}
            />
            <h2>어디로 떠나시나요?</h2>

            <div className="map-placeholder" style={{
                width: '100%', height: '300px', background: '#eee',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', borderRadius: '15px'
            }}>
                📍 지도가 들어갈 공간입니다
            </div>
        </div>

        <div className="content-segment">
            <div className="search-main-card">
            <div className="selection-grid">

                <div className="input-group">
                <label>📍 지역</label>
                <select
                    value={planConfig.region_id || ""}
                    onChange={(e) => {
                    const regionId = e.target.value;
                    handleRegionClick(regionId);
                    }}
                >
                    <option value="">지역 선택</option>
                    {Object.entries(REGION_DATA).map(([key, v]) => (
                    <option key={key} value={key}>{v.name}</option>
                    ))}
                </select>
                </div>

                <div className="input-group">
                <label>🗺️ 세부 지역</label>
                <select
                    value={planConfig.sub_region || ""}
                    disabled={!planConfig.region_id}
                    onChange={(e) =>
                    handleConfigChange("sub_region", e.target.value)
                    }
                >
                    <option value="">상세 지역 선택</option>
                    {planConfig.region_id &&
                    REGION_DATA[planConfig.region_id].sub.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))
                    }
                </select>
                </div>

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

            <button className="next-button" onClick={handleNext}>
                날짜 및 인원 설정하기
            </button>
            </div>
        </div>
        </div>
    );
};

export default PlanSearch;
