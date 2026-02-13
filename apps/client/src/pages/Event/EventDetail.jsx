import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetail.css';
import api from '../../api';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        api.get(`/events/${id}`)
            .then(res => {
                setEvent(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("데이터 로드 실패:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        // 지도 좌표가 유효하지 않으면 지도 초기화 로직을 건너뜁니다.
        if (loading || !event || !event.mapX || !event.mapY || event.mapX === 0 || event.mapY === 0) return;

        const KAKAO_KEY = (import.meta.env.VITE_KAKAO_MAP_KEY || "").trim();

        const loadMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                console.warn("Kakao maps SDK not ready yet...");
                return;
            }
            window.kakao.maps.load(() => {
                if (!mapRef.current) return;
                const movePosition = new window.kakao.maps.LatLng(event.mapY, event.mapX);
                const map = new window.kakao.maps.Map(mapRef.current, { center: movePosition, level: 3 });
                new window.kakao.maps.Marker({ position: movePosition }).setMap(map);

                // 회색 화면 방지
                setTimeout(() => { map.relayout(); map.setCenter(movePosition); }, 200);
            });
        };

        if (window.kakao && window.kakao.maps) {
            loadMap();
        } else {
            // 이미 스크립트가 있다면 로드 완료 대기
            const existingScript = document.querySelector(`script[src*="//dapi.kakao.com/v2/maps/sdk.js"]`);
            if (existingScript) {
                existingScript.addEventListener('load', loadMap);
            } else {
                const script = document.createElement("script");
                script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
                script.async = true;
                script.onload = loadMap;
                script.onerror = () => {
                    console.error("Kakao Map Script failed to load.");
                    if (mapRef.current) mapRef.current.innerHTML = "<div style='display:flex;align-items:center;justify-content:center;height:100%;color:red;'>지도를 불러올 수 없습니다.</div>";
                };
                document.head.appendChild(script);
            }
        }
    }, [loading, event]);

    if (loading) return <div className="detail-container">로딩 중...</div>;
    if (!event) return <div className="detail-container">정보가 없습니다.</div>;

    return (
        <div className="detail-container">
            <button className="back-button" onClick={() => navigate(-1)}>← 이전으로</button>
            <div className="detail-card">
                <img
                    src={event.url || "https://placehold.co/600x400"}
                    alt={event.name}
                    className="detail-image"
                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                />
                <div className="detail-body">
                    <h1 className="detail-title">{event.name}</h1>
                    <div className="info-box">
                        <p><strong>🗓️ 기간:</strong> {event.startDate} ~ {event.endDate}</p>
                        <p><strong>📍 장소:</strong> {event.address}</p>
                    </div>
                    <p className="description">{event.description}</p>

                    <h3 className="section-title">위치 보기</h3>
                    {event.mapX && event.mapY && event.mapX !== 0 && event.mapY !== 0 ? (
                        <>
                            <div ref={mapRef} className="map-container"></div>
                            <div className="kakao-link-wrapper">
                                <a
                                    href={`https://map.kakao.com/link/map/${event.name},${event.mapY},${event.mapX}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="kakao-link-btn"
                                >
                                    카카오맵에서 크게 보기 🔗
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="no-location-box">
                            📍 위치 정보가 제공되지 않는 행사입니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetail;