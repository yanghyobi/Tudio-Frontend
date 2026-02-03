import axios from 'axios';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Globe,
  LogIn,
  Monitor,
  RotateCcw,
  Search,
  ShieldAlert,
  Smartphone,
  Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import '../../../assets/css/admin/pages/AdminCommon.css';
import Pagination from '../../../components/common/Pagination';

const LogLogin = () => {
  const [querySearchParams, setQuerySearchParams] = useSearchParams();
  const currentPage = parseInt(querySearchParams.get('page')) || 1;

  const [logs, setLogs] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); 

  // ✅ [카드 내용 고정] 상단 카드를 위한 통계 상태
  const [summaryStats, setSummaryStats] = useState({
    total: 0, success: 0, fail: 0, ips: 0
  });

  const getBeforeDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ 
    startDate: getBeforeDate(7), 
    endDate: today, 
    keyword: '' 
  });
  const [finalKeyword, setFinalKeyword] = useState('');

  const fetchData = useCallback(async (isSearch = false) => {
    setLoading(true);
    try {
      const params = {
        page: isSearch ? 1 : currentPage,
        searchWord: isSearch ? filters.keyword : finalKeyword,
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: activeTab === 'all' ? '' : activeTab
      };

      const response = await axios.get('/api/log/login/list', { params });
      setLogs(response.data.dataList || []);
      setPageInfo(response.data.pageInfo);

      // ✅ [카드 데이터 고정] 전체 로그를 보거나 첫 로드 시에만 계산
      if (isSearch || summaryStats.total === 0 || activeTab === 'all') {
        const statsParams = { ...params, status: '', page: 1, rowSize: 9999 };
        const statsRes = await axios.get('/api/log/login/list', { params: statsParams });
        const allData = statsRes.data.dataList || [];
        
        setSummaryStats({
          total: statsRes.data.pageInfo?.totalRecord || 0,
          success: allData.filter(l => l.loginStatus === 'SUCCESS').length,
          fail: allData.filter(l => l.loginStatus === 'FAIL').length,
          ips: new Set(allData.map(l => l.ipAddr)).size
        });
      }
    } catch (error) {
      console.error("로그 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, finalKeyword, filters, summaryStats.total]);

  useEffect(() => {
    fetchData();
  }, [currentPage, activeTab, finalKeyword]);

  const handleSearch = () => {
    setFinalKeyword(filters.keyword);
    setQuerySearchParams({ page: 1 });
    fetchData(true);
  };

  const handleReset = () => {
    setFilters({ startDate: getBeforeDate(7), endDate: today, keyword: '' });
    setFinalKeyword('');
    setActiveTab('all');
    setQuerySearchParams({ page: 1 });
  };

  // ✅ [에러 해결!] 회원 관리에서 뜯어온 엑셀 다운로드 함수
  const handleDownloadExcel = () => {
    const statusParam = activeTab === 'all' ? '' : activeTab;
    // 팁: 로그인 로그 백엔드 URL에 맞춰 경로를 설정하세요.
    const url = `/api/log/login/download-excel?status=${statusParam}&searchWord=${finalKeyword}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
    
    if (window.confirm('현재 조회된 목록을 엑셀로 다운로드 하시겠습니까?')) {
      window.location.href = url;
    }
  };

  const parseOs = (userAgent) => {
    if (!userAgent) return "Unknown";
    const ua = userAgent.toLowerCase();
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("mac")) return "Mac OS";
    if (ua.includes("linux")) return "Linux";
    if (ua.includes("android")) return "Android";
    return "Other";
  };

  const getOsIcon = (osName) => {
    const name = osName.toLowerCase();
    if (name.includes('windows') || name.includes('mac') || name.includes('linux')) return <Monitor size={14} />;
    if (name.includes('android') || name.includes('ios')) return <Smartphone size={14} />;
    return <Globe size={14} />;
  };

  return (
    <div className="admin-content-wrapper meeting-room-scope p-5 d-flex flex-column">
      
      {/* 1. 상단 제목 영역 */}
      <div className="admin-title-row d-flex justify-content-between align-items-end mb-4">
        <div>
          <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
            <span>Admin</span> <ChevronRight size={12} /> <span>로그 관리</span> <ChevronRight size={12} /> <span className="text-primary fw-bold">로그인 로그</span>
          </nav>
          <h2 className="admin-page-title m-0">
            <LogIn size={24} className="me-2" />로그인 이력 조회
          </h2>
        </div>
        <div className="d-flex gap-2">
          {/* ✅ 함수가 정의되었으므로 이제 에러가 나지 않습니다 */}
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-bold px-3 shadow-sm" onClick={handleDownloadExcel}>
            <Download size={18} /> 일괄 다운로드 (Excel)
          </button>
        </div>
      </div>

      {/* 2. 대시보드 통계 카드 */}
      <div className="row g-4 mb-5">
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Users size={18} className="text-primary-custom me-2" /> 전체 접속 시도
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-primary-custom">{summaryStats.total.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">조회 범위 내 총 시도</p>
          </div>
        </div>
        
        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <CheckCircle2 size={18} className="text-success me-2" /> 로그인 성공
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-success">{summaryStats.success.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">인증 완료 이력</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <ShieldAlert size={18} className="text-danger-custom me-2" /> 로그인 실패
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-danger-custom">{summaryStats.fail.toLocaleString()}</span>
              <span className="text-muted small">건</span>
            </div>
            <p className="stat-desc">패스워드 오류 등</p>
          </div>
        </div>

        <div className="col-3">
          <div className="admin-stat-card h-100">
            <div className="stat-header">
              <Activity size={18} className="text-warning me-2" /> 고유 IP 종류
            </div>
            <div className="stat-value-row">
              <span className="stat-value-big text-warning">{summaryStats.ips}</span>
              <span className="text-muted small">개</span>
            </div>
            <p className="stat-desc">중복 제외 고유 IP</p>
          </div>
        </div>
      </div>

      {/* 3. 탭 필터 */}
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

      {/* 4. 상세 목록 박스 */}
      <div className="admin-common-box flex-grow-1 d-flex flex-column shadow-sm bg-white rounded-4 overflow-hidden mb-4">
        <div className="p-4 bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="m-0 fw-bold" style={{fontSize: '1.15rem'}}>상세 목록 <span className="text-primary ms-2 small">{pageInfo?.totalRecord || 0}건</span></h4>
            <div className="d-flex gap-2 align-items-center">
              <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border x-small">
                <Calendar size={14} className="text-muted" />
                <input type="date" className="border-0 bg-transparent small shadow-none" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                <span className="text-muted">~</span>
                <input type="date" className="border-0 bg-transparent small shadow-none" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>
              <div className="position-relative" style={{ width: '220px' }}>
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input type="text" className="form-control ps-5 rounded-pill border-light bg-light shadow-none" placeholder="아이디 검색..." value={filters.keyword} onChange={(e) => setFilters({...filters, keyword: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <button className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold" onClick={handleSearch}>검색</button>
              <button className="btn btn-outline-secondary rounded-pill shadow-none" onClick={handleReset} title="초기화"><RotateCcw size={16} /></button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-center ps-4" style={{width: '80px'}}>No</th>
                  <th style={{width: '200px'}}>접속 일시</th>
                  <th>사용자 아이디</th>
                  <th>접속 IP</th>
                  <th>기기/브라우저</th>
                  <th className="text-center" style={{width: '120px'}}>상태</th>
                  <th className="pe-4" style={{width: '200px'}}>실패 사유</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">로딩 중...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">조회된 이력이 없습니다.</td></tr>
                ) : (
                  logs.map((log, index) => {
                    const rowNo = (pageInfo?.totalRecord || 0) - ((currentPage - 1) * (pageInfo?.rowSize || 10)) - index;
                    const osName = parseOs(log.userAgent);
                    return (
                      <tr key={log.loginLogId || index}>
                        <td className="text-center small text-muted ps-4">{rowNo}</td>
                        <td className="small">{new Date(log.regDate).toLocaleString()}</td>
                        <td className="fw-bold">{log.loginId}</td>
                        <td className="small text-muted">{log.ipAddr}</td>
                        <td className="small">{getOsIcon(osName)} {osName} / {log.browser}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill px-3 py-1 border ${log.loginStatus === 'SUCCESS' ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-danger bg-opacity-10 text-danger border-danger'}`}>
                            {log.loginStatus === 'SUCCESS' ? '성공' : '실패'}
                          </span>
                        </td>
                        <td className="small text-danger pe-4">{log.loginStatus !== 'SUCCESS' ? log.failReason : '-'}</td>
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

      <style>{`
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

export default LogLogin;