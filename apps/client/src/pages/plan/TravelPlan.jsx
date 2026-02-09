import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';

export default function TravelPlan() {
    const [planConfig, setPlanConfig] = useState({
        region_id: null,
        region_name: "",
        sub_region: "",
        people_count: 1,
        budget_range: [10, 50],
        travel_date: null,
        keywords: [],
    });

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
                {/* context를 통해 자식들에게 데이터와 수정 함수를 전달합니다 */}
                <Outlet context={{ planConfig, handleConfigChange }} />
            </main>
        </div>
    );
}