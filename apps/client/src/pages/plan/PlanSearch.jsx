import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PlanSearch.css';

// 1. 전국 광역자치단체 및 세부 시·군·구 데이터
const REGION_DATA = {
    "seoul": { name: "서울특별시", sub: ["강남구", "종로구", "마포구", "송파구", "용산구"] },
    "busan": { name: "부산광역시", sub: ["해운대구", "기장군", "영도구", "수영구", "부산진구"] },
    "daegu": { name: "대구광역시", sub: ["중구", "수성구", "달성군", "동구"] },
    "incheon": { name: "인천광역시", sub: ["중구(차이나타운)", "강화군", "옹진군", "연수구(송도)"] },
    "gwangju": { name: "광주광역시", sub: ["동구", "남구", "북구", "광산구"] },
    "daejeon": { name: "대전광역시", sub: ["유성구", "서구", "중구", "동구"] },
    "ulsan": { name: "울산광역시", sub: ["남구", "동구", "울주군"] },
    "sejong": { name: "세종특별자치시", sub: ["세종시"] },
    "gyeonggi": { name: "경기도", sub: ["수원시", "용인시", "파주시", "가평군", "양평군", "포천시"] },
    "gangwon": { name: "강원특별자치도", sub: ["강릉시", "속초시", "춘천시", "양양군", "평창군", "정선군"] },
    "chungbuk": { name: "충청북도", sub: ["청주시", "충주시", "제천시", "단양군", "괴산군"] },
    "chungnam": { name: "충청남도", sub: ["천안시", "아산시", "태안군", "보령시", "부여군", "공주시"] },
    "jeonbuk": { name: "전북특별자치도", sub: ["전주시", "군산시", "익산시", "남원시", "부안군"] },
    "jeonnam": { name: "전라남도", sub: ["여수시", "순천시", "목포시", "담양군", "보성군", "완도군"] },
    "gyeongbuk": { name: "경상북도", sub: ["경주시", "포항시", "안동시", "울릉군", "문경시"] },
    "gyeongnam": { name: "경상남도", sub: ["창원시", "통영시", "거제시", "남해군", "하동군"] },
    "jeju": { name: "제주특별자치도", sub: ["제주시", "서귀포시", "우도"] },
};

const PlanSearch = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState(null); 
    const [searchData, setSearchData] = useState({
        people_count: 1,
        region_id: "",
        sub_region: "",
        main_category: "", 
        budget_range: 500000
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "region_id") {
            // 지역(시·도) 변경 시 세부 지역 초기화
            setSearchData(prev => ({ ...prev, region_id: value, sub_region: "" }));
        } else {
            setSearchData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            alert("여행 기간을 선택해주세요!");
            return;
        }
        if (!searchData.region_id || !searchData.sub_region || !searchData.main_category) {
            alert("지역, 세부 지역, 테마를 모두 선택해주세요!");
            return;
        }

        const startDate = dateRange[0].toISOString().split('T')[0];
        const endDate = dateRange[1].toISOString().split('T')[0];

        navigate('/keyword', { 
            state: { 
                ...searchData, 
                start_date: startDate, 
                end_date: endDate,
                region_name: REGION_DATA[searchData.region_id].name 
            } 
        });
    };

    return (
        <div className="plan-search-container">
            <h2>어디로 떠나시나요?</h2>
            <div className="search-main-card">
                <div className="calendar-section">
                    <label>📅 여행 기간</label>
                    <div className="calendar-wrapper">
                        <Calendar 
                            onChange={setDateRange} 
                            value={dateRange} 
                            selectRange={true} 
                            minDate={new Date()}
                            formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}
                        />
                    </div>
                </div>

                <div className="selection-grid">
                    <div className="input-group">
                        <label>👥 인원</label>
                        <select name="people_count" value={searchData.people_count} onChange={handleChange}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>{num}명</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>✨ 여행 테마</label>
                        <select name="main_category" value={searchData.main_category} onChange={handleChange}>
                            <option value="">테마 선택</option>
                            <option value="relaxed">여유로운 힐링</option>
                            <option value="active">활동적인 액티비티</option>
                            <option value="cost-effective">가성비 위주</option>
                            <option value="luxury">럭셔리 호캉스</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>📍 지역 (시·도)</label>
                        <select name="region_id" value={searchData.region_id} onChange={handleChange}>
                            <option value="">지역 선택</option>
                            {Object.keys(REGION_DATA).map(key => (
                                <option key={key} value={key}>{REGION_DATA[key].name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>🗺️ 세부 지역</label>
                        <select 
                            name="sub_region" 
                            value={searchData.sub_region} 
                            onChange={handleChange}
                            disabled={!searchData.region_id}
                        >
                            <option value="">상세 지역 선택</option>
                            {searchData.region_id && (
                                <>
                                    {/* 상위 지역 명칭을 활용한 '전체' 옵션 추가 */}
                                    <option value="all">{REGION_DATA[searchData.region_id].name} 전체</option>
                                    {REGION_DATA[searchData.region_id].sub.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>
                    
                    <div className="input-group budget-group">
                        <label>💰 최대 예산: <strong>{Number(searchData.budget_range).toLocaleString()}원</strong></label>
                        <input 
                            type="range" 
                            name="budget_range" 
                            min="100000" 
                            max="5000000" 
                            step="10000" 
                            value={searchData.budget_range} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <button className="next-button" onClick={handleNext}>상세 키워드 선택하러 가기</button>
            </div>
        </div>
    );
};

export default PlanSearch;