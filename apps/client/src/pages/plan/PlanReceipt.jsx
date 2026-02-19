import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './PlanReceipt.css';

const PlanReceipt = () => {
    const navigate = useNavigate();
    const { planConfig } = useOutletContext();

    // localStorage에서 결제 데이터 가져오기
    const savedPlanData = JSON.parse(localStorage.getItem('temp_plan_data') || '{}');

    const accommodation = savedPlanData.selected_accommodation;
    const activity = savedPlanData.selected_activity;
    const ticket = savedPlanData.selected_ticket;
    const confirmedDetails = savedPlanData.confirmed_details || [];
    const peopleCount = savedPlanData.people_count || planConfig.people_count || 1;

    const accomTotal = (accommodation?.pricePerNight || 0) * 2;
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;
    const totalPrice = savedPlanData.total_amount || (accomTotal + activityTotal + ticketTotal);

    // 일정을 일차별로 그룹화
    const groupedDetails = confirmedDetails.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {});

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

                {/* 확정 일정 */}
                {Object.keys(groupedDetails).length > 0 && (
                    <section className="receipt-section">
                        <h3>[ 확정 여행 일정 ]</h3>
                        {Object.keys(groupedDetails).sort((a, b) => a - b).map(day => (
                            <div key={day} className="receipt-day-group">
                                <p className="receipt-day-title">{day}일차</p>
                                {groupedDetails[day].map(item => (
                                    <div key={item.id} className="receipt-row">
                                        <span>[{item.type}] {item.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{item.address}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </section>
                )}

                <hr className="dashed-line" />

                <section className="receipt-section price-detail">
                    <h3>[ 결제 금액 명세 ]</h3>
                    {accommodation && (
                        <div className="receipt-row">
                            <span>숙소 - {accommodation.name}</span>
                            <span>{accomTotal.toLocaleString()}원 (1실 x 2박)</span>
                        </div>
                    )}
                    {activity && (
                        <div className="receipt-row">
                            <span>액티비티 - {activity.name}</span>
                            <span>{activityTotal.toLocaleString()}원 ({peopleCount}명)</span>
                        </div>
                    )}
                    {ticket && (
                        <div className="receipt-row">
                            <span>티켓 - {ticket.name}</span>
                            <span>{ticketTotal.toLocaleString()}원 ({peopleCount}명)</span>
                        </div>
                    )}
                </section>

                <hr className="double-line" />

                <div className="receipt-row total-amount-row">
                    <span>최종 결제 합계</span>
                    <span className="total-price">{totalPrice.toLocaleString()}원</span>
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