import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PlanKeyword.css';

const PlanKeyword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromGacha = location.state?.fromGacha || false;

    const { planConfig, handleConfigChange } = useOutletContext();
    const { region_id, region_name, sub_region, travel_date, people_count, main_category, keywords: selectedKeywords } = planConfig;

    const themeKeywords = [
        { id: 3, name: '액티비티', category: '성향' },
        { id: 4, name: '성수맛집', category: '기타' }, 
        { id: 9, name: '가족친화', category: '조건' },
        { id: 10, name: '가성비', category: '조건' },
        { id: 11, name: '조용한', category: '조건' },
        { id: 12, name: '반려동물동반', category: '조건' },
        { id: 15, name: '루프탑/야외', category: '조건' }
    ];

    const categoryLabels = {
        '성향': '🤸 어떤 활동을 즐기시나요?',
        '조건': '✅ 꼭 필요한 조건이 있나요?',
        '테마': '📍 이번 여행의 테마는?',
        '기타': '💡 이런 키워드도 있어요!'
    };

    const [filteredKeywords, setFilteredKeywords] = useState([]);

    useEffect(() => {
        const baseTheme = themeKeywords.filter(kw => !main_category || kw.category === main_category || kw.category === 'all'); 
        setFilteredKeywords(baseTheme);
    }, [main_category]);

    // 💡 [수정됨] 객체가 아닌 '이름(문자열)'만 그룹화하도록 변경
    const groupedKeywords = filteredKeywords.reduce((acc, item) => {
        const category = item.category || '기타'; 
        if (!acc[category]) acc[category] = [];
        // item(객체)이 아니라 item.name(문자열)을 넣어야 렌더링 에러가 안 납니다.
        acc[category].push(item.name); 
        return acc;
    }, {});

    const handleNext = () => {
        if (!travel_date || travel_date.length < 2) { 
            alert("여행 기간을 선택해주세요!"); 
            return; 
        }
        if (!fromGacha && selectedKeywords.length === 0) { 
            alert("키워드를 최소 1개 선택해주세요!"); 
            return; 
        }
        navigate('/reserve/result', { 
            state: { 
                finalPlanData: {
                    ...planConfig,
                    start_date: travel_date[0].toLocaleDateString(),
                    end_date: travel_date[1].toLocaleDateString(),
                    fromGacha: fromGacha 
                } 
            } 
        }); 
    };

    return (
        <div className="outer-layout">
            <div className="setup-container">
                <h2 className="setup-title">
                    <span style={{ color: '#005ADE' }}>{region_name}</span> 
                    <span style={{ color: '#005ADE' }}> {sub_region}</span> 여행 상세 설정
                </h2>

                <div className="plan-keyword-container">
                    <div className="setup-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
                        <div className="calendar-section">
                            <label style={{ display: 'block', marginBottom: '10px', textAlign: 'left', fontWeight: '600' }}>📅 언제 떠나시나요?</label>
                            <Calendar 
                                onChange={(val) => handleConfigChange('travel_date', val)} 
                                value={travel_date} 
                                selectRange={true} 
                                minDate={new Date()} 
                            />
                        </div>

                        <div className="info-section">
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '10px', textAlign: 'left', fontWeight: '600' }}>👥 인원 선택</label>
                                <select 
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={people_count} 
                                    onChange={(e) => handleConfigChange('people_count', parseInt(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}명</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {!fromGacha && (
                        <div className="keyword-section">
                            <h3 className="section-label" style={{ textAlign: 'left', fontWeight: '600', marginBottom: '15px' }}>당신의 취향은?</h3>
                            
                            {Object.keys(groupedKeywords).map((category) => (
                                <div key={category} className="category-group" style={{ marginBottom: '25px' }}>
                                    <h4 style={{ textAlign: 'left', fontSize: '1rem', fontWeight: '700', marginBottom: '10px', color: '#333' }}>
                                        {categoryLabels[category] || category}
                                    </h4>
                                    <div className="keyword-grid">
                                        {groupedKeywords[category].map((name, index) => {
                                            const isActive = selectedKeywords.includes(name);
                                            return (
                                                <div 
                                                    key={`${name}-${index}`} 
                                                    className={`keyword-item ${isActive ? 'active' : ''}`} 
                                                    onClick={() => {
                                                        const newKws = isActive 
                                                            ? selectedKeywords.filter(k => k !== name) 
                                                            : [...selectedKeywords, name];
                                                        handleConfigChange('keywords', newKws);
                                                    }}
                                                >
                                                    #{name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="budget-group" style={{ marginTop: '40px', textAlign: 'left' }}>
                                <label style={{ fontWeight: '600', display: 'block', marginBottom: '10px' }}>
                                    💰 최대 예산: <strong style={{ color: '#005ADE' }}>
                                        {(Number(planConfig.budget_range?.[1]) || 100000).toLocaleString()}원
                                    </strong>
                                </label>
                                <input
                                    type="range"
                                    min="100000"
                                    max="5000000"
                                    step="50000"
                                    style={{ width: '100%' }}
                                    value={Number(planConfig.budget_range?.[1]) || 100000}
                                    onChange={(e) => handleConfigChange('budget_range', [0, Number(e.target.value)])}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                    <span>10만원</span>
                                    <span>500만원</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <button className="back-button" onClick={() => navigate(-1)}>이전으로</button>
                        <button className="submit-button" onClick={handleNext}>일정 생성하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanKeyword;