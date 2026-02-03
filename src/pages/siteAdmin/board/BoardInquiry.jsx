import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  List,
  ChevronRight,
  Search,
  User,
  Calendar,
  Send,
  Trash2,
  SlidersHorizontal,
  Paperclip
} from "lucide-react";
import axios from "axios";
import "@/assets/css/admin/pages/boardInquiry.css";
import Swal from "sweetalert2";

const BoardInquiry = () => {
  // === State ===
  const navigate = useNavigate();
  const { inquiryNo } = useParams(); // URL에서 번호를 읽어옴
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchWord, setSearchWord] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, INQUIRY, REPORT
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, Y, N
  const [currentPage, setCurrentPage] = useState(1);
  const [pagingInfo, setPagingInfo] = useState({ totalRecord: 0, completedCount: 0 }); 
  const [replyFiles, setReplyFiles] = useState([]);
  const [files, setFiles] = useState([]); // 첨부파일 목록 저장용

  const totalCount = pagingInfo?.totalRecord || 0;
  const completedCount = pagingInfo?.completedCount || 0;
  const waitingCount = totalCount - completedCount;

  const fetchData = async (page = 1) => {
    try {
      const params = {
        page: page,
        searchStatus: filterStatus === "ALL" ? "" : filterStatus,
        searchWord: searchWord,
        inquiryType: filterType === "ALL" ? "" : filterType,
        searchType: "ALL",
      };

      console.log("보내는 파라미터 확인:", params);

      const res = await axios.get(
        "http://localhost:8060/api/admin/board/inquiry/list", { params },
      );
      console.log("서버 응답 전체 데이터(res.data):", res.data);

      if (res.data && res.data.dataList) {
        setPosts(res.data.dataList);
        setPagingInfo(res.data);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const todayStr = `${year}.${month}.${day}`;

    const targetDate = dateString.substring(0, 10);

    return targetDate === todayStr;
  };

  const handleInstantFilter = async (type, status) => {
    const params = {
      searchStatus: status === "ALL" ? "" : status,
      inquiryType: type === "ALL" ? "" : type,
      searchWord: searchWord,
      searchType: "ALL",
    };
    try {
      const res = await axios.get(
        "http://localhost:8060/api/admin/board/inquiry/list",
        { params },
      );
      setPosts(res.data.dataList || []);
    } catch (error) {
      console.error("필터링 실패:", error);
    }
  };

  // 초기화 함수
  const handleReset = () => {
    setFilterType("ALL");
    setFilterStatus("ALL");

    const resetParams = {
      searchStatus: "",
      inquiryType: "",
      searchWord: searchWord,
      searchType: "ALL",
      page: 1,
    };

    axios
      .get("http://localhost:8060/api/admin/board/inquiry/list", {
        params: resetParams,
      })
      .then((res) => {
        setPosts(res.data.dataList || []);
        setShowFilter(false); // 초기화 누르면 창 닫기
        console.log("초기화 완료 및 데이터 로딩 성공");
      })
      .catch((err) => {
        console.error("초기화 요청 실패:", err);
      });
  };

  // 특정 문의글의 상세 데이터를 다시 불러오는 함수
  const fetchDetail = async (inquiryNo) => {
    try {
    const res = await axios.get(`http://localhost:8060/api/admin/board/inquiry/detail/data/${inquiryNo}`);
    
    if (res.data) {
      setSelectedPost(res.data.post);    
      setAnswerText(res.data.post?.replyContent || "");  
      setFiles(res.data.fileList || []);

      if (res.data.pagingInfo) {
        console.log("🔥 서버가 보내준 카운트:", res.data.pagingInfo);
        setPagingInfo(res.data.pagingInfo);
      }
    }
  } catch (error) {
    console.error("데이터 갱신 실패:", error);
  }
  };

  // 답변 등록/수정 함수
  const handleSaveAnswer = async () => {
      if (!answerText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '내용 누락',
        text: '답변 내용을 입력해주세요.',
      });
      return;
    }

    

    // 2. 서버로 보낼 짐 싸기 (FormData)
    try {
      const formData = new FormData();
      formData.append("inquiryNo", inquiryNo);     // 주소창에서 가져온 그 번호
      formData.append("replyContent", answerText); // 입력한 답변 내용
      formData.append("adminNo", 1);               // 관리자 번호 (세션에서 가져오거나 일단 고정)

      // 선택한 파일들이 있다면 하나씩 추가
      replyFiles.forEach((file) => {
        formData.append("replyFiles", file);
      });

      // 3. 백엔드로 전송!
      await axios.post("http://localhost:8060/api/admin/board/inquiry/reply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 4. 성공 알림 및 마무리
      await Swal.fire({
        icon: 'success',
        title: '등록 완료',
        text: '답변이 성공적으로 등록되었습니다.',
      });

      setAnswerText(""); 
      setReplyFiles([]);
      
      // 6. 상세 데이터 다시 불러오기 (화면에 방금 쓴 답변 바로 뜨게)
      fetchDetail(inquiryNo);

    } catch (error) {
      console.error("답변 등록 에러:", error);
      Swal.fire({
        icon: 'error',
        title: '등록 실패',
        text: '서버 통신 중 오류가 발생했습니다.',
      });
    }  
  };
  // 상세 화면으로 이동
  const goDetail = async (post) => {
    setSelectedPost(post); 
    await fetchDetail(post.inquiryNo);     
    setAnswerText(post.replyContent || "");
    navigate(`/admin/board/inquiry/${post.inquiryNo}`);
  };

  // 목록으로 돌아가기
  const goList = () => {    
    setSelectedPost(null);
    setAnswerText("");
    navigate("/admin/board/inquiry");
  };
  // 삭제
  const handleDeleteInquiry = async () => {
    const result = await Swal.fire({
      title: '정말 삭제하시겠습니까?',
      text: "글을 삭제하면 복구할 수 없습니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: '삭제하기',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      // 삭제 로직 실행
      setPosts(posts.filter((p) => p.inquiryNo !== selectedPost.inquiryNo));
      Swal.fire('삭제됨', '해당 문의글이 삭제되었습니다.', 'success');
      goList();
    }
  };
  //답변만 삭제
  const handleDeleteReply = async () => {
    if (window.confirm("등록된 답변을 삭제하시겠습니까?")) {
        try {
            // 답변 삭제 로직 (보통 replyContent를 비우고 status를 'N'으로 업데이트)
            const updateData = {
                inquiryNo: selectedPost.inquiryNo,
                replyContent: "",
                replyStatus: "N",
                replyFileGroupNo: null
            };
            await axios.post("http://localhost:8060/api/admin/board/inquiry/reply", updateData);
            alert("답변이 삭제되었습니다.");
            fetchData(currentPage);
            goList();
        } catch (error) {
            console.error("답변 삭제 실패:", error);
        }
    }
};

  useEffect(() => {
    if (inquiryNo) {
      fetchDetail(inquiryNo);
    } else {
      setSelectedPost(null); // 번호가 없으면 다시 목록 상태로
      fetchData(1);
    }
  }, [inquiryNo]);

  return (
    <div className="tudio-container">
      <div className="flex-grow-1 p-5 d-flex flex-column h-100">
        
        {/* 1. 공통 헤더 (항상 보임) */}
        <div className="mb-4">
          <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
            <span>Admin</span> <ChevronRight size={12} />
            <span>게시판 관리</span> <ChevronRight size={12} />
            <span className="text-primary fw-bold">1:1 문의</span>
          </nav>
          <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <MessageCircle size={24} className="text-primary" />
            {!inquiryNo ? "1:1 문의 관리" : "문의 내용 상세"}
          </h2>
        </div>

        {/* 2. 조건부 렌더링: 목록 vs 상세 */}
        {!inquiryNo ? (
          /* ==================== [목록 화면] ==================== */
          <div className="LIST_VIEW flex-grow-1 d-flex flex-column">
            <div className="flex-grow-1 bg-white rounded-3 shadow-sm border overflow-hidden d-flex flex-column">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                <span className="text-muted small">
                  총 <strong>{totalCount}</strong>건의 글이 있습니다. ({" "}
                  {waitingCount}건 답변 대기 중, {completedCount}건 답변 완료 )
                </span>
                <div className="d-flex gap-2 align-items-center">
                  <div className="tudio-search">
                    <input
                      type="text"
                      placeholder="검색어를 입력하세요"
                      value={searchWord}
                      onChange={(e) => setSearchWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") fetchData(1);
                      }}
                    />
                  </div>
                  <button className="tudio-search-btn" onClick={() => fetchData(1)}>검색</button>
                  
                  <div className="position-relative">
                    <button className="btn btn-link text-secondary p-1" onClick={() => setShowFilter(!showFilter)}>
                      <SlidersHorizontal size={20} strokeWidth={2.5} />
                    </button>
                    {showFilter && (
                      <div className="position-absolute end-0 mt-2 p-3 bg-white border shadow-lg rounded-3" style={{ zIndex: 1000, minWidth: "260px" }}>
                        <div className="mb-3">
                          <label className="fw-bold small mb-2 d-block text-dark">유형 선택</label>
                          <div className="d-flex gap-2">
                            {["ALL", "INQUIRY", "REPORT"].map((t) => (
                              <div key={t} className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="typeFilter" id={`type-${t}`} checked={filterType === t} onChange={() => { 
    setFilterType(t); 
    handleInstantFilter(t, filterStatus); 
  }} />
                                <label className="form-check-label small" htmlFor={`type-${t}`}>
                                  {t === "ALL" ? "전체" : t === "INQUIRY" ? "문의" : "신고"}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="fw-bold small mb-2 d-block text-dark">답변 상태</label>
                          <div className="d-flex gap-2">
                            {["ALL", "N", "Y"].map((s) => (
                              <div key={s} className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="statusFilter" id={`status-${s}`} checked={filterStatus === s} onChange={() => { setFilterStatus(s); handleInstantFilter(filterType, s); }} />
                                <label className="form-check-label small" htmlFor={`status-${s}`}>
                                  {s === "ALL" ? "전체" : s === "N" ? "대기" : "완료"}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={handleReset}>초기화</button>
                          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => setShowFilter(false)}>닫기</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="table-responsive flex-grow-1">
                <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 5px" }}>
                  <thead className="table-light">
                    <tr className="text-center">
                      <th style={{ width: "15%" }}>상태</th>
                      <th style={{ width: "47%" }} className="text-start ps-4">제목</th>
                      <th style={{ width: "10%" }}>작성자</th>
                      <th style={{ width: "10%" }}>등록일</th>
                      <th style={{ width: "10%" }}>답변완료일</th>
                      <th style={{ width: "10%" }}>조회수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.inquiryNo} onClick={() => goDetail(post)} style={{ cursor: "pointer" }}>
                        <td className="text-center">
                          <span className={post.replyStatus === "Y" ? "badge-complete" : "badge-wait"}>
                            {post.replyStatus === "Y" ? "답변완료" : "답변대기"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge me-2 ${post.inquiryType === "REPORT" ? "bg-danger" : "bg-primary"}`}>
                            {post.inquiryType === "REPORT" ? "신고" : "문의"}
                          </span>
                          <span className="fw-bold me-2">{post.inquiryTitle}</span>
                          {post.fileCount > 0 && <span className="text-muted small me-2"><i className="bi bi-paperclip"></i> {post.fileCount}</span>}
                          {isToday(post.inquiryRegdate) && <span className="badge-new-style">N</span>}
                        </td>
                        <td className="text-center">{post.userName}</td>
                        <td className="text-center text-muted small">{post.inquiryRegdate}</td>
                        <td className="text-center text-muted small">{post.replyDate || "-"}</td>
                        <td className="text-center text-muted small">{post.inquiryHit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              {/* 페이징 */}
              <div className="p-3 border-top bg-white">
                <ul className="pagination pagination-sm m-0 d-flex justify-content-center">
                  {Array.from({ length: Math.max(0, (pagingInfo.endPage || 0) - (pagingInfo.startPage || 0) + 1) }, (_, i) => pagingInfo.startPage + i).map((pageNum) => (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                      <button className="page-link" onClick={() => fetchData(pageNum)}>{pageNum}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== [상세 화면] ==================== */
          <div className="DETAIL_VIEW">
            {selectedPost && (
              <>
                <div className="card-body p-5 d-flex flex-column bg-white rounded-4 shadow-sm">
                  <div className="border-bottom pb-4 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className={selectedPost.replyStatus === 'Y' ? 'badge-complete' : 'badge-wait'}>
                        {selectedPost.replyStatus === 'Y' ? '답변완료' : '답변대기'}
                      </span>
                      <span className={`badge ${selectedPost.inquiryType === 'REPORT' ? 'bg-danger' : 'bg-primary'} px-3`}>
                        {selectedPost.inquiryType === 'REPORT' ? '신고' : '문의'}
                      </span>
                      <h4 className="fw-bold m-0 ms-2">{selectedPost.inquiryTitle}</h4>
                    </div>
                    <div className="d-flex align-items-center justify-content-end gap-3 text-muted mt-3">
                      <div><User size={16}/> {selectedPost.userName}</div>
                      <div className="vr"></div>
                      <div><Calendar size={16}/> {selectedPost.inquiryRegdate}</div>
                      <div className="vr"></div>
                      <div>조회수 {selectedPost.inquiryHit}</div>
                    </div>
                  </div>

                  <div className="flex-grow-1 mb-5 p-3 bg-white" style={{ minHeight: '150px', whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                    {selectedPost.inquiryContent || "내용이 없습니다."}
                  </div>

                  <div className="board-file-section">
                    <span className="file-label">
                      <i className="bi bi-paperclip me-1"></i> 첨부파일 <span className="text-primary">{selectedPost.fileList?.length || 0}</span>개
                    </span>
                    <div className="file-card-grid">
                      {selectedPost.fileList?.map((file, index) => (
                        <a key={index} href={`http://localhost:8060/api/admin/board/inquiry/download?fileNo=${file.fileNo}`} className="file-card">
                          <div className="file-icon-box"><i className="bi bi-file-earmark-text"></i></div>
                          <div className="file-info">
                            <span className="file-name">{file.fileOriginalName}</span>
                            <span className="file-size">{(file.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <hr />
                  
                  {/* 답변 영역 */}
                  <div className="reply-list-area mt-5">
                    {selectedPost.replyStatus === 'Y' ? (
                      <div className="d-flex gap-3 p-3 rounded-3 bg-light">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="fw-bold small">관리자 <span className="text-muted fw-normal ms-2">{selectedPost.replyDate}</span></div>
                            <button className="btn btn-link text-danger btn-sm p-0 text-decoration-none" onClick={handleDeleteReply}>삭제</button>
                          </div>
                          <div className="comment-text" style={{ whiteSpace: 'pre-line' }}>{selectedPost.replyContent}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted bg-white">답변을 등록해주세요.</div>
                    )}
                  </div>

                  {/* 답변 입력 */}
                  {selectedPost.replyStatus === 'N' && (
                    <div className="comment-write-box mt-4">
                      <div className="messenger-input-row d-flex align-items-center p-2 border rounded-3">
                        <textarea 
                          className="form-control border-0 shadow-none bg-transparent flex-grow-1" 
                          placeholder="내용을 입력하세요."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          style={{ height: '40px', resize: 'none' }}
                        />
                        <div className="d-flex align-items-center gap-2 ms-2">
                          <label htmlFor="reply-file" className="text-secondary m-0 p-1" style={{ cursor: 'pointer' }}><Paperclip size={20} /></label>
                          <input type="file" id="reply-file" multiple className="d-none" onChange={(e) => setReplyFiles([...replyFiles, ...Array.from(e.target.files)])} />
                          <button className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center" onClick={handleSaveAnswer} style={{ width: '32px', height: '32px' }}>
                            <Send size={16} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                  <button className="btn btn-light border px-4" onClick={() => navigate("/admin/board/inquiry")}><List size={18} /> 목록으로</button>
                  <button className="btn btn-outline-danger px-4" onClick={handleDeleteInquiry}><Trash2 size={18} /> 문의글 삭제</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardInquiry;
