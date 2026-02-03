import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Survey.css';
import '../../../assets/css/admin/pages/AdminCommon.css'; // ★ 공통 CSS

const SurveyForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 목록에서 넘어온 데이터 (수정 모드일 때 사용)
    const initialData = location.state?.survey || null;

    // 수정 모드 여부 (데이터 없으면 등록 모드(true), 있으면 상세 보기(false))
    const [isEditMode, setIsEditMode] = useState(!initialData);

    // 폼 데이터
    const [formData, setFormData] = useState({
        surveyNo: 0,
        surveyTitle: '',
        surveyDescription: '',
        surveyStartDate: '',
        surveyEndDate: '',
        surveyCloseStatus: 'N',
        questionList: [] 
    });

    useEffect(() => {
        if (initialData) {
            // 날짜 포맷 (YYYY-MM-DD HH:mm:ss -> YYYY-MM-DDTHH:mm)
            const formatForInput = (dateStr) => {
                if(!dateStr) return '';
                return dateStr.replace(' ', 'T').substring(0, 16); 
            };

            setFormData(prev => ({
                ...prev,
                surveyNo: initialData.SURVEY_NO,
                surveyTitle: initialData.SURVEY_TITLE,
                surveyDescription: initialData.SURVEY_DESCRIPTION || '',
                surveyStartDate: formatForInput(initialData.SURVEY_START_DATE),
                surveyEndDate: formatForInput(initialData.SURVEY_END_DATE),
                surveyCloseStatus: initialData.SURVEY_CLOSE_STATUS
            }));

            // 상세 질문/보기 가져오기
            fetchSurveyDetail(initialData.SURVEY_NO);
        } else {
            addQuestion(); // 등록 모드: 기본 질문 1개 추가
        }
    }, [initialData]);

    const fetchSurveyDetail = async (surveyNo) => {
        try {
            const res = await axios.get(`/tudio/admin/survey/result/${surveyNo}`);
            const { info, stats } = res.data;
            
            let mappedQuestions = [];
            if (stats && Array.isArray(stats)) {
                mappedQuestions = stats.map(q => ({
                    questionNo: q.QUESTION_NO,
                    questionContent: q.QUESTION_CONTENT,
                    optionList: q.options.map(opt => ({
                        answerNo: opt.ANSWER_NO,
                        answerContent: opt.ANSWER_CONTENT
                    }))
                }));
            }

            setFormData(prev => ({ 
                ...prev, 
                surveyTitle: info.SURVEY_TITLE,
                surveyDescription: info.SURVEY_DESCRIPTION,
                questionList: mappedQuestions 
            }));

        } catch (err) {
            console.error("데이터 로드 실패:", err);
        }
    };

    // --- 핸들러들 ---
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (idx, value) => {
        const newQ = [...formData.questionList];
        newQ[idx].questionContent = value;
        setFormData(prev => ({ ...prev, questionList: newQ }));
    };

    const handleOptionChange = (qIdx, oIdx, value) => {
        const newQ = [...formData.questionList];
        newQ[qIdx].optionList[oIdx].answerContent = value;
        setFormData(prev => ({ ...prev, questionList: newQ }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questionList: [...prev.questionList, { questionContent: '', optionList: [{ answerContent: '' }, { answerContent: '' }] }]
        }));
    };

    const removeQuestion = (idx) => {
        if(formData.questionList.length <= 1) return Swal.fire('경고', '최소 1개의 질문은 필요합니다.', 'warning');
        setFormData(prev => ({ ...prev, questionList: prev.questionList.filter((_, i) => i !== idx) }));
    };

    const addOption = (qIdx) => {
        const newQ = [...formData.questionList];
        newQ[qIdx].optionList.push({ answerContent: '' });
        setFormData(prev => ({ ...prev, questionList: newQ }));
    };

    const removeOption = (qIdx, oIdx) => {
        const newQ = [...formData.questionList];
        if(newQ[qIdx].optionList.length <= 1) return Swal.fire('경고', '최소 1개의 보기는 필요합니다.', 'warning');
        newQ[qIdx].optionList = newQ[qIdx].optionList.filter((_, i) => i !== oIdx);
        setFormData(prev => ({ ...prev, questionList: newQ }));
    };

    const handleSubmit = async () => {
        if (!formData.surveyTitle.trim()) return Swal.fire('필수', '제목을 입력해주세요.', 'warning');
        
        try {
            const url = initialData ? '/tudio/admin/survey/update' : '/tudio/admin/survey/insert';
            const method = initialData ? 'put' : 'post';
            await axios[method](url, formData);
            
            Swal.fire('성공', '저장되었습니다.', 'success').then(() => {
                navigate('/admin/survey/SurveyList');
            });
        } catch (err) {
            Swal.fire('오류', '저장 중 문제가 발생했습니다.', 'error');
        }
    };

    // =================================================================================
    // [렌더링 1] 상세 보기 모드 (Read-Only)
    // =================================================================================
    if (!isEditMode) {
        return (
            <div className="admin-content-wrapper survey-scope">
                <div className="admin-center-layout">
                    {/* ★ 공통 박스 클래스 적용 (admin-common-box) + 설문 전용 스타일 (survey-form-card) */}
                    <div className="admin-common-box survey-form-card" style={{ maxWidth: '900px' }}>
                        
                        {/* 헤더 (읽기 전용) */}
                        <div className="survey-header text-center">
                            <div className="d-flex justify-content-between mb-3">
                                <button onClick={() => navigate(-1)} className="btn-icon text-muted" style={{fontSize:'14px'}}>
                                    <i className="bi bi-arrow-left me-1"></i> 목록으로
                                </button>
                                <button 
                                    onClick={() => setIsEditMode(true)} 
                                    className="btn btn-sm btn-outline-primary fw-bold"
                                    style={{borderRadius:'8px', padding:'8px 16px'}}
                                >
                                    <i className="bi bi-pencil-square me-1"></i> 수정 모드 전환
                                </button>
                            </div>

                            <h1 className="title-input" style={{border:'none', textAlign:'center', pointerEvents:'none'}}>
                                {formData.surveyTitle}
                            </h1>
                            <p className="text-muted" style={{whiteSpace: 'pre-wrap', lineHeight:'1.6'}}>{formData.surveyDescription}</p>
                            
                            <div className="mt-3 p-3 bg-light rounded d-inline-block border">
                                <div className="d-flex gap-4 text-secondary small">
                                    <span>
                                        <i className="bi bi-calendar-check me-1"></i> 
                                        시작: {formData.surveyStartDate.replace('T', ' ')}
                                    </span>
                                    <span>
                                        <i className="bi bi-calendar-x me-1"></i> 
                                        종료: {formData.surveyEndDate.replace('T', ' ')}
                                    </span>
                                    <span>
                                        상태: {formData.surveyCloseStatus === 'N' 
                                            ? <span className="text-primary fw-bold ms-1">진행중</span> 
                                            : <span className="text-danger fw-bold ms-1">마감</span>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 질문 목록 (읽기 전용) */}
                        <div>
                            {formData.questionList.map((q, idx) => (
                                <div key={idx} className="question-box" style={{backgroundColor: '#fafafa'}}>
                                    <div className="q-header">
                                        <div className="q-num">{idx + 1}</div>
                                        <h4 className="m-0 fw-bold" style={{fontSize: '18px'}}>{q.questionContent}</h4>
                                    </div>
                                    <div className="option-list">
                                        {q.optionList.map((opt, oIdx) => (
                                            <div key={oIdx} className="option-item p-2 border rounded bg-white mb-2">
                                                <span className="text-secondary me-2">{oIdx + 1}.</span>
                                                {opt.answerContent}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // =================================================================================
    // [렌더링 2] 수정/등록 모드 (Edit Mode)
    // =================================================================================
    return (
        <div className="admin-content-wrapper survey-scope">
            <div className="admin-center-layout">
                {/* ★ 공통 박스 클래스 적용 */}
                <div className="admin-common-box survey-form-card" style={{ maxWidth: '900px' }}>
                    
                    {/* 1. 기본 정보 입력 */}
                    <div className="survey-header">
                        <div className="d-flex justify-content-between mb-2 align-items-center">
                            <span className="badge bg-warning text-dark">수정/등록 모드</span>
                            {initialData && (
                                <button onClick={() => {
                                    setIsEditMode(false);
                                    fetchSurveyDetail(initialData.SURVEY_NO); // 취소 시 데이터 원복
                                }} className="btn-icon text-muted small">
                                    <i className="bi bi-x-lg"></i> 닫기
                                </button>
                            )}
                        </div>
                        <input 
                            type="text" name="surveyTitle" className="survey-input title-input"
                            placeholder="설문 제목" value={formData.surveyTitle} onChange={handleInfoChange}
                        />
                        <textarea 
                            name="surveyDescription" className="survey-textarea desc-input"
                            placeholder="설문 설명" value={formData.surveyDescription} onChange={handleInfoChange}
                        ></textarea>

                        <div className="date-row">
                            <div className="date-group">
                                <label>시작일시</label>
                                <input type="datetime-local" name="surveyStartDate" className="survey-input"
                                    value={formData.surveyStartDate} onChange={handleInfoChange} />
                            </div>
                            <div className="date-group">
                                <label>종료일시</label>
                                <input type="datetime-local" name="surveyEndDate" className="survey-input"
                                    value={formData.surveyEndDate} onChange={handleInfoChange} />
                            </div>
                            <div className="date-group" style={{maxWidth:'120px'}}>
                                <label>상태</label>
                                <select name="surveyCloseStatus" className="survey-input"
                                    value={formData.surveyCloseStatus} onChange={handleInfoChange}>
                                    <option value="N">진행중</option>
                                    <option value="Y">마감</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 2. 질문 & 보기 수정 */}
                    <div>
                        {formData.questionList.map((q, qIdx) => (
                            <div key={qIdx} className="question-box">
                                <button className="btn-icon btn-delete-q" onClick={() => removeQuestion(qIdx)} title="질문 삭제">
                                    <i className="bi bi-trash"></i>
                                </button>
                                <div className="q-header">
                                    <div className="q-num">{qIdx + 1}</div>
                                    <input type="text" className="survey-input q-input" placeholder="질문 입력"
                                        value={q.questionContent} onChange={(e) => handleQuestionChange(qIdx, e.target.value)} />
                                </div>
                                <div className="option-list">
                                    {q.optionList.map((opt, oIdx) => (
                                        <div key={oIdx} className="option-item">
                                            <div className="option-radio-deco"></div>
                                            <input type="text" className="survey-input option-input" placeholder={`보기 ${oIdx + 1}`}
                                                value={opt.answerContent} onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} />
                                            <button className="btn-icon" onClick={() => removeOption(qIdx, oIdx)} title="보기 삭제">
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}
                                    <button className="btn-add-option" onClick={() => addOption(qIdx)}>
                                        <i className="bi bi-plus-circle"></i> 보기 추가
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="btn-add-question" onClick={addQuestion}>
                            <i className="bi bi-plus-lg me-2"></i>질문 추가
                        </button>
                    </div>

                    {/* 3. 저장/취소 버튼 */}
                    <div className="form-actions">
                        <button className="btn-cancel" onClick={() => {
                            if (!initialData) navigate(-1);
                            else {
                                setIsEditMode(false);
                                fetchSurveyDetail(initialData.SURVEY_NO);
                            }
                        }}>취소</button>
                        <button className="btn-submit" onClick={handleSubmit}>저장 완료</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SurveyForm;