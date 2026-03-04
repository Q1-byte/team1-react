import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import ReviewCard from './ReviewCard';
import ReviewSkeleton from './ReviewSkeleton';
import './ReviewSection.css';

const PAGE_SIZE = 3;

export default function ReviewSection() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);

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

    const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
    const visibleReviews = reviews.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

    return (
    <section className="review-section-final">
        <div className="review-title-tag-final">REAL REVIEW</div>
        <h2 className="review-main-title-final">사용자들의 솔직한 후기</h2>

        <div className="slider-outer-wrapper-final">
            <button
                className="slide-btn-final left"
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
            >&lt;</button>

            <div className="slider-inner-view-final">
                <div className="review-container-final">
                    {loading ? (
                        [1, 2, 3].map((i) => <ReviewSkeleton key={i} />)
                    ) : (
                        visibleReviews.map((review) => (
                            <div key={review.id} className="review-card-wrapper-final" onClick={() => navigate('/reviews')}>
                                <ReviewCard stars={review.rating} text={review.title} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                className="slide-btn-final right"
                onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))}
                disabled={pageIndex >= totalPages - 1}
            >&gt;</button>
        </div>
    </section>
);
}