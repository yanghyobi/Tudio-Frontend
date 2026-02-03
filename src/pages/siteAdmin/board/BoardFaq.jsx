import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, PenLine, Trash2, List, ChevronRight, 
  Plus, Save, GripVertical, ArrowUpDown, User, Calendar
} from 'lucide-react';
import axios from 'axios';

const BoardFaq = () => {
  const [view, setView] = useState('list'); 
  const [faqList, setFaqList] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null); 
  const [formData, setFormData] = useState({ faqNo: '', adminNo: '', faqTitle: '', faqContent: '', publicStatus: 'Y' });

  const dragItem = useRef();
  const dragOverItem = useRef();

  const goWrite = () => { 
    setFormData({ faqTitle: '', adminNo: '나중에넣어', faqContent: '', publicStatus: 'Y' }); 
    setView('write'); 
  };
  const goEdit = (faq) => { 
    setSelectedFaq(faq); 
    setFormData({ ...faq }); 
    setView('edit'); 
  };
  const goList = () => { 
    setView('list'); 
    setSelectedFaq(null); 
  };

  const handleSave = () => {
    if (!formData.faqTitle.trim()) return alert('질문을 입력해주세요.');
    const newFaq = { 
      ...formData, 
      faqRegdate: new Date(), 
      feqUpdate: new Date()
    };
    setFaqList([...faqList, newFaq]);
    /* 추후 sweetAlert으로 변경 */
    alert('FAQ가 등록되었습니다.');
    goList();
  };

  const handleUpdate = () => {
    if (!formData.faqTitle.trim()) return alert('질문을 입력해주세요.');
    const updatedFaqList = faqList.map(faq => faq.faqNo === selectedFaq.faqNo ? { ...faq, ...formData } : faq);
    setFaqList(updatedFaqList);
    alert('수정되었습니다.');
    goList();
  };

  const handleDelete = (faqNo) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setFaqList(faqList.filter(faq => faq.faqNo !== faqNo));
    }
  };

  const toggleStatus = (faqNo) => {
    setFaqList(faqList.map(faq => 
      faq.faqNo === faqNo ? { ...faq, publicStatus: faq.publicStatus === 'Y' ? 'N' : 'Y' } : faq
    ));
  };

  const dragStart = (e, position) => {
    dragItem.current = position;
    e.target.closest('tr').classList.add('bg-light');
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const drop = (e) => {
    e.target.closest('tr').classList.remove('bg-light');
    const copyListItems = [...faqList];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setFaqList(copyListItems);
  };

  const saveOrder = () => {
    console.log('변경된 순서:', faqList.map((faq, idx) => ({ faqNo: faq.faqNo, faqOrder: idx + 1 })));
    alert('순서가 저장되었습니다.');
  };

  useEffect(() => {
    axios.get("http://localhost:8060/api/faq/list")
      .then((response) => {
        setFaqList(response.data);
      })
      .catch((error) => {
        console.error("에러 발생 : ", error);
      })
  }, [])

  return (
    <div className="flex-grow-1 p-5 d-flex flex-column h-100">
      
      <div className="mb-4">
        <nav className="text-muted small mb-2 d-flex align-items-center gap-2">
          <span>Admin</span> <ChevronRight size={12} /> 
          <span>게시판 관리</span> <ChevronRight size={12} />
          <span className="text-primary fw-bold">FAQ 관리</span>
        </nav>
        <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <HelpCircle size={24} className="text-primary" /> 
          {view === 'list' ? 'FAQ 목록 (순서 변경)' : (view === 'write' ? 'FAQ 등록' : 'FAQ 수정')}
        </h2>
      </div>

      <div className="flex-grow-1 d-flex flex-column bg-white rounded-3 shadow-sm border overflow-hidden">
        
        {view === 'list' && (
          <>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                좌측 핸들(<GripVertical size={12}/>)을 드래그하여 순서를 변경하세요.
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-1" onClick={saveOrder}>
                    <ArrowUpDown size={14} /> 순서 저장
                </button>
                <button className="btn btn-primary btn-sm fw-bold px-3 d-flex align-items-center gap-1" onClick={goWrite}>
                    <Plus size={16} /> FAQ 등록
                </button>
              </div>
            </div>
            
            <div className="table-responsive flex-grow-1">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="text-center py-3" style={{width:'60px'}}>순서</th>
                    <th className="ps-3 py-3">질문 (Question)</th>
                    <th className="text-center py-3" style={{width:'100px'}}>상태</th>
                    <th className="text-center py-3" style={{width:'140px'}}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {faqList.map((faq, index) => (
                    <tr 
                    key={faq.faqNo}
                    draggable
                    onDragStart={(e) => dragStart(e, index)}
                    onDragEnter={(e) => dragEnter(e, index)}
                    onDragEnd={drop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ cursor: 'move' }}
                    >
                      <td className="text-center text-muted">
                        <div className="d-flex justify-content-center text-secondary">
                           <GripVertical size={18} />
                        </div>
                      </td>
                      <td className="ps-3">
                        <span className="fw-medium text-dark">{faq.faqTitle}</span>
                      </td>
                      <td className="text-center">
                        {faq.publicStatus === 'Y' ? (
                          <button className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 border-0" onClick={() => toggleStatus(faq.faqNo)}>
                             공개
                          </button>
                        ) : (
                          <button className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 border-0" onClick={() => toggleStatus(faq.faqNo)}>
                             비공개
                          </button>
                        )}
                      </td>
                      <td className="text-center">
                         <button className="btn btn-sm btn-white border me-1" onClick={() => goEdit(faq)}>
                            <PenLine size={14} className="text-secondary"/>
                         </button>
                         <button className="btn btn-sm btn-white border text-danger" onClick={() => handleDelete(faq.faqNo)}>
                            <Trash2 size={14}/>
                         </button>
                      </td>
                    </tr>
                  ))}
                  {faqList.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-5 text-muted">등록된 FAQ가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {(view === 'write' || view === 'edit') && (
          <div className="p-5">
            <div className="row mb-3">
                <div className="col-md-9">
                    <label className="form-label fw-bold">질문 (Question)</label>
                    <input type="text" className="form-control" name="question" value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} placeholder="질문을 입력하세요" />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold">공개 여부</label>
                    <select className="form-select" name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="public">공개 (Public)</option>
                        <option value="private">비공개 (Private)</option>
                    </select>
                </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">답변 (Answer)</label>
              <textarea className="form-control" name="answer" rows="10" value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} placeholder="답변 내용을 입력하세요" style={{resize:'none'}}></textarea>
            </div>
            
            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <button className="btn btn-light border" onClick={goList}>취소</button>
              <button className="btn btn-primary fw-bold" onClick={view === 'write' ? handleSave : handleUpdate}>
                <Save size={16} className="me-1"/> {view === 'write' ? '등록하기' : '수정 완료'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BoardFaq;