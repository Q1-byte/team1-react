// apps/client/src/components/TopSlider.jsx
import React, { useState, useEffect } from 'react';

export default function TopSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 3; 

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="topbanner-section">
            <div className="slider-container">
                {[0, 1, 2].map((idx) => (
                    <div
                        key={idx}
                        className={`slide-item ${currentSlide === idx ? 'active' : ''}`}
                        // ✅ 경로를 /banner/Topbanner 로 수정했습니다. (확장자가 .jpg인지 .png인지 꼭 확인하세요!)
                        style={{ backgroundImage: `url('/banner/Topbanner${idx + 1}.jpg')` }}
                    />
                ))}
            </div>

            <div className="banner-content">
                <p> 성향 기반 여행 일정 생성 </p>
                <h1>예약에서 결제까지<br/><strong>한 번에!</strong></h1>
            </div>

            <div className="slider-dots">
                {[0, 1, 2].map((idx) => (
                    <span key={idx} className={currentSlide === idx ? 'dot active' : 'dot'} />
                ))}
            </div>
        </section>
    );
}