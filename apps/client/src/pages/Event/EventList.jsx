import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EventList.css'; // CSS 분리 완료!

const EventList = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([
        {
            id: 1,
            name: "제주도 유채꽃 축제",
            category: "축제",
            description: "노란 유채꽃과 함께하는 봄 나들이!",
            startDate: "2026-03-01",
            endDate: "2026-04-15",
            url: "/banner/event/flower.jpg"
        },
        {
            id: 2,
            name: "겨울 바다 기차 여행",
            category: "시즌",
            description: "낭만 가득한 겨울 바다를 기차로 즐기세요.",
            startDate: "2026-02-01",
            endDate: "2026-02-28",
            url: "/banner/event/winter.jpg"
        },
        {
            id: 3,
            name: "서울 밤도깨비 야시장",
            category: "먹거리",
            description: "맛있는 먹거리와 핸드메이드 소품이 가득!",
            startDate: "2026-05-05",
            endDate: "2026-10-30",
            url: "/banner/event/dokkaebi.jpg" // 준비된 이미지를 재사용하거나 추가하세요
        },
        {
            id: 4,
            name: "남산타워 벚꽃 축제",
            category: "시즌",
            description: "서울 도심에서 즐기는 화려한 벚꽃의 향연.",
            startDate: "2026-04-01",
            endDate: "2026-04-10",
            url: "/banner/event/sakura.jpg"
        },
        {
            id: 5,
            name: "부산 국제 영화제",
            category: "축제",
            description: "전 세계 영화인들과 함께하는 아시아 최대 축제.",
            startDate: "2026-10-02",
            endDate: "2026-10-11",
            url: "/banner/event/cure.jpg"
        },
        {
            id: 6,
            name: "전주 한옥마을 투어",
            category: "축제",
            description: "전통의 숨결이 살아있는 한옥마을에서의 하루.",
            startDate: "2026-06-01",
            endDate: "2026-08-31",
            url: "/banner/event/han.jpg"
        }
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("전체"); // 카테고리 상태

    // ---------------------------------------------------------
    // 추가: 페이징을 위한 상태(State)
    // ---------------------------------------------------------
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
    const itemsPerPage = 4; // 한 페이지에 보여줄 아이템 개수
    // ---------------------------------------------------------

    // 2. 카테고리 종류 정의
    const categories = ["전체", "축제", "먹거리", "시즌"];

    // 3. 필터링 로직 (검색어 + 카테고리 동시 적용)
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "전체" || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // ---------------------------------------------------------
    // [2] 표시할 데이터 계산 로직 (여기에 추가!)
    // ---------------------------------------------------------
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // 최종적으로 화면에 보여줄 "현재 페이지 데이터"
    const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

    // 페이지 번호 배열 생성 (예: [1, 2])
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    // ---------------------------------------------------------

    useEffect(() => {
        // 백엔드가 완성되기 전까지는 이 아래 axios 코드는 작동하지 않지만 그대로 두셔도 됩니다.
        // 나중에 백엔드를 켜면 여기서 가져온 진짜 데이터가 위 가짜 데이터를 덮어씌우게 됩니다.
        axios.get('http://localhost:8080/api/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error("백엔드 미연결: 임시 데이터 표시 중"));
    }, []);

    // [3] 검색이나 카테고리 변경 시 페이지를 1로 리셋 (추가 권장)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

return (
        <div className="list-container">
            <h2 className="list-title">진행 중인 이벤트</h2>

            <div className="search-container">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="찾으시는 이벤트를 검색해보세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="category-container">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            <div className="event-grid">
                {currentItems.length > 0 ? (
                    currentItems.map(event => (
                        <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
                            <img src={event.url} alt={event.name} />
                            <div className="card-content">
                                <span className="category-tag">{event.category}</span>
                                <h3>{event.name}</h3>
                                <p>{event.description}</p>
                                <span className="card-date">{event.startDate} ~ {event.endDate}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-result">해당하는 이벤트가 없습니다. 🔍</p>
                )}
            </div>

            {/* 페이징 UI */}
            {filteredEvents.length > itemsPerPage && (
                <div className="pagination">
                    {pageNumbers.map(number => (
                        <button 
                            key={number} 
                            className={`page-btn ${currentPage === number ? 'active' : ''}`}
                            onClick={() => setCurrentPage(number)}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;