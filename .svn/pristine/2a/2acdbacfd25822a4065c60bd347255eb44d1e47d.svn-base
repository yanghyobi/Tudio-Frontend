import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SurveyBanner = () => {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        axios.get('/tudio/dashboard/survey/pending')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setSurveys(res.data);
                } else {
                    setSurveys([]);
                }
            })
            .catch(err => {
                console.error("설문 로드 실패", err);
                setSurveys([]); 
            });
    }, []);

    if (!surveys || surveys.length === 0) return null; 

    return (
        <div className="alert alert-primary d-flex align-items-center justify-content-between mb-4 shadow-sm border-0" role="alert">
            <div className="d-flex align-items-center">
                <i className="bi bi-clipboard-check-fill fs-4 me-3 text-primary"></i>
                <div>
                    <strong>미참여 설문이 {surveys.length}건 있습니다!</strong>
                    <div className="small text-muted">소중한 의견을 남겨주세요.</div>
                </div>
            </div>
            
            <div className="d-flex gap-2">
                {(surveys || []).slice(0, 2).map(survey => (
                    <a 
                        key={survey.surveyNo} 
                        href={`/tudio/survey/detail/${survey.surveyNo}`}
                        className="btn btn-sm btn-light text-primary fw-bold border"
                    >
                        {survey.surveyTitle} <i className="bi bi-arrow-right ms-1"></i>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SurveyBanner;