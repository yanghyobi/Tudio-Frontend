import axios from 'axios';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  ChevronRight,
  Download,
  FileUp,
  UserPlus,
  Users
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

// [임포트] 사용자님의 공통 페이징 컴포넌트
import Pagination from '../../../components/common/Pagination';

// CSS 임포트
import '../../../assets/css/admin/pages/AdminCommon.css';

const UserList = () => {
  // --- [1. State 관리] ---
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [searchKeyword, setSearchKeyword] = useState(''); 
  const [finalKeyword, setFinalKeyword] = useState('');   

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);

  // 정렬 상태 (초기값: 가입일 내림차순)
  const [sortConfig, setSortConfig] = useState({ key: 'memberJoinDate', direction: 'desc' });

  // 상단 카드 전용 상태 (탈퇴 회원 항목 포함)
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    todayNew: 0,
    active: 0,
    withdrawn: 0 
  });

  const formatMemberInfo = (regno) => {
  if (!regno) return "- / -";
  const str = String(regno);
  // 앞 6자리(YY.MM.DD)
  const birth = `${str.slice(0, 2)}.${str.slice(2, 4)}.${str.slice(4, 6)}`;
  // 마지막 7번째 자리로 성별 구분 (1,3: 남 / 2,4: 여)
  const genderDigit = str.charAt(6);
  const gender = (genderDigit === '1' || genderDigit === '3') ? '남' : '여';
  return `${birth} / ${gender}`;
};

  // --- [2. API 호출 및 데이터 처리 로직] ---

  // 상단 요약 통계 전용 API 호출
  const fetchMemberStats = async () => {
    try {
      const response = await axios.get('/api/member/stats');
      const data = response.data;
      
      // MyBatis가 반환하는 Map의 Key 대응
      setSummaryStats({
        total: data.totalCount || data.TOTALCOUNT || 0,
        todayNew: data.todayCount || data.TODAYCOUNT || 0,
        active: data.activeCount || data.ACTIVECOUNT || 0,
        withdrawn: data.withdrawnCount || data.WITHDRAWNCOUNT || 0 
      });
    } catch (error) {
      console.error("통계 데이터 로드 실패:", error);
    }
  };

  // 회원 목록 호출
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/member/list`, {
        params: {
          type: activeTab,
          page: currentPage,
          keyword: finalKeyword
        }
      });
      
      if (response.data && response.data.dataList) {
        // [안전장치] 데이터가 없는데 현재 페이지가 1보다 크면 1페이지로 리셋
        if (response.data.dataList.length === 0 && currentPage > 1) {
          setCurrentPage(1);
          return;
        }
        setUsers(response.data.dataList);
        setPageInfo(response.data.pageInfo);
      } else {
        setUsers([]);
        setPageInfo(null);
      }
    } catch (error) {
      console.error("회원 목록 로드 실패:", error);
      setUsers([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, finalKeyword]);

  // 초기 렌더링 시 통계 호출
  useEffect(() => {
    fetchMemberStats(); 
  }, []);

  // 탭/검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, finalKeyword]);

  // 데이터 로드 실행
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 정렬 요청 함수
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 클라이언트 사이드 정렬 로직
  const processedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    let result = [...users];
    result.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';

      // 가입일 정렬 처리 (Date 객체 변환)
      if (sortConfig.key === 'memberJoinDate') {
        return sortConfig.direction === 'asc' 
          ? new Date(valA) - new Date(valB) 
          : new Date(valB) - new Date(valA);
      }

      // 일반 문자열 정렬
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, sortConfig]);

  // 정렬 아이콘 렌더링 도우미
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="ms-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ms-1" /> 
      : <ArrowDown size={14} className="ms-1" />;
  };

  const handleSearch = () => {
    setFinalKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // --- [3. 이벤트 핸들러] ---

  const handleDownloadExcel = () => {
    const url = `/api/member/download-excel?type=${activeTab}&keyword=${finalKeyword}`;
    window.location.href = url;
  };

  const handleNewMemberClick = async () => {
    const { value: file } = await Swal.fire({
      title: '회원 일괄 등록',
      text: '회원 정보가 담긴 엑셀 파일(.xlsx, .xls)을 선택해주세요.',
      input: 'file',
      inputAttributes: { 'accept': '.xlsx, .xls' },
      showCancelButton: true,
      confirmButtonText: '업로드 시작',
      cancelButtonText: '취소'
    });

    if (file) {
      const formData = new FormData();
      formData.append('excelFile', file); 
      Swal.fire({ title: '업로드 중...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      try {
        const response = await axios.post('/api/member/upload-excel', formData);
        if (response.status === 200) {
          Swal.fire({ icon: 'success', title: '등록 완료', text: `${response.data.count || 0}명의 회원이 등록되었습니다.` });
          fetchUsers(); 
          fetchMemberStats(); 
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: '업로드 실패', text: error.response?.data || '데이터 형식을 확인해주세요.' });
      }
    }
  };

  const openModal = async (user) => {
    setSelectedUser({ ...user }); 
    try {
      const response = await axios.get(`/api/member/detail/${user.memberId}`);
      if (response.data) setSelectedUser(response.data); 
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      Swal.fire('오류', '회원 상세 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
     setSelectedUser(null);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '정말로 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: '삭제'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/member/delete/${selectedUser.memberNo}`);
        Swal.fire('완료', '삭제되었습니다.', 'success');
        fetchUsers(); 
        fetchMemberStats(); 
        closeModal();
      } catch (error) {
        Swal.fire('오류', '삭제 중 오류 발생', 'error');
      }
    }
  };

  // --- [4. 렌더링 영역] ---
  return (
    <div className="flex-grow-1 p-5 d-flex flex-column admin-content-wrapper meeting-room-scope">
      
      {/* 타이틀 영역 */}
      <div className="admin-title-row mb-4 d-flex justify-content-between align-items-end">
        <div>
          <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
            <span>Admin</span> <ChevronRight size={12} /> <span className="text-primary fw-bold">회원 관리</span>
          </nav>
          <h2 className="admin-page-title m-0"><i className="bi bi-people-fill me-2"></i>회원 조회</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-bold px-3 shadow-sm" onClick={handleDownloadExcel}>
            <Download size={18} /> 일괄 다운로드 (Excel)
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2 fw-bold px-4 shadow-sm" onClick={handleNewMemberClick}>
            <FileUp size={18} /> 신규 회원 등록 (Excel)
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="row g-4 mb-5">
          <div className="col-3">
            <div className="admin-stat-card h-100">
                <div className="stat-header"><Users size={18} className="text-primary-custom me-2" /> 누적 회원</div>
                <div className="stat-value-row">
                    <span className="stat-value-big text-primary-custom">{summaryStats.total.toLocaleString()}</span>
                    <span className="text-muted small">명</span>
                </div>
            </div>
          </div>
          <div className="col-3">
            <div className="admin-stat-card h-100">
                <div className="stat-header"><UserPlus size={18} className="text-success me-2" /> 오늘 가입</div>
                <div className="stat-value-row">
                    <span className="stat-value-big text-success">{summaryStats.todayNew.toLocaleString()}</span>
                    <span className="text-muted small">명</span>
                </div>
            </div>
          </div>
          <div className="col-3">
            <div className="admin-stat-card h-100">
                <div className="stat-header"><Activity size={18} className="text-warning me-2" /> 활성 유저</div>
                <div className="stat-value-row">
                    <span className="stat-value-big text-warning">{summaryStats.active.toLocaleString()}</span>
                    <span className="text-muted small">명</span>
                </div>
            </div>
          </div>
          <div className="col-3">
            <div className="admin-stat-card h-100">
                <div className="stat-header">
                  <Ban size={18} style={{ color: '#ff6b6b' }} className="me-2" /> 탈퇴 회원
                </div>
                <div className="stat-value-row">
                    <span className="stat-value-big" style={{ color: '#ff6b6b' }}>
                      {summaryStats.withdrawn.toLocaleString()}
                    </span>
                    <span className="text-muted small">명</span>
                </div>
            </div>
          </div>
      </div>

      {/* 필터 탭 */}
      <div className="filter-tabs mb-4">
        {['all', 'general', 'company', 'withdrawal'].map(tab => (
          <button 
            key={tab}
            className={`filter-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? '전체' : tab === 'general' ? '일반' : tab === 'company' ? '기업' : '탈퇴'}
          </button>
        ))}
      </div>

      {/* 상세 목록 테이블 */}
      <div className="admin-common-box shadow-sm border-0 flex-grow-1 d-flex flex-column overflow-hidden mb-4">
        <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
          <h4 className="m-0 fw-bold" style={{fontSize: '1.15rem'}}>
            상세 목록 <span className="text-primary ms-2 small">{pageInfo?.totalRecord || 0}건</span>
          </h4>
          
          {/* 검색창 및 정렬 버튼 그룹 (오른쪽 정렬) */}
          <div className="d-flex align-items-center gap-3">
            {/* 정렬 버튼 그룹 */}
            <div className="d-flex gap-2">
              <button 
                className={`btn btn-sm px-3 rounded-pill d-flex align-items-center fw-bold transition-all ${sortConfig.key === 'memberName' ? 'btn-primary' : 'btn-outline-secondary border-light-subtle text-muted'}`}
                onClick={() => requestSort('memberName')}
              >
                이름순 {getSortIcon('memberName')}
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-pill d-flex align-items-center fw-bold transition-all ${sortConfig.key === 'companyName' ? 'btn-primary' : 'btn-outline-secondary border-light-subtle text-muted'}`}
                onClick={() => requestSort('companyName')}
              >
                소속순 {getSortIcon('companyName')}
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-pill d-flex align-items-center fw-bold transition-all ${sortConfig.key === 'memberJoinDate' ? 'btn-primary' : 'btn-outline-secondary border-light-subtle text-muted'}`}
                onClick={() => requestSort('memberJoinDate')}
              >
                가입일순 {getSortIcon('memberJoinDate')}
              </button>
            </div>

            {/* 검색 입력창 */}
            <div className="d-flex gap-2">
              <input 
                type="text" 
                className="form-control rounded-pill border-light bg-light ps-3" 
                placeholder="이름, ID 검색..." 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ width: '220px' }}
              />
              <button className="btn btn-primary px-4 rounded-pill fw-bold" onClick={handleSearch}>
                검색
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="res-table align-middle mb-0 w-100">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '8%' }}>유형</th>
                  <th className="text-center" style={{ width: '10%' }}>이름</th>
                  <th style={{ width: '30%' }}>소속(기업명)</th>
                  <th style={{ width: '12%' }}>계정(ID)</th>
                  <th className="text-center" style={{ width: '7%' }}>프로젝트</th>
                  <th className="text-center" style={{ width: '8%' }}>상태</th>
                  <th className="text-center" style={{ width: '13%' }}>가입일</th>
                  <th className="text-center pe-4" style={{ width: '12%' }}>상세</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-5">로딩 중...</td></tr>
                ) : processedUsers.length > 0 ? (
                  processedUsers.map((user) => (
                    <tr key={user.memberNo}>
                      <td className="ps-4 text-center">
                        <span className={`badge rounded-pill border px-2 py-1 ${user.memberAuthVOList?.some(a => a.auth === 'ROLE_CLIENT') ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'}`}>
                          {user.memberAuthVOList?.some(a => a.auth === 'ROLE_CLIENT') ? '기업' : '일반'}
                        </span>
                      </td>
                      <td className="fw-bold text-center text-nowrap">{user.memberName}</td>
                      <td>{user.companyName || '-'}</td>
                      <td className="text-nowrap">{user.memberId}</td>
                      <td className="text-center text-nowrap">{user.projectCount || 0}건</td>
                      <td className='fw-bold text-center text-nowrap'>
                        {user.leaveStatus === 'Y' ? 
                          <span className="text-danger">탈퇴</span> : 
                          <span className="text-success">활성</span>
                        }
                      </td>
                      <td className="text-center text-nowrap">{user.memberJoinDate ? user.memberJoinDate.split(' ')[0] : '-'}</td>
                      <td className="text-center pe-4">
                        <button className="tudio-btn tudio-btn-outline-primary btn-sm px-3 text-nowrap" onClick={() => openModal(user)}>상세보기</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center py-5">결과가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 페이징 컴포넌트 */}
      {processedUsers.length > 0 && pageInfo && (
        <div className="d-flex justify-content-center pb-4">
          <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
        </div>
      )}

      {/* 상세 모달 */}
      {showModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              
              {/* 헤더 */}
              <div className="modal-header border-0 pt-4 px-4 pb-0">
                <h5 className="fw-bold m-0" style={{ fontSize: '1.25rem' }}>구성원 상세 정보</h5>
                <button type="button" className="btn-close shadow-none" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  
                  {/* 좌측: 프로필 이미지 섹션 */}
                  <div className="col-md-4 text-center">
                    <div className="profile-card p-3 h-100 d-flex flex-column align-items-center justify-content-center border rounded-4 bg-white shadow-sm">
                      <div className="mb-3 position-relative">
                        <img 
                          /* 1. 필드명을 memberProfileimg로 변경하고 백엔드 주소를 붙여줍니다. */
                          src={selectedUser.memberProfileimg 
                            ? `http://localhost:8060${selectedUser.memberProfileimg}` 
                            : 'https://via.placeholder.com/150'} 
                          alt="Profile"
                          className="rounded-4 object-fit-cover"
                          style={{ width: '100%', aspectRatio: '1/1', maxWidth: '180px' }}
                          /* 이미지 로드 실패 시 처리 */
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      </div>
                      <h4 className="fw-bold mb-1">{selectedUser.memberName} <small className="text-muted" style={{fontSize: '0.9rem'}}>{selectedUser.memberId}</small></h4>
                      
                      {/* 2. 상세 정보에서는 memberAuthVOList가 아니라 auth 문자열을 사용합니다. */}
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        {selectedUser.auth?.includes('ROLE_CLIENT') ? '기업 회원' : '일반 회원'}
                      </span>
                    </div>
                  </div>

                  {/* 우측: 활동 현황 및 정보 섹션 */}
                  <div className="col-md-8">
                    {/* 활동 통계 카드 (Image 2 스타일) */}
                    <div className="mb-4">
                      <label className="fw-bold mb-3 d-block text-secondary small">활동 현황</label>
                      <div className="row g-2">
                        {[
                          { label: '작성 글', value: selectedUser.postCount || 0, color: 'text-dark' },
                          { label: '작성 댓글', value: selectedUser.commentCount || 0, color: 'text-dark' },
                          { label: '1:1 문의', value: selectedUser.inquiryCount || 0, color: 'text-danger' }
                        ].map((stat, idx) => (
                          <div className="col-4" key={idx}>
                            <div className="p-3 border rounded-4 bg-light bg-opacity-50 text-center shadow-sm h-100 transition-hover">
                              <span className="d-block small text-muted mb-2">{stat.label}</span>
                              <span className={`fs-4 fw-bold ${stat.color}`}>{stat.value}<small className="ms-1 fs-6 fw-normal">건</small></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 상세 정보 그리드 */}
                    <div className="info-grid border rounded-4 p-3 bg-white">
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="small text-muted d-block mb-1">가입일</label>
                          <div className="fw-medium">{selectedUser.memberJoinDate?.split(' ')[0] || '-'}</div>
                        </div>
                        <div className="col-6">
                          <label className="small text-muted d-block mb-1">연락처</label>
                          <div className="fw-medium">{selectedUser.memberTel || '-'}</div>
                        </div>
                        <div className="col-6 border-top pt-2">
                          <label className="small text-muted d-block mb-1">부서</label>
                          <div className="fw-medium">{selectedUser.memberDepartment || '-'}</div>
                        </div>
                        <div className="col-6 border-top pt-2">
                          <label className="small text-muted d-block mb-1">직급</label>
                          <div className="fw-medium">{selectedUser.memberPosition || '-'}</div>
                        </div>
                        <div className="col-12 border-top pt-2">
                          <label className="small text-muted d-block mb-1">이메일</label>
                          <div className="fw-medium text-primary">{selectedUser.memberEmail}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단: 계정 상태 조절 섹션 */}
                  <div className="col-12 mt-4 pt-3 border-top">
                    <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-4">
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold text-dark small">계정 상태 설정</span>
                          <select className="form-select form-select-sm border-secondary-subtle rounded-pill shadow-sm" style={{ width: '140px' }} defaultValue={selectedUser.leaveStatus}>
                            <option value="N">정상 이용 중</option>
                            <option value="Y">탈퇴 회원</option>
                          </select>
                        </div>
                        <div className="text-muted small">최근 접속: {selectedUser.lastLoginAt || '기록 없음'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="modal-footer border-0 px-4 pb-4 pt-0 mt-2">
                <button className="btn btn-link text-danger text-decoration-none me-auto fw-bold p-0 shadow-none" onClick={handleDelete}>회원 영구 삭제</button>
                <button className="btn btn-dark px-5 py-2 rounded-pill shadow-sm fw-bold" onClick={closeModal}>닫기</button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserList;