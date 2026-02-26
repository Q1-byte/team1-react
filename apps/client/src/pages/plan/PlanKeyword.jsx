import { useState, useEffect } from 'react';
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

    // PlanKeyword.jsx 내부 수정
    const themeKeywords = [
        { id: 1, name: '힐링', category: '테마' },
        { id: 2, name: '자연', category: '테마' },
        { id: 3, name: '트래킹', category: '활동' },
        { id: 4, name: '데이트', category: '활동' },
        { id: 5, name: '스릴', category: '활동' },
        { id: 6, name: '추억', category: '테마' },
        { id: 7, name: '예술', category: '문화' },
        { id: 8, name: '체험', category: '문화' }
    ];

    const categoryLabels = {
        '테마': '✨ 어떤 분위기의 여행을 원하시나요?',
        '활동': '🏃 활기찬 활동을 원하시나요?',
        '문화': '🎨 새로운 경험을 해보고 싶나요?'
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

    // 새 일정 생성 전 이전 sessionStorage 초기화 (같은 날짜+지역으로 기존 plan 재사용 방지)
    Object.keys(sessionStorage)
        .filter(key => key.startsWith('saved_plan_'))
        .forEach(key => sessionStorage.removeItem(key));

    // 💡 가챠에서 온 데이터가 있다면 그걸 사용하고, 없으면 planConfig 값을 사용합니다.
    const gachaData = location.state?.gachaResult || {};

    // 끝 날짜가 23:59:59로 오는 react-calendar 특성 대비: 둘 다 자정으로 정규화 후 비교
    const startDay = new Date(travel_date[0]); startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(travel_date[1]); endDay.setHours(0, 0, 0, 0);
    const computedTripDays = Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;

    navigate('/reserve/result', {
        state: {
            finalPlanData: {
                ...planConfig, // 기존 설정값들
                // 💡 중요: 가챠에서 넘어온 지역 정보를 명시적으로 덮어씌웁니다.
                region_id: fromGacha ? gachaData.region_id : region_id,
                parent_region_db_id: fromGacha ? gachaData.region_id : planConfig.parent_region_db_id,
                region_name: fromGacha ? gachaData.region_name : region_name,
                keywords: fromGacha ? gachaData.keywords : selectedKeywords,
                start_date: travel_date[0].toLocaleDateString(),
                end_date: travel_date[1].toLocaleDateString(),
                trip_days: computedTripDays,
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
                        <label className="item-label">📅 언제 떠나시나요? <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>(최대 2박 3일)</span></label>
                        <div className="calendar-wrapper">
                            <Calendar
                                onChange={(val) => {
                                    if (Array.isArray(val)) {
                                        const [start, end] = val;
                                        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
                                        if (diffDays > 2) {
                                            const maxEnd = new Date(start);
                                            maxEnd.setDate(maxEnd.getDate() + 2);
                                            handleConfigChange('travel_date', [start, maxEnd]);
                                            return;
                                        }
                                    }
                                    handleConfigChange('travel_date', val);
                                }}
                                value={travel_date}
                                selectRange={true}
                                minDate={new Date()}
                            />
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '8px' }}>
                            현재는 최대 2박 3일까지의 일정만 계획하실 수 있어요.
                        </p>
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