import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ApprovalWidget = ({ refreshTrigger }) => {
    const [data, setData] = useState({
        stats: { PENDING_COUNT: 0, CONFIRM_COUNT: 0, APPROVE_COUNT: 0, REJECT_COUNT: 0,
                 WAIT_COUNT: 0, PROG_COUNT: 0, APPROVED_COUNT: 0 },
        myDrafts: [],
        toApprove: [],
        isClient: false 
    });
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [activeTab, setActiveTab] = useState(null);

    const fetchDraft = async () => {
        try {
            const res = await axios.get('/tudio/dashboard/approval/data');
            const safeData = res.data || {};
            const client = safeData.isClient;
            
            setData({
                stats: safeData.stats || {},
                myDrafts: safeData.myDrafts || [],
                toApprove: safeData.toApprove || [],
                isClient: client 
            });

        } catch (error) {
            console.error("결재 데이터 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDraft();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ [전자결재] 갱신 신호 수신 -> 재조회");
            fetchDraft();
        }
    }, [refreshTrigger]);

    const handleMove = (documentNo) => {
        window.location.href = `/tudio/approval/detail?no=${documentNo}`;
    };

    const handleApproveBtn = (e, docNo) => {
        e.stopPropagation();
        handleMove(docNo);
    };

    const handleFilter = (statusCodes) => {
        if (filterStatus === statusCodes) {
            setFilterStatus(null);
        } else {
            setFilterStatus(statusCodes);
        }
    };

    let targetList = [];
    let title = "";
    let emptyMsg = "";

    if (data.isClient) {
        title = "결재 기안";
        targetList = data.toApprove;
        if (activeTab === 'PENDING') targetList = targetList.filter(d => d.documentStatus === 607);     // 미결
        if (activeTab === 'CONFIRM') targetList = targetList.filter(d => d.documentStatus === 608);     // 확인
        if (activeTab === 'APPROVE') targetList = targetList.filter(d => d.documentStatus === 609);     // 승인
        if (activeTab === 'REJECT')  targetList = targetList.filter(d => d.documentStatus === 610);     // 반려
        emptyMsg = activeTab ? "해당 상태의 기안서가 없습니다." : "요청된 결재 기안서가 없습니다.";
    } else {
        title = "기안 현황";
        targetList = data.myDrafts;
        if (activeTab === 'WAIT') targetList = targetList.filter(d => d.documentStatus === 611);        // 승인대기
        if (activeTab === 'PROG') targetList = targetList.filter(d => d.documentStatus === 612);        // 진행중
        if (activeTab === 'REJECT') targetList = targetList.filter(d => d.documentStatus === 614);      // 반려
        if (activeTab === 'APPROVED') targetList = targetList.filter(d => d.documentStatus === 613);    // 최종승인
        emptyMsg = activeTab ? "해당 상태의 기안서가 없습니다." : "작성한 기안서가 없습니다.";
    }

    const handleTabClick = (tabName) => {
        if (activeTab === tabName) setActiveTab(null); 
        else setActiveTab(tabName);
    };

    const renderStatusBadge = (status) => {
        const s = parseInt(status);
        const styleProps = { minWidth: '60px' };
        switch (s) {
            case 607: return <span className="badge bg-danger rounded-pill" style={styleProps}>미결</span>;
            case 608: return <span className="badge bg-primary rounded-pill" style={styleProps}>확인</span>;
            case 609: return <span className="badge bg-success rounded-pill" style={styleProps}>승인</span>;
            case 610: return <span className="badge bg-secondary rounded-pill" style={styleProps}>반려</span>;
            case 611: return <span className="badge bg-secondary rounded-pill" style={styleProps}>승인대기</span>;
            case 612: return <span className="badge bg-primary rounded-pill" style={styleProps}>진행중</span>;
            case 613: return <span className="badge bg-success rounded-pill" style={styleProps}>최종승인</span>;
            case 614: return <span className="badge bg-danger rounded-pill" style={styleProps}>반려</span>;
            case 615: return <span className="badge bg-pending rounded-pill" style={styleProps}>회수</span>;
            case 616: return <span className="badge bg-light text-dark border rounded-pill" style={styleProps}>임시보관</span>;
            default: return <span className="badge bg-light text-dark border rounded-pill" style={styleProps}>-</span>;
        }
    };

    const renderDocType = (type) => {
        const t = parseInt(type);
        switch (t) {
            case 601: return '자원/인력 요청';
            case 602: return '일정변경 요청';
            case 603: return '예산조정 요청';
            case 604: return '검수및보고';
            case 605: return '최종완료보고';
            case 606: return '기타';
            default: return '일반기안';
        }
    };

    const totalCount = data.isClient ? data.toApprove.length : data.myDrafts.length;

    if (loading) return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></div>;

    return (
        <div className="widget-content d-flex flex-column h-100 overflow-hidden">
            
            <div className="flex-shrink-0 p-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold m-0 text-dark">
                    <i className={`bi bi-file-earmark-check-fill me-2 text-success`}></i>
                    {title}
                </h6>

                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-secondary border">
                        {totalCount}건
                    </span>
                    <a href="/tudio/approval/list" className="text-muted small text-decoration-none ms-1" title="더보기">
                        <i className="bi bi-plus-lg"></i>
                    </a>
                </div>
            </div>

            <div className="flex-shrink-0 d-flex border-bottom border-top text-center py-2 bg-light small mx-3 rounded mb-2">
                {data.isClient ? (
                    <>
                        <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => handleTabClick('PENDING')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>미결</span>
                            <strong className="text-danger">{data.stats.PENDING_COUNT || 0}</strong>
                        </div>
                        <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'CONFIRM' ? 'active' : ''}`} onClick={() => handleTabClick('CONFIRM')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>확인</span>
                            <strong className="text-primary">{data.stats.CONFIRM_COUNT || 0}</strong>
                        </div>
                        <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'APPROVE' ? 'active' : ''}`} onClick={() => handleTabClick('APPROVE')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>승인</span>
                            <strong className="text-success">{data.stats.APPROVE_COUNT || 0}</strong>
                        </div>
                        <div className={`flex-fill py-2 stats-item ${activeTab === 'REJECT' ? 'active' : ''}`} onClick={() => handleTabClick('REJECT')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>반려</span>
                            <strong className="text-secondary">{data.stats.REJECT_COUNT || 0}</strong>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'WAIT' ? 'active' : ''}`} onClick={() => handleTabClick('WAIT')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>대기</span>
                            <strong className="text-secondary">{data.stats.WAIT_COUNT || 0}</strong>
                        </div>
                        <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'PROG' ? 'active' : ''}`} onClick={() => handleTabClick('PROG')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>진행</span>
                            <strong className="text-primary">{data.stats.PROG_COUNT || 0}</strong>
                        </div>
                        <div className={`flex-fill border-end py-2 stats-item ${activeTab === 'REJECT' ? 'active' : ''}`} onClick={() => handleTabClick('REJECT')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>반려</span>
                            <strong className="text-danger">{data.stats.REJECT_COUNT || 0}</strong>
                        </div>
                        <div className={`flex-fill py-2 stats-item ${activeTab === 'APPROVED' ? 'active' : ''}`} onClick={() => handleTabClick('APPROVED')}>
                            <span className="text-muted d-block" style={{fontSize: '0.7rem'}}>승인</span>
                            <strong className="text-success">{data.stats.APPROVED_COUNT || 0}</strong>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-grow-1 overflow-y-auto custom-scrollbar px-3" style={{ minHeight: 0 }}>
                {targetList.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-75 text-muted small">
                        <i className="bi bi-inbox fs-4 mb-2 opacity-50"></i>
                        <span>{emptyMsg}</span>
                    </div>
                ) : (
                    <ul className="list-group list-group-flush pb-2">
                        {targetList.map((doc) => (
                            <li key={doc.documentNo}
                                className="list-group-item list-group-item-action py-2 px-2 border-bottom d-flex justify-content-between align-items-center cursor-pointer border-0"
                                onClick={() => handleMove(doc.documentNo)} 
                                style={{cursor:'pointer'}}>

                                <div className="text-truncate me-2" style={{flex: 1}}>
                                    <div className="d-flex align-items-center mb-1">
                                        <span className="badge bg-light text-dark border me-2 text-truncate" style={{fontSize: '0.6rem'}}>
                                            {renderDocType(doc.documentType)}
                                        </span>
                                        <span className="fw-bold text-dark text-truncate small me-2" title={doc.documentTitle}>
                                            {doc.documentTitle}
                                        </span>
                                        <span className="text-muted small" style={{fontSize:'0.75rem'}}>
                                            [
                                                {data.isClient && (
                                                    <span><i className="bi bi-person me-1"></i>{doc.drafterName} / </span>
                                                )}
                                                {doc.documentRegdate}
                                            ]    
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0">
                                    {data.isClient && doc.documentStatus === 607 ? (
                                        <button className="btn btn-sm btn-danger rounded-pill py-0 px-2 fw-bold d-flex align-items-center fw-bold gap-1" 
                                                style={{fontSize:'0.75rem', minWidth: '60px', justifyContent: 'center', color: '#fff'}}
                                                onClick={(e) => handleApproveBtn(e, doc.documentNo)}>
                                            <i className="bi bi-pencil-square" style={{fontSize: '0.7rem'}}></i>
                                            결재
                                        </button>
                                    ) : (
                                        renderStatusBadge(doc.documentStatus)
                                        
                                    )}
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

export default ApprovalWidget;