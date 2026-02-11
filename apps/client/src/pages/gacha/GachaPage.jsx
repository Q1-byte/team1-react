import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 추가
import './GachaPage.css';

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
    const [isHover, setIsHover] = useState(false);

    // 2. 결과 클릭 시 PlanResult로 이동하는 함수
    // GachaPage.jsx 내부

const handleMoveToResult = (itemId) => {
    const detail = areaPlanDetails[itemId];
    
    // PlanKeyword 페이지로 이동하면서 
    // state에 fromGacha: true를 반드시 실어 보내야 합니다.
    navigate('/reserve/keyword', {
        state: {
            // 💡 PlanKeyword에서 체크할 데이터
            fromGacha: true, 
            
            // 💡 기존 가챠 결과 데이터
            gachaResult: {
                region_id: itemId,
                region_name: detail.name,
                main_category: 'all' 
            }
        }
    });
};

const handleGoToSetup = () => {
    navigate('/plan/setup', { 
        state: { 
            region_id: selectedRegionId,
            region_name: selectedRegionName,
            // 💡 가챠에서 왔음을 알리는 플래그 추가
            fromGacha: true 
        } 
    });
};

    const handleGacha = () => {
        console.log("뽑기 시작!");
        setIsShaking(true);
        setShowCapsule(false);
        setShowList(false);
        setResultList([]);

        setTimeout(() => {
            console.log("흔들기 종료!");
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
    // GachaPage.jsx 컴포넌트 내부

    const handleReset = () => {
        setResultList([]);     // 결과 리스트 비우기
        setShowList(false);    // 결과 창 닫기
        setShowCapsule(false); // 캡슐 애니메이션 초기화
        setIsShaking(false);   // 흔들림 중지
        setSelectedLevel(1);   // (선택사항) 난이도 초기화
        
    };
    const resetBtnStyle = {
        ...btnStyle, // 기존 공통 스타일 상속
        marginTop: '30px',
        backgroundColor: isHover ? '#fff' : 'transparent', // 호버 시 흰색, 기본 투명
        color: isHover ? '#9DBFF5' : '#fff',           // 호버 시 배경색(파랑), 기본 흰색
        border: '2px solid #fff',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'block',    /* 중앙 정렬을 위한 설정 */
        marginRight: 'auto',
        marginLeft: 'auto'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px', minHeight: '100vh', backgroundColor: '#9DBFF5' }}>
            {/* 스타일 생략 (기존과 동일) */}
            
            <div className={isShaking ? 'shake' : ''}
                style={{ display: 'inline-block' }}
                >
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
                    <img 
                        src="/banner/Gachacapsule.png" 
                        alt="opened capsule" 
                        style={{ width: '300px' }} 
                    />
                    {/* 💡 클래스명을 추가해서 CSS 애니메이션 지연 적용 */}
                    <p className="capsule-text">캡슐 오픈!</p>
                </div>
            )}

            {showList && (
                <div className="list-fade-in" style={{ marginTop: '40px', width: '100%', maxWidth: '600px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>🎉 랜덤 여행지가 선택 되었습니다!🎉</h3>
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
                                    👆 카드를 클릭하여 일정을 선택하세요!
                                </p>
                            </div>
                        );
                    })}
                    {/* 다시 뽑기 버튼 추가 */}
                    <button 
                        onClick={handleReset}
                        className="reset-button" /* 👈 인라인 스타일 대신 클래스만 사용 */
                    >
                        다시 뽑기
                    </button>
                </div>
            )}
        </div>
    );
};

const btnStyle = { padding: '15px 50px', fontSize: '1.1rem', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#fff', border: '2px solid #007bff', fontWeight: 'bold' };
const resultCardStyle = { backgroundColor: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' };

export default GachaPage;