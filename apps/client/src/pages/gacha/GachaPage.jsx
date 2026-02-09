import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 추가

// 테스트용 데이터 (실제로는 DB에서 가져온 templateId를 사용하게 됩니다)
const areaPlanDetails = {
    1: { name: "제주도", keywords: ["성산일출봉", "오설록", "해안도로"], templateId: 101 },
    2: { name: "강원도", keywords: ["설악산", "강릉 카페거리", "중앙시장"], templateId: 102 },
    3: { name: "인천 강화도", keywords: ["마니산", "루지", "조양방직"], templateId: 103 },
};

const travelDestinations = [
    { id: 1, name: "제주도", level: 1, desc: "초보 여행자에게 딱! 푸른 바다를 보러 가요." },
    { id: 2, name: "강원도", level: 2, desc: "트래킹 산행을 좋아하는 여행자에게 추천하는 액티비티코스" },
    { id: 3, name: "인천 강화도", level: 3, desc: "극기훈련 캠프를 통한 단합력 다지기 코스" },
];

const GachaPage = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [resultList, setResultList] = useState([]);
    const [isShaking, setIsShaking] = useState(false);
    const [showCapsule, setShowCapsule] = useState(false);
    const [showList, setShowList] = useState(false);

    // 2. 결과 클릭 시 PlanResult로 이동하는 함수
    // GachaPage.jsx 내부

const handleMoveToResult = (itemId) => {
    const detail = areaPlanDetails[itemId];
    
    // PlanKeyword 페이지가 위치한 경로로 이동 (예: /reserve/keyword)
    // state에 가챠로 뽑힌 정보를 실어서 보냅니다.
    navigate('/reserve/keyword', {
        state: {
            gachaResult: {
                region_id: itemId,
                region_name: detail.name,
                // 가챠 성격에 맞는 기본 카테고리 설정 (예: 'all' 또는 'active')
                main_category: 'all' 
            }
        }
    });
};

    const handleGacha = () => {
        setIsShaking(true);
        setShowCapsule(false);
        setShowList(false);
        setResultList([]);

        setTimeout(() => {
            setIsShaking(false);
            setShowCapsule(true);
            setTimeout(() => {
                setShowCapsule(false);
                const filtered = travelDestinations.filter(dest => dest.level === selectedLevel);
                if (filtered.length > 0) {
                    const randomIndex = Math.floor(Math.random() * filtered.length);
                    setResultList([filtered[randomIndex]]);
                    setShowList(true);
                }
            }, 1500);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px', minHeight: '100vh', backgroundColor: '#9DBFF5' }}>
            {/* 스타일 생략 (기존과 동일) */}
            
            <div className={isShaking ? 'shake' : ''}>
                <img src="/banner/GachaMachine.png" alt="machine" style={{ width: '450px' }} />
            </div>

            {!showCapsule && !showList && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>난이도를 선택해주세요</span>
                        <div style={{ display: 'flex', padding: '10px 20px', border: '2px solid #ddd', borderRadius: '10px', backgroundColor: '#001F3F' }}>
                            {[1, 2, 3].map(num => (
                                <label key={num} style={{ margin: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: selectedLevel === num ? '#ffcc00' : '#ccc' }}>
                                    <input type="radio" name="level" checked={selectedLevel === num} onChange={() => setSelectedLevel(num)} />
                                    {"★".repeat(num)}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleGacha} disabled={isShaking} style={btnStyle}>
                        {isShaking ? "두근두근..." : "랜덤여행 뽑기"}
                    </button>
                </div>
            )}

            {showCapsule && (
                <div className="capsule-pop" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <img src="/banner/Gachacapsule.png" alt="opened capsule" style={{ width: '300px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '10px' }}>캡슐 오픈!</p>
                </div>
            )}

            {showList && (
                <div className="list-fade-in" style={{ marginTop: '40px', width: '100%', maxWidth: '600px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>🎉 축하합니다!</h3>
                    {resultList.map(item => {
                        const detail = areaPlanDetails[item.id];
                        return (
                            // 3. 카드 전체에 클릭 이벤트 추가 및 스타일 변경
                            <div 
                                key={item.id} 
                                style={{ ...resultCardStyle, cursor: 'pointer', border: '2px solid transparent', transition: '0.3s' }}
                                onClick={() => handleMoveToResult(item.id)} // 클릭 시 이동
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#007bff'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                <h2 style={{ color: '#007bff', marginBottom: '10px' }}>📍 {detail?.name || item.name}</h2>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f1f3f5', borderRadius: '10px' }}>
                                    {detail?.keywords.map((kw, idx) => (
                                        <span key={idx} style={{ marginRight: '10px', color: '#002f87', fontWeight: 'bold' }}>#{kw}</span>
                                    ))}
                                </div>
                                <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#007bff', fontWeight: 'bold' }}>
                                    👆 카드를 클릭하여 3일 일정을 확인하세요!
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const btnStyle = { padding: '15px 50px', fontSize: '1.1rem', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#fff', border: '2px solid #007bff', fontWeight: 'bold' };
const resultCardStyle = { backgroundColor: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' };

export default GachaPage;