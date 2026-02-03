import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TravelReviewDetail.css'; 

const TravelReviewDetail = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // [검수] 가짜 데이터 6개 전수 기재 (속성별 개행 유지)
    const reviewDetails = {
        "1": { 
            id: 1, 
            title: "노란 유채꽃밭에서 인생샷 건지고 왔어요! 🌼", 
            user_id: 101, 
            author: "봄나들이객", 
            plan_id: 501,
            content: "제주도 유채꽃 축제 정말 대박이에요. [IMAGE_1] 특히 성산일출봉 근처 유채꽃 재배단지가 정말 넓어서 사람에 치이지 않고 사진 찍기 좋았어요. [IMAGE_2] 내년에도 꼭 다시 오고 싶네요.", 
            rating: 5, 
            difficulty_score: 1, 
            is_random: false, 
            is_public: true, 
            is_deleted: false, 
            view_count: 1250, 
            created_at: "2026-03-05 14:20:00", 
            updated_at: "2026-03-05 14:20:00",
            images: [
                { id: 1, file_name: "화사한 유채꽃밭", url: "/event/flower.jpg", sort_order: 0 },
                { id: 2, file_name: "jeju_spring_02.jpg", url: "/event/jejuflower.jpg", sort_order: 1 }
            ]
        },
        "2": { 
            id: 2, 
            title: "겨울 바다 기차 여행... 생각보다 훨씬 낭만적이네요", 
            user_id: 102, 
            author: "혼행족", 
            plan_id: 502,
            content: "추운 날씨였지만 기차 안에서 따뜻한 커피 한 잔 마시며 보는 바다는 정말 아름다웠어요. 정동진역에 내려서 바다 냄새 한껏 맡고 오니 가슴이 뻥 뚫리네요. 혼자만의 시간이 필요할 때 강력 추천합니다.", 
            rating: 4, 
            difficulty_score: 2, 
            is_random: false, 
            is_public: true, 
            is_deleted: false, 
            view_count: 842, 
            created_at: "2026-02-10 09:00:00", 
            updated_at: "2026-02-10 09:00:00",
            images: [
                { id: 3, file_name: "winter_train.jpg", url: "/event/winter.jpg", sort_order: 0 }
            ]
        },
        "3": { 
            id: 3, 
            title: "야시장 먹거리 털기! 스테이크가 진짜 맛있음 🍖", 
            user_id: 103, 
            author: "맛집탐방가", 
            plan_id: 503,
            content: "서울 밤도깨비 야시장 다녀왔어요. 웨이팅은 좀 길었지만 큐브 스테이크랑 팟타이 조합은 최고였습니다. 야경을 보며 먹으니 더 맛있더라고요. 한강 바람이 선선해서 데이트 코스로도 딱이에요.", 
            rating: 5, 
            difficulty_score: 3, 
            is_random: false, 
            is_public: true, 
            is_deleted: false, 
            view_count: 2105, 
            created_at: "2026-05-15 20:30:00", 
            updated_at: "2026-05-15 20:30:00",
            images: [
                { id: 4, file_name: "night_market.jpg", url: "/event/dokkaebi.jpg", sort_order: 0 }
            ]
        },
        "4": { 
            id: 4, 
            title: "남산타워 벚꽃, 이번 주말이 절정일 듯합니다", 
            user_id: 104, 
            author: "사진작가L", 
            plan_id: 504,
            content: "남산 산책로를 따라 핀 벚꽃들이 정말 환상적입니다. 케이블카 대기 줄이 길긴 하지만 위에서 내려다보는 핑크빛 서울 시내는 그만한 가치가 있어요. 야간 조명이 켜지면 더 예쁘니 저녁 방문도 추천드려요.", 
            rating: 4, 
            difficulty_score: 4, 
            is_random: false, 
            is_public: true, 
            is_deleted: false, 
            view_count: 562, 
            created_at: "2026-04-05 11:00:00", 
            updated_at: "2026-04-05 11:00:00",
            images: [
                { id: 5, file_name: "namsan_sakura.jpg", url: "/event/sakura.jpg", sort_order: 0 }
            ]
        },
        "5": { 
            id: 5, 
            title: "영화제 현장 열기 대단하네요! 레드카펫 대기 중", 
            user_id: 105, 
            author: "시네마덕후", 
            plan_id: 505,
            content: "부산 국제 영화제에 다녀왔습니다! 해운대와 영화의 전당 일대의 축제 분위기가 너무 좋네요. 평소 보고 싶었던 영화를 큰 화면으로 보니 정말 뜻깊었습니다. 레드카펫 행사도 운 좋게 볼 수 있었어요.", 
            rating: 5, 
            difficulty_score: 3, 
            is_random: false, 
            is_public: true, 
            is_deleted: false, 
            view_count: 320, 
            created_at: "2026-10-05 18:00:00", 
            updated_at: "2026-10-05 18:00:00",
            images: [
                { id: 6, file_name: "busan_biff.jpg", url: "/event/cure.jpg", sort_order: 0 }
            ]
        },
        "6": { 
            id: 6, 
            title: "전주 한옥마을 투어! 한복 입고 인생 사진 남기기", 
            user_id: 106, 
            author: "전주매니아", 
            plan_id: 506,
            content: "전주 여행은 언제 와도 고즈넉하고 좋네요. 이번엔 한복을 대여해서 돌아다녔는데 경기전 앞에서 찍은 사진들이 다 마음에 들어요. 길거리 음식들도 최고였고 한옥에서의 하룻밤도 잊지 못할 겁니다.", 
            rating: 4, 
            difficulty_score: 2, 
            is_random: false, 
            is_public: true, 
            is_deleted: false, 
            view_count: 1580, 
            created_at: "2026-06-10 13:00:00", 
            updated_at: "2026-06-10 13:00:00",
            images: [
                { id: 7, file_name: "jeonju_hanok.jpg", url: "/event/han.jpg", sort_order: 0 }
            ]
        }
    };

    const review = reviewDetails[id];

    if (!review || review.is_deleted || !review.is_public) {
        return (
            <div className="error-wrap">
                <p>요청하신 후기가 존재하지 않거나 삭제되었습니다.</p>
                <button onClick={() => navigate(-1)}>목록으로 돌아가기</button>
            </div>
        );
    }

    // 블로그형 렌더링 로직 (불필요한 줄바꿈 제거)
    const renderMixedContent = (content, images) => {
        const parts = content.split(/(\[IMAGE_\d+\])/g);
        const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

        return parts.map((part, index) => {
            const match = part.match(/\[IMAGE_(\d+)\]/);
            if (match) {
                const imgIdx = parseInt(match[1], 10) - 1;
                const imgObj = sortedImages[imgIdx];
                return imgObj ? (
                    <div key={`img-${index}`} className="gallery-card">
                        <div className="img-frame">
                            <img src={imgObj.url} alt={imgObj.file_name} className="fixed-height-img" />
                        </div>
                        <p className="img-name-tag">{imgObj.file_name}</p>
                    </div>
                ) : null;
            }
            return <span key={`text-${index}`} className="content-text-part">{part}</span>;
        });
    };

    const renderStars = (num) => "★".repeat(num) + "☆".repeat(5 - num);

    return (
        <div className="review-detail-layout">
            <header className="detail-nav-header">
                <button className="back-list-btn" onClick={() => navigate(-1)}>
                    ← 목록으로 돌아가기
                </button>
            </header>

            <article className="review-main-card">
                <div className="review-header">
                    <h1 className="review-title">{review.title}</h1>
                    <div className="review-meta">
                        <span className="meta-text">작성자: <strong>{review.author}</strong></span>
                        <span className="meta-sep">|</span>
                        <span className="meta-text">날짜: {review.created_at.split(' ')[0]}</span>
                        <span className="meta-sep">|</span>
                        <span className="meta-text">조회수: {review.view_count.toLocaleString()}</span>
                    </div>
                    <div className="review-summary">
                        <div className="summary-item rating">
                            <span className="summary-label">평점</span>
                            <span className="summary-value star-gold">{renderStars(review.rating)}</span>
                        </div>
                        <div className="summary-item difficulty">
                            <span className="summary-label">여행 난이도</span>
                            <span className="summary-value">Level {review.difficulty_score}</span>
                        </div>
                    </div>
                </div>

                <div className="review-body">
                    <div className="content-mixed-area">
                        {renderMixedContent(review.content, review.images)}
                    </div>
                </div>

                <footer className="review-footer">
                    <button className="report-btn" onClick={() => alert('신고 접수 페이지로 연결됩니다.')}>
                        🚨 이 게시글 신고하기
                    </button>
                </footer>
            </article>
        </div>
    );
};

export default TravelReviewDetail;