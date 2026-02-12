import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GachaPage.css';
import confetti from 'canvas-confetti';

const GachaPage = () => {
    const navigate = useNavigate();
    const [level, setLevel] = useState(1);
    const [gachaResult, setGachaResult] = useState(null);
    const [isShaking, setIsShaking] = useState(false);
    const [showCapsule, setShowCapsule] = useState(false);
    const [showList, setShowList] = useState(false);

    const fireConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffcc00', '#9DBFF5', '#ffffff', '#ff0000']
        });
    };
    
    const handleCreatePlan = async () => {
    // 현재 가챠로 뽑힌 데이터(gachaData)에서 지역 ID를 추출
    const targetRegionId = gachaData.regionId; 

    // 플랜 생성 API 호출 시 이 ID를 보냅니다.
    await axios.post('/api/plan/generate', {
        regionId: targetRegionId, // 👈 여기서 부산(6)이 아닌 뽑힌 지역 ID를 넘겨야 함!
        spotId: gachaData.id
    });
    };

    const handleGacha = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/gacha/draw?level=${level}`);
            console.log("진짜 데이터:", response.data);
            
            setGachaResult(response.data);
            setShowList(true); 
            fireConfetti();    
        } catch (error) {
            console.error("가챠 실패:", error);
        }
    };

    const handleMoveToResult = () => {
    if (!gachaResult) return;
    
    navigate('/reserve/keyword', {
        state: {
            fromGacha: true,
            gachaResult: {
                // ⚠️ 주의: gachaResult.id는 관광지ID입니다. 지역ID를 넣어야 합니다.
                region_id: gachaResult.regionId,   // 33이 들어감
                region_name: gachaResult.regionName, // '충청북도'가 들어감
                keywords: gachaResult.keywords,     // 랜덤 키워드 3개
                spotId: gachaResult.id              // 관광지 자체 ID
            }
        }
    });
};

    return (
        <div className="gacha-screen">
            {/* 가챠 기계 영역 */}
            <div className={`machine-container ${isShaking ? 'shake' : ''}`}>
                <div className="gacha-image-container">
                    <img src="/banner/GachaMachine.png" alt="machine" />
                </div>
            </div>

            {/* 컨트롤 섹션 */}
            {!showCapsule && !showList && (
                <div className="controls-section">
                    <div className="level-selector">
                        <span className="level-label">난이도를 선택해주세요</span>
                        <div className="level-options">
                            {[1, 2, 3].map(num => (
                                <label key={num} className={`level-item ${level === num ? 'active' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="level" 
                                        checked={level === num} 
                                        onChange={() => setLevel(num)} 
                                    />
                                    {"★".repeat(num)}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleGacha} disabled={isShaking} className="draw-button">
                        {isShaking ? "두근두근..." : "랜덤여행 뽑기"}
                    </button>
                </div>
            )}

            {/* 캡슐 팝업 */}
            {showCapsule && (
                <div className="capsule-pop">
                    <img src="/banner/Gachacapsule.png" alt="capsule" style={{ width: '300px' }} />
                    <p className="capsule-text">캡슐 오픈!</p>
                </div>
            )}

            {/* 결과 카드 섹션 */}
            {/* 결과 카드 섹션 */}
            {showList && gachaResult && (
                <div className="result-section list-fade-in">
                    <h3 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>
                        🎉 랜덤 여행지가 선택 되었습니다! 🎉
                    </h3>
                    
                    <div 
                        className="result-card" 
                        onClick={handleMoveToResult}
                        style={{ 
                            width: '100%',      // 부모 컨테이너에 꽉 차게
                            maxWidth: '450px',  // 하지만 너무 커지지는 않게 (기존 카드 크기)
                            margin: '0 auto',   // 가운데 정렬
                            boxSizing: 'border-box' // 패딩이 폭에 영향을 주지 않도록
                        }}
                    >
                        {/* 1. 제목을 장소명 대신 지역명(충청북도 등)으로 강조 */}
                        <h2 className="result-name">
                            📍 {gachaResult.regionName || "지역 정보 없음"}
                        </h2>

                        {/* 2. 장소 이름(충주농협 등)은 소제목으로, 설명은 띄어쓰기 추가 */}
                        <h3 style={{ fontSize: '1.1rem', color: '#555', marginTop: '10px' }}>
                            <span style={{ color: '#005ADE', fontWeight: 'bold' }}>{gachaResult.name}</span>
                            <br />
                            <span style={{ fontSize: '0.95rem', color: '#666', display: 'block', marginTop: '8px' }}>
                                {gachaResult.desc || "선택하신 난이도에 맞는 멋진 여행지입니다!"}
                            </span>
                        </h3>

                        <div className="keyword-container">
                            {(() => {
                                const allKeywords = gachaResult.keywords || [];
                                if (allKeywords.length > 0) {
                                    // 가챠 결과에 들어온 키워드를 그대로 보여주거나 섞어서 3개 노출
                                    const displayKeywords = allKeywords.slice(0, 3);

                                    return displayKeywords.map((kw, idx) => (
                                        <span key={idx} className="keyword-tag">#{kw}</span>
                                    ));
                                } else {
                                    return (
                                        <>
                                            <span className="keyword-tag">#추천여행</span>
                                            <span className="keyword-tag">#즉흥여행</span>
                                            <span className="keyword-tag">#행운</span>
                                        </>
                                    );
                                }
                            })()}
                        </div>
                        <p className="click-guide">👆 카드를 클릭하여 일정을 선택하세요!</p>
                    </div>

                    <button 
                        onClick={() => { setShowList(false); setGachaResult(null); }} 
                        className="reset-button"
                    >
                        다시 뽑기
                    </button>
                </div>
            )}
        </div>
    );
};

export default GachaPage;