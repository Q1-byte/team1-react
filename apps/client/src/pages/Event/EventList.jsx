import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import './EventList.css'; // CSS 분리 완료!

const EventList = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("전체"); // 카테고리 상태

    // ---------------------------------------------------------
    // 추가: 페이징을 위한 상태(State)
    // ---------------------------------------------------------
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
    const itemsPerPage = 4; // 한 페이지에 보여줄 아이템 개수
    // ---------------------------------------------------------

    // 2. 카테고리 종류 정의 (백엔드 분류와 일치시킴: 축제, 먹거리, 시즌테마, 일반행사)
    const categories = ["전체", "축제", "먹거리", "시즌테마", "일반행사"];

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
        // [수정] 백엔드에서 페이징 객체(Page)를 주므로 res.data.content를 사용합니다.
        api.get('/events')
            .then(res => {
                if (res.data && res.data.content) {
                    setEvents(res.data.content);
                } else {
                    setEvents(res.data); // 배열로 올 경우 대응
                }
            })
            .catch(err => console.error("백엔드 연동 실패: ", err));
    }, []);

    // [3] 검색이나 카테고리 변경 시 페이지를 1로 리셋
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
                            {/* [수정] url 필드명 사용 */}
                            <img src={event.url || "/event/default.jpg"} alt={event.name} />
                            <div className="card-content">
                                {/* [수정] category 필드명 사용 */}
                                <span className="category-tag">{event.category}</span>
                                <h3>{event.name}</h3>
                                {/* [수정] description 필드 사용 */}
                                <p>{event.description || "상세 정보가 없습니다."}</p>
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