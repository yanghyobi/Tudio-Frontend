import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end', 
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

const BookmarkWidget = ({ onProjectSelect, refreshTrigger }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ 소켓 신호 감지: 목록 새로고침");
            fetchBookmarks();
        }
    }, [refreshTrigger]); 

    const fetchBookmarks = async () => {
        try {
            const res = await axios.get('/tudio/dashboard/bookmark/list');
            setProjects(res.data);
        } catch (error) {
            console.error("북마크 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBookmark = async (e, projectNo) => {
        e.stopPropagation(); 

        const prevProjects = [...projects];
        setProjects(prevProjects.filter(p => p.projectNo !== projectNo));

        try {
            const res = await axios.post('/tudio/project/bookmark', { 
                projectNo: projectNo 
            });
            
            if (res.data && res.data.status === 'SUCCESS') {
                Toast.fire({
                    icon: 'success',
                    title: '북마크가 해제되었습니다.'
                });
                console.log("북마크 해제 완료");
            } else {
                throw new Error("Server returned status: " + (res.data ? res.data.status : 'Unknown'));
            }

        } catch (error) {
            console.error("북마크 변경 실패", error);
            setProjects(prevProjects); 
            
            Toast.fire({
                icon: 'error',
                title: '북마크 변경 실패'
            });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const yy = String(d.getFullYear()).slice(-2); 
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    };

    const calculateMyProgress = (total, done) => {
        const t = Number(total) || 0;
        const c = Number(done) || 0;
        if (t === 0) return 0;
        return Math.round((c / t) * 100);
    };

    const calculateDateProgress = (startStr, endStr) => {
        if (!startStr || !endStr) return 0;
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        const today = new Date().getTime();
        const totalDuration = end - start;
        const elapsed = today - start;

        if (totalDuration <= 0) return 100;
        if (elapsed < 0) return 0;

        const rate = Math.round((elapsed / totalDuration) * 100);
        return rate > 100 ? 100 : rate; 
    };

    const renderStatusBadge = (status) => {
        const commonClass = "badge rounded-pill ms-1 px-2 py-1";
        const style = { fontSize: '0.75rem', padding: '0.25em 0.6em' };

        if (status === 1) return <span className={`${commonClass} bg-success`} style={style}>완료</span>;
        if (status === 2) return <span className={`${commonClass} bg-secondary`} style={style}>중단</span>;
        return <span className={`${commonClass} bg-primary`} style={style}>진행</span>;
    };

    if (loading) return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></div>;

    return (
        <div className="widget-content d-flex flex-column h-100 overflow-hidden">
            <div className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold m-0 text-dark">
                    <i className="bi bi-bookmark-star-fill text-info me-2"></i>북마크 프로젝트
                </h6>
                <span className="badge bg-light text-secondary border">{projects.length}</span>
            </div>

            <div className="flex-grow-1 overflow-auto custom-scrollbar" style={{ minHeight: 0 }}>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                        <span className="spinner-border spinner-border-sm me-2"></span> 로딩중...
                    </div>
                ) : projects.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted py-5 small">
                        <i className="bi bi-star d-block fs-3 mb-2 opacity-50"></i>
                        북마크한 프로젝트가 없습니다.
                    </div>
                ) : (
                    <ul className="list-group list-group-flush gap-1">
                        {projects.map((prj) => {                            
                            const myRate = calculateMyProgress(prj.myTotalTaskCount, prj.myDoneTaskCount);                         
                            const dateRate = calculateDateProgress(prj.projectStartdate, prj.projectEnddate);

                            return (
                                <li 
                                    key={prj.projectNo} 
                                    className="list-group-item list-group-item-action px-3 d-flex cursor-pointer"
                                    onClick={() => onProjectSelect({
                                            projectNo: prj.projectNo,
                                            projectName: prj.projectName
                                        })
                                    } 
                                    style={{ cursor: 'pointer' }}>
                                        
                                    <div className="d-flex align-items-center overflow-hidden me-2" style={{ width: '35%', minWidth: 0 }}>
                                        <button className="btn btn-link p-0 text-warning border-0 flex-shrink-0 me-2"
                                            style={{lineHeight: 0}}
                                            onClick={(e) => handleToggleBookmark(e, prj.projectNo)}
                                            title="북마크 해제"
                                        >
                                            <i className="bi bi-star-fill fs-6"></i>
                                        </button>
                                        <div className="d-flex overflow-hidden align-items-center">
                                            <div className="fw-bold text-dark text-truncate" title={prj.projectName} style={{fontSize: '0.9rem'}}>
                                                {prj.projectName}
                                            </div>
                                            {renderStatusBadge(prj.projectStatus)}
                                        </div>        
                                    </div>

                                    <div className="d-flex flex-column justify-content-center border-start ps-3" style={{ width: '65%' }}>               
                                        <div className="mb-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1" style={{fontSize: '0.9rem'}}>
                                                <span className="text-primary fw-bold">내 업무 진행현황</span>
                                                <span className="fw-bold small">{myRate}% <span className="text-muted fw-light">({prj.myDoneTaskCount}/{prj.myTotalTaskCount})</span></span>
                                            </div>
                                            <div className="progress" style={{height: '6px', backgroundColor: '#fff'}}>
                                                <div className="progress-bar bg-primary" style={{width: `${myRate}%`}}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-1" style={{fontSize: '0.9rem'}}>
                                                <span className="text-primary fw-bold">프로젝트 진척도</span>
                                                <span className="text-dark small">{dateRate}%</span>
                                            </div>
                                            <div className="progress mb-1" style={{height: '4px', backgroundColor: '#fff'}}>
                                                <div className="progress-bar bg-secondary opacity-50" style={{width: `${dateRate}%`}}></div>
                                            </div>
                                            <div className="text-muted text-end" style={{fontSize: '0.8rem', whiteSpace: 'nowrap'}}>
                                                {formatDate(prj.projectStartdate)} ~ {formatDate(prj.projectEnddate)}
                                            </div>
                                        </div>
                                    </div>                                    
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <div className="flex-shrink-0 py-2 px-3 border-top text-end bg-light rounded-bottom">
                <span className="text-muted small" style={{fontSize: '0.75rem'}}>
                    <i className="bi bi-info-circle me-1"></i>
                    북마크한 프로젝트를 선택하여 <span className="fw-bold text-primary">To Do List</span>를 추가할 수 있습니다.
                </span>
            </div>
        </div>
    );
};

export default BookmarkWidget;