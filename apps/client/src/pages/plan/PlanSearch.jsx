import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../api/axiosConfig';
import KoreaMap from "../../components/KoreaMap";
import './PlanSearch.css';

// 지도 SVG class명 → 백엔드 region name 매핑
const MAP_TO_REGION_NAME = {
    Seoul: "서울", Busan: "부산", Daegu: "대구", Incheon: "인천",
    Gwangju: "광주", Daejeon: "대전", Ulsan: "울산", Sejong: "세종",
    Gyeonggi: "경기", Gangwon: "강원", Jeju: "제주",
    Chungcheongbukdo: "충북", Chungbuk: "충북",
    Chungcheongnamdo: "충남", Chungnam: "충남",
    Jeollabukdo: "전북", Jeonbuk: "전북",
    Jeollanamdo: "전남", Jeonnam: "전남",
    Gyeongsangbukdo: "경북", Gyeongbuk: "경북",
    Gyeongsangnamdo: "경남", Gyeongnam: "경남"
};

// 백엔드 region name → 지도 표시용 정식 명칭
const DISPLAY_NAME = {
    "서울": "서울특별시", "부산": "부산광역시", "대구": "대구광역시",
    "인천": "인천광역시", "광주": "광주광역시", "대전": "대전광역시",
    "울산": "울산광역시", "세종": "세종특별자치시", "경기": "경기도",
    "강원": "강원특별자치도", "충북": "충청북도", "충남": "충청남도",
    "전북": "전라북도", "전남": "전라남도", "경북": "경상북도",
    "경남": "경상남도", "제주": "제주특별자치도"
};

export default function PlanSearch() {
    const { planConfig, handleConfigChange } = useOutletContext();
    const navigate = useNavigate();

    const [parentRegions, setParentRegions] = useState([]);
    const [subRegions, setSubRegions] = useState([]);

    // 시/도 목록 로드
    useEffect(() => {
        api.get('/api/regions').then(res => {
            setParentRegions(res.data);
        });
    }, []);

    // 선택된 시/도가 바뀌면 시/군/구 로드
    useEffect(() => {
        if (planConfig.region_id) {
            const parent = parentRegions.find(r => r.name === planConfig.region_name_short);
            if (parent) {
                api.get(`/api/regions/${parent.id}/sub`).then(res => {
                    setSubRegions(res.data);
                });
            }
        } else {
            setSubRegions([]);
        }
    }, [planConfig.region_name_short, parentRegions]);

    // 지역 선택 통합 함수
    const updateRegionState = (mapId) => {
        if (!mapId) return;
        const formattedId = mapId.charAt(0).toUpperCase() + mapId.slice(1);
        const regionName = MAP_TO_REGION_NAME[formattedId];
        if (!regionName) return;

        const fullName = DISPLAY_NAME[regionName] || regionName;

        const parentRegion = parentRegions.find(r => r.name === regionName);
        handleConfigChange("region_id", formattedId);
        handleConfigChange("parent_region_db_id", parentRegion?.id || null);
        handleConfigChange("region_name", fullName);
        handleConfigChange("region_name_short", regionName);
        handleConfigChange("sub_region", "");
        handleConfigChange("sub_region_id", null);
    };

    // 드롭다운에서 시/도 선택
    const handleParentSelect = (e) => {
        const selectedId = Number(e.target.value);
        if (!selectedId) {
            handleConfigChange("region_id", "");
            handleConfigChange("parent_region_db_id", null);
            handleConfigChange("region_name", "");
            handleConfigChange("region_name_short", "");
            handleConfigChange("sub_region", "");
            handleConfigChange("sub_region_id", null);
            return;
        }
        const region = parentRegions.find(r => r.id === selectedId);
        if (!region) return;

        // region.name(서울)에 대응하는 mapId 찾기
        const mapId = Object.entries(MAP_TO_REGION_NAME).find(([, name]) => name === region.name)?.[0];
        const fullName = DISPLAY_NAME[region.name] || region.name;

        handleConfigChange("region_id", mapId || String(selectedId));
        handleConfigChange("parent_region_db_id", selectedId);
        handleConfigChange("region_name", fullName);
        handleConfigChange("region_name_short", region.name);
        handleConfigChange("sub_region", "");
        handleConfigChange("sub_region_id", null);
    };

    // 지도 클릭
    const handlePathClick = (e) => {
        const target = e.target.closest('path, g');
        if (!target) return;
        const regionId =
            target.getAttribute('class')?.split(' ')[0] ||
            target.parentElement?.getAttribute('class')?.split(' ')[0] ||
            target.id;
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

    // 현재 선택된 부모 region의 DB id (드롭다운 value용)
    const selectedParentDbId = parentRegions.find(r => r.name === planConfig.region_name_short)?.id || "";

    return (
    <div className="plan-search-container">
        <h2 className="search-title">어디로 떠나시나요?</h2>

        <div className="plan-search-layout">
            <div className="layout-left" onClick={handlePathClick}>
                <div className="map-card">
                    <div className="map-wrapper">
                        <KoreaMap planConfig={planConfig} />
                    </div>
                </div>
            </div>

            <div className="layout-right">
                <div className="search-main-card">

                    <div className="info-box-card">
                        {planConfig.region_id ? (
                            <p className="main-info-text">
                                <span className="region-name-highlight" style={{ color: '#005ADE', fontWeight: 'bold' }}>
                                    {planConfig.region_name}
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
                                value={selectedParentDbId}
                                onChange={handleParentSelect}
                            >
                                <option value="">지역 선택</option>
                                {parentRegions.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {DISPLAY_NAME[r.name] || r.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>🗺️ 세부 지역 선택</label>
                            <select
                                value={planConfig.sub_region || ""}
                                disabled={!planConfig.region_id}
                                onChange={(e) => {
                                    const selectedSub = subRegions.find(r => r.name === e.target.value);
                                    handleConfigChange("sub_region", e.target.value);
                                    handleConfigChange("sub_region_id", selectedSub?.id || null);
                                }}
                            >
                                <option value="">상세 지역 선택</option>
                                {subRegions.map(r => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group budget-section" style={{ marginTop: '10px' }}>
                            <label>💰 예산 선택</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' }}>
                                {[
                                    { label: '절약', sub: '~20만원', value: 200000 },
                                    { label: '보통', sub: '~40만원', value: 400000 },
                                    { label: '여유', sub: '~100만원', value: 1000000 },
                                    { label: '럭셔리', sub: '100만원+', value: 9999999 },
                                ].map(({ label, sub, value }) => {
                                    const isSelected = planConfig.budget_range?.[1] === value;
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => handleConfigChange('budget_range', [0, value])}
                                            style={{
                                                padding: '10px 4px',
                                                borderRadius: '10px',
                                                border: isSelected ? '2px solid #005ADE' : '1px solid #E5E7EB',
                                                background: isSelected ? '#EFF6FF' : '#fff',
                                                color: isSelected ? '#005ADE' : '#555',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                fontWeight: isSelected ? '700' : '400',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{ fontSize: '14px' }}>{label}</div>
                                            <div style={{ fontSize: '11px', marginTop: '3px', color: isSelected ? '#005ADE' : '#999' }}>{sub}</div>
                                        </button>
                                    );
                                })}
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
