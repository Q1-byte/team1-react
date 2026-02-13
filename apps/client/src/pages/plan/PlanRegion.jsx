import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function PlanRegion() {
    const navigate = useNavigate();
    const { planConfig, handleConfigChange } = useOutletContext();

    const handleNext = () => {
        // 기존에 state로 넘기던 데이터를 부모 context에 저장합니다.
        // (예시 변수명: selectedRegion, selectedSubRegion)
        // handleConfigChange('region_id', selectedRegion);
        
        // 데이터가 저장되었으므로 주소만 이동하면 됩니다.
        navigate('/travel-plan/setup'); 
    };

    return (
        <div>
            <h2>1단계: 지역 선택</h2>
            {/* 선택 로직... */}
            <button onClick={handleNext}>다음 단계로</button>
        </div>
    );
}