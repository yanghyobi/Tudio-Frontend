import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const PersonalWorkWidget = ({ refreshTrigger }) => {
    const [allWork, setAllWork] = useState([]);      
    const [weekRange, setWeekRange] = useState('');         
    const [selectedDate, setSelectedDate] = useState('');   
    const [calendarDays, setCalendarDays] = useState([]);   
    const [loading, setLoading] = useState(true);

    const getStatusLabel = (status) => {
        switch (parseInt(status)) {
            case 201: return { text: '요청', color: 'bg-secondary' };
            case 202: return { text: '진행', color: 'bg-primary' };
            case 203: return { text: '완료', color: 'bg-success' };
            case 204: return { text: '보류', color: 'bg-dark' };
            case 205: return { text: '지연', color: 'bg-danger' };
            default: return { text: '미정', color: 'bg-secondary' };
        }
    };

    const getTodayStr = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now - offset).toISOString().split('T')[0];
    };

    const generateCalendar = useCallback((workList) => {
        const now = new Date(); 
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const days = [];
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        for (let i = 0; i < 7; i++) {
            const temp = new Date(startOfWeek);
            temp.setDate(startOfWeek.getDate() + i);

            const yyyy = temp.getFullYear();
            const mm = String(temp.getMonth() + 1).padStart(2, '0');
            const dd = String(temp.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const found = workList.find(w => w.WORK_DATE_STR === dateStr);
            const count = found ? found.DAILY_COUNT : 0;

            days.push({
                dateStr: dateStr,
                dayNum: dd,
                dayName: dayNames[i],
                count: count
            });
        }
        setCalendarDays(days);
    }, []);

    const fetchData = async (isInit = false) => {
        try {
            const res = await axios.get('/tudio/dashboard/personalWork');
            const { list, titleRange } = res.data;

            setAllWork(list || []);
            setWeekRange(titleRange);
            generateCalendar(list || []);

            if (isInit) {
                setSelectedDate(getTodayStr());
            }

        } catch (e) {
            console.error("개인업무 로드 실패", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ [개인업무] 갱신 신호 수신 -> 재조회");
            fetchData(false); 
        }
    }, [refreshTrigger]);

    const filteredList = allWork.filter(w => w.WORK_DATE_STR === selectedDate);

    const handleMoveToTask = (work) => {
        window.location.href = `/tudio/project/detail?projectNo=${work.PROJECT_NO}&taskId=${work.WORK_ID}`;
    };

    const handleMoveToProject = (e, projectNo) => {
        e.stopPropagation(); 
        window.location.href = `/tudio/project/detail?projectNo=${projectNo}`;
    };

    if (loading) return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></div>;

    return (
        <div className="widget-content d-flex flex-column h-100 overflow-hidden">
            <div className="flex-shrink-0 p-3 pb-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold m-0 text-dark">
                        <i className="bi bi-calendar-check text-primary me-2"></i>개인 업무
                    </h6>
                    <span className="badge bg-light text-secondary border">{weekRange}</span>
                </div>

                <div className="d-flex justify-content-between text-center bg-light rounded p-2 mt-3 mb-3">
                    {calendarDays.map((day, idx) => {
                        const isSelected = selectedDate === day.dateStr;
                        const colorClass = idx === 0 ? 'text-danger' : idx === 6 ? 'text-primary' : 'text-dark';

                        return (
                            <div key={day.dateStr} 
                                onClick={() => setSelectedDate(day.dateStr)}
                                className={`calendar-day-box flex-fill p-1 rounded cursor-pointer position-relative ${isSelected ? 'bg-white shadow-sm border border-primary' : ''}`}
                            >
                                <div className={`small ${idx===0||idx===6 ? colorClass : 'text-muted'}`} style={{fontSize:'0.7rem'}}>
                                    {day.dayName}
                                </div>
                                <div className={`fw-bold mt-1 ${colorClass}`}>
                                    {day.dayNum}
                                    {day.count > 0 && (
                                        <span className="ms-1 text-primary small" style={{fontSize: '0.75rem', verticalAlign: 'top'}}>
                                            [{day.count}]
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>            

            <div className="flex-grow-1 overflow-auto custom-scrollbar px-3">
                <div className='d-flex align-items-center'>
                    <h6 className="small text-muted border-bottom pb-2 mt-3 mb-2">
                        📅 {selectedDate} ({filteredList.length}건)
                    </h6>
                    <div className="info-icon-wrapper">
                        <i className="bi bi-info-circle text-secondary"></i>
                        <div className="info-tooltip">
                            <div className="d-flex align-items-center mb-1 fw-bold">
                                <i className="bi bi-bookmark-fill text-primary me-2"></i> 업무
                            </div>
                            <div className="d-flex align-items-center mb-1 fw-bold">
                                <i className="bi bi-arrow-return-right text-muted me-2"></i> 단위 업무
                            </div>
                        </div>
                    </div>
                </div>

                {filteredList.length === 0 ? (
                    <div className="text-center text-muted py-4 small">
                        예정된 업무가 없습니다.
                    </div>
                ) : (
                    <ul className="list-group list-group-flush px-0 py-0">
                        {filteredList.map((work, i) => {
                            const statusInfo = getStatusLabel(work.WORK_STATUS);
                            return (
                            <li key={i} 
                                className="list-group-item px-2 py-2 border-0 d-flex align-items-center list-group-item-action"
                                onClick={() => handleMoveToTask(work)} style={{cursor:'pointer'}}>
                                
                                <span className="badge bg-light text-dark border me-2 text-truncate" 
                                    style={{maxWidth: '180px', cursor: 'pointer'}}
                                    onClick={(e) => handleMoveToProject(e, work.PROJECT_NO)}
                                    title="프로젝트로 이동">
                                    {work.PROJECT_NAME}
                                </span>

                                <div className="text-truncate flex-grow-1 small fw-bold text-dark" title={work.WORK_TITLE}>
                                    {work.WORK_TYPE === 'TASK' ? 
                                        <i className="bi bi-bookmark-fill text-primary me-1" style={{fontSize: '0.7rem'}}></i> : 
                                        <i className="bi bi-arrow-return-right text-muted me-1" style={{fontSize: '0.7rem'}}></i>
                                    }
                                    {work.WORK_TITLE}
                                </div>
                                    
                                <span className={`badge ${statusInfo.color} ms-2`} style={{minWidth: '50px'}}>
                                    {statusInfo.text}
                                </span>
                            </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="flex-shrink-0 py-2 px-3 border-top text-end">
                 <span className="text-muted small" style={{fontSize: '0.75rem'}}>
                    <i className="bi bi-check2-circle me-1"></i>
                    오늘 완료: <span className="fw-bold">{allWork.filter(w=>w.WORK_DATE_STR === getTodayStr() && w.WORK_STATUS == 203).length}건</span>
                </span>
            </div>
        </div>
    );
};

export default PersonalWorkWidget;