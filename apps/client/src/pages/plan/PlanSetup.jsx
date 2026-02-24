import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

export default function PlanSetup() {
    const navigate = useNavigate();
    const { planConfig, handleConfigChange } = useOutletContext();
    const [loading, setLoading] = useState(false);

    // 🚀 확정된 8가지 키워드
    const officialKeywords = ['힐링', '자연', '트래킹', '데이트', '스릴', '추억', '예술', '체험'];

    const MAX_NIGHTS = 2;

    // 시작일 기준 최대 종료일 계산
    const getMaxEndDate = (startDate) => {
        if (!startDate) return '';
        const d = new Date(startDate);
        d.setDate(d.getDate() + MAX_NIGHTS);
        return d.toISOString().split('T')[0];
    };

    // 오늘 날짜 (input min 값)
    const today = new Date().toISOString().split('T')[0];

    // 시작일 변경 핸들러
    const handleStartDateChange = (value) => {
        handleConfigChange('travel_date', value);
        // 종료일이 새 시작일보다 이전이거나 최대 초과면 초기화
        if (planConfig.end_date) {
            const maxEnd = getMaxEndDate(value);
            if (planConfig.end_date < value || planConfig.end_date > maxEnd) {
                handleConfigChange('end_date', null);
            }
        }
    };

    // 🚀 일정 생성 및 API 호출 로직
    const handleGeneratePlan = async () => {
        const { travel_date, end_date, people_count, keywords, region_name, sub_region } = planConfig;

        // 필수 값 체크
        if (!travel_date) return alert("여행 시작 날짜를 선택해주세요!");
        if (!end_date) return alert("여행 종료 날짜를 선택해주세요!");
        if (!keywords || keywords.length === 0) return alert("취향 키워드를 최소 1개 선택해주세요!");

        setLoading(true);
        try {
            // 백엔드 API 호출
            const response = await axios.post('http://localhost:8080/api/plans/recommend', {
                region: region_name,
                subRegion: sub_region,
                selectedKeywords: keywords,
                peopleCount: people_count || 1,
                startDate: travel_date,
                endDate: end_date
            });

            // 결과 페이지로 데이터 전달하며 이동
            navigate('/reserve/result', { 
                state: { 
                    finalPlanData: response.data, 
                    config: { ...planConfig }
                } 
            }); 
        } catch (error) {
            console.error("일정 생성 중 오류 발생:", error);
            alert("일정 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // --- 팀원분 디자인 가이드 (인라인 스타일) ---
    const containerStyle = {
        maxWidth: '450px',
        margin: '20px auto',
        padding: '0 20px 20px 20px',
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
        boxSizing: 'border-box'
    };
    const titleStyle = {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '20px',
        textAlign: 'center',
        display: 'block'
    };
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
            
            {/* 1. 날짜 선택 */}
            <section style={sectionStyle}>
                <span style={titleStyle}>📅 언제 떠나시나요?</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: '#888', marginBottom: '6px', display: 'block' }}>시작일</label>
                        <input
                            type="date"
                            value={planConfig.travel_date || ''}
                            min={today}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            style={{...fullWidthControl, textAlign: 'center'}}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: '#888', marginBottom: '6px', display: 'block' }}>
                            종료일 <span style={{ color: '#007BFF' }}>(최대 2박 3일)</span>
                        </label>
                        <input
                            type="date"
                            value={planConfig.end_date || ''}
                            min={planConfig.travel_date || today}
                            max={getMaxEndDate(planConfig.travel_date)}
                            disabled={!planConfig.travel_date}
                            onChange={(e) => handleConfigChange('end_date', e.target.value)}
                            style={{...fullWidthControl, textAlign: 'center', opacity: planConfig.travel_date ? 1 : 0.4}}
                        />
                    </div>
                    {planConfig.travel_date && planConfig.end_date && (
                        <p style={{ textAlign: 'center', fontSize: '13px', color: '#007BFF', margin: 0, fontWeight: '600' }}>
                            {Math.round((new Date(planConfig.end_date) - new Date(planConfig.travel_date)) / (1000 * 60 * 60 * 24))}박
                            {' '}
                            {Math.round((new Date(planConfig.end_date) - new Date(planConfig.travel_date)) / (1000 * 60 * 60 * 24)) + 1}일
                        </p>
                    )}
                </div>
            </section>

            {/* 2. 인원 선택 */}
            <section style={sectionStyle}>
                <span style={titleStyle}>👥 인원 선택</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => handleConfigChange('people_count', Math.max(1, planConfig.people_count - 1))}
                        disabled={loading}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: '20px', cursor: 'pointer' }}
                    >-</button>
                    <span style={{ fontSize: '20px', fontWeight: '600', width: '60px', textAlign: 'center' }}>{planConfig.people_count}명</span>
                    <button 
                        onClick={() => handleConfigChange('people_count', (planConfig.people_count || 1) + 1)}
                        disabled={loading}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: '20px', cursor: 'pointer' }}
                    >+</button>
                </div>
            </section>

            {/* 3. 취향 키워드 (공유해주신 8개 키워드로 변경) */}
            <section style={sectionStyle}>
                <span style={titleStyle}>✨ 당신의 취향은?</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {officialKeywords.map(word => {
                        const isSelected = planConfig.keywords?.includes(word);
                        return (
                            <button 
                                key={word}
                                disabled={loading}
                                onClick={() => {
                                    const nextKeywords = isSelected
                                        ? planConfig.keywords.filter(k => k !== word)
                                        : [...(planConfig.keywords || []), word];
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
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                #{word}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 하단 버튼 영역 */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    disabled={loading}
                    style={{ 
                        flex: 1, height: '56px', backgroundColor: '#F3F4F6', color: '#666', 
                        border: 'none', borderRadius: '16px', fontWeight: '600', cursor: 'pointer' 
                    }}
                >
                    이전으로
                </button>
                <button 
                    onClick={handleGeneratePlan} 
                    disabled={loading}
                    style={{ 
                        flex: 1, height: '56px', 
                        backgroundColor: loading ? '#A5D1FF' : '#007BFF', 
                        color: '#fff', border: 'none', borderRadius: '16px', 
                        fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {loading ? "생성 중..." : "일정 생성하기"}
                </button>
            </div>
        </div>
    );
}