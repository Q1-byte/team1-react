import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import KoreaMap from "../../components/KoreaMap";
import './PlanSearch.css';

// 1. 매핑 테이블: 지도의 class명과 드롭박스의 value를 모두 한글로 변환
const REGION_CLASS_MAP = {
    Seoul: "서울특별시", Busan: "부산광역시", Daegu: "대구광역시", Incheon: "인천광역시",
    Gwangju: "광주광역시", Daejeon: "대전광역시", Ulsan: "울산광역시", Sejong: "세종특별자치시",
    Gyeonggi: "경기도", Gangwon: "강원특별자치도", Jeju: "제주특별자치도",
    // 긴 이름과 짧은 이름 모두 대응 가능하도록 등록
    Chungcheongbukdo: "충청북도", Chungbuk: "충청북도",
    Chungcheongnamdo: "충청남도", Chungnam: "충청남도",
    Jeollabukdo: "전라북도", Jeonbuk: "전라북도",
    Jeollanamdo: "전라남도", Jeonnam: "전라남도",
    Gyeongsangbukdo: "경상북도", Gyeongbuk: "경상북도",
    Gyeongsangnamdo: "경상남도", Gyeongnam: "경상남도"
};

// 2. 지역 데이터: Key값을 지도(SVG)에서 넘어오는 긴 이름으로 통일
const REGION_DATA = {
    Seoul: { name: "서울특별시", sub: ["강남구", "종로구", "마포구", "용산구"] },
    Gyeonggi: { name: "경기도", sub: ["수원시", "용인시", "성남시"] },
    Gangwon: { name: "강원특별자치도", sub: ["춘천시", "강릉시"] },
    Chungcheongbukdo: { name: "충청북도", sub: ["청주시", "충주시"] },
    Chungcheongnamdo: { name: "충청남도", sub: ["천안시", "아산시"] },
    Jeollabukdo: { name: "전라북도", sub: ["전주시", "군산시"] },
    Jeollanamdo: { name: "전라남도", sub: ["여수시", "순천시"] },
    Gyeongsangbukdo: { name: "경상북도", sub: ["포항시", "경주시"] },
    Gyeongsangnamdo: { name: "경상남도", sub: ["창원시", "진주시"] },
    Busan: { name: "부산광역시", sub: ["해운대구", "기장군"] },
    Jeju: { name: "제주특별자치도", sub: ["제주시", "서귀포시"] },
    Incheon: { name: "인천광역시", sub: ["중구", "남동구"] },
    Ulsan: { name: "울산광역시", sub: ["남구", "북구"] },
    Daegu: { name: "대구광역시", sub: ["중구", "수성구"] },
    Daejeon: { name: "대전광역시", sub: ["서구", "유성구"] },
    Gwangju: { name: "광주광역시", sub: ["동구", "남구"] },
    Sejong: { name: "세종특별자치시", sub: ["세종시"] }
};

