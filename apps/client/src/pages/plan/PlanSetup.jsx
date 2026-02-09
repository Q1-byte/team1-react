import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function PlanSetup() {
    const navigate = useNavigate();
    // 부모의 데이터와 수정 함수를 가져옴
    const { planConfig, handleConfigChange } = useOutletContext();

    const handleNext = () => {
        // 모든 입력이 끝났으므로 결과 페이지로 이동
        navigate('/travel-plan/search');
    };

    return (
        <div className="setup-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px' }}>
            {/* 1. 날짜 선택 (달력) */}
            <section>
                <h3>📅 언제 떠나시나요?</h3>
                {/* 사용하시는 달력 라이브러리 연결 */}
                <input 
                    type="date" 
                    onChange={(e) => handleConfigChange('travel_date', e.target.value)} 
                />
            </section>

            {/* 2. 인원수 선택 */}
            <section>
                <h3>👥 몇 분이서 가시나요?</h3>
                <button onClick={() => handleConfigChange('people_count', Math.max(1, planConfig.people_count - 1))}>-</button>
                <span style={{ margin: '0 15px' }}>{planConfig.people_count}명</span>
                <button onClick={() => handleConfigChange('people_count', planConfig.people_count + 1)}>+</button>
            </section>

            {/* 3. 취향 키워드 (세로 또는 그리드) */}
            <section>
                <h3>✨ 어떤 여행을 원하시나요?</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {['힐링', '맛집', '액티비티', '쇼핑', '문화'].map(word => (
                        <button 
                            key={word}
                            onClick={() => {
                                const nextKeywords = planConfig.keywords.includes(word)
                                    ? planConfig.keywords.filter(k => k !== word)
                                    : [...planConfig.keywords, word];
                                handleConfigChange('keywords', nextKeywords);
                            }}
                            style={{ 
                                padding: '10px 20px',
                                borderRadius: '20px',
                                backgroundColor: planConfig.keywords.includes(word) ? '#005ADE' : '#fff',
                                color: planConfig.keywords.includes(word) ? '#fff' : '#333'
                            }}
                        >
                            {word}
                        </button>
                    ))}
                </div>
            </section>

            <button onClick={handleNext} style={{ marginTop: '50px', padding: '15px', backgroundColor: '#005ADE', color: '#fff', border: 'none', borderRadius: '8px' }}>
                여행 계획 생성하기
            </button>
        </div>
    );
}