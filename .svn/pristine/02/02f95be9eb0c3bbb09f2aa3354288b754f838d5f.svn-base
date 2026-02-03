import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom'; // Portal 사용
import axios from 'axios';
import Swal from 'sweetalert2';
// CSS 임포트
import './MeetingRoomAdmin.css'; 
import '../../../assets/css/admin/pages/AdminCommon.css'; 

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const MeetingReservationAdmin = () => {
    // --- State 관리 ---
    const [reservations, setReservations] = useState([]); 
    const [filterStatus, setFilterStatus] = useState('ALL'); 
    
    // 모달 관련 State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [targetResId, setTargetResId] = useState(null); 
    const [rejectReason, setRejectReason] = useState(""); 

    // --- 초기 로드 ---
    useEffect(() => { fetchReservations(); }, []);

    const fetchReservations = async () => {
        try {
            const res = await axios.get('http://localhost:8060/admin/meetingRoom/reservationList');
            setReservations(res.data);
        } catch (e) { console.error("목록 로드 실패", e); }
    };

    /* 통계 로직 */
    const stats = useMemo(() => {
        if (reservations.length === 0) return null;
        const userReservations = reservations.filter(r => r.resType !== 'B');
        const pendingCount = reservations.filter(r => r.resStatus === 701).length;
        const noShowCount = reservations.filter(r => r.resStatus === 705).length;
        const confirmCount = userReservations.filter(r => r.resStatus === 702 || r.resStatus === 704).length;
        const cancelCount = reservations.filter(r => r.resStatus === 703).length;

        const branchMap = {};
        reservations.forEach(r => {
            const name = r.branchName || '기타';
            branchMap[name] = (branchMap[name] || 0) + 1;
        });
        const branchRankData = Object.entries(branchMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); 

        const pieData = [
            { name: '확정/완료', value: confirmCount },
            { name: '대기', value: pendingCount },
            { name: '취소/노쇼', value: cancelCount + noShowCount },
        ];

        return { pendingCount, noShowCount, confirmCount, branchRankData, pieData };
    }, [reservations]);

    const COLORS = ['#40c057', '#fab005', '#fa5252']; 

    // --- 핸들러 ---
    const handleUpdateStatus = async (reservationId, status) => {
        let title = "", text = "", confirmBtnText = "승인", confirmBtnColor = "#3085d6";

        if (status === 702) {
            title = "예약 승인"; text = "이 예약을 승인(확정) 하시겠습니까?"; confirmBtnColor = "#40c057";
        } else if (status === 704) {
            title = "이용 완료 처리"; text = "정상적으로 이용이 완료되었습니까?"; confirmBtnText = "완료 처리"; confirmBtnColor = "#495057";
        } else if (status === 705) {
            title = "노쇼 처리"; text = "사용자가 예약 시간에 방문하지 않았습니까?"; confirmBtnText = "노쇼 확정"; confirmBtnColor = "#fa5252";
        }

        const result = await Swal.fire({
            title, text, icon: 'question', showCancelButton: true,
            confirmButtonColor: confirmBtnColor, cancelButtonColor: '#d33',
            confirmButtonText: confirmBtnText, cancelButtonText: '취소'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.post('http://localhost:8060/admin/meetingRoom/updateStatus', {
                reservationId, resStatus: status
            });
            await Swal.fire('완료', '처리되었습니다.', 'success');
            await fetchReservations(); 
        } catch (e) {
            Swal.fire('오류', '처리 중 문제가 발생했습니다.', 'error');
        }
    };

    const getStatusClass = (res) => {
        if (res.resStatus === 703) return res.resType === 'B' ? 'status-703' : 'status-cancel';
        return `status-${res.resStatus}`;
    };

    const openRejectModal = (reservationId) => {
        setTargetResId(reservationId);
        setRejectReason("");
        setIsRejectModalOpen(true);
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) return Swal.fire('경고', '반려 사유를 입력해야 합니다.', 'warning');
        
        const confirmResult = await Swal.fire({
            title: '반려 처리', text: "정말 반려하시겠습니까?", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#fa5252', confirmButtonText: '반려', cancelButtonText: '취소'
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await axios.post('http://localhost:8060/admin/meetingRoom/updateStatus', {
                reservationId: targetResId, 
                resStatus: 703,
                resType: 'B',         // ★ 중요: 관리자 반려 타입 지정
                resContent: rejectReason // 반려 사유
            });
            await Swal.fire('완료', '반려 처리되었습니다.', 'success');
            
            // ★ 중요: 성공 시 모달 닫기
            setIsRejectModalOpen(false);
            setRejectReason(""); // 초기화
            fetchReservations();
        } catch (e) { Swal.fire('오류', '오류가 발생했습니다.', 'error'); }
    };

    const getStatusText = (res) => {
        if (!res) return '-';
        switch (res.resStatus) {
            case 701: return '신청';
            case 702: return '확정';
            case 703: return (res.resType === 'B') ? '반려' : '취소';
            case 704: return '완료';
            case 705: return '노쇼';
            default: return '-';
        }
    };

    const getFilteredList = () => {
        if (filterStatus === 'ALL') return reservations;
        return reservations.filter(res => String(res.resStatus) === String(filterStatus));
    };

    return (
        <div className="admin-content-wrapper meeting-room-scope">
            
            <div className="admin-title-row">
                <h2 className="admin-page-title">
                    <i className="bi bi-calendar-week"></i>
                    예약 현황 관리
                </h2>
            </div>
            
            {/* 상단 통계 카드 */}
            <div className="admin-dashboard-grid">
                <div className="admin-stat-card" onClick={() => setFilterStatus('701')} style={{ cursor: 'pointer' }}>
                    <div className="stat-header"><i className="bi bi-bell-fill text-warning-custom"></i> 신규 신청</div>
                    <div className="stat-value-row">
                        <span className="stat-value-big text-warning-custom">{stats ? stats.pendingCount : 0}</span><span className="text-muted small">건</span>
                    </div>
                    <p className="stat-desc">승인 대기중 입니다.</p>
                </div>
                <div className="admin-stat-card" onClick={() => setFilterStatus('702')} style={{ cursor: 'pointer' }}>
                    <div className="stat-header"><i className="bi bi-check-circle-fill text-primary-custom"></i> 예약 확정</div>
                    <div className="stat-value-row">
                        <span className="stat-value-big text-primary-custom">{stats ? stats.confirmCount : 0}</span><span className="text-muted small">건</span>
                    </div>
                    <p className="stat-desc">현재 확정된 예약 입니다.</p>
                </div>
                <div className="admin-stat-card" onClick={() => setFilterStatus('705')} style={{ cursor: 'pointer' }}>
                    <div className="stat-header"><i className="bi bi-exclamation-triangle-fill text-danger-custom"></i> 노쇼(미방문)</div>
                    <div className="stat-value-row">
                        <span className="stat-value-big text-danger-custom">{stats ? stats.noShowCount : 0}</span><span className="text-muted small">건</span>
                    </div>
                    <p className="stat-desc">관리가 필요합니다.</p>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="row g-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="admin-stat-card" style={{ height: '320px' }}>
                    <h5 className="stat-header">📊 인기 지점 순위</h5>
                    <div style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={stats ? stats.branchRankData : []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => [`${value}건`, '총 예약']} />
                                <Bar dataKey="count" fill="#4dabf7" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="admin-stat-card" style={{ height: '320px' }}>
                    <h5 className="stat-header">⚙️ 예약 상태 비율</h5>
                    <div style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={stats ? stats.pieData : []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {stats && stats.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 필터 버튼 */}
            <div className="filter-tabs">
                {[{ code: 'ALL', label: '전체' }, { code: '701', label: '신청/대기' }, { code: '702', label: '확정' }, { code: '703', label: '반려/취소' }, { code: '704', label: '완료' }, { code: '705', label: '미방문' }].map(filter => (
                    <button
                        key={filter.code}
                        className={`filter-btn ${filterStatus === filter.code ? 'active' : ''}`}
                        onClick={() => setFilterStatus(filter.code)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* 테이블 */}
            <div className="admin-common-box">
                <div className="res-table-wrapper" style={{border:'none', boxShadow:'none'}}>
                    <table className="res-table">
                        <colgroup>
                            <col style={{width: '5%'}} />
                            <col style={{width: '15%'}} />
                            <col style={{width: '8%'}} />
                            <col style={{width: '10%'}} />
                            <col style={{width: 'auto'}} />
                            <col style={{width: '22%'}} />
                            <col style={{width: '10%'}} />
                            <col style={{width: '15%'}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>No</th>
                                <th style={{textAlign:'center'}}>회의실</th>
                                <th style={{textAlign:'center'}}>회원번호</th>
                                <th style={{textAlign:'center'}}>예약자</th>
                                <th style={{textAlign:'center'}}>회의 제목</th>
                                <th style={{textAlign:'center'}}>일시</th>
                                <th style={{textAlign:'center'}}>상태</th>
                                <th style={{textAlign:'center'}}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredList().length === 0 ? (
                                <tr><td colSpan="8" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
                            ) : (
                                getFilteredList().map((res, idx) => (
                                    <tr key={res.reservationId}>
                                        <td style={{textAlign:'center'}}>{idx + 1}</td>
                                        <td style={{textAlign:'center'}}>{res.branchName} - {res.roomName}</td>
                                        <td style={{textAlign:'center'}}>{res.memberNo}</td>
                                        <td style={{textAlign:'center'}}>{res.memberName}</td>
                                        <td className="text-truncate" style={{maxWidth:'200px'}}>{res.resMeetingTitle}</td>
                                        
                                        <td style={{textAlign:'center', whiteSpace: 'nowrap'}}>
                                            {res.resStartdate.replace('T', ' ').substring(0, 16)} ~ {res.resEnddate.split('T')[1].substring(0, 5)}
                                        </td>
                                        
                                        <td style={{textAlign:'center'}}>
                                            <span className={`status-badge ${getStatusClass(res)}`}>{getStatusText(res)}</span>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            {res.resStatus === 701 && (
                                                <>
                                                    <button className="btn-approve" onClick={() => handleUpdateStatus(res.reservationId, 702)}>확정</button>
                                                    <button className="btn-reject" onClick={(e) => {e.stopPropagation(); openRejectModal(res.reservationId); }}>반려</button>
                                                </>
                                            )}
                                            {res.resStatus === 702 && (
                                                <>
                                                    <button className="btn-complete" onClick={() => handleUpdateStatus(res.reservationId, 704)}>완료</button>
                                                    <button className="btn-noshow" onClick={() => handleUpdateStatus(res.reservationId, 705)}>노쇼</button>
                                                </>
                                            )}
                                            {res.resStatus === 703 && (
                                                <small style={{color:'#888', display:'block', maxWidth:'150px'}} className="text-truncate"
                                                    title={res.resType === 'B' ? (res.resContent || res.resMemo) : '사용자 취소'}>
                                                    {res.resType === 'B' 
                                                        ? (res.resContent || res.resMemo || '관리자 반려') // ★ 반려 사유 표시
                                                        : '사용자 취소'
                                                    }
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ★ [모달] Portal 사용 */}
            {isRejectModalOpen && createPortal(
                <div className="res-modal-overlay"> 
                    <div className="res-modal-content">
                        <div className="res-modal-title">🚫 반려 처리</div>
                        <p style={{marginBottom:'10px', fontSize:'14px'}}>반려 사유를 입력해주세요.</p>
                        
                        <textarea 
                            className="modal-textarea" 
                            placeholder="사유 입력..." 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            autoFocus
                        />
                        
                        <div className="modal-actions">
                            <button className="btn-cancel" type="button" onClick={() => setIsRejectModalOpen(false)}>취소</button>
                            <button className="btn-confirm-reject" type="button" onClick={submitReject}>반려</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MeetingReservationAdmin;