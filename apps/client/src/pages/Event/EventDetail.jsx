import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetail.css'; // 분리된 CSS 연결

import api from '../../api'; // API 모듈 추가

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/events/${id}`)
            .then(res => {
                setEvent(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("상세 정보 로드 실패:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="detail-container"><p>데이터를 불러오는 중입니다... ⏳</p></div>;
    }

    if (!event) {
        return (
            <div className="detail-container">
                <p>존재하지 않는 이벤트입니다. ⚠️</p>
                <button className="back-button" onClick={() => navigate('/events')}>목록으로 돌아가기</button>
            </div>
        );
    }

    return (
        <div className="detail-container">
            {/* 상단 버튼 영역 */}
            <button className="back-button" onClick={() => navigate(-1)}>
                ← 이전으로
            </button>

            {/* 카드형 상세 정보 영역 */}
            <div className="detail-card">
                <img src={event.url || "/event/default.jpg"} alt={event.name} className="detail-image" />

                <div className="detail-body">
                    <h1 className="detail-title">{event.name}</h1>

                    <div className="info-box">
                        <p><strong>🗓️ 기간:</strong> {event.startDate} ~ {event.endDate}</p>
                        <p><strong>📍 장소:</strong> {event.address} {event.addr2}</p>
                        <p><strong>📞 문의:</strong> {event.tel || "정보 없음"}</p>
                    </div>

                    <h3 className="section-title">행사 소개</h3>
                    <p className="description">{event.description || "상세 정보가 없습니다."}</p>

                    {/* 신청 버튼 */}
                    <button className="apply-button" onClick={() => alert(`${event.name} 안내 페이지로 이동하시겠습니까?`)}>
                        상세 정보 확인하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;