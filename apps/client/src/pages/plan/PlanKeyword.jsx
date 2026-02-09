import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PlanKeyword.css';


const PlanKeyword = () => {
    const navigate = useNavigate();
    const { planConfig, handleConfigChange } = useOutletContext();
    const { region_id, region_name, sub_region, travel_date, people_count, main_category, keywords: selectedKeywords } = planConfig;

    const themeKeywords = [
        // 서울(region_id: 1이라 가정)
        { id: 1, name: '호캉스', category: 'relaxed', region_id: 1 },
        { id: 2, name: '경복궁 투어', category: 'active', region_id: 1 },
        { id: 3, name: '남산타워', category: 'all', region_id: 1 },

        // 제주(region_id: 2라 가정)
        { id: 4, name: '해안도로 드라이브', category: 'relaxed', region_id: 2 },
        { id: 5, name: '서핑', category: 'active', region_id: 2 },
        { id: 6, name: '흑돼지 맛집', category: 'cost-effective', region_id: 2 },

        // 공통(어느 지역에서나 보임)
        { id: 100, name: '야경감상', category: 'all', region_id: 'all' }
    ];

    const [filteredKeywords, setFilteredKeywords] = useState([]);

    useEffect(() => {
        console.log("현재 지역 ID:", region_id); // 1. 값이 제대로 들어오는지 확인
        console.log("현재 메인 카테고리:", main_category); // 2. 카테고리 확인
        const baseTheme = themeKeywords.filter(kw => kw.category === main_category || kw.category === 'all').map(kw => kw.name);
        setFilteredKeywords([...new Set([...baseTheme])]);
    }, [main_category]);

    const handleNext = () => {
    if (!travel_date || travel_date.length < 2) { 
        alert("여행 기간을 선택해주세요!"); 
        return; 
    }
    if (selectedKeywords.length === 0) { 
        alert("키워드를 최소 1개 선택해주세요!"); 
        return; 
    }

    // 결과 페이지(PlanResult)가 기대하는 구조로 데이터 전송
    navigate('/reserve/result', { 
        state: { 
            finalPlanData: {
                ...planConfig,
                // 날짜 객체를 문자열로 변환 (안 하면 Result에서 안 보임)
                start_date: travel_date[0].toLocaleDateString(),
                end_date: travel_date[1].toLocaleDateString(),
            } 
        } 
    }); 
};

    return (
        <div className="plan-keyword-container">
            <h2 style={{ marginBottom: '40px' }}>{region_name} {sub_region} 여행 상세 설정</h2>

            <div className="setup-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
                {/* 달력 섹션 */}
                <div className="calendar-section">
                    <label>📅 언제 떠나시나요?</label>
                    <Calendar 
                        onChange={(val) => handleConfigChange('travel_date', val)} 
                        value={travel_date} 
                        selectRange={true} 
                        minDate={new Date()} 
                    />
                </div>

                {/* 인원 및 테마 섹션 */}
                <div className="info-section">
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label>👥 인원 선택</label>
                        <select value={people_count} onChange={(e) => handleConfigChange('people_count',parseInt(e.target.value))}>
                            {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}명</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 키워드 섹션 */}
            <div className="keyword-section">
                <h3>당신의 취향은?</h3>
                <div className="keyword-grid">
                    {filteredKeywords.map((name, index) => (
                        <div key={index} className={`keyword-item ${selectedKeywords.includes(name) ? 'active' : ''}`} onClick={() => {
                            const newKws = selectedKeywords.includes(name) ? selectedKeywords.filter(k => k !== name) : [...selectedKeywords, name];
                            handleConfigChange('keywords', newKws);
                        }}>
                            #{name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="button-group">
                <button className="back-button" onClick={() => navigate(-1)}>이전으로</button>
                <button className="submit-button" onClick={handleNext}>일정 생성하기</button>
            </div>
        </div>
    );
};

export default PlanKeyword;