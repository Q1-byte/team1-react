import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import './PlanReceipt.css';

const PlanReceipt = () => {
    const navigate = useNavigate();
    const { planConfig } = useOutletContext();
    const location = useLocation();

    // 진입 경로별 state 구분
    // - 결제 직후 (Kakao/Toss): location.state.finalPlanData
    // - MyPage 상세보기:        location.state.planData
    const finalPlanData = location.state?.finalPlanData;
    const planData = location.state?.planData;

    // 결제 상세 데이터 결정 순서:
    // 1) 결제 직후 → finalPlanData (state로 전달)
    // 2) MyPage 상세보기 → payment_detail_${planId} (localStorage 영구 저장분)
    // 3) 구버전 fallback → temp_plan_data
    const savedPlanData = finalPlanData || JSON.parse(
        (planData?.id ? localStorage.getItem(`payment_detail_${planData.id}`) : null)
        || localStorage.getItem('temp_plan_data')
        || '{}'
    );

    const accommodation = savedPlanData.selected_accommodation;
    const activity = savedPlanData.selected_activity;
    const ticket = savedPlanData.selected_ticket;
    const confirmedDetails = savedPlanData.confirmed_details || [];
    const peopleCount = planData?.peopleCount || savedPlanData.people_count || planConfig.people_count || 1;

    const accomTotal = (accommodation?.pricePerNight || 0) * 2;
    const activityTotal = (activity?.price || 0) * peopleCount;
    const ticketTotal = (ticket?.price || 0) * peopleCount;
    const usedPoints = savedPlanData.used_points || 0;
    const originalPrice = savedPlanData.total_amount || (accomTotal + activityTotal + ticketTotal);
    // 최종 결제 금액: MyPage planData.totalPrice는 실제 결제액, 없으면 원가 - 포인트
    const totalPrice = planData?.totalPrice ?? Math.max(0, originalPrice - usedPoints);

    const [fetchedDetails, setFetchedDetails] = useState([]);

    useEffect(() => {
        if (planData?.id && confirmedDetails.length === 0) {
            api.get(`/plans/${planData.id}`)
                .then(res => {
                    const data = res.data;
                    if (data.schedule) {
                        const formatted = [];
                        Object.entries(data.schedule).forEach(([dayStr, spots]) => {
                            const dayNum = parseInt(dayStr.replace(/[^0-9]/g, '')) || 1;
                            if (Array.isArray(spots)) {
                                spots.forEach(spot => {
                                    formatted.push({
                                        id: spot.id,
                                        day: dayNum,
                                        type: spot.spotKeywords?.[0]?.keyword?.name || '관광',
                                        name: spot.name,
                                        address: spot.address,
                                    });
                                });
                            }
                        });
                        setFetchedDetails(formatted);
                    }
                })
                .catch(() => {});
        }
    }, [planData?.id]);

    const allDetails = confirmedDetails.length > 0 ? confirmedDetails : fetchedDetails;
    const groupedDetails = allDetails.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {});

    // 키워드: MyPage planData.keyword(문자열) → savedPlanData.keywords(배열) → planConfig
    const keywords = planData?.keyword
        ? planData.keyword.split(',').map(k => k.trim()).filter(Boolean)
        : (savedPlanData?.keywords || planConfig.keywords || []);

    // 표시값 결정: MyPage planData → savedPlanData(결제 시 저장) → planConfig(빈 기본값) 순
    const regionName =
        planData?.region || planData?.regionName ||
        savedPlanData?.region_name ||
        planConfig.region_name || '미지정';

    const travelDate = planData?.travelDate
        ? `${planData.travelDate} · ${planData.durationDays || '-'}일`
        : savedPlanData?.start_date
            ? `${savedPlanData.start_date} ~ ${savedPlanData.end_date}`
            : `${planConfig.start_date || '미정'} ~ ${planConfig.end_date || '미정'}`;
    const confirmedAt = planData?.createdAt
        ? new Date(planData.createdAt).toLocaleString('ko-KR')
        : new Date().toLocaleString('ko-KR');

    return (
        <div className="receipt-container">

            {/* 상단 완료 배너 */}
            <div className="receipt-success-banner">
                <div className="receipt-check-icon">✓</div>
                <h2 className="receipt-success-title">예약이 확정되었습니다</h2>
                <p className="receipt-success-sub">결제 완료 · {confirmedAt}</p>
            </div>

            <div className="receipt-card-wrap">

                {/* 여행 요약 */}
                <div className="receipt-card">
                    <div className="receipt-card-header">
                        <span className="receipt-card-icon">✈️</span>
                        <h3 className="receipt-card-title">여행 정보</h3>
                    </div>
                    <div className="receipt-info-grid">
                        <div className="receipt-info-item">
                            <span className="info-label">목적지</span>
                            <span className="info-value">{regionName}</span>
                        </div>
                        <div className="receipt-info-item">
                            <span className="info-label">여행 일정</span>
                            <span className="info-value">{travelDate}</span>
                        </div>

                        {/* 확정 일정: 날짜 바로 아래 인라인 표시 */}
                        {Object.keys(groupedDetails).length > 0 && (
                            <div className="receipt-itinerary-inline">
                                {Object.keys(groupedDetails).sort((a, b) => Number(a) - Number(b)).map(day => (
                                    <div key={day} className="receipt-day-group">
                                        <p className="receipt-day-title">Day {day}</p>
                                        {groupedDetails[day].map(item => (
                                            <div key={item.id} className="receipt-spot-row">
                                                <span className="spot-type-badge">{item.type}</span>
                                                <div className="spot-info">
                                                    <span className="spot-name">{item.name}</span>
                                                    {item.address && <span className="spot-address">{item.address}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="receipt-info-item">
                            <span className="info-label">인원</span>
                            <span className="info-value">{peopleCount}명</span>
                        </div>
                        {keywords.length > 0 && (
                            <div className="receipt-info-item">
                                <span className="info-label">테마</span>
                                <div className="keyword-tags">
                                    {keywords.map((k, i) => (
                                        <span key={i} className="receipt-tag">#{k}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 결제 금액 */}
                <div className="receipt-card">
                    <div className="receipt-card-header">
                        <span className="receipt-card-icon">💳</span>
                        <h3 className="receipt-card-title">결제 내역</h3>
                    </div>

                    {accommodation && (
                        <div className="receipt-price-row">
                            <span>숙소 · {accommodation.name} <small>(1실 x 2박)</small></span>
                            <span>{accomTotal.toLocaleString()}원</span>
                        </div>
                    )}
                    {activity && (
                        <div className="receipt-price-row">
                            <span>액티비티 · {activity.name} <small>({peopleCount}명)</small></span>
                            <span>{activityTotal.toLocaleString()}원</span>
                        </div>
                    )}
                    {ticket && (
                        <div className="receipt-price-row">
                            <span>티켓 · {ticket.name} <small>({peopleCount}명)</small></span>
                            <span>{ticketTotal.toLocaleString()}원</span>
                        </div>
                    )}
                    {!accommodation && !activity && !ticket && planData && (
                        <div className="receipt-price-row">
                            <span>여행 패키지 (숙소 · 액티비티 · 티켓 포함)</span>
                            <span>{originalPrice.toLocaleString()}원</span>
                        </div>
                    )}

                    {usedPoints > 0 && (
                        <div className="receipt-price-row receipt-price-discount">
                            <span>포인트 할인</span>
                            <span>- {usedPoints.toLocaleString()} P</span>
                        </div>
                    )}

                    <div className="receipt-total-row">
                        <span>총 결제 금액</span>
                        <span className="receipt-total-price">{totalPrice.toLocaleString()}원</span>
                    </div>
                </div>

                <p className="receipt-notice">예약 내역은 마이페이지에서 언제든지 확인할 수 있습니다.</p>
            </div>

            <div className="receipt-actions">
                <button className="receipt-btn-secondary" onClick={() => navigate('/')}>홈으로</button>
                <button className="receipt-btn-primary" onClick={() => navigate('/mypage')}>내 예약 확인</button>
            </div>
        </div>
    );
};

export default PlanReceipt;
