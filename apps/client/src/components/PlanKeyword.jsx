import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlanKeyword.css';

const PlanKeyword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // PlanSearch에서 넘어온 데이터 (데이터가 없을 경우를 대비한 방어 코드 포함)
    const searchData = location.state || { 
        main_category: 'relaxed', 
        region_id: 'seoul', 
        region_name: '서울특별시', 
        sub_region: 'all' 
    };
    const { main_category, region_id, region_name, sub_region } = searchData;

    // 1. 테마별 기본 키워드 데이터베이스
    const themeKeywords = [
        { id: 1, name: '호캉스', category: 'relaxed' },
        { id: 2, name: '산책/명상', category: 'relaxed' },
        { id: 3, name: '미술관/전시', category: 'relaxed' },
        { id: 4, name: '온천/스파', category: 'relaxed' },
        { id: 5, name: '북카페', category: 'relaxed' },
        { id: 6, name: '액티비티', category: 'active' },
        { id: 7, name: '등산/트레킹', category: 'active' },
        { id: 8, name: '테마파크', category: 'active' },
        { id: 9, name: '수상레저', category: 'active' },
        { id: 10, name: '번지점프', category: 'active' },
        { id: 11, name: '무료전시', category: 'cost-effective' },
        { id: 12, name: '로컬맛집', category: 'cost-effective' },
        { id: 13, name: '전통시장', category: 'cost-effective' },
        { id: 14, name: '공원피크닉', category: 'cost-effective' },
        { id: 15, name: '게스트하우스', category: 'cost-effective' },
        { id: 100, name: '맛집탐방', category: 'all' },
        { id: 101, name: '사진맛집', category: 'all' },
        { id: 102, name: '야경감상', category: 'all' }
    ];

    // 2. 지역별 특화 키워드
    const regionalSpecialty = {
        seoul: ["한강피크닉", "고궁투어", "남산타워", "쇼핑"],
        busan: ["바다전망", "자갈치시장", "요트투어", "감천문화마을"],
        gangwon: ["양떼목장", "강원도대게", "서핑", "오션뷰카페"],
        jeju: ["오름", "감귤체험", "해안도로드라이브", "한라산"],
        gyeongbuk: ["황리단길", "한옥스테이", "유적지순례"],
        default: ["지역 핫플레이스", "현지인 추천"]
    };

    const [filteredKeywords, setFilteredKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    // 분위기 + 지역 키워드 병합 로직
    useEffect(() => {
        const baseTheme = themeKeywords.filter(
            kw => kw.category === main_category || kw.category === 'all'
        ).map(kw => kw.name);

        const regionalAddons = regionalSpecialty[region_id] || regionalSpecialty.default;
        const combined = [...new Set([...baseTheme, ...regionalAddons])];
        setFilteredKeywords(combined);
    }, [main_category, region_id]);

    const toggleKeyword = (name) => {
        setSelectedKeywords(prev =>
            prev.includes(name) ? prev.filter(k => k !== name) : [...prev, name]
        );
    };

    // [수정 핵심] 결제창이 아닌 '일정 결과' 페이지로 먼저 이동하도록 수정
    const handleNext = () => {
        if (selectedKeywords.length === 0) {
            alert("상세 키워드를 하나 이상 선택해주세요!");
            return;
        }

        const finalPlanData = {
            ...searchData,
            keywords: selectedKeywords,
            // 금액은 결과 페이지나 체크아웃 페이지에서 정의하는 것이 좋습니다.
        };

        // '/checkout'이 아니라 '/result'로 목적지 변경
        navigate('/result', { state: { finalPlanData } });
    };

    const getTitle = () => {
        const subRegionText = sub_region === 'all' ? '전체' : sub_region;
        const regionTitle = `${region_name} ${subRegionText}`;
        
        switch(main_category) {
            case 'relaxed': return `🧘 ${regionTitle} 힐링 여행`;
            case 'active': return `🏃 ${regionTitle} 에너지 여행`;
            case 'cost-effective': return `💰 ${regionTitle} 가성비 여행`;
            default: return `✨ ${regionTitle} 맞춤 여행`;
        }
    };

    return (
        <div className="plan-keyword-container">
            <div className="keyword-header">
                <h2>{getTitle()}</h2>
                <p>선택하신 지역과 테마에 딱 맞는 키워드들입니다!</p>
            </div>

            <div className="keyword-grid">
                {filteredKeywords.map((name, index) => (
                    <div
                        key={index}
                        className={`keyword-item ${selectedKeywords.includes(name) ? 'active' : ''}`}
                        onClick={() => toggleKeyword(name)}
                    >
                        #{name}
                    </div>
                ))}
            </div>

            <div className="button-group">
                <button className="back-button" onClick={() => navigate(-1)}>
                    이전으로
                </button>
                <button 
                    className="submit-button" 
                    onClick={handleNext}
                    disabled={selectedKeywords.length === 0}
                >
                    AI 일정 생성하기
                </button>
            </div>
        </div>
    );
};

export default PlanKeyword;