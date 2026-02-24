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
    
    const handleGacha = async () => {
        try {
            setIsShaking(true);
            setShowList(false);
            setShowCapsule(false);

            const response = await axios.get(`http://localhost:8080/api/gacha/draw?level=${level}`);
            const data = response.data;

            // 0.8초 뒤 캡슐 등장 (더 빨리!)
            setTimeout(() => {
                setShowCapsule(true);
            }, 800);

            // 1.2초 뒤 흔들림 멈춤
            setTimeout(() => {
                setIsShaking(false);
            }, 1200);

            // 2.2초 뒤 결과 공개 (기존 3초에서 대폭 단축)
            setTimeout(() => {
                setGachaResult(data);
                setShowCapsule(false);
                setShowList(true);
                fireConfetti(); // 캡슐 사라짐과 동시에 팡!
            }, 2200);

        } catch (error) {
            console.error("가챠 실패:", error);
            setIsShaking(false);
        }
    };

    const handleMoveToResult = () => {
        if (!gachaResult) return;
        navigate('/reserve/keyword', {
            state: {
                fromGacha: true,
                gachaResult: {
                    region_id: gachaResult.regionId,
                    region_name: gachaResult.regionName,
                    keywords: gachaResult.keywords,
                    spotId: gachaResult.id
                }
            }
        });
    };

    return (
        <div className="gacha-screen" style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minHeight: '100vh',
            paddingTop: '50px'
        }}>
            {/* 가챠 기계 컨테이너 */}
            <div className={`machine-container ${isShaking ? 'shake' : ''}`} style={{ 
                position: 'relative', 
                zIndex: 2,
                marginBottom: '0px' // 여백 제거
            }}>
                <div className="gacha-image-container">
                    <img src="/banner/GachaMachine.png" alt="machine" style={{ display: 'block', width: '400px' }} />
                </div>

                {/* 캡슐 연출: 기계 하단 입구쪽에 고정 (기계를 많이 가리지 않음) */}
                {showCapsule && (
                    <div className="capsule-pop" style={{ 
                        position: 'absolute',
                        bottom: '-40px', // 기계 아래쪽으로 살짝 내려서 배치
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 10,
                        animation: 'appear 0.4s ease-out'
                    }}>
                        <div className="capsule-glow" style={{
                            position: 'absolute',
                            width: '250px',
                            height: '250px',
                            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255,255,255,0) 70%)',
                            zIndex: -1,
                            animation: 'pulse 1s infinite'
                        }}></div>
                        
                        <img 
                            src="/banner/Gachacapsule.png" 
                            alt="capsule" 
                            style={{ width: '180px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} 
                        />
                        <p className="capsule-text" style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: '#fff', 
                            textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                            marginTop: '5px'
                        }}>
                            캡슐 오픈!
                        </p>
                    </div>
                )}
            </div>

            {/* 하단 섹션: 캡슐이 나올 때 가려지지 않도록 적당한 간격만 유지 */}
            <div style={{ marginTop: '10px', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 1 }}>
                {!showCapsule && !showList && (
                    <div className="controls-section">
                        <div className="level-selector">
                            <span className="level-label">난이도를 선택해주세요</span>
                            <div className="level-options">
                                {[1, 2, 3].map(num => (
                                    <label key={num} className={`level-item ${level === num ? 'active' : ''}`}>
                                        <input type="radio" name="level" checked={level === num} onChange={() => setLevel(num)} />
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

                {showList && gachaResult && (
                    <div className="result-section list-fade-in" style={{ width: '100%' }}>
                        <h3 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>🎉 랜덤 여행지가 선택 되었습니다! 🎉</h3>
                        <div className="result-card" onClick={handleMoveToResult} style={{ width: '90%', maxWidth: '450px', margin: '0 auto', cursor: 'pointer' }}>
                            <h2 className="result-name">📍 {gachaResult.regionName || "지역 정보 없음"}</h2>
                            <h3 style={{ fontSize: '1.1rem', color: '#555', marginTop: '10px' }}>
                                <span style={{ color: '#005ADE', fontWeight: 'bold' }}>{gachaResult.name}</span>
                                <br />
                                <span style={{ fontSize: '0.95rem', color: '#666', display: 'block', marginTop: '8px' }}>
                                    {gachaResult.desc || "선택하신 난이도에 맞는 멋진 여행지입니다!"}
                                </span>
                            </h3>
                            <div className="keyword-container">
                                {(gachaResult.keywords || ["추천여행", "즉흥여행", "행운"]).slice(0, 3).map((kw, idx) => (
                                    <span key={idx} className="keyword-tag">#{kw}</span>
                                ))}
                            </div>
                            <p className="click-guide">👆 카드를 클릭하여 일정을 선택하세요!</p>
                        </div>
                        <button onClick={() => { setShowList(false); setGachaResult(null); }} className="reset-button" style={{ marginTop: '20px' }}>다시 뽑기</button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes appear {
                    0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                    100% { transform: translateX(-50%) scale(1); opacity: 1; }
                }
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default GachaPage;