import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AlarmWidget = ({ refreshTrigger }) => {
    const [data, setData] = useState({
        stats: { ALL_COUNT: 0, UNREAD_COUNT: 0, READ_COUNT: 0 },
        list: []
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    const fetchAlarms = async () => {
        try {
            const res = await axios.get('/tudio/dashboard/alarm');
            const safeData = res.data || {};
            
            setData({
                stats: safeData.stats || { ALL_COUNT: 0, UNREAD_COUNT: 0, READ_COUNT: 0 },
                list: Array.isArray(safeData.list) ? safeData.list : []
            });
        } catch (error) {
            console.error("알림 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAlarms();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ Alarm 리스트 갱신");
            fetchAlarms();
        }
    }, [refreshTrigger]); 

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    };

    const handleRead = async (e, notiNo) => {
        e.stopPropagation();   
        try {
            await axios.post('/tudio/noti/toggle', { notiNo: notiNo });
            fetchAlarms(); 
        } catch (error) {
            console.error("알림 상태 변경 실패", error);
        }
    };

    const handleDelete = async (e, notiNo) => {
        e.stopPropagation();    
        const result = await Swal.fire({
            title: '삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            customClass: { popup: 'small-swal' }
        });

        if (result.isConfirmed) {
            try {
                await axios.post('/tudio/noti/delete', null, { params: { notiNo: notiNo } });
                fetchAlarms(); 
                Toast.fire({
                    icon: 'success',
                    title: '알림이 삭제되었습니다.'
                });
            } catch (error) {
                Swal.fire('실패', '알림 삭제 중 오류 발생', 'error');
            }
        }
    };

    const handleMove = (url) => {
        if (url) window.location.href = url;
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    let targetList = data.list;

    if (activeTab === 'UNREAD') {
        targetList = data.list.filter(item => item.isRead === 'N');
    } else if (activeTab === 'READ') {
        targetList = data.list.filter(item => item.isRead === 'Y');
    }
    let emptyMsg = "알림이 없습니다.";
    if (activeTab === 'UNREAD' && targetList.length === 0) emptyMsg = "안 읽은 알림이 없습니다.";
    if (activeTab === 'READ' && targetList.length === 0) emptyMsg = "읽은 알림이 없습니다.";

    if (loading) return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></div>;

    return (
        <div className="widget-content d-flex flex-column h-100 overflow-hidden">
            <div className="flex-shrink-0 p-3 pb-2 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold m-0 text-dark">
                    <i className="bi bi-bell-fill me-2 text-warning"></i>알림
                </h6>
            </div>

            <div className="flex-shrink-0 d-flex border-bottom border-top text-center bg-light small mx-3 rounded mb-2 overflow-hidden">
                <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => handleTabClick('ALL')}>
                    <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>전체</span>
                    <strong className="text-dark">{data.stats.ALL_COUNT || 0}</strong>
                </div>
                <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'UNREAD' ? 'active' : ''}`} onClick={() => handleTabClick('UNREAD')}>
                    <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>안읽음</span>
                    <strong className="text-danger">{data.stats.UNREAD_COUNT || 0}</strong>
                </div>
                <div className={`flex-fill py-2 stats-item ${activeTab === 'READ' ? 'active' : ''}`} onClick={() => handleTabClick('READ')}>
                    <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>읽음</span>
                    <strong className="text-secondary">{data.stats.READ_COUNT || 0}</strong>
                </div>
            </div>

            <div className="flex-grow-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
                {targetList.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted small pb-4">
                        <i className="bi bi-bell-slash fs-4 mb-2 opacity-50"></i>
                        <span className="text-center text-muted small">{emptyMsg}</span>
                    </div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {targetList.map((noti) => (
                            <li key={noti.notiNo} 
                                className={`list-group-item list-group-item-action py-3 px-3 border-bottom-0 noti-list ${noti.isRead === 'N' ? 'bg-red-50' : ''}`}
                                onClick={() => handleMove(noti.notiUrl)}
                                style={{cursor: 'pointer'}}>
                                
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div className="text-truncate small" style={{maxWidth: '85%'}}>
                                        <span className="text-muted">From. {noti.senderId}</span>
                                    </div>
                                    <small className="text-muted" style={{fontSize:'0.7rem'}}>
                                        {formatDate(noti.notiRegdate)}
                                    </small>
                                </div>

                                <div className={`mb-2 small ${noti.isRead === 'N' ? 'fw-bold text-dark' : 'text-secondary'}`}>
                                    {noti.notiMessage}
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <button className="btn btn-xs btn-outline-secondary" 
                                            onClick={(e) => handleRead(e, noti.notiNo)}
                                            title={noti.isRead === 'Y' ? '안읽음 처리' : '읽음 처리'}>
                                        <i className={`bi ${noti.isRead === 'Y' ? 'bi-envelope' : 'bi-envelope-open'}`}></i>
                                    </button>
                                    <button className="btn btn-xs btn-outline-danger" 
                                            onClick={(e) => handleDelete(e, noti.notiNo)}
                                            title="삭제">
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex-shrink-0 p-2 border-top text-end" style={{ minHeight: '2rem'}}></div>
        </div>
    );
};

export default AlarmWidget;