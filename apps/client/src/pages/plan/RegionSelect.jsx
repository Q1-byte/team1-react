import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegionSelect.css';

const RegionSelect = () => {
    const navigate = useNavigate();
    const [selectedRegion, setSelectedRegion] = useState(null);

    // 💡 8가지 사용자 성향 데이터 (요청하신 내용 완벽 반영)
    const personalityData = [
        { id: 1, tag: "#사람싫어 #조용한게최고", theme: "나홀로 힐링, 명상", example: "한적한 사찰, 숲길, 독립서점" },
        { id: 2, tag: "#자연좋아 #풍경맛집", theme: "자연 친화, 아웃도어", example: "국립공원, 해안절벽, 수목원" },
        { id: 3, tag: "#집순이_집돌이 #안전제일", theme: "호캉스, 실내 체험", example: "호텔 스파, 북카페, 만화카페" },
        { id: 4, tag: "#활동파 #에너지뿜뿜", theme: "액티비티, 스포츠", example: "테마파크, 서핑, 번지점프" },
        { id: 5, tag: "#예술혼 #전시회덕후", theme: "문화 예술, 역사", example: "미술관, 박물관, 유적지" },
        { id: 6, tag: "#먹는게남는거 #미식가", theme: "로컬 맛집 탐방", example: "전통시장, 노포, 미슐랭 식당" },
        { id: 7, tag: "#사진에진심 #인생샷", theme: "SNS 핫플레이스", example: "대형 베이커리 카페, 포토존 공원" },
        { id: 8, tag: "#가성비추구 #알뜰족", theme: "무료 저가 투어", example: "무료 전망대, 공원 피크닉, 야시장" },
    ];

    // 지도 표시용 임시 지역 데이터
    const regions = [
        { id: 'seoul', name: '서울', x: 120, y: 150 },
        { id: 'busan', name: '부산', x: 320, y: 420 },
        { id: 'jeju', name: '제주', x: 150, y: 580 },
        { id: 'gangwon', name: '강원', x: 250, y: 100 },
    ];

    const handleSelectKeyword = (item) => {
        // 선택한 지역과 성향을 가지고 결과 페이지로 이동
        navigate('/plan/result', { 
            state: { 
                region: selectedRegion, 
                personality: item 
            } 
        });
    };

    return (
        <div className="region-select-container">
            <header className="selection-header">
                <h2>어디로 떠나고 싶으신가요?</h2>
                <p>지역을 클릭한 후, 당신의 여행 성향을 선택해주세요.</p>
            </header>

            <div className="selection-content">
                {/* 왼쪽: SVG 지도 영역 */}
                <div className="map-section">
                    <svg viewBox="0 0 500 700" className="korea-svg">
                        {/* 실제 지도 Path 데이터가 들어갈 자리입니다. 여기서는 마커로 대체합니다. */}
                        {regions.map(reg => (
                            <g key={reg.id} onClick={() => setSelectedRegion(reg.id)} className={`region-group ${selectedRegion === reg.id ? 'active' : ''}`}>
                                <circle cx={reg.x} cy={reg.y} r="15" className="region-dot" />
                                <text x={reg.x} y={reg.y + 30} textAnchor="middle" className="region-label">{reg.name}</text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* 오른쪽: 8개 성향 버튼 영역 (지역 선택 시 노출) */}
                <div className={`personality-section ${selectedRegion ? 'visible' : ''}`}>
                    {selectedRegion ? (
                        <>
                            <h3>📍 {regions.find(r => r.id === selectedRegion)?.name}에서 어떤 여행을 할까요?</h3>
                            <div className="personality-grid">
                                {personalityData.map((item) => (
                                    <button 
                                        key={item.id} 
                                        className="personality-card"
                                        onClick={() => handleSelectKeyword(item)}
                                    >
                                        <div className="card-tag">{item.tag}</div>
                                        <div className="card-theme">{item.theme}</div>
                                        <div className="card-example">예: {item.example}</div>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-selection">지도에서 먼저 지역을 선택해주세요!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegionSelect;