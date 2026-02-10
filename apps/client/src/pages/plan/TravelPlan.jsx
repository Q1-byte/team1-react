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
           <main style={{ paddingTop: '20px' }}> {/* 100px에서 20px로 과감하게 줄여보세요 */}
                <Outlet context={{ planConfig, handleConfigChange }} />
            </main>
        </div>
    );
}