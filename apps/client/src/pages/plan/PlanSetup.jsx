import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PlanSearch.css'; 

export default function PlanSetup() {
    const navigate = useNavigate();
    const { planConfig, handleConfigChange } = useOutletContext();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    // 오늘 날짜 기준점 (시간 초기화)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const keywordList = [
        { id: 1, label: "#사람싫어 #조용한게최고" },
        { id: 2, label: "#자연좋아 #풍경맛집" },
        { id: 3, label: "#집순이_집돌이 #안전제일" },
        { id: 4, label: "#활동파 #에너지뿜뿜" },
        { id: 5, label: "#예술혼 #전시회덕후" },
        { id: 6, label: "#먹는게남는거 #미식가" },
        { id: 7, label: "#사진에진심 #인생샷" },
        { id: 8, label: "#가성비추구 #알뜰족" },
    ];

    // 날짜 클릭 핸들러
    const handleDayClick = (date) => {
        date.setHours(0, 0, 0, 0);

        // 오늘 이전 날짜 방어
        if (date < today) return;

        // 시작일이 없거나, 범위를 새로 잡고 싶을 때
        if (!startDate || (startDate && endDate)) {
            setStartDate(date);
            setEndDate(null);
        } else {
            // 선택 가능한 범위 내인지 다시 확인 (로직상 방어)
            const diff = Math.abs(Math.floor((date - startDate) / (1000 * 60 * 60 * 24)));
            if (diff > 2) return; 

            if (date < startDate) { 
                setEndDate(startDate); 
                setStartDate(date); 
            } else { 
                setEndDate(date); 
            }
        }
    };

    // 🔥 핵심: 3일 초과 날짜 비활성화 함수
    const isTileDisabled = ({ date, view }) => {
        if (view === 'month') {
            // 1. 오늘 이전 날짜 막기
            if (date < today) return true;

            // 2. 시작일만 선택된 상태일 때, 시작일 기준 전후 2일(총 3일) 외에는 다 막기
            if (startDate && !endDate) {
                const diff = Math.abs(Math.floor((date - startDate) / (1000 * 60 * 60 * 24)));
                return diff > 2; // 차이가 2일보다 크면 클릭 불가
            }
        }
        return false;
    };

    const toggleKeyword = (keyword) => {
        setSelectedKeywords(prev => 
            prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
        );
    };

    const handleNext = () => {
        navigate('/travel-plan/search');
        if (!startDate || !endDate) return alert("여행 기간을 선택해주세요!");
        if (selectedKeywords.length === 0) return alert("키워드를 선택해주세요!");
        
        const formatDate = (d) => {
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().split('T')[0];
        };

        handleConfigChange('start_date', formatDate(startDate));
        handleConfigChange('end_date', formatDate(endDate));
        handleConfigChange('nights', Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));
        handleConfigChange('keywords', selectedKeywords);

        navigate('/reserve/result'); 
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
        <div className="setup-wrapper" style={{ padding: '120px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="setup-content-card" style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📅 일정 선택 (최대 3일)</h3>
                <div className="calendar-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <Calendar 
                        key={startDate ? (endDate ? 'full' : startDate.toISOString()) : 'empty'}
                        onClickDay={handleDayClick}
                        selectRange={false}
                        value={startDate && endDate ? [startDate, endDate] : startDate}
                        formatDay={(locale, date) => date.getDate()}
                        calendarType="gregory"
                        
                        // [수정] minDate 대신 커스텀 비활성화 함수 적용
                        tileDisabled={isTileDisabled} 

                        tileClassName={({ date, view }) => {
                            if (view === 'month' && startDate) {
                                if (endDate && date >= startDate && date <= endDate) return 'selected-range-tile';
                                if (date.getTime() === startDate.getTime()) return 'selected-single-tile';
                            }
                        }}
                    />
                </div>

                <hr style={{ border: '0', height: '1px', background: '#eee', margin: '30px 0' }} />

                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>✨ 나의 여행 스타일</h3>
                <div className="keyword-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {keywordList.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleKeyword(item.label)}
                            style={{
                                padding: '12px 8px',
                                borderRadius: '12px',
                                border: selectedKeywords.includes(item.label) ? '2px solid #007bff' : '1px solid #eee',
                                backgroundColor: selectedKeywords.includes(item.label) ? '#eef6ff' : '#fff',
                                color: selectedKeywords.includes(item.label) ? '#007bff' : '#555',
                                fontWeight: selectedKeywords.includes(item.label) ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

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
                <button className="next-button" onClick={handleNext} style={{ width: '100%', marginTop: '40px', padding: '15px', borderRadius: '12px', background: '#007bff', color: '#fff', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    여행 일정 생성하기 🧾
                </button>
            </div>
        </div>
    );
}