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
        '성향': '🤸 나는 어떤 여행 스타일인가요?',
        '조건': '✅ 꼭 필요한 조건이 있나요?',
        '테마': '✨ 어떤 분위기의 여행을 원하시나요?',
        '기타': '💡 놓치면 아쉬운 여행의 디테일'
    };

    const [filteredKeywords, setFilteredKeywords] = useState([]);

    useEffect(() => {
        const baseTheme = themeKeywords.filter(kw => !main_category || kw.category === main_category || kw.category === 'all'); 
        setFilteredKeywords(baseTheme);
    }, [main_category]);

    const groupedKeywords = filteredKeywords.reduce((acc, item) => {
        const category = item.category || '기타'; 
        if (!acc[category]) acc[category] = [];
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
                    {/* 1. 언제 떠나시나요? (가운데 정렬을 위한 setup-item 추가) */}
                    <div className="setup-item calendar-section">
                        <label className="item-label">📅 언제 떠나시나요?</label>
                        <div className="calendar-wrapper">
                            <Calendar 
                                onChange={(val) => handleConfigChange('travel_date', val)} 
                                value={travel_date} 
                                selectRange={true} 
                                minDate={new Date()} 
                            />
                        </div>
                    </div>

                    {/* 2. 인원 선택 (가운데 정렬을 위한 setup-item 추가) */}
                    <div className="setup-item info-section">
                        <div className="input-group">
                            <label className="item-label">👥 인원 선택</label>
                            <select 
                                className="people-select"
                                value={people_count} 
                                onChange={(e) => handleConfigChange('people_count', parseInt(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}명</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 3. 당신의 취향은? (가운데 정렬을 위한 setup-item 추가) */}
                    {!fromGacha && (
                        <div className="setup-item keyword-section">
                            <h3 className="section-label">📍 당신의 취향은?</h3>
                            
                            {Object.keys(groupedKeywords).map((category) => (
                                <div key={category} className="category-group">
                                    <h4 className="category-title">
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
                        </div>
                    )}

                    {/* 하단 버튼 그룹 */}
                    <div className="setup-item button-group">
                        <button className="back-button" onClick={() => navigate(-1)}>이전으로</button>
                        <button className="submit-button" onClick={handleNext}>일정 생성하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanKeyword;