import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './PlanReceipt.css';

const PlanReceipt = () => {
    const navigate = useNavigate();
    // 💡 부모(TravelPlan)로부터 실시간 계획 데이터를 가져옵니다.
    const { planConfig } = useOutletContext();

    // 💰 결제 완료된 최종 금액 계산 로직
    const calculatePrices = () => {
        const { people_count = 1, nights = 0 } = planConfig;
        
        // 가상의 계산 로직 (기획에 맞게 유지)
        const stay = nights * 100000; // 1박당 10만원
        const food = (nights + 1) * people_count * 30000; // 1인 1식 기준
        const activity = people_count * 50000; // 인당 체험비
        
        return {
            stay,
            food,
            activity,
            total: stay + food + activity
        };
    };

    const prices = calculatePrices();

    return (
        <div className="receipt-container">
            <div className="receipt-paper">
                <header className="receipt-header">
                    <h1 className="receipt-title">PAYMENT COMPLETED</h1>
                    <p className="receipt-status-badge">결제 완료</p>
                    <p className="receipt-date">결제일시: {new Date().toLocaleString()}</p>
                </header>
                
                <hr className="dashed-line" />
                
                <section className="receipt-section">
                    <h3>[ 여행 확정 정보 ]</h3>
                    <div className="receipt-row">
                        <span>목적지</span>
                        <span>**{planConfig.region_name || "미지정"} ({planConfig.sub_region || "전체"})**</span>
                    </div>
                    <div className="receipt-row">
                        <span>여행 일정</span>
                        <span>{planConfig.start_date || "미정"} ~ {planConfig.end_date || "미정"} ({planConfig.nights}박)</span>
                    </div>
                    <div className="receipt-row">
                        <span>인원 수</span>
                        <span>{planConfig.people_count}명</span>
                    </div>
                </section>

                <section className="receipt-section">
                    <h3>[ 선택 테마 키워드 ]</h3>
                    <div className="keyword-tags">
                        {planConfig.keywords && planConfig.keywords.length > 0 
                            ? planConfig.keywords.map((k, i) => <span key={i} className="receipt-tag">#{k} </span>)
                            : "선택된 키워드가 없습니다."
                        }
                    </div>
                </section>

                <hr className="dashed-line" />

                <section className="receipt-section price-detail">
                    <h3>[ 결제 금액 명세 ]</h3>
                    <div className="receipt-row">
                        <span>숙박 서비스</span>
                        <span>{prices.stay.toLocaleString()}원</span>
                    </div>
                    <div className="receipt-row">
                        <span>액티비티 체험권</span>
                        <span>{prices.activity.toLocaleString()}원</span>
                    </div>
                </section>

                <hr className="double-line" />

                <div className="receipt-row total-amount-row">
                    <span>최종 결제 합계</span>
                    <span className="total-price">{prices.total.toLocaleString()}원</span>
                </div>

                <footer className="receipt-footer">
                    <p>※ 상세 여행 일정은 '마이페이지'에서 확인 가능합니다.</p>
                    <p>저희 서비스를 이용해주셔서 감사합니다!</p>
                    <div className="barcode"></div>
                </footer>
            </div>

            <div className="receipt-actions">
                {/* 🚫 기존 예약하기 버튼 삭제, 유저 편의 버튼으로 대체 */}
                <button className="home-btn" onClick={() => navigate('/')}>
                    홈으로 돌아가기
                </button>
                <button className="mypage-link-btn" onClick={() => navigate('/mypage')}>
                    내 예약 확인하기
                </button>
            </div>
        </div>
    );
};

export default PlanReceipt;