export default function PlanSearch() {
    const { planConfig, handleConfigChange } = useOutletContext();
    const navigate = useNavigate();

    // 통합 업데이트 함수: 지도를 클릭하든 드롭박스를 바꾸든 이 함수를 거침
    const updateRegionState = (id) => {
        if (!id) return;
        
        // 첫 글자만 대문자로 (혹시 소문자로 들어올 경우 대비)
        const formattedId = id.charAt(0).toUpperCase() + id.slice(1);
        
        // 1. 한글 정식 명칭 가져오기
        const fullName = REGION_CLASS_MAP[formattedId] || (REGION_DATA[formattedId]?.name || formattedId);

        // 2. 부모 상태 업데이트
        handleConfigChange("region_id", formattedId);
        handleConfigChange("region_name", fullName);
        handleConfigChange("sub_region", ""); // 지역 변경 시 상세지역 초기화
    };

    // 지도의 path 클릭 시 실행 (이게 없으면 지도를 클릭해도 오른쪽이 안 바뀜)
    const handlePathClick = (e) => {
    // 1. 클릭된 요소부터 상위로 올라가며 path나 g 태그를 찾습니다.
    const target = e.target.closest('path, g');
    if (!target) return;

    // 2. 그룹(g)이나 패스(path) 중 클래스명이 있는 요소를 찾습니다.
    // 만약 클릭한 path에 클래스가 없으면 부모인 g 태그의 클래스를 확인합니다.
    const regionId = 
        target.getAttribute('class')?.split(' ' )[0] || 
        target.parentElement?.getAttribute('class')?.split(' ')[0] ||
        target.id; // 혹시 id로 되어있을 경우 대비

    console.log("클릭된 ID 확인:", regionId); // 디버깅용: 인천/경북 클릭 시 콘솔을 확인해보세요!

    if (regionId) {
        updateRegionState(regionId);
    }
};
    const handleNext = () => {
        if (!planConfig.region_id || !planConfig.sub_region) {
            alert("지역과 세부 지역을 선택해주세요!");
            return;
        }
        navigate('/reserve/setup');
    };

    return (
    <div className="plan-search-container">
        <h2 className="search-title">어디로 떠나시나요?</h2>

        <div className="plan-search-layout">
            {/* 왼쪽: 지도 섹션 (지도만 깔끔하게 나오도록 유지) */}
            <div className="layout-left" onClick={handlePathClick}>
                <div className="map-card">
                    <div className="map-wrapper">
                        <KoreaMap planConfig={planConfig} />
                    </div>
                </div>
            </div>

            {/* 오른쪽: 설정 카드 섹션 */}
            <div className="layout-right">
                <div className="search-main-card">
                    
                    {/* ✅ 오른쪽 카드 내부 상단에만 파란 점선 문구 배치 */}
                    <div className="info-box-card">
                        {planConfig.region_id ? (
        <p className="main-info-text">
            {/* CSS와 동일하게 region-name-highlight로 클래스명 고정 */}
            <span className="region-name-highlight" style={{ color: '#005ADE', fontWeight: 'bold' }}>
                {REGION_CLASS_MAP[planConfig.region_id] || planConfig.region_name}
            </span>
            {" "} 지역 세부선택을 완료해주세요! 
        </p>
    ) : (
        <p className="main-info-text default">🗺️ 어디로 떠나고 싶으신가요?</p>
    )}
                    </div>

                    <div className="selection-grid">
                        <div className="input-group">
                            <label>📍 지역 선택</label>
                            <select
                                value={planConfig.region_id || ""}
                                onChange={(e) => updateRegionState(e.target.value)}
                            >
                                <option value="">지역 선택</option>
                                {Object.entries(REGION_DATA).map(([key, v]) => (
                                    <option key={key} value={key}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>🗺️ 세부 지역 선택</label>
                            <select
                                value={planConfig.sub_region || ""}
                                disabled={!planConfig.region_id}
                                onChange={(e) => handleConfigChange("sub_region", e.target.value)}
                            >
                                <option value="">상세 지역 선택</option>
                                {planConfig.region_id && REGION_DATA[planConfig.region_id]?.sub.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        {/* 3. 예산 설정 (세 번째 줄 - 새로 추가됨!) */}
                        <div className="input-group budget-section" style={{ marginTop: '10px' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>💰 최대 예산</span>
                                <span style={{ color: '#005ADE', fontWeight: 'bold' }}>
                                    {(Number(planConfig.budget_range?.[1]) || 100000).toLocaleString()}원
                                </span>
                            </label>
                            <input
                                type="range"
                                min="100000"
                                max="5000000"
                                step="50000"
                                style={{ width: '100%', marginTop: '10px', cursor: 'pointer' }}
                                value={Number(planConfig.budget_range?.[1]) || 100000}
                                onChange={(e) => handleConfigChange('budget_range', [0, Number(e.target.value)])}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginTop: '5px' }}>
                                <span>10만원</span>
                                <span>500만원</span>
                            </div>
                        </div>
                    </div>

                    <button className="next-button" onClick={handleNext}>
                        날짜 및 인원 설정하기
                    </button>
                </div>
            </div>
        </div>
    </div>
);}