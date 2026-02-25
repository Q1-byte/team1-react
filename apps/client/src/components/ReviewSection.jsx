import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import ReviewCard from './ReviewCard';
import ReviewSkeleton from './ReviewSkeleton';
import './ReviewSection.css';

export default function ReviewSection() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/api/reviews', { params: { size: 10 } });

                const actualData = Array.isArray(response.data)
                    ? response.data
                    : (response.data.content || []);

                setReviews(actualData);
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400; // 카드 너비만큼 이동
            scrollRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    return (
    <section className="review-section-final">
        <div className="review-title-tag-final">REAL REVIEW</div>
        <h2 className="review-main-title-final">사용자들의 솔직한 후기</h2>

        {/* 이 래퍼가 버튼-카드-버튼을 가로로 꽉 잡아줍니다 */}
        <div className="slider-outer-wrapper-final">
            <button className="slide-btn-final left" onClick={() => scroll('left')}>&lt;</button>
            
            <div className="slider-inner-view-final">
                <div className="review-container-final" ref={scrollRef}>
                    {loading ? (
                        [1, 2, 3, 4].map((i) => <ReviewSkeleton key={i} />)
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="review-card-wrapper-final" onClick={() => navigate('/reviews')}>
                                <ReviewCard stars={review.rating} text={review.title} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button className="slide-btn-final right" onClick={() => scroll('right')}>&gt;</button>
        </div>
    </section>
);
}