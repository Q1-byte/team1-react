// ReviewSkeleton.jsx
import './ReviewSection.css';

const ReviewSkeleton = () => {
    return (
        <div className="review-card-wrapper skeleton">
        <div className="skeleton-card">
            <div className="skeleton-stars"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
        </div>
        </div>
    );
};

export default ReviewSkeleton;