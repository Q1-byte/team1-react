import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetail.css'; // 분리된 CSS 연결

const EventDetail = () => {
    const { id } = useParams(); // URL에서 id 추출 (예: /events/3 -> id는 "3")
    const navigate = useNavigate();

    // 상세 페이지에서 보여줄 가짜 데이터 (Mock Data)
    const eventDetails = {
        "1": { 
            name: "제주도 유채꽃 축제", 
            content: "따스한 봄 햇살 아래 펼쳐진 노란 유채꽃 물결! 제주도에서 인생 사진을 남기세요. 축제 기간 동안 다양한 버스킹 공연이 준비되어 있습니다.", 
            date: "2026-03-01 ~ 2026-04-15", 
            location: "제주도 서귀포시 표선면", 
            url: "/banner/event/flower.jpg" 
        },
        "2": { 
            name: "겨울 바다 기차 여행", 
            content: "동해바다를 따라 달리는 낭만 기차 여행. 파도 소리를 들으며 마시는 따뜻한 커피 한 잔의 여유를 느껴보세요.", 
            date: "2026-02-01 ~ 2026-02-28", 
            location: "강원도 강릉시 정동진역", 
            url: "/banner/event/winter.jpg" 
        },
        "3": { 
            name: "서울 밤도깨비 야시장", 
            content: "한강의 아름다운 야경과 함께 즐기는 맛있는 푸드트럭 음식들! 다양한 핸드메이드 소품 쇼핑도 놓치지 마세요.", 
            date: "2026-05-05 ~ 2026-10-30", 
            location: "서울 여의도 한강공원", 
            url: "/banner/event/dokkaebi.jpg" 
        },
        "4": { 
            name: "남산타워 벚꽃 축제", 
            content: "서울에서 가장 아름다운 벚꽃길, 남산 산책로에서 봄의 정취를 만끽하세요. 야간 조명쇼도 함께 진행됩니다.", 
            date: "2026-04-01 ~ 2026-04-10", 
            location: "서울 남산공원 일대", 
            url: "/banner/event/sakura.jpg" 
        },
        "5": { 
            name: "부산 국제 영화제", 
            content: "아시아 최고의 영화 축제! 전 세계 영화인들과 함께 레드카펫의 열기를 느끼고 엄선된 영화를 관람하세요.", 
            date: "2026-10-02 ~ 2026-10-11", 
            location: "부산 영화의 전당", 
            url: "/banner/event/cure.jpg" 
        },
        "6": { 
            name: "전주 한옥마을 투어", 
            content: "전통 한옥의 고즈넉함 속에서 즐기는 비빔밥 체험과 한복 입기 여행. 한국의 미를 온전히 경험할 수 있습니다.", 
            date: "2026-06-01 ~ 2026-08-31", 
            location: "전주 한옥마을", 
            url: "/banner/event/han.jpg" 
        }
    };

    // 현재 ID에 해당하는 데이터 가져오기
    const event = eventDetails[id];

    // 데이터가 없는 경우 예외 처리
    if (!event) {
        return (
            <div className="detail-container">
                <p>존재하지 않는 이벤트입니다.</p>
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
                <img src={event.url} alt={event.name} className="detail-image" />
                
                <div className="detail-body">
                    <h1 className="detail-title">{event.name}</h1>
                    
                    <div className="info-box">
                        <p><strong>🗓️ 기간:</strong> {event.date}</p>
                        <p><strong>📍 장소:</strong> {event.location}</p>
                    </div>

                    <h3 className="section-title">행사 소개</h3>
                    <p className="description">{event.content}</p>
                    
                    {/* 신청 버튼 */}
                    <button className="apply-button" onClick={() => alert(`${event.name} 신청이 완료되었습니다!`)}>
                        지금 바로 여행가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;