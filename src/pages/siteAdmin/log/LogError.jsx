import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock, 
  Copy,
  FileSpreadsheet,
  Info,
  Link2,
  RotateCcw,
  Search,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../../components/common/Pagination';

// 공통 CSS 임포트
import '../../../assets/css/admin/pages/AdminCommon.css';

const LogError = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // 탭 상태 관리: 전체(all), 미해결(NEW), 해결완료(RESOLVED)
  const [activeTab, setActiveTab] = useState('all');

  // ✅ [카드 내용 고정] 상단 카드를 위한 별도 통계 상태
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    unresolved: 0,
    resolved: 0,
    critical: 0
  });

  const today = new Date().toISOString().split('T')[0];

  const [searchParams, setSearchParams] = useState({
    startDate: today,
    endDate: today,
    keyword: '',
    page: 1
  });

  // 데이터 가져오기 로직
  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get('/api/log/error/list', {
        params: {
          page: searchParams.page,
          searchWord: searchParams.keyword,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          // ✅ 컨트롤러 @RequestParam 이름인 'searchType'으로 전달
          searchType: activeTab === 'all' ? '' : activeTab 
        }
      });
      
      const dataList = response.data.dataList || [];
      const pi = response.data.pageInfo || null;
      
      setLogs(dataList);
      setPageInfo(pi);

      // ✅ [카드 데이터 고정 로직] 
      // 처음 로드할 때나 '전체' 탭일 때만 카드 통계를 업데이트해서 고정시킵니다.
      if (activeTab === 'all' || summaryStats.total === 0) {
        // 전체 record 수는 pageInfo에서 가져옴
        const totalCount = pi?.totalRecord || 0;
        
        // 미해결/해결/치명적 오류는 현재 불러온 '전체' 데이터 기준으로 계산
        // (참고: 페이징 때문에 전체 통계용 API가 별도로 있다면 그것을 호출하는 것이 가장 정확합니다.)
        setSummaryStats({
          total: totalCount,
          unresolved: dataList.filter(l => l.errStatus !== 'RESOLVED').length,
          resolved: dataList.filter(l => l.errStatus === 'RESOLVED').length,
          critical: dataList.filter(l => l.statusCode === 500).length
        });
      }

    } catch (error) {
      console.error("에러 로그 조회 실패:", error);
      setLogs([]);
      setPageInfo(null);
    }
  }, [searchParams, activeTab, summaryStats.total]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 해결 처리 함수
  const handleResolve = async (errorLogId) => {
    const result = await Swal.fire({
      title: '해결 완료 처리',
      text: "해당 오류를 '해결 완료' 상태로 변경하시겠습니까?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#64748b',
      confirmButtonText: '처리',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`/api/log/error/resolve/${errorLogId}`);
        Swal.fire('완료', '정상적으로 처리되었습니다.', 'success');
        fetchLogs(); // 리스트 새로고침
      } catch (error) {
        Swal.fire('오류', '처리 중 문제가 발생했습니다.', 'error');
      }
    }
  };

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleReset = () => {
    setSearchParams({ startDate: today, endDate: today, keyword: '', page: 1});
    setActiveTab('all');
  };

  const handlePageChange = (page) => {
    setSearchParams(prev => ({ ...prev, page: page }));
  };

  const closeModal = () => {
    setSelectedLog(null);
    setCopied(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeBadge = (statusCode) => {
    if (!statusCode) return <span className="badge bg-secondary">Error</span>;
    const colors = { 404: 'warning', 403: 'primary', 500: 'danger' };
    const color = colors[statusCode] || 'secondary';
    return (
      <span className={`badge bg-${color} bg-opacity-10 text-${color === 'warning' ? 'dark' : color} border border-${color} border-opacity-25 fw-bold`}>
        {statusCode}
      </span>
    );
  };

  const handleDownload = () => {
    const total = pageInfo?.totalRecord || 0;
    Swal.fire({
      title: '엑셀 다운로드',
      text: `조회된 ${total}건을 다운로드 하시겠습니까?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '다운로드'
    }).then((res) => {
      if(res.isConfirmed) Swal.fire('시작', '다운로드를 시작합니다.', 'success');
    });
  };

  return (
    <div className="flex-grow-1 p-5 d-flex flex-column admin-content-wrapper meeting-room-scope">
      
      {/* 1. 상단 타이틀 영역 */}
      <div className="admin-title-row mb-4 d-flex justify-content-between align-items-end">
        <div>
          <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
            <span>Admin</span> <ChevronRight size={12} /> <span>로그 관리</span> <ChevronRight size={12} /> <span className="text-primary fw-bold">오류 로그</span>
          </nav>
          <h2 className="admin-page-title m-0">
            <AlertTriangle size={28} className="text-danger me-2" />시스템 오류 발생 내역
          </h2>
        </div>
        <button className="tudio-btn border bg-white shadow-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold" onClick={handleDownload}>
          <FileSpreadsheet size={16} className="text-success" /> 엑셀 다운로드
        </button>
      </div>

      {/* 2. 통계 대시보드 (탭을 눌러도 summaryStats 덕분에 고정됨) */}
      <div className="row g-4 mb-5">
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Activity size={18} className="text-primary-custom me-2" /> 전체 감지 오류
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-primary-custom">{summaryStats.total.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">시스템에서 감지된 총 로그</p>
          </div>
        </div>
        
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <AlertTriangle size={18} className="text-danger-custom me-2" /> 미해결 오류
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-danger-custom">{summaryStats.unresolved.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">즉시 확인 및 조치 필요</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <CheckCircle2 size={18} className="text-success me-2" /> 해결 완료
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-success">{summaryStats.resolved.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">Status: RESOLVED</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <ShieldAlert size={18} className="text-warning me-2" /> 치명적 오류 (500)
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-warning">{summaryStats.critical.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">Internal Server Error</p>
          </div>
        </div>
      </div>

      {/* 3. 상단 탭 필터 */}
      <div className="filter-tabs mb-4">
        {[
          { id: 'all', label: '전체 로그' },
          { id: 'NEW', label: '미해결' },
          { id: 'RESOLVED', label: '해결' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSearchParams(prev => ({...prev, page: 1})); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. 상세 목록 박스 (검색 필터 헤더 통합) */}
      <div className="admin-common-box flex-grow-1 d-flex flex-column shadow-sm overflow-hidden mb-4">
        <div className="p-4 bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="m-0 fw-bold" style={{fontSize: '1.15rem'}}>
              오류 감지 목록 <span className="text-primary ms-2 small">{pageInfo?.totalRecord || 0}건</span>
            </h4>
            
            <div className="d-flex gap-2 align-items-center">
              <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border x-small">
                <Calendar size={14} className="text-muted" />
                <input type="date" className="border-0 bg-transparent small shadow-none" value={searchParams.startDate} onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})} />
                <span className="text-muted">~</span>
                <input type="date" className="border-0 bg-transparent small shadow-none" value={searchParams.endDate} onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})} />
              </div>
              
              <div className="position-relative" style={{ width: '220px' }}>
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input 
                  type="text" 
                  className="form-control ps-5 rounded-pill border-light bg-light shadow-none" 
                  placeholder="URL, 메시지 검색..." 
                  value={searchParams.keyword} 
                  onChange={(e) => setSearchParams({...searchParams, keyword: e.target.value})} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                />
              </div>
              
              <button className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold" onClick={handleSearch}>검색</button>
              <button className="btn btn-outline-secondary rounded-pill shadow-none" onClick={handleReset} title="초기화">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive flex-grow-1">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-center py-3 ps-4" style={{width: '70px'}}>No</th>
                <th className="text-center" style={{width: '90px'}}>Code</th>
                <th className="text-center" style={{width: '110px'}}>상태</th>
                <th>오류 메시지 요약</th>
                <th style={{ width: '25%' }}>요청 URL</th>
                <th style={{width: '180px'}}>발생 일시</th>
                <th className="text-center pe-4" style={{width: '100px'}}>발생자</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const total = pageInfo?.totalRecord || 0;
                const current = pageInfo?.currentPage || 1;
                const size = pageInfo?.rowSize || 10;
                const rowNo = total - ((current - 1) * size) - index;
                const isResolved = log.errStatus === 'RESOLVED';

                return (
                  <tr key={log.errorLogId ?? index} className={isResolved ? 'opacity-75' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                    <td className="text-center text-muted small ps-4">{rowNo}</td>
                    <td className="text-center">{getCodeBadge(log.statusCode)}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill px-3 py-1 border ${isResolved ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-danger bg-opacity-10 text-danger border-danger'}`}>
                        {isResolved ? '해결됨' : '미해결'}
                      </span>
                    </td>
                    <td className={`text-truncate ${isResolved ? 'text-muted' : 'text-dark fw-bold'}`} style={{ maxWidth: '300px' }}>{log.errorMessage}</td>
                    <td className="small text-truncate text-primary">{log.requestUri}</td>
                    <td className="text-muted small">{log.regDate ? new Date(log.regDate).toLocaleString() : '-'}</td>
                    <td className="text-center pe-4 fw-bold text-secondary small">{log.memberNo || 'Guest'}</td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr><td colSpan="7" className="text-center py-5 text-muted">조회된 에러 로그가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {pageInfo && logs.length > 0 && (
          <div className="p-4 border-top bg-white">
            <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* 5. 상세 모달 (절대 생략 없음) */}
      {selectedLog && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className={`modal-header border-bottom-0 pt-4 px-4 border-start border-5 ${selectedLog.errStatus === 'RESOLVED' ? 'border-success' : 'border-danger'}`}>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={`badge ${selectedLog.errStatus === 'RESOLVED' ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                      {selectedLog.errStatus === 'RESOLVED' ? 'Resolved' : 'Unresolved'}
                    </span>
                    {getCodeBadge(selectedLog.statusCode)}
                  </div>
                  <h4 className="modal-title fw-bold text-dark mt-2">오류 상세 리포트</h4>
                </div>
                <button type="button" className="btn-close shadow-none" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4 pt-2">
                <div className="row g-3 mb-4">
                  <div className="col-md-7">
                    <div className="h-100 p-3 bg-light border rounded-3">
                      <div className="text-muted small fw-bold mb-2 d-flex align-items-center gap-1">
                        <Link2 size={16} className="text-primary"/> 요청 API 주소
                      </div>
                      <div className="text-dark font-monospace small bg-white p-2 rounded border" style={{ wordBreak: 'break-all' }}>
                        {selectedLog.requestUri}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="h-100 p-3 bg-light border rounded-3">
                      <div className="text-muted small fw-bold mb-2 d-flex align-items-center gap-1">
                        <Clock size={16} className="text-primary"/> 발생 정보
                      </div>
                      <div className="text-dark small mb-1"><span className="fw-bold text-muted">일시:</span> {new Date(selectedLog.regDate).toLocaleString()}</div>
                      <div className="text-dark small"><span className="fw-bold text-muted">사용자:</span> {selectedLog.memberNo || 'Guest'}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small d-flex align-items-center gap-2 px-1">
                    <AlertCircle size={16} className="text-danger"/> Error Message Summary
                  </label>
                  <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 text-danger fw-bold">
                    {selectedLog.errorMessage}
                  </div>
                </div>

                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <label className="form-label fw-bold text-secondary small mb-0 d-flex align-items-center gap-2">
                      <Info size={16} className="text-primary"/> Stack Trace
                    </label>
                    <button className={`btn btn-sm shadow-none ${copied ? 'text-success fw-bold' : 'text-muted'}`} onClick={() => handleCopy(selectedLog.errorDetail)}>
                      {copied ? <ClipboardCheck size={14}/> : <Copy size={14}/>}
                      <span className="ms-1" style={{ fontSize: '12px' }}>{copied ? '복사완료' : '전체 복사'}</span>
                    </button>
                  </div>
                  <div className="position-relative shadow-sm rounded-3 overflow-hidden">
                    <pre className="p-4 bg-dark text-white font-monospace custom-scrollbar m-0" 
                         style={{ height: '300px', fontSize: '13px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {selectedLog.errorDetail}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-4 pt-2 gap-3 border-0">
                <button type="button" className="btn btn-secondary px-5 rounded-pill fw-bold" onClick={closeModal}>닫기</button>
                {selectedLog.errStatus !== 'RESOLVED' && (
                  <button type="button" className="btn btn-primary px-5 fw-bold rounded-pill shadow-sm" onClick={() => handleResolve(selectedLog.errorLogId)}>
                    <CheckCircle2 size={18} className="me-2"/>해결 완료 처리
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .x-small input[type="date"] { outline: none; }
        .filter-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          border: 1px solid #dee2e6;
          background: white;
          color: #6c757d;
          font-weight: 600;
          transition: all 0.2s;
        }
        .filter-btn.active {
          background: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default LogError;