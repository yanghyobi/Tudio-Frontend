import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Survey.css'; 
import '../../../assets/css/admin/pages/AdminCommon.css'; // ★ 공통 CSS

const SurveyResult = () => {
    const [searchParams] = useSearchParams();
    const surveyNo = searchParams.get('surveyNo');
    const navigate = useNavigate();

    const [data, setData] = useState(null);

    useEffect(() => {
        if (surveyNo) {
            axios.get(`/tudio/admin/survey/result/${surveyNo}`)
                .then(res => {
                    console.log("통계 데이터:", res.data);
                    setData(res.data);
                })
                .catch(err => console.error(err));
        }
    }, [surveyNo]);

    if (!data) return <div className="text-center py-20">데이터를 불러오는 중...</div>;

    const { info, stats } = data; 

    return (
        // ★ 1. 공통 래퍼 클래스 적용 (admin-content-wrapper)
        <div className="admin-content-wrapper survey-scope">
            
            {/* ★ 2. 중앙 정렬 레이아웃 적용 */}
            <div className="admin-center-layout">
                
                {/* ★ 3. 공통 박스 클래스 적용 (admin-common-box) */}
                <div className="admin-common-box survey-form-card" style={{ maxWidth: '900px' }}>
                    
                    {/* 상단 헤더 */}
                    <div className="result-header">
                        <div className="d-flex justify-content-between mb-3">
                            <button onClick={() => navigate('/admin/survey/SurveyList')} className="btn-icon text-muted" style={{fontSize:'14px'}}>
                                <i className="bi bi-arrow-left me-1"></i> 목록으로
                            </button>
                            
                            {/* 수정 버튼: 폼으로 이동 */}
                            <button 
                                onClick={() => navigate('/admin/survey/SurveyForm', { 
                                    state: { 
                                        survey: {
                                            SURVEY_NO: surveyNo,
                                            SURVEY_TITLE: info.SURVEY_TITLE,
                                            SURVEY_DESCRIPTION: info.SURVEY_DESCRIPTION,
                                            SURVEY_START_DATE: info.SURVEY_START_DATE,
                                            SURVEY_END_DATE: info.SURVEY_END_DATE,
                                            SURVEY_CLOSE_STATUS: 'N'
                                        } 
                                    } 
                                })}
                                className="btn btn-sm btn-outline-primary fw-bold"
                                style={{borderRadius:'8px', padding: '8px 16px'}}
                            >
                                <i className="bi bi-pencil-square me-1"></i> 수정하기
                            </button>
                        </div>

                        <h1 className="result-title">{info.SURVEY_TITLE}</h1>
                        <p className="text-muted" style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{info.SURVEY_DESCRIPTION}</p>
                        
                        <div className="mt-3 d-inline-block bg-light px-3 py-1 rounded text-secondary small border">
                            <i className="bi bi-people-fill me-1"></i>
                            총 참여자: <strong>{info.TOTAL_PARTICIPANTS}명</strong>
                        </div>
                    </div>

                    {/* 통계 리스트 */}
                    <div className="stats-list">
                        {stats.map((q, idx) => (
                            <div key={q.QUESTION_NO} className="stat-card">
                                <h3 className="stat-title">Q{idx + 1}. {q.QUESTION_CONTENT}</h3>
                                
                                <div className="options-stats">
                                    {q.options.map((opt, oIdx) => {
                                        // 0으로 나누기 방지
                                        const total = q.TOTAL_VOTES || 0; 
                                        const count = opt.VOTE_COUNT || 0;
                                        const percent = total === 0 ? 0 : ((count / total) * 100).toFixed(1);

                                        return (
                                            <div key={oIdx} className="mb-3">
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span>{opt.ANSWER_CONTENT}</span>
                                                    <span style={{color: '#3182CE', fontWeight:'bold'}}>
                                                        {count}표 ({percent}%)
                                                    </span>
                                                </div>
                                                <div className="progress-bg">
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SurveyResult;