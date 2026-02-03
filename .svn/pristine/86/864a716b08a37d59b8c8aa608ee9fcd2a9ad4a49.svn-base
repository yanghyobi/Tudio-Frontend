// 1. [필수] 리액트 & 라우터 (프레임워크 코어)
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// 2. [외부] 설치한 라이브러리 (기능 -> UI)
import axios from 'axios';
import { AlertCircle, Calendar, ChevronRight, List, Megaphone, PenLine, Pin, Plus, Save, Trash2, User, X, Paperclip } from 'lucide-react';
import Swal from 'sweetalert2';

// 3. [내부] 직접 만든 컴포넌트
import Pagination from '../../../components/common/Pagination';

const BoardNotice = () => {
  // 1. [페이지 번호 불러오기]
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1; 

  // 2. [데이터 관리]
  const [posts, setPosts] = useState([]);         // 게시글 리스트 (dataList)
  const [pageInfo, setPageInfo] = useState(null); // 페이징 계산 정보 (pageInfo)

  // 3. [화면 관리]
  const [view, setView] = useState('list');       // 화면 상태 ('list' | 'write' | 'detail')
  const [selectedPost, setSelectedPost] = useState(null); // 상세 조회한 글 데이터

  // 4. [폼 관리] 
  const [formData, setFormData] = useState({ 
    noticeTitle: '',      // 제목
    noticeContent: '',    // 내용
    noticePinStatus: 'N'  // 상단 고정 여부 (Y/N)
  });

  // 5. [파일 관리]
  const [uploadFiles, setUploadFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]); // 현재 글에 붙어있는 기존 파일들
  const [delFileNos, setDelFileNos] = useState([]);

  // 목록 조회
  const fetchNoticeList = async () => {
    try{
      const res = await axios.get(`/api/notice/list?currentPage=${currentPage}`);
      setPosts(res.data.dataList || []);    // 리스트 세팅
      setPageInfo(res.data.pageInfo);       // 페이지 버튼 정보 세팅
    } catch (error) {
      console.error("목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    if(view === 'list') fetchNoticeList();
  }, [currentPage, view]);

  // 페이징 버튼 클릭시
  const handlePageChange = (pageNum) => {
    setSearchParams({ page: pageNum });
  };

  // 1. 상세 화면으로 이동
  const goDetail = async (post) => {
    // 로그인한 내 번호 가져오기 (없으면 0)
    const userRes = await axios.get('/api/member/me');
    const viewerNo = userRes.data ? userRes.data.memNo || userRes.data.memberNo : 0;

    try {
      // 서버에 상세 조회 요청
      const res = await axios.get("/api/notice/detail", {
        params: {
          noticeNo: post.noticeNo,
          memberNo: viewerNo
        }
      });

      // 서버에서 받은 최신 데이터로 세팅
      setSelectedPost(res.data);
      setView('detail');

    } catch (error) {
      try {
        const fallbackRes = await axios.get("/api/notice/detail", {
          params: { noticeNo: post.noticeNo, memberNo: 0 }
        });
        setSelectedPost(fallbackRes.data); // fallback 데이터로 세팅
      } catch (fallbackError) {
        setSelectedPost(post); // 최악의 경우 목록 데이터라도 보여줌
      }
      setView('detail');
    }
  };

  // 2. 작성 화면으로 이동
  const goWrite = () => {
    setFormData({ noticeTitle: '', noticeContent: '', noticePinStatus: 'N' }); // 폼 초기화
    setView('write');
  };

  // 3. 수정 화면으로 이동
  const goEdit = () => {
    setFormData({ 
      noticeTitle: selectedPost.noticeTitle, 
      noticeContent: selectedPost.noticeContent, 
      noticePinStatus: selectedPost.noticePinStatus 
    });

    setExistingFiles(selectedPost.fileList || []); 
    setDelFileNos([]);  // 삭제 목록 초기화
    setUploadFiles([]); // 새로 추가할 파일 목록 초기화

    setView('edit');
  };

  // 4. 목록으로 복귀
  const goList = () => {
    setView('list');
    setSelectedPost(null);
  };

  // 5. 글 저장 (신규 등록)
  const handleSave = async () => {

    // 유효성 검사
    if(!formData.noticeTitle.trim()) return Swal.fire('경고', '제목을 입력해주세요', 'warning');

    const userRes = await axios.get('/api/member/me');
    const loginUser = userRes.data;

    const finalMemberNo = loginUser.memberNo || loginUser.memNo;

    if (!loginUser || !finalMemberNo) {
      return Swal.fire('로그인 필요', '사용자 정보를 찾을 수 없습니다.', 'warning');
    }

    try{
      const fd = new FormData();

      fd.append("noticeTitle", formData.noticeTitle);
      fd.append("noticeContent", formData.noticeContent);
      fd.append("noticePinStatus", formData.noticePinStatus);
      fd.append("memberNo", finalMemberNo);
      fd.append("fileType", 401);

      uploadFiles.forEach(file => {
        fd.append("upfiles", file); 
      });

      const res = await axios.post("/api/notice/write", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if(res.data === "SUCCESS"){
        await Swal.fire('성공', '등록되었습니다', 'success');
        setUploadFiles([]); // 파일 상태 초기화
        goList();
      }else{
        Swal.fire('실패', '등록 실패', 'error');
      }
    }catch (error) {
      console.error("등록 에러 : ", error);
      Swal.fire('오류', '서버 통신 오류', 'error')
    }
  };

  // 6. 글 수정 (업데이트)
  const handleUpdate = async () => {
    if(!formData.noticeTitle.trim()) return Swal.fire('경고', '제목을 입력해주세요', 'warning');

    try{

      const userRes = await axios.get('/api/member/me');
      const loginUser = userRes.data;

      const finalMemberNo = loginUser?.memNo || loginUser?.memberNo;

      if (!loginUser || !finalMemberNo) {
        return Swal.fire('로그인 필요', '세션이 만료되었습니다.', 'warning');
      }

      const fd = new FormData();

      fd.append("noticeNo", selectedPost.noticeNo);
      fd.append("noticeTitle", formData.noticeTitle);
      fd.append("noticeContent", formData.noticeContent);
      fd.append("noticePinStatus", formData.noticePinStatus);
      fd.append("memberNo", finalMemberNo);

      uploadFiles.forEach(file => {
        fd.append("upfiles", file); 
      });

      const res = await axios.post("/api/notice/update", fd, {
        headers: { "Content-Type": "multipart/form-data" } // 파일 전송용 헤더
      });

      if(res.data === "SUCCESS"){
        await Swal.fire('수정 완료', '공지사항이 수정되었습니다.', 'success');
        
        // 상태 초기화 및 최신 상세 데이터 로드
        setUploadFiles([]); 
        goDetail({ noticeNo: selectedPost.noticeNo }); 
      } else {
        Swal.fire('실패', '수정 처리에 실패했습니다.', 'error');
      }
    }catch (error) {
      console.error("수정 에러:", error);
      Swal.fire('오류', '서버 통신 오류', 'error');
    }
  };

  // 7. 글 삭제
  const handleDelete = async () => {
    const result = await Swal.fire({
        title: '정말 삭제하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    });

    if(result.isConfirmed){
      try{
        // 서버에 삭제 요청 전송
        const res = await axios.post("/api/notice/delete", {
            noticeNo: selectedPost.noticeNo
        });

        if (res.data === "SUCCESS") {
            await Swal.fire('삭제됨', '삭제되었습니다.', 'success');
            goList(); // 목록 새로고침
        } else {
            Swal.fire('실패', '삭제에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error("삭제 에러:", error);
        Swal.fire('오류', '서버 통신 오류', 'error');
      }
    }
  };

  // 8. 핀 상태 변경
  const handleTogglePin = (e, post) => {
    e.stopPropagation();

    const newStatus = post.noticePinStatus === 'Y' ? 'N' : 'Y';

    axios.post("/api/notice/updatePin", {
      noticeNo: post.noticeNo,
      noticePinStatus: newStatus
    })
    .then(res => {
      const result = res.data;

      if(result === "SUCCESS"){
        setPosts(prevPosts => prevPosts.map(p => 
          p.noticeNo === post.noticeNo 
            ? { ...p, noticePinStatus: newStatus }
            : p 
        ));
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
        Toast.fire({
            icon: 'success',
            title: newStatus === 'Y' ? '상단 고정되었습니다' : '고정 해제되었습니다'
        });
      }else{
        Swal.fire({icon: 'error', title:'상태 변경 실패', text: '상태 변경에 실패했습니다.'});
      }
    })
    .catch(error => {
      console.error("에러 : ", error);
      Swal.fire({icon: 'error', title: '오류', text: '서버 연결 실패'});
    });
  };

  // 9. 입력 필드 핸들링
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const finalVal = type === 'checkbox' ? (checked ? 'Y' : 'N') : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalVal
    }));
  };

  // 10. 파일 핸들링
  const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files); // FileList를 배열로 변환
  const MAX_SIZE = 10 * 1024 * 1024;

  // 용량 체크 추가
  const overSizeFiles = selectedFiles.filter(file => file.size > MAX_SIZE);
  if (overSizeFiles.length > 0) {
    Swal.fire('파일 용량 초과', '10MB 이하의 파일만 첨부 가능합니다.', 'error');
    e.target.value = '';
    return;
  }
  
  // 기존 선택된 파일에 새로 선택한 파일 합치기 (중복 선택 가능하게)
  setUploadFiles(prev => [...prev, ...selectedFiles]);
  
  // input value 초기화 (같은 파일을 다시 선택할 수 있도록)
  e.target.value = ''; 
};

