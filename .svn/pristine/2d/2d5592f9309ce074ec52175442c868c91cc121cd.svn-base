import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Info,
  RotateCw,
  Search,
  Zap,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';

// 공통 CSS 임포트
import '../../../assets/css/admin/pages/AdminCommon.css';

const LogBatch = () => {
  const [querySearchParams, setQuerySearchParams] = useSearchParams();
  const currentPage = parseInt(querySearchParams.get('page')) || 1;
  
  const [logs, setLogs] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 탭 상태 관리: 전체(all), 성공(SUCCESS), 실패(FAIL)
  const [activeTab, setActiveTab] = useState('all');

  // ✅ [카드 내용 고정] 상단 통계 데이터를 위한 별도 상태
  const [summaryStats, setSummaryStats] = useState({
    total: 0, success: 0, fail: 0, avgDuration: 0
  });

  // 필터 상태
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ 
    startDate: today, 
    endDate: today, 
    keyword: ''
  });
  const [finalKeyword, setFinalKeyword] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        searchWord: finalKeyword, 
        startDate: filters.startDate,
        endDate: filters.endDate,
        // 배치 로그 XML 기준 변수명인 'status' 사용
        status: activeTab === 'all' ? '' : activeTab
      };
      const response = await axios.get('/api/log/batch/list', { params });
      
      const dataList = response.data.dataList || [];
      const pi = response.data;
      
      setLogs(dataList);
      setPageInfo(pi);

      // ✅ [카드 데이터 고정 로직] 탭이 'all'이거나 처음 로드 시에만 통계 업데이트
      if (activeTab === 'all' || summaryStats.total === 0) {
        const totalCount = pi?.totalRecord || 0;
        const avg = dataList.length > 0 
          ? Math.round(dataList.reduce((acc, curr) => acc + (curr.duration || 0), 0) / dataList.length) 
          : 0;

        setSummaryStats({
          total: totalCount,
          success: dataList.filter(l => l.batchStatus === 'SUCCESS').length,
          fail: dataList.filter(l => l.batchStatus === 'FAIL').length,
          avgDuration: avg
        });
      }
    } catch (error) {
      console.error("배치 로그 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, finalKeyword, filters.startDate, filters.endDate, summaryStats.total]);

  useEffect(() => { 
    fetchLogs(); 
  }, [fetchLogs]);

  const handleSearch = () => {
    setFinalKeyword(filters.keyword);
    setQuerySearchParams({ page: 1 });
  };

  const handleReset = () => {
    setFilters({ startDate: today, endDate: today, keyword: '' });
    setFinalKeyword('');
    setActiveTab('all');
    setQuerySearchParams({ page: 1 });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "0초";
    if (seconds < 60) return `${seconds}초`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}분 ${sec}초`;
  };

  return (
    <div className="flex-grow-1 p-5 d-flex flex-column admin-content-wrapper meeting-room-scope">
      
      {/* 1. 상단 타이틀 영역 */}
      <div className="admin-title-row mb-4 d-flex justify-content-between align-items-end">
        <div>
          <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
            <span>Admin</span> <ChevronRight size={12} /> <span>로그 관리</span> <ChevronRight size={12} /> <span className="text-primary fw-bold">배치 로그</span>
          </nav>
          <h2 className="admin-page-title m-0">
            <RotateCw size={24} className="text-primary me-2" />배치 실행 이력
          </h2>
        </div>
        <button className="tudio-btn border bg-white shadow-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold" onClick={() => window.confirm('엑셀을 다운로드 하시겠습니까?')}>
          <FileSpreadsheet size={16} className="text-success" /> 엑셀 다운로드
        </button>
      </div>

      {/* 2. 대시보드 통계 카드 (내용 고정됨) */}
      <div className="row g-4 mb-5">
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Activity size={18} className="text-primary-custom me-2" /> 전체 실행 횟수
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-primary-custom">{summaryStats.total.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">스케줄러 총 작동 횟수</p>
          </div>
        </div>
        
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <CheckCircle2 size={18} className="text-success me-2" /> 실행 성공
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-success">{summaryStats.success.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">정상 종료된 배치 작업</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <AlertCircle size={18} className="text-danger-custom me-2" /> 실행 실패
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-danger-custom">{summaryStats.fail.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">확인이 필요한 에러 발생</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Zap size={18} className="text-warning me-2" /> 평균 소요 시간
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-warning">{formatDuration(summaryStats.avgDuration)}</span>
            </div>
            <p className="stat-desc">작업당 평균 성능 지표</p>
          </div>
        </div>
      </div>

      {/* 3. 상단 탭 필터 (LogLogin 스타일) */}
      <div className="filter-tabs mb-4">
        {[
          { id: 'all', label: '전체 로그' },
          { id: 'SUCCESS', label: '성공' },
          { id: 'FAIL', label: '실패' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setQuerySearchParams({page: 1}); }}
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
              배치 실행 목록 <span className="text-primary ms-2 small">{pageInfo?.totalRecord || 0}건</span>
            </h4>
            
            <div className="d-flex gap-2 align-items-center">
              {/* 날짜 필터 통합 */}
              <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border x-small">
                <Calendar size={14} className="text-muted" />
                <input type="date" className="border-0 bg-transparent small shadow-none" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                <span className="text-muted">~</span>
                <input type="date" className="border-0 bg-transparent small shadow-none" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>
              
              {/* 키워드 검색창 통합 */}
              <div className="position-relative" style={{ width: '220px' }}>
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input 
                  type="text" 
                  className="form-control ps-5 rounded-pill border-light bg-light shadow-none" 
                  placeholder="작업명, 메시지 검색..." 
                  value={filters.keyword} 
                  onChange={(e) => setFilters({...filters, keyword: e.target.value})} 
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
                <th className="text-center py-3 ps-4" style={{width:'70px'}}>No</th>
                <th style={{width: '250px'}}>작업명</th>
                <th className="text-center" style={{width:'110px'}}>상태</th>
                <th>실행 정보</th>
                <th style={{width:'150px'}}>소요 시간</th>
                <th className="pe-4" style={{width:'220px'}}>시작 / 종료 일시</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">데이터 로딩 중...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">조회된 배치 로그가 없습니다.</td></tr>
              ) : (
                logs.map((log, index) => {
                  const total = pageInfo?.totalRecord || 0;
                  const current = pageInfo?.currentPage || 1;
                  const size = pageInfo?.rowSize || 10;
                  const rowNo = total - ((current - 1) * size) - index;

                  return (
                    <tr key={log.batchLogId || index}>
                      <td className="text-center small text-muted ps-4">{rowNo}</td>
                      <td>
                        <div className="fw-bold text-dark">{log.jobName}</div>
                        <div className="text-muted extra-small d-flex align-items-center gap-1">
                          <Info size={10} className="text-primary"/> {log.batchParams || '파라미터 없음'}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 py-1 border ${log.batchStatus === 'SUCCESS' ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-danger bg-opacity-10 text-danger border-danger'}`}>
                          {log.batchStatus === 'SUCCESS' ? '성공' : '실패'}
                        </span>
                      </td>
                      <td className="small">
                        <div className="text-truncate" style={{maxWidth:'300px'}} title={log.resultMsg}>{log.resultMsg}</div>
                        {log.errorLogId && (
                          <button 
                            className="btn btn-link p-0 extra-small text-danger fw-bold text-decoration-none" 
                            onClick={() => alert(`에러 로그 #${log.errorLogId} 상세 보기로 이동합니다.`)}
                          >
                            [에러 로그 확인 #{log.errorLogId}]
                          </button>
                        )}
                      </td>
                      <td className="small text-muted">
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={12} className="text-warning"/> {formatDuration(log.duration)}
                        </div>
                      </td>
                      <td className="extra-small text-muted pe-4">
                        <div className="d-flex flex-column gap-1">
                          <span><span className="badge bg-light text-dark me-1" style={{fontSize: '9px'}}>START</span> {log.startDate ? new Date(log.startDate).toLocaleString() : '-'}</span>
                          <span><span className="badge bg-light text-dark me-1" style={{fontSize: '9px'}}>END</span> {log.regDate ? new Date(log.regDate).toLocaleString() : '-'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pageInfo && pageInfo.totalRecord > 0 && (
          <div className="p-4 border-top bg-white">
            <Pagination 
              pageInfo={pageInfo} 
              onPageChange={(n) => setQuerySearchParams({page: n})} 
            />
          </div>
        )}
      </div>

      <style>{`
        .extra-small { font-size: 11px; }
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
        .x-small input[type="date"] { outline: none; }
      `}</style>
    </div>
  );
};

export default LogBatch;