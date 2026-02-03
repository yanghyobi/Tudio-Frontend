import axios from 'axios';
import { 
  Activity, ChevronRight, Edit, FileSpreadsheet, PlusCircle, 
  Search, Trash2, Calendar, Hash
} from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';
import * as XLSX from 'xlsx';

// Tudio 전용 공통 CSS 임포트
import '../../../assets/css/admin/pages/AdminCommon.css';

const LogAction = () => {
  // 1. 상태 관리
  const [querySearchParams, setQuerySearchParams] = useSearchParams();
  const currentPage = parseInt(querySearchParams.get('page')) || 1;
  const [logs, setLogs] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ startDate: today, endDate: today, keyword: '' });
  const [activeTab, setActiveTab] = useState('all'); // all, INSERT, UPDATE, DELETE
  const [finalKeyword, setFinalKeyword] = useState('');

  // 2. 데이터 로드
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        searchWord: finalKeyword, 
        startDate: filters.startDate, 
        endDate: filters.endDate,
        actionType: activeTab === 'all' ? '' : activeTab
      };
      const response = await axios.get('/api/log/action/list', { params });
      setLogs(response.data.dataList || []);
      setPageInfo(response.data.pageInfo);
    } catch (error) {
      console.error("로그 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, finalKeyword, activeTab, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 3. 상단 통계 데이터 계산
  const stats = useMemo(() => ({
    total: pageInfo?.totalRecord || 0,
    insertCount: logs.filter(l => l.actionType === 'INSERT').length,
    updateCount: logs.filter(l => l.actionType === 'UPDATE').length,
    deleteCount: logs.filter(l => l.actionType === 'DELETE').length
  }), [logs, pageInfo]);

  // 4. 핸들러 함수
  const handleSearch = () => {
    setFinalKeyword(filters.keyword);
    setQuerySearchParams({ page: 1 });
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleDownloadExcel = () => {
    const url = `/api/member/download-excel?type=${activeTab}&keyword=${finalKeyword}`;
    window.location.href = url;
  };

  const getActionBadge = (type) => {
    const map = { 'INSERT': 'success', 'UPDATE': 'primary', 'DELETE': 'danger' };
    const color = map[type] || 'secondary';
    return (
      <span className={`badge rounded-pill px-3 py-1 border bg-${color} bg-opacity-10 text-${color} border-${color}`}>
        {type === 'INSERT' ? '등록' : type === 'UPDATE' ? '수정' : type === 'DELETE' ? '삭제' : type}
      </span>
    );
  };

  return (
    <div className="flex-grow-1 p-5 d-flex flex-column admin-content-wrapper meeting-room-scope">
      
      {/* 1. 상단 타이틀 영역 */}
      <div className="admin-title-row d-flex justify-content-between align-items-end mb-4">
        <div>
          <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
            <span>Admin</span> <ChevronRight size={12} /> <span>로그 관리</span> <ChevronRight size={12} /> <span className="text-primary fw-bold">액션 로그</span>
          </nav>
          <h2 className="admin-page-title m-0">액션 로그 조회</h2>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-bold px-3 shadow-sm" onClick={handleDownloadExcel}>
            <Download size={18} /> 일괄 다운로드 (Excel)
        </button>
      </div>

      {/* 2. 대시보드 통계 카드 - UserList 스타일 이식 */}
      <div className="row g-4 mb-5">
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Activity size={18} className="text-primary-custom me-2" /> 전체 활동 내역
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-primary-custom">{stats.total.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">시스템 내 모든 활동 건수</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <PlusCircle size={18} className="text-success me-2" /> 데이터 등록
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-success">{stats.insertCount.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">신규 생성(INSERT) 내역</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Edit size={18} className="text-warning me-2" /> 데이터 수정
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-warning">{stats.updateCount.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">정보 변경(UPDATE) 내역</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Trash2 size={18} className="text-danger-custom me-2" /> 데이터 삭제
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-danger-custom">{stats.deleteCount.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc text-danger-custom fw-bold small">DELETE (유실 주의)</p>
          </div>
        </div>
      </div>

      {/* 3. 탭 필터 영역 */}
      <div className="filter-tabs mb-4">
        {['all', 'INSERT', 'UPDATE', 'DELETE'].map(tab => (
          <button
            key={tab}
            className={`filter-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setQuerySearchParams({page: 1}); }}
          >
            {tab === 'all' ? '전체 로그' : tab === 'INSERT' ? '등록' : tab === 'UPDATE' ? '수정' : '삭제'}
          </button>
        ))}
      </div>

      {/* 4. 상세 목록 테이블 영역 */}
      <div className="admin-common-box flex-grow-1 d-flex flex-column overflow-hidden shadow-sm bg-white">
        <div className="p-4 bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="m-0 fw-bold" style={{fontSize: '1.15rem'}}>
              상세 목록 <span className="text-primary ms-2 small">{pageInfo?.totalRecord || 0}건</span>
            </h4>
            
            <div className="d-flex gap-2 align-items-center">
              {/* 기간 필터 */}
              <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border x-small">
                <Calendar size={14} className="text-muted" />
                <input type="date" className="border-0 bg-transparent small" style={{outline:'none'}} value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                <span className="text-muted">~</span>
                <input type="date" className="border-0 bg-transparent small" style={{outline:'none'}} value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>

              {/* 검색어 입력 */}
              <div className="position-relative" style={{ width: '250px' }}>
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input type="text" className="form-control ps-5 rounded-pill border-light bg-light" 
                       style={{ height: '42px' }}
                       placeholder="메뉴명, 내용 검색..." value={filters.keyword} 
                       onChange={(e) => setFilters({...filters, keyword: e.target.value})} onKeyPress={handleKeyPress} />
              </div>

              <button className="tudio-btn tudio-btn-primary px-4 rounded-pill shadow-sm fw-bold" 
                      onClick={handleSearch}>검색</button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 text-center" style={{ width: '80px' }}>No</th>
                  <th style={{ width: '180px' }}>발생 일시</th>
                  <th style={{ width: '150px' }}>메뉴명</th>
                  <th className="text-center" style={{ width: '120px' }}>유형</th>
                  <th>상세 메시지</th>
                  <th className="text-center" style={{ width: '100px' }}>관리자</th>
                  <th style={{ width: '150px' }}>IP 주소</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">데이터 로드 중...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">조회 결과가 없습니다.</td></tr>
                ) : (
                  logs.map((log, index) => {
                    const rowNo = (pageInfo?.totalRecord || 0) - ((currentPage - 1) * (pageInfo?.rowSize || 10)) - index;
                    return (
                      <tr key={log.actionLogId || index}>
                        <td className="text-center small text-muted ps-4">{rowNo}</td>
                        <td className="small">{new Date(log.regDate).toLocaleString()}</td>
                        <td className="fw-bold text-dark">{log.menuName}</td>
                        <td className="text-center">{getActionBadge(log.actionType)}</td>
                        <td className="small text-truncate" style={{maxWidth:'350px'}} title={log.actionMsg}>
                          {log.actionMsg}
                        </td>
                        <td className="text-center fw-medium small">
                          <Hash size={12} className="me-1 text-muted" />{log.memberNo}
                        </td>
                        <td className="small text-muted">{log.ipAddr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pageInfo && logs.length > 0 && (
          <div className="p-4 border-top bg-white">
            <Pagination pageInfo={pageInfo} onPageChange={(n) => setQuerySearchParams({page: n})} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LogAction;