// 파일 목록에서 특정 파일 제거
const removeFile = (index) => {
  setUploadFiles(prev => prev.filter((_, i) => i !== index));
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

  // === 렌더링 시작 ===
  return (
    <div className="flex-grow-1 p-5 d-flex flex-column">
      
      {/* 1. Breadcrumb Navigation (사이트 이동 경로) */}
      <div className="mb-4">
        <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
          <span>Admin</span> <ChevronRight size={12} /> 
          <span className="text-body">게시판 관리</span> <ChevronRight size={12} />
          <span className="text-primary fw-bold">공지사항</span>
        </nav>
        <div className="d-flex justify-content-between align-items-end">
          <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <Megaphone size={24} className="text-primary" /> 
            {view === 'list' && '공지사항 목록'}
            {view === 'write' && '공지사항 작성'}
            {view === 'detail' && '공지사항 상세'}
            {view === 'edit' && '공지사항 수정'}
          </h2>
        </div>
      </div>

      {/* 2. 컨텐츠 영역 (조건부 렌더링) */}
      <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
        
        {/* ================= VIEW: LIST (목록) ================= */}
        {view === 'list' && (
          <>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                총 <span className="fw-bold text-dark">{pageInfo?.totalRecordCount || 0}</span>건의 공지가 있습니다.
              </div>
              <button className="tudio-btn tudio-btn-primary" onClick={goWrite}>
                <Plus size={18} /> 글쓰기
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ tableLayout: 'fixed' }}>
                  <thead className="bg-light text-muted small text-uppercase">
                    <tr>
                      <th className="text-center py-3" style={{ width: '60px' }}>No</th>
                      <th className="py-3 ps-4">제목</th>
                      <th className="py-3 text-center" style={{ width: '80px' }}>파일</th>
                      <th className="py-3 text-center" style={{ width: '80px' }}>다운</th>
                      <th className="py-3 text-center" style={{ width: '140px' }}>작성정보</th>
                      <th className="py-3 text-center" style={{ width: '140px' }}>최종수정</th>
                      <th className="py-3 text-center" style={{ width: '80px' }}>조회</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* [1] 데이터가 있을 때: 목록 출력 */}
                    {posts?.length > 0 ? (
                      posts.map((post, index) => (
                        <tr key={post.noticeNo} onClick={() => goDetail(post)} style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                          
                          {/* 번호/핀 */}
                          <td className="text-center py-4" onClick={(e) => handleTogglePin(e, post)}>
                            {post.noticePinStatus === 'Y' ? (
                              <div title="상단 고정 해제" className='d-flex justify-content-center'>
                                <div 
                                    className="bg-danger bg-opacity-10 text-danger rounded-3 d-flex align-items-center justify-content-center" 
                                    style={{ width:'32px', height:'32px', boxShadow: '0 2px 4px rgba(220, 53, 69, 0.1)' }}
                                >
                                     <Pin size={18} fill='currentColor' strokeWidth={1.5} />
                                </div>
                              </div>
                            ) : (
                              <span className='text-muted' title='클릭하여 상단 고정'>
                                {post.noticeNo}
                              </span>
                            )}
                          </td>

                          {/* 제목 */}
                          <td className="ps-4 py-4">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-dark fw-bold text-truncate" style={{ fontSize: '1.05rem', maxWidth: '400px' }}>
                                {post.noticeTitle}
                              </span>
                            </div>
                          </td>

                          {/* 첨부파일 */}
                          <td className="text-center py-4">
                            {post.fileCount > 0 ? (
                              <div className="d-flex align-items-center justify-content-center gap-1 text-primary bg-primary bg-opacity-10 rounded-pill py-1 mx-auto" style={{width: '60px'}}>
                                <Paperclip size={16} /> 
                                <span className="fw-bold small">{post.fileCount}</span>
                              </div>
                            ) : (
                              <span className="text-muted opacity-25">-</span>
                            )}
                          </td>

                          {/* 다운로드 */}
                          <td className="text-center py-4">
                            {post.totalDownloadHit > 0 ? (
                              <span className="text-dark fw-bold">{post.totalDownloadHit}</span>
                            ) : (
                              <span className="text-muted opacity-50">0</span>
                            )}
                          </td>

                          {/* 작성 정보 */}
                          <td className="text-center py-4">
                            <div className="d-flex flex-column justify-content-center" style={{lineHeight: '1.2'}}>
                              <span className="fw-bold text-dark small mb-1">{post.writer}</span>
                              <span className="text-muted" style={{fontSize: '0.75rem'}}>
                                {post.noticeRegdate ? post.noticeRegdate.substring(0, 10) : '-'}
                              </span>
                            </div>
                          </td>

                          {/* 최종 수정 */}
                          <td className="text-center py-4">
                            {post.noticeUpdate ? (
                              <div className="d-flex flex-column justify-content-center" style={{lineHeight: '1.2'}}>
                                <span className="fw-bold text-primary small mb-1">
                                  {post.modifierName || "수정됨"} 
                                </span>
                                <span className="text-primary" style={{fontSize: '0.75rem'}}>
                                  {post.noticeUpdate.substring(0, 10)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted opacity-25 small">-</span>
                            )}
                          </td>

                          {/* 조회수 */}
                          <td className="text-center py-4 text-muted small number-font">{post.noticeHit}</td>
                        </tr>
                      ))
                    ) : (
                      /* [2] 데이터가 없을 때: 안내 메시지 출력 */
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">등록된 공지사항이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {pageInfo && (posts?.length > 0) && (
                <div className="p-4 border-top">
                    <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= VIEW: WRITE & EDIT (작성/수정) ================= */}
        {(view === 'write' || view === 'edit') && (
          <div className="card-body p-5">
            <div className="mb-4">
              <label className="form-label fw-bold">제목</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-light" 
                name="noticeTitle"
                value={formData.noticeTitle} 
                onChange={handleChange}
                placeholder="공지사항 제목을 입력하세요" 
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">내용</label>
              <textarea 
                className="form-control bg-light" 
                name="noticeContent"
                rows="12" 
                value={formData.noticeContent} 
                onChange={handleChange}
                placeholder="내용을 입력하세요"
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div className="mb-4 form-check">
               <input 
                 className="form-check-input" 
                 type="checkbox" 
                 id="chkImportant" 
                 name="noticePinStatus"
                 checked={formData.noticePinStatus === 'Y'}
                 onChange={handleChange}
               />
               <label className="form-check-label fw-bold text-danger" htmlFor="chkImportant">
                 <AlertCircle size={16} className="me-1 mb-1"/>
                 상단 고정 (필독 공지로 등록)
               </label>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold d-flex align-items-center gap-2">
                첨부파일 <small className="text-muted fw-normal">(최대 5개)</small>
              </label>

              {/* 기존 파일 목록 표시 (삭제 기능 포함) */}
                {existingFiles.length > 0 && (
                  <div className="mb-3 d-flex flex-wrap gap-2">
                    {existingFiles.map((file, index) => (
                      <div key={file.fileNo} className="d-flex align-items-center gap-2 bg-light border rounded-pill px-3 py-1">
                        <span className="small text-muted">{file.fileOriginalName}</span>
                        <X 
                          size={14} 
                          className="text-danger" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => {
                            // 1. 삭제할 번호 저장 (나중에 서버에 보낼 용도)
                            setDelFileNos(prev => [...prev, file.fileNo]);
                            // 2. 화면 목록에서 제거
                            setExistingFiles(prev => prev.filter((_, i) => i !== index));
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              
              {/* 커스텀 파일 업로드 버튼 */}
              <div className="d-flex flex-column gap-3">
                <div className="upload-zone border-dashed p-4 rounded-3 text-center bg-light" 
                    style={{ cursor: 'pointer', border: '2px dashed #dee2e6' }}
                    onClick={() => document.getElementById('fileInput').click()}>
                  <Plus size={32} className="text-muted mb-2" />
                  <p className="text-muted mb-0">클릭하여 파일을 추가하세요</p>
                  <input 
                    type="file" 
                    id="fileInput" 
                    className="d-none" 
                    multiple 
                    onChange={handleFileChange} 
                  />
                </div>

                {/* 선택된 파일 목록 표시 */}
                {uploadFiles.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 bg-white border rounded-pill px-3 py-1 shadow-sm">
                        <span className="small text-truncate" style={{ maxWidth: '150px' }}>{file.name}</span>
                        <span className="text-muted small">({(file.size / 1024).toFixed(1)} KB)</span>
                        <X 
                          size={16} 
                          className="text-danger" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => removeFile(index)} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-4">
              <button className="btn btn-light border px-4" onClick={goList}>취소</button>
              {view === 'write' ? (
                <button className="btn btn-primary px-4 fw-bold" onClick={handleSave}><Save size={18} className="me-1"/> 등록하기</button>
              ) : (
                <button className="btn btn-primary px-4 fw-bold" onClick={handleUpdate}><Save size={18} className="me-1"/> 수정 완료</button>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW: DETAIL (상세) ================= */}
        {view === 'detail' && selectedPost && (
          <div className="card-body p-5 d-flex flex-column">
            
            {/* 제목 헤더 */}
            <div className="border-bottom pb-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                 <h3 className="fw-bold m-0">{selectedPost.noticeTitle}</h3>
              </div>
              <div className="d-flex align-items-center gap-4 text-muted small mt-3">
                 <div className="d-flex align-items-center gap-1"><User size={14}/> {selectedPost.writer}</div>
                 <div className="vr"></div>
                 <div className="d-flex align-items-center gap-1">
                  <Calendar size={14}/> {formatDate(selectedPost.noticeRegdate)}
                </div>
                 <div className="vr"></div>
                 <div>조회수 {selectedPost.noticeHit}</div>
              </div>
            </div>

            {/* 본문 */}
            <div className="flex-grow-1 mb-5" style={{ minHeight: '200px', whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              {selectedPost.noticeContent}
            </div>

            {/* 2. [추가] 첨부파일 목록 영역 */}
              {selectedPost.fileList && selectedPost.fileList.length > 0 && (
                <div className="mb-5 p-4 bg-light rounded-3 border">
                  <div className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                    <Paperclip size={18} className="text-primary" /> 첨부파일 [{selectedPost.fileList.length}]
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {selectedPost.fileList.map((file, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between bg-white p-2 px-3 border rounded shadow-sm">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted small">{idx + 1}.</span>
                          <span className="small fw-medium text-dark">{file.fileOriginalName}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {/* 1. 파일 용량 */}
                            <span>({(file.fileSize / 1024).toFixed(1)} KB)</span>
                            
                            {/* 2. 구분선 */}
                            <span className="mx-2 text-secondary opacity-25">|</span>
                            
                            {/* 3. 다운로드 횟수 */}
                            <span className="text-primary fw-bold">
                              Down: {file.fileDownloadCnt || 0}
                            </span>
                          </span>
                        </div>
                        {/* 다운로드 버튼: 프로젝트의 다운로드 API 주소로 연결하세요 */}
                        <a 
                          href={`/api/notice/download?fileNo=${file.fileNo}`} 
                          className="btn btn-sm btn-outline-secondary py-1 px-3"
                          download={file.fileOriginalName}
                        >
                          다운로드
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* 하단 버튼 */}
            <div className="d-flex justify-content-between border-top pt-4">
              <button className="btn btn-light border px-4 d-flex align-items-center gap-2" onClick={goList}>
                <List size={18} /> 목록으로
              </button>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary px-4 d-flex align-items-center gap-2" onClick={goEdit}>
                  <PenLine size={18} /> 수정
                </button>
                <button className="btn btn-outline-danger px-4 d-flex align-items-center gap-2" onClick={handleDelete}>
                  <Trash2 size={18} /> 삭제
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default BoardNotice;