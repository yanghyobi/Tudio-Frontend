import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const NoticeWidget = ({ refreshTrigger }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotices = () => {
        axios.get('/tudio/dashboard/notice')
            .then(res => {
                setNotices(res.data || []);
            })
            .catch(err => console.error("공지사항 로드 실패", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ [공지사항] 갱신 신호 수신 -> 재조회");
            fetchNotices();
        }
    }, [refreshTrigger]);

    const handleMoveToDetail = (noticeNo) => {
        window.location.href = `/tudio/notice/detail?noticeNo=${noticeNo}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    };

    if (loading) {
        return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-warning"></span></div>;
    }

    return (
        <>
            <div className="widget-content d-flex flex-column h-100 overflow-hidden">                
                <div className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold m-0">
                        <i className="bi bi-megaphone-fill me-2 text-warning"></i>시스템 공지사항
                    </h6>
                    <a href="/tudio/notice/list" className="text-muted small text-decoration-none" title="더보기">
                        <i className="bi bi-plus-lg"></i>
                    </a>
                </div>

                <div className="flex-grow-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
                    {notices.length === 0 ? (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                            <i className="bi bi-exclamation-circle fs-4 mx-2 opacity-50"></i>
                            <span>등록된 공지사항이 없습니다.</span>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {notices.map((notice) => (
                                <li key={notice.noticeNo} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-3">
                                    <div className="d-flex align-items-center overflow-hidden me-2" style={{ flex: 1 }}>
                                        {notice.noticeFixStatus === 'Y' && (
                                            <i className="bi bi-pin-angle-fill text-danger me-2 small flex-shrink-0" title="중요 공지"></i>
                                        )}
                                        <span className="notice-title text-dark small fw-bold text-truncate cursor-pointer"
                                            onClick={() => handleMoveToDetail(notice.noticeNo)}
                                            style={{ cursor: 'pointer' }}
                                            title={notice.noticeTitle}>
                                            {notice.noticeTitle}
                                        </span>

                                        {new Date(notice.noticeRegdate).toDateString() === new Date().toDateString() && (
                                            <span className="badge bg-danger rounded-pill ms-2" style={{fontSize: '0.5rem', padding: '0.2em 0.4em'}}>New</span>
                                        )}
                                    </div>

                                    <div className="d-flex align-items-center flex-shrink-0" style={{ fontSize: '0.75rem' }}>
                                        <span className="text-secondary me-2 fw-bold">
                                            <i className="bi bi-person me-1 text-muted"></i>
                                            {notice.writer || '관리자'} 
                                        </span>

                                        <span className="text-muted small bg-light border px-2 py-1 rounded">
                                            {formatDate(notice.noticeRegdate)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex-shrink-0 p-2 border-top text-end" style={{ minHeight: '2rem'}}></div>
            </div>
        </>
    );
};

export default NoticeWidget;