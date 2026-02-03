import React, { useState } from 'react';

const travelDestinations = [
    { id: 1, name: "제주도", level: 1, desc: "초보 여행자에게 딱! 푸른 바다를 보러 가요." },
    { id: 2, name: "강원도", level: 2, desc: "트래킹 산행을 좋아하는 여행자에게 추천하는 액티비티코스" },
    { id: 3, name: "인천 강화도", level: 3, desc: "극기훈련 캠프를 통한 단합력 다지기 코스" },
];

const GachaPage = () => {
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [resultList, setResultList] = useState([]);
    const [isShaking, setIsShaking] = useState(false);
    const [showCapsule, setShowCapsule] = useState(false); 
    const [showList, setShowList] = useState(false); 

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
        <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '50px', 
            minHeight: '100vh', 
            backgroundColor: '#f0f2f5'
        }}>
            <style>{`
                @keyframes shake {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(2deg); }
                    50% { transform: rotate(-2deg); }
                    75% { transform: rotate(2deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes popUp {
                    0% { transform: scale(0); opacity: 0; }
                    70% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .shake { animation: shake 0.2s infinite; }
                .capsule-pop { animation: popUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .list-fade-in { animation: fadeInUp 0.8s ease-out; }
            `}</style>

            <div className={isShaking ? 'shake' : ''}>
                <img src="/banner/GachaMachine.png" alt="machine" style={{ width: '450px' }} />
            </div>

            {!showCapsule && !showList && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '15px', 
                        marginBottom: '20px' 
                    }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>난이도를 선택해주세요</span>
                        
                        <div style={{ 
                            display: 'flex', 
                            padding: '10px 20px', 
                            border: '2px solid #ddd', 
                            borderRadius: '10px',
                            backgroundColor: '#001F3F'
                        }}>
                            {[1, 2, 3].map(num => (
                                <label key={num} style={{ 
                                    margin: '0 10px', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontSize: '1.2rem',
                                    color: selectedLevel === num ? '#ffcc00' : '#ccc' 
                                }}>
                                    <input 
                                        type="radio" 
                                        name="level"
                                        style={{ marginRight: '5px' }}
                                        checked={selectedLevel === num} 
                                        onChange={() => setSelectedLevel(num)} 
                                    />
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
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>🎉 추천 여행지</h3>
                    {resultList.map(item => (
                        <div key={item.id} style={resultCardStyle}>
                            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>📍 {item.name}</h2>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                            <button 
                                onClick={() => { setShowList(false); }} 
                                style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer' }}
                            >
                                다시 뽑기
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const btnStyle = { padding: '15px 50px', fontSize: '1.1rem', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#fff', border: '2px solid #007bff', fontWeight: 'bold' };
const resultCardStyle = { backgroundColor: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' };

export default GachaPage;
