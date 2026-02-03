import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

const TodoWidget = ({ projectNo, projectName, onClearProject, refreshTrigger }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [isAdding, setIsAdding] = useState(false);    
    const [newTodo, setNewTodo] = useState('');          
    const [editingId, setEditingId] = useState(null);    
    const [editContent, setEditContent] = useState(''); 

    const [filterType, setFilterType] = useState('ALL');

    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    const fetchTodos = async () => {
        try {
            const res = await axios.get('/tudio/dashboard/todo/list', {
                params: { projectNo: projectNo || 0 }
            });
            setTodos(res.data || []);
        } catch (error) {
            console.error("투두 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTodos();
        setIsAdding(false);
        setEditingId(null);
        setFilterType('ALL');
    }, [projectNo]); 

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log("♻️ [TodoWidget] 갱신 신호 수신");
            fetchTodos();
        }
    }, [refreshTrigger]);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingId]);

    const handleAdd = async () => {
        if (!newTodo.trim()) {
            Toast.fire({ icon: 'warning', title: '내용을 입력해주세요.' });
            return;
        }

        try {
            const res = await axios.post('/tudio/dashboard/todo/insert', {
                todoContent: newTodo,
                projectNo: projectNo || 0 
            });

            if (res.data === 'OK') {
                Toast.fire({ icon: 'success', title: '할 일이 등록되었습니다.' });
                setNewTodo('');
                fetchTodos(); 
                if(inputRef.current) inputRef.current.focus(); 
            } else {
                Swal.fire('실패', '등록에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error("등록 에러", error);
            Swal.fire('에러', '서버 통신 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleToggle = async (todo) => {
        const newStatus = todo.todoStatus === 'Y' ? 'N' : 'Y';
        
        const prevTodos = [...todos];
        setTodos(todos.map(t => t.todoNo === todo.todoNo ? { ...t, todoStatus: newStatus } : t));

        try {
            const res = await axios.post('/tudio/dashboard/todo/updateStatus', {
                todoNo: todo.todoNo,
                todoStatus: newStatus
            });
            console.log(res.data);
            if (res.status === 200 && res.data === 'OK') {
                console.log("성공");
            } else {
                throw new Error("DB 업데이트 실패 (0건 수정됨)");
            }
        } catch (error) {
            setTodos(prevTodos); 
            console.error("상태 변경 실패", error);
            Swal.fire('오류', '상태 변경 실패', 'error');
        }
    };

    const handleDelete = async (todoNo) => {
        const result = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 데이터는 복구할 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네, 삭제합니다',
            cancelButtonText: '취소',
            customClass: { popup: 'small-swal' } 
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.post('/tudio/dashboard/todo/delete', { todoNo });
                if(res.data === 'OK') {
                    Toast.fire({ icon: 'success', title: '삭제되었습니다.' });
                    setTodos(todos.filter(t => t.todoNo !== todoNo));
                } else {
                    Swal.fire('오류', '삭제 실패', 'error');
                }
            } catch (error) {
                Swal.fire('오류', '서버 통신 실패', 'error');
            }
        }
    };

    const startEdit = (todo) => {
        setEditingId(todo.todoNo);
        setEditContent(todo.todoContent);
    };

    const saveEdit = async () => {
        if (!editContent.trim()) {
            Swal.fire({ icon: 'warning', title: '내용을 입력해주세요.' });
            return;
        }

        try {
            const res = await axios.post('/tudio/dashboard/todo/updateContent', {
                todoNo: editingId,
                todoContent: editContent
            });

            if (res.data === 'OK') {
                Toast.fire({ icon: 'success', title: '수정 완료' });
                setTodos(todos.map(t => t.todoNo === editingId ? { ...t, todoContent: editContent } : t));
                setEditingId(null);
            } else {
                Swal.fire('실패', '수정 실패', 'error');
            }
        } catch (error) {
            console.error("수정 실패", error);
        }
    };

    const stats = useMemo(() => {
        const total = todos.length;
        const done = todos.filter(t => t.todoStatus === 'Y').length;
        const active = total - done;
        return { total, done, active };
    }, [todos]);

    const filteredList = useMemo(() => {
        let list = todos;
        if (filterType === 'ACTIVE') list = todos.filter(t => t.todoStatus === 'N');
        else if (filterType === 'DONE') list = todos.filter(t => t.todoStatus === 'Y');
        return list;
    }, [todos, filterType]);

    const getEmptyMessage = () => {
        if (loading) return "로딩중...";
        if (todos.length === 0) return projectNo > 0 ? "이 프로젝트에 할 일이 없습니다." : "등록된 할 일이 없습니다.";
        if (filterType === 'ACTIVE') return "진행 중인 할 일이 없습니다.";
        if (filterType === 'DONE') return "완료된 할 일이 없습니다.";
        return "할 일이 없습니다.";
    };


    return (
        <div className="widget-content zen-folder-widget bg-white d-flex flex-column rounded shadow-sm position-relative" 
             style={{ height: '100%', width: '100%', overflow: 'hidden' }}>

            <style>{`
                .todo-tab { cursor: pointer; transition: all 0.2s; border-top: 2px solid transparent; }
                .todo-tab:hover { background-color: #f8f9fa; }
                .todo-tab.active { background-color: #EFF6FF; color: #3B82F6; font-weight: bold;}
                .todo-tab .badge { transition: all 0.2s; }
                .todo-tab.active .badge { background-color: #3B82F6 !important; color: white !important; opacity: 1 !important; }
            `}</style>
            
            <div className="folder-shape-layer" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <div className="folder-tab-todo"></div>
                <div className="folder-body-bg"></div>
            </div>

            <div className="folder-content-layer d-flex flex-column h-100 position-relative" style={{ zIndex: 1, paddingLeft: '6px' }}>
            
                <div className="widget-header-wrapper flex-shrink-0">
                    <div className="d-flex justify-content-between align-items-center widget-header-custom">
                        <h6 className="font-weight-bold m-0 text-gray-800" style={{padding: '14px 20px'}}>
                            <i className="bi bi-check2-square text-primary me-2"></i>To Do List
                        </h6>
                        <button className="btn btn-sm btn-white bg-white shadow-sm border rounded-circle d-flex align-items-center justify-content-center" 
                                onClick={() => {
                                    const nextState = !isAdding;
                                    setIsAdding(nextState);
                                    
                                    if (nextState) {
                                        setNewTodo('정기 배포관련 화상미팅 진행');
                                    } else {
                                        setNewTodo(''); 
                                    }
                                }} 
                                title="할 일 추가"
                                style={{width:'32px', height:'32px'}}>
                            <i className={`bi ${isAdding ? 'bi-x-lg text-danger' : 'bi-plus-lg text-primary fw-bold'}`}></i>
                        </button>
                    </div>
                </div>

                {projectNo > 0 && (
                    <div className="flex-shrink-0 px-3 py-2 border-bottom d-flex justify-content-between align-items-center bg-white bg-opacity-75">
                        <span className="small fw-bold text-primary text-truncate">
                            <i className="bi bi-folder-fill me-1"></i>{projectName} 
                        </span>
                        <button type="button" className="btn btn-xs btn-link text-secondary p-0 ms-2"
                                onClick={onClearProject} title="전체 목록 보기">
                            <i className="bi bi-x-circle-fill"></i>
                        </button>
                    </div>
                )}

                {isAdding && (
                    <div className="flex-shrink-0 px-3 mb-2 pt-2 animate-fade-in">
                        <li className="list-group-item d-flex justify-content-between align-items-center bg-light border rounded p-2">
                            <div className="d-flex align-items-center w-100 me-2">
                                <input 
                                    type="text" 
                                    ref={inputRef}
                                    className="form-control form-control-sm" 
                                    placeholder="할 일 추가" 
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdd();
                                        if (e.key === 'Escape') setIsAdding(false);
                                    }} 
                                />
                            </div>
                            <button className="btn btn-sm btn-primary" style={{ minWidth:'50px' }} onClick={handleAdd}>추가</button>
                        </li>
                    </div>
                )}

                <div className="flex-grow-1 overflow-auto custom-scrollbar px-0" id={`todo-list-area-${projectNo}`} style={{ minHeight: 0 }}>
                    {filteredList.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted small pb-4">
                            <i className={`bi ${filterType === 'ACTIVE' ? 'bi-emoji-smile' : 'bi-clipboard-check'} fs-4 mb-2 opacity-50`}></i>
                            <span className="mt-2">{getEmptyMessage()}</span>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {filteredList.map(todo => (
                                <li key={todo.todoNo} className="list-group-item px-3 py-2 border-bottom-0 d-flex align-items-center group-hover-target"
                                    onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
                                    onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}>
                                    
                                    <div className="form-check m-0 d-flex align-items-center flex-grow-1 text-truncate" style={{maxWidth: '80%'}}>
                                        <input className="form-check-input cursor-pointer mt-0" type="checkbox" 
                                            id={`todoCheck${todo.todoNo}`}
                                            checked={todo.todoStatus === 'Y'} 
                                            onChange={() => handleToggle(todo)} 
                                        />
                                        
                                        {editingId === todo.todoNo ? (
                                            <div className="d-flex ms-2 w-100 align-items-center">
                                                <input 
                                                    type="text" 
                                                    ref={editInputRef}
                                                    className="form-control form-control-sm me-2"
                                                    value={editContent} 
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit();
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }} 
                                                />
                                                <button className="btn btn-sm btn-success text-nowrap" style={{ minWidth:'50px' }} onClick={saveEdit}>저장</button>
                                                <button className="btn btn-sm btn-secondary text-nowrap" onClick={() => setEditingId(null)}>취소</button>
                                            </div>
                                        ) : (
                                            <label className={`form-check-label ms-2 cursor-pointer text-truncate ${todo.todoStatus==='Y'?'text-decoration-line-through text-muted':''}`}
                                                htmlFor={`todoCheck${todo.todoNo}`}
                                                onDoubleClick={() => startEdit(todo)} 
                                                style={{fontSize: '0.9rem', width: '100%'}}
                                                title={todo.todoContent}>
                                                {todo.todoContent}
                                            </label>
                                        )}
                                    </div>
                                    
                                    {editingId !== todo.todoNo && (
                                        <div className="btn-group btn-group-sm opacity-50 group-hover-visible transition-opacity ms-auto">
                                            <button type="button" className="btn btn-link text-secondary p-0 me-2" 
                                                onClick={() => startEdit(todo)} title="수정">
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button type="button" className="btn btn-link text-danger p-0" 
                                                onClick={() => handleDelete(todo.todoNo)} title="삭제">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex-shrink-0 px-3 py-2 gap-2 d-flex border-top text-end">
                    <div className={`flex-fill d-flex align-items-center justify-content-center small todo-tab ${filterType === 'ALL' ? 'active' : 'text-muted'}`}
                         onClick={() => setFilterType('ALL')}>
                        <span>전체</span>
                        <span className="badge bg-light border text-primary rounded-pill ms-1">
                            {stats.total}
                        </span>
                    </div>

                    <div className="vr my-2 opacity-25"></div>

                    <div className={`flex-fill d-flex align-items-center justify-content-center small todo-tab ${filterType === 'ACTIVE' ? 'active' : 'text-muted'}`}
                         onClick={() => setFilterType('ACTIVE')}>
                        <span>진행</span>
                        <span className="badge bg-light border text-primary rounded-pill ms-1">
                            {stats.active}
                        </span>
                    </div>

                    <div className="vr my-2 opacity-25"></div>

                    <div className={`flex-fill d-flex align-items-center justify-content-center small todo-tab ${filterType === 'DONE' ? 'active' : 'text-muted'}`}
                         onClick={() => setFilterType('DONE')}>
                        <span>완료</span>
                        <span className="badge bg-light border text-primary rounded-pill ms-1">
                            {stats.done}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodoWidget;