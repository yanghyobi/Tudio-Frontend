import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DashboardWidget.css';

const ApprovalWidget = ({ refreshTrigger }) => {
    const [data, setData] = useState({
        stats: { DRAFT_COUNT: 0, APPROVED_COUNT: 0, PENDING_COUNT: 0 },
        myDrafts: [],  // 내 기안 목록
        toApprove: [], // 승인 대기 목록
        isAdmin: false // 관리자 여부
    });
    const [loading, setLoading] = useState(false);
    
    const loadData = async () => {
        try {
            // setLoading(true);
            const res = await axios.get('/tudio/dashboard/approval/data');           
            setData(res.data || {
                stats: { DRAFT_COUNT: 0, APPROVED_COUNT: 0, PENDING_COUNT: 0 },
                myDrafts: [],
                toApprove: [],
                isAdmin: false
            });
        } catch (e) {
            console.error("전자결재 데이터 로드 실패", e);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ [전자결재] 갱신 신호 수신 -> 재조회");
            loadData();
        }
    }, [refreshTrigger]);

    // 상세 페이지 이동
    const handleMove = (docNo) => {
        window.location.href = `/tudio/approval/detail?docNo=${docNo}`;
    };

    // ---------------------------------------------------------
    // 권한에 따라 보여줄 데이터와 제목 결정
    // ---------------------------------------------------------
    let title = "최근 기안 문서";
    let iconColor = "text-success";
    let targetList = [];
    let emptyMsg = "";

    if (data.isAdmin) {
        // [관리자] -> 결재 해야 할 문서
        title = "결재 대기 문서"; 
        iconColor = "text-danger"; 
        targetList = data.toApprove;
        emptyMsg = "승인 대기 중인 문서가 없습니다.";
    } else {
        // [일반 사용자] -> 내가 올린 기안 진행상황
        title = "내 결재 진행상황";
        iconColor = "text-primary";
        targetList = data.myDrafts;
        emptyMsg = "진행 중인 기안 문서가 없습니다.";
    }

    // 상태 뱃지 렌더링
    const renderStatusBadge = (status) => {
        // DB 코드가 숫자(612, 613...)로 넘어올 수 있으므로 문자열/숫자 모두 처리
        // 612: 진행/대기, 613: 승인, 614: 반려
        const s = parseInt(status);
        if (s === 613) return <span className="badge bg-success rounded-pill">승인</span>;
        if (s === 614) return <span className="badge bg-secondary rounded-pill">반려</span>;
        return <span className="badge bg-warning text-dark rounded-pill">진행</span>;
    };

    if (loading) return <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></div>;

    return (
        <div className="widget-content">
            {/* 1. 헤더 (권한별 타이틀 자동 변경) */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold m-0 text-dark">
                    <i className={`bi bi-file-earmark-check-fill me-2 ${iconColor}`}></i>
                    {title}
                </h6>

                {/* 우측 뱃지: 관리자면 대기건수, 사원이면 진행중건수 */}
                <span className={`badge ${data.isAdmin ? 'bg-danger' : 'bg-primary'}`}>
                    {targetList.length}건
                </span>
            </div>

            {/* 2. 목록 영역 (탭 없이 바로 출력) */}
            <div className="flex-grow-1 overflow-auto custom-scrollbar p-0">
                <ul className="list-group list-group-flush">
                    {targetList.length === 0 ? (
                        <li className="text-center text-muted py-5 small">
                            {emptyMsg}
                        </li>
                    ) : (
                        targetList.map(doc => (
                            <li key={doc.documentNo}
                                className="list-group-item list-group-item-action py-2 px-3 border-bottom-0 d-flex justify-content-between align-items-center"
                                onClick={() => handleMove(doc.documentNo)} style={{cursor:'pointer'}}>

                                {/* 문서 정보 */}
                                <div className="text-truncate" style={{maxWidth:'70%'}}>
                                    <div className="small fw-bold text-dark text-truncate">
                                        {/* 관리자일 경우 [요청] 뱃지 표시 */}
                                        {data.isAdmin && <span className="text-danger me-1">[요청]</span>}
                                        {doc.documentTitle}
                                    </div>
                                    <div className="small text-muted" style={{fontSize:'0.75rem'}}>
                                        {/* 관리자는 기안자 이름, 사원은 날짜 표시 */}
                                        {data.isAdmin ? `기안자: ${doc.drafterName}` : new Date(doc.documentRegdate).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* 우측 상태 표시 */}
                                {data.isAdmin ? (
                                    // 관리자: 결재하기 버튼
                                    <button className="btn btn-sm btn-outline-danger py-0" style={{fontSize:'0.8rem'}}>
                                        결재
                                    </button>
                                ) : (
                                    // 일반 사용자: 진행 상태 뱃지
                                    <span className={`badge ${
                                        doc.documentStatus === 'APPROVED' ? 'bg-success' :
                                        doc.documentStatus === 'REJECTED' ? 'bg-secondary' : 'bg-warning text-dark'
                                    }`}>
                                        {doc.documentStatus === 'APPROVED' ? '승인' :
                                         doc.documentStatus === 'REJECTED' ? '반려' : '진행'}
                                    </span>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* 3. 하단 통계 (공통) */}
            <div className="p-2 bg-light border-top d-flex justify-content-around small">
                <div className="text-muted">
                    기안 <strong className="text-dark">{data.stats.DRAFT_COUNT}</strong>
                </div>
                <div className="vr"></div>
                <div className="text-muted">
                    승인 <strong className="text-success">{data.stats.APPROVED_COUNT}</strong>
                </div>
                <div className="vr"></div>
                 {/* 전체보기 링크 */}
                <a href="/tudio/approval/list" className="text-decoration-none text-secondary fw-bold">
                    더보기 <i className="bi bi-chevron-right" style={{fontSize: '0.7rem'}}></i>
                </a>
            </div>
        </div>
    );
};

export default ApprovalWidget;