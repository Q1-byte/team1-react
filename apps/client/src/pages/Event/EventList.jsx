import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import './EventList.css'; // CSS 분리 완료!

const EventList = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [totalElements, setTotalElements] = useState(0); // 전체 데이터 개수

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("전체");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 3x3 그리드

    // 카테고리 맵핑 (프론트 한글명 -> 백엔드 Enum 명칭)
    const categoryMapping = {
        "축제": "FESTIVAL",
        "먹거리": "FOOD",
        "시즌테마": "SEASON",
        "일반행사": "GENERAL"
    };

    const categories = ["전체", "축제", "먹거리", "시즌테마", "일반행사"];

    // 데이터 가져오는 함수 분리
    const fetchEvents = () => {
        const params = {
            page: currentPage - 1, // 백엔드는 0페이지부터 시작
            size: itemsPerPage,
            sort: "id,desc"
        };

        if (searchTerm) params.name = searchTerm;
        if (selectedCategory !== "전체") params.type = categoryMapping[selectedCategory];

        api.get('/events', { params })
            .then(res => {
                if (res.data && res.data.content) {
                    setEvents(res.data.content);
                    setTotalElements(res.data.totalElements);
                } else if (Array.isArray(res.data)) {
                    setEvents(res.data);
                    setTotalElements(res.data.length);
                }
            })
            .catch(err => console.error("백엔드 연동 실패: ", err));
    };

    // 현재 페이지나 검색어, 카테고리가 바뀔 때마다 다시 가져옴
    useEffect(() => {
        fetchEvents();
    }, [currentPage, searchTerm, selectedCategory]);

    // 검색이나 카테고리 변경 시 페이지를 1로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    // 페이지 번호 계산
    const totalPages = Math.ceil(totalElements / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
                            <img
                                src={event.url || "https://placehold.co/600x400?text=No+Image"}
                                alt={event.name}
                                onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                            />
                            <div className="card-content">
                                <span className="category-tag">{event.category}</span>
                                <h3>{event.name}</h3>
                                <p>{event.description || "상세 정보가 없습니다."}</p>
                                <span className="card-date">{event.startDate} ~ {event.endDate}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-result">해당하는 이벤트가 없습니다. 🔍</p>
                )}
            </div>

            {/* 페이징 UI: 전체 개수가 페이지 당 개수보다 많을 때만 표시 */}
            {totalElements > itemsPerPage && (
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