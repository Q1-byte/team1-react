import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';

export default function TravelPlan() {
    const [planConfig, setPlanConfig] = useState({
        region_id: null,
        region_name: "",
        sub_region: "",
        people_count: 1,
        budget_range: [100000, 500000],
        start_date: null,  // 추가
        end_date: null,    // 추가
        nights: 0,         // 추가
        keywords: [],
    });

    // 필드 하나씩 업데이트하는 기존 방식 (유지)
    const handleConfigChange = (key, value) => {
        setPlanConfig((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <div className="travel-plan-container">
            <Header />
            <main style={{ paddingTop: '100px' }}> 
                <Outlet context={{ planConfig, handleConfigChange }} />
            </main>
        </div>
    );
}