import { useState } from 'react';
// 각 단계별 컴포넌트 임포트 (가정)
// import StepSearch from './PlanSearch';
// import StepKeyword from './PlanKeyword';

const TravelPlan = () => {
    // 1. 통합 상태 관리 (데이터베이스 구조 반영)
    const [planConfig, setPlanConfig] = useState({
        people_count: 1,
        budget_min: 100000,
        budget_max: 500000,
        travel_date: '',
        duration_days: 1,
        region_id: null,
        keywords: [], // ['힐링', '맛집'] 형태
    });

    // 2. 서버에서 받은 상세 일정 저장 (plan_detail 테이블용)
    const [generatedSchedule, setGeneratedSchedule] = useState([]);

    // 현재 어떤 단계인지 관리 (1: 검색, 2: 키워드, 3: 결과)
    const [step, setStep] = useState(1);

    // 공통 상태 변경 함수
    const handleConfigChange = (key, value) => {
        setPlanConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // 최종 결제 금액 계산 로직
    const calculateTotal = () => {
        return generatedSchedule
            .filter(item => item.is_selected)
            .reduce((sum, item) => sum + item.price, 0);
    };

    return (
        <div className="travel-plan-container">
            <h1>반자동 여행 계획 생성</h1>
            
            {/* 현재 step에 따라 다른 컴포넌트를 보여줌 */}
            {step === 1 && (
                <div>
                    {/* PlanSearch 내용이 여기 들어감 */}
                    <button onClick={() => setStep(2)}>다음 (키워드 선택)</button>
                </div>
            )}
            
            {step === 2 && (
                <div>
                    {/* PlanKeyword 내용이 여기 들어감 */}
                    <button onClick={() => setStep(3)}>일정 생성하기</button>
                </div>
            )}
            
            {/* ... 이런 식으로 한 페이지 내에서 흐름 제어 가능 ... */}
        </div>
    );
};

export default TravelPlan;