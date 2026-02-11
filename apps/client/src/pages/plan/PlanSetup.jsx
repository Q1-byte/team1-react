import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function PlanSetup() {
    const navigate = useNavigate();
    const { planConfig, handleConfigChange } = useOutletContext();

    const handleNext = () => {
        navigate('/travel-plan/search');
    };

    // 공통 레이아웃 스타일
    const containerStyle = {
    maxWidth: '450px',
    margin: '20px auto', // <--- 기존 50px(혹은 자동)에서 20px로 확 줄임
    padding: '0 20px 20px 20px', // <--- 상단 패딩을 0으로 설정
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};
    const sectionStyle = {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        width: '100%',
        boxSizing: 'border-box' // 패딩이 가로 길이에 영향을 주지 않도록 설정
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '20px',
        textAlign: 'center',
        display: 'block'
    };

    // 달력, 인원수, 키워드 등의 내부 요소 공통 가로 스타일
    const fullWidthControl = {
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '14px',
        fontSize: '16px',
        outline: 'none'
    };

    return (
        <div className="setup-container" style={containerStyle}>
            
            {/* 1. 날짜 선택 - 가로 길이를 섹션에 꽉 채움 */}
            <section style={sectionStyle}>
                <span style={titleStyle}>📅 언제 떠나시나요?</span>
                <input 
                    type="date" 
                    value={planConfig.travel_date || ''}
                    onChange={(e) => handleConfigChange('travel_date', e.target.value)} 
                    style={{...fullWidthControl, textAlign: 'center'}}
                />
            </section>

            {/* 2. 인원 선택 */}
            <section style={sectionStyle}>
                <span style={titleStyle}>👥 인원 선택</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => handleConfigChange('people_count', Math.max(1, planConfig.people_count - 1))}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: '20px', cursor: 'pointer' }}
                    >-</button>
                    <span style={{ fontSize: '20px', fontWeight: '600', width: '60px', textAlign: 'center' }}>{planConfig.people_count}명</span>
                    <button 
                        onClick={() => handleConfigChange('people_count', planConfig.people_count + 1)}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: '20px', cursor: 'pointer' }}
                    >+</button>
                </div>
            </section>

            {/* 3. 취향 키워드 */}
            <section style={sectionStyle}>
                <span style={titleStyle}>✨ 당신의 취향은?</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {['남산타워', '야경감상', '맛집탐방', '카페투어', '쇼핑'].map(word => {
                        const isSelected = planConfig.keywords.includes(word);
                        return (
                            <button 
                                key={word}
                                onClick={() => {
                                    const nextKeywords = isSelected
                                        ? planConfig.keywords.filter(k => k !== word)
                                        : [...planConfig.keywords, word];
                                    handleConfigChange('keywords', nextKeywords);
                                }}
                                style={{ 
                                    padding: '10px 18px',
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: isSelected ? '#007BFF' : '#EEE',
                                    backgroundColor: isSelected ? '#F0F7FF' : '#fff',
                                    color: isSelected ? '#007BFF' : '#666',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                #{word}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 하단 버튼 - 높이(height)를 통일하고 한 줄 배치 */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ 
                        flex: 1, 
                        height: '56px', 
                        backgroundColor: '#F3F4F6', 
                        color: '#666', 
                        border: 'none', 
                        borderRadius: '16px', // <--- 이미지와 같은 부드러운 곡률
                        fontWeight: '600', 
                        cursor: 'pointer'
                    }}
                >
                    이전으로
                </button>
                <button 
                    onClick={handleNext} 
                    style={{ 
                        flex: 1,           // <--- 가로 길이를 1:1로 맞춤
                        height: '56px', 
                        backgroundColor: '#007BFF', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '16px', // <--- 이전 버튼과 똑같이 16px
                        fontWeight: '700', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                    }}
                >
                    일정 생성하기
                </button>
            </div>
        </div>
    );
}