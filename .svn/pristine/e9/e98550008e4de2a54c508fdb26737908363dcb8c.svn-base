import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DeadlineWorkWidget = ({ refreshTrigger }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = () => {
        axios.get('/tudio/dashboard/deadlineWork')
            .then(res => {
                console.log("마감임박 데이터 확인:", res.data);
                setTasks(res.data || []);
            })
            .catch(err => console.error("마감임박 로드 실패", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ [마감임박] 갱신 신호 수신 -> 재조회");
            fetchTasks();
        }
    }, [refreshTrigger]);

    if (loading) {
        return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-danger"></span></div>;
    }

    const renderDdayBox = (dDay) => {
        const isUrgent = dDay <= 0;
        const boxColor = isUrgent ? 'bg-danger' : 'bg-warning';
        const textColor = isUrgent ? 'text-white' : 'text-dark';
        
        let text = '';
        if (dDay < 0) text = `D+${Math.abs(dDay)}`;
        else if (dDay === 0) text = 'D-Day';
        else text = `D-${dDay}`;

        return (
            <div className={`${boxColor} ${textColor} rounded d-flex align-items-center justify-content-center fw-bold shadow-sm`}
                 style={{ width: '50px', height: '50px', fontSize: '1rem', flexShrink: 0 }}>
                {text}
            </div>
        );
    };

    const handleMoveToProject = (projectNo) => {
        localStorage.setItem('targetTab', 'task');
        window.location.href = `/tudio/project/detail?projectNo=${projectNo}`;
    };

    return (
        <>
            <div className="widget-content d-flex flex-column h-100 overflow-hidden">
                
                <div className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold m-0 text-dark">
                        <i className="bi bi-stopwatch-fill me-2"></i>마감 임박 업무
                    </h6>
                    <span className="badge bg-danger rounded-pill border">{tasks.length}건</span>
                </div>

                <div className="flex-grow-1 overflow-auto custom-scrollbar p-0" style={{ minHeight: 0 }}>
                    
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted small py-5">
                            <i className="bi bi-check-circle fs-4 mb-2 text-success"></i>
                            <span className="small text-secondary mt-1">일주일 내 마감 예정인 업무가 없습니다.</span>
                        </div>
                    ) : (
                        <div className="d-flex flex-column px-2 py-2" style={{gap: '2'}}>
                            {tasks.map((task, idx) => {
                                const isUrgent = task.taskDday <= 0;
                                return (
                                    <div key={idx} 
                                        className="deadline-card-item bg-light rounded p-3 d-flex align-items-center shadow-sm cursor-pointer"
                                        style={{ marginBottom: '0.5rem' }}
                                        onClick={() => handleMoveToProject(task.projectNo)} 
                                    >
                                        <div className="me-3">
                                            {renderDdayBox(task.taskDday)}
                                        </div>

                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex justify-content-between small text-muted mb-1">
                                                <span className="badge bg-light border text-truncate d-flex align-items-center text-primary fw-bold">
                                                    <i className="bi bi-folder-fill me-1 opacity-75" style={{ fontSize: '0.6rem'}}></i> {task.projectName}
                                                </span>
                                                <span className={`fw-bold ${isUrgent ? 'text-danger' : 'text-warning'}`} style={{fontSize: '0.7rem'}}>
                                                    ~ {task.taskEnddate}
                                                </span>
                                            </div>

                                            <div className="fw-bold text-dark text-truncate mt-1 mb-1" style={{ fontSize: '0.95rem' }} title={task.taskTitle}>
                                                {task.taskTitle}
                                            </div>

                                            <div className="d-flex align-items-center">
                                                <div className="progress flex-grow-1" style={{ height: '6px', backgroundColor: '#edf2f7', borderRadius: '3px' }}>
                                                    <div 
                                                        className={`progress-bar ${isUrgent ? 'bg-danger' : 'bg-warning'}`} 
                                                        role="progressbar"
                                                        style={{ width: `${task.taskRate}%` }}
                                                    ></div>
                                                </div>
                                                <small className="ms-2 fw-bold text-muted" style={{ fontSize: '0.75rem', width: '30px', textAlign: 'right' }}>
                                                    {task.taskRate}%
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-2 border-top bg-light text-center small text-muted">
                    {tasks.length > 0 ? (
                        <span>
                            <i className="bi bi-exclamation-triangle-fill text-warning me-1"></i>
                            우선순위가 높은 업무부터 처리하세요.
                        </span>
                    ) : (
                        <span>
                            <i className='bi bi-emoji-smile text-primary me-1'></i>
                            모든 업무가 안정적입니다. 
                        </span>
                    )}
                </div>
            </div>    
        </>
    );
};

export default DeadlineWorkWidget;