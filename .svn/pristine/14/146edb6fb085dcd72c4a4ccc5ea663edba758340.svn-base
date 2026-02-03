import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { GridStack } from 'gridstack';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import 'gridstack/dist/gridstack.min.css';

import PersonalWorkWidget from '../../components/dashboard/PersonalWorkWidget';
import ApprovalWidget from '../../components/dashboard/ApprovalWidget';
import AlarmWidget from '../../components/dashboard/AlarmWidget';
import BookmarkWidget from '../../components/dashboard/BookmarkWidget';
import TodoWidget from '../../components/dashboard/TodoWidget';
import SurveyBanner from '../../components/dashboard/SurveyBanner';
import NoticeWidget from '../../components/dashboard/NoticeWidget';
import DeadlineWorkWidget from '../../components/dashboard/DeadlineWorkWidget';

const DashboardMain = () => {
    const [widgets, setWidgets] = useState([]);       
    const [sidebarItems, setSidebarItems] = useState([]); 
    const [isEditMode, setIsEditMode] = useState(false);
    const gridRef = useRef(null);
    const [selectedProject, setSelectedProject] = useState({ no: 0, name: '' });

    // 위젯 트리거 객체
    const [triggers, setTriggers] = useState({
        PERSONAL_WORK: 0,    // 개인업무
        DRAFT: 0,            // 전자결재
        ALARM: 0,            // 알림
        PROJECT_BOOKMARK: 0, // 북마크
        TODO: 0,             // Todo
        NOTICE: 0,           // 공지사항
        PROJECT_SUMMARY: 0   // 마감임박
    });

    const contextPath = document.body.dataset.contextPath || "";
    const loginMemberNo = document.body.dataset.loginNo ? parseInt(document.body.dataset.loginNo, 10) : 0;

    const handleProjectSelect = (projectData) => {
        if (!projectData || typeof projectData !== 'object') return;
        
        setSelectedProject({
            no: projectData.projectNo,
            name: projectData.projectName
        });
    };

    const handleClearProject = () => {
        setSelectedProject({ no: 0, name: '' });
    };

    useEffect(() => {
        const mainWrap = document.getElementById('mainContent');
        if (!mainWrap) return;
        if (isEditMode) {
            // 편집 모드
            mainWrap.classList.add('dashboard-edit-mode');
        } else {
            mainWrap.classList.remove('dashboard-edit-mode');
        }
        // 컴포넌트가 사라질 때
        return () => mainWrap.classList.remove('dashboard-edit-mode');
    }, [isEditMode]);

    // [1] 레이아웃 초기 데이터 로드
    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const res = await axios.get('/tudio/dashboard/layout');
                const data = Array.isArray(res.data) ? res.data : [];
                setWidgets(data.filter(w => w.widgetStatus === 'Y'));
                setSidebarItems(data.filter(w => w.widgetStatus === 'N'));
            } catch (error) {
                console.error("Layout fetch error", error);
            }
        };
        fetchLayout();
    }, []);

    // [2] GridStack 초기화 및 이벤트 바인딩
    useEffect(() => {
        // 데이터 로딩 전이거나 이미 그리드가 존재하면 스킵
        if (widgets.length === 0) return;

        const gridEl = document.querySelector('.grid-stack');
        if (!gridEl || gridRef.current) return;

        console.log("Grid Container Width:", gridEl.offsetWidth);

        const grid = GridStack.init({
            column: 12,
            cellHeight: 100,
            margin: 10,
            disableOneColumnMode: true,
            animate: true,
            float: false,
            staticGrid: !isEditMode,    // 초기 로딩 시 정적 모드 
            removable: false,           // 네이티브 Drop 이벤트 사용
            children: false,           
            minRow: 5,                  // 빈 공간에도 드롭이 가능하도록 공간 확보
            resizable: {
                handles: 'n, e, s, w, nw, sw, se' 
            }
        }, gridEl);

        gridRef.current = grid;

        return () => {
            if (grid) { grid.destroy(false); gridRef.current = null; }
        };
    }, [widgets]); // 최초 로딩 시 1회 실행

    // [3] 편집 모드 전환 시 그리드 잠금/해제 & 리사이즈
    useEffect(() => {
        if (!gridRef.current) return;
        gridRef.current.setStatic(!isEditMode);

        if (isEditMode) {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize')); 
                console.log("Triggered window resize for GridStack");
            }, 320);
        }
    }, [isEditMode]);

    // [4] 네이티브 드래그 (사이드바)
    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('widget-data', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
        document.body.style.cursor = 'grabbing';
    };

    const handleDragEnd = () => {
        document.body.style.cursor = 'auto';
        document.querySelector('.grid-stack')?.classList.remove('drag-over');
    };

    // [5] 네이티브 드래그 오버 (그리드 영역) - 금지 표시 방지
    const handleDragOver = (e) => {
        e.preventDefault();     // 드롭 허용
        e.stopPropagation();    // 상위요소로 이벤트 전파 방지
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over'); 
    };

    // [6] 네이티브 드롭 (그리드 영역)
    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        document.body.style.cursor = 'auto';

        const dataStr = e.dataTransfer.getData('widget-data');
        if (!dataStr) return;

        const item = JSON.parse(dataStr);
        
        // 상태 업데이트
        setSidebarItems(prev => prev.filter(w => String(w.widgetNo) !== String(item.widgetNo)));
        setWidgets(prev => {
            if (prev.some(w => String(w.widgetNo) === String(item.widgetNo))) return prev;
            return [...prev, { 
                ...item, 
                x: 0, y: 0, 
                widgetStatus: 'Y',
                autoPosition: true // GridStack이 알아서 빈 곳 찾아줌
            }];
        });
    };

    const toggleEditMode = useCallback((mode) => {
        setIsEditMode(mode);
    }, []);

    // [5] 위젯 제거 (보관함으로 이동)
    const removeWidgetToSidebar = (widgetNo) => {
        setWidgets(prev => {
            const target = prev.find(w => w.widgetNo == widgetNo);
            if (!target) return prev;
            setSidebarItems(current => [...current, { ...target, x: 0, y: 0, widgetStatus: 'N' }]);
            return prev.filter(w => w.widgetNo != widgetNo);
        });
    };

    // [6] 레이아웃 저장
    const saveLayout = async () => {
        if (!gridRef.current) return;
        const layoutData = gridRef.current.save(false); 
        const activePayload = layoutData.map(node => ({
            widgetNo: node.id, x: node.x, y: node.y, width: node.w, height: node.h, widgetStatus: 'Y'
        }));
        const inactivePayload = sidebarItems.map(item => ({
            widgetNo: item.widgetNo, x: 0, y: 0, width: item.width, height: item.height, widgetStatus: 'N'
        }));
        try {
            await axios.post('/tudio/dashboard/layout/save', [...activePayload, ...inactivePayload]);
            Swal.fire({ icon: 'success', title: '저장 완료', text: '레이아웃이 저장되었습니다.', timer: 1500, showConfirmButton: false });
            toggleEditMode(false);
        } catch (error) {
            Swal.fire('오류', '저장 실패', 'error');
        }
    };

    // WebSocket 연결
    useEffect(() => {
        if (!loginMemberNo) return;

        // 연결 주소: /tudio/ws-stomp
        const socket = new SockJS(`${contextPath}/ws-stomp`);
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
            console.log(`✅ WebSocket Connected (Member: ${loginMemberNo})`);

            client.subscribe(`/sub/dashboard/${loginMemberNo}`, (message) => {
                const body = JSON.parse(message.body);
                const type = body.type; 

                // 수신된 타입에 해당하는 카운트만 1 증가시킴
                if (type && triggers.hasOwnProperty(type)) {
                    console.log(`♻️ [${type}] 위젯 갱신 신호 수신`);
                    setTriggers(prev => ({
                        ...prev,
                        [type]: prev[type] + 1
                    }));
                }
            });
        });

        return () => { if (client) client.disconnect(); };
    }, [contextPath, loginMemberNo]);

    // 위젯 타이틀
    const getWidgetTitle = (type) => WIDGET_REGISTRY[type]?.title || '위젯';

    // 위젯 아이콘
    const getWidgetIcon = (type) => WIDGET_REGISTRY[type]?.icon || 'bi-grid';

    const WIDGET_REGISTRY = useMemo(() => ({
        'PERSONAL_WORK': { component: <PersonalWorkWidget refreshTrigger={triggers.PERSONAL_WORK}/>, title: '개인 업무', icon: 'bi-calendar-week' },
        'DRAFT': { component: <ApprovalWidget refreshTrigger={triggers.DRAFT}/>, title: '전자결재', icon: 'bi-file-earmark-text' },
        'ALARM': { component: <AlarmWidget refreshTrigger={triggers.ALARM}/>, title: '미확인 알림', icon: 'bi-bell-fill' },
        'PROJECT_BOOKMARK': { component: <BookmarkWidget 
            onProjectSelect={handleProjectSelect}
            refreshTrigger={triggers.PROJECT_BOOKMARK}
            />, title: '북마크 프로젝트', icon: 'bi-bookmark-star-fill' },
        'TODO': { component: <TodoWidget 
            projectNo={selectedProject.no} 
            projectName={selectedProject.name}
            onClearProject={handleClearProject}
            refreshTrigger={triggers.TODO}
            />, title: 'To Do List', icon: 'bi-check2-square' },
        'NOTICE': { component: <NoticeWidget refreshTrigger={triggers.NOTICE}/>, title: '시스템 공지사항', icon: 'bi-megaphone-fill' }, 
        'PROJECT_SUMMARY': { component: <DeadlineWorkWidget refreshTrigger={triggers.PROJECT_SUMMARY}/>, title: '마감 임박 업무', icon: 'bi-stopwatch' }
    }), [selectedProject, triggers]);

    return (
        <div className={`dashboard-container`}>
            {/* svg filter */}
            <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
                <defs>
                    <filter id="filter-svg">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                    </filter>
                </defs>
            </svg>
            
            {/* 컨텐츠 영역 */}
            <div className="dashboard-content-wrapper">
                {/* 상단바 */}
                <div className="d-flex justify-content-between align-items-center px-4 mb-3">
                    <div>
                        <h2 className="fw-bold text-primary-dark mb-2" style={{color: '#00407F'}}>대시보드</h2>
                        <p className="text-muted small m-0">Tudio와 함께 활기차게 업무를 시작해보세요 !</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-white rounded-pill px-3 py-2 d-flex align-items-center border shadow-sm gap-3">
                            <div className="form-check form-switch m-0">
                                <input className="form-check-input cursor-pointer" type="checkbox" id="editModeSwitch"
                                    checked={isEditMode} onChange={(e) => toggleEditMode(e.target.checked)} />
                                <label className="form-check-label small fw-bold ms-2 cursor-pointer" htmlFor="editModeSwitch">위젯 편집</label>
                            </div>
                        </div>
                        {isEditMode && (
                            <button className="btn btn-sm btn-primary rounded-pill px-3 py-2 fw-bold shadow-sm" onClick={saveLayout}>
                                <i className="bi bi-check-lg me-1"></i> 저장
                            </button>
                        )}
                    </div>
                </div>

                <div className='px-4'><SurveyBanner /></div>

                {/* 메인 그리드 */}
                <div className="main-content-wrapper px-2">
                    <div className="grid-stack"
                        style={{ minHeight: '600px' }}
                        onDragOver={isEditMode ? handleDragOver : undefined}
                        onDrop={isEditMode ? handleDrop : undefined}
                    >
                        {widgets.map((w) => (
                            <div key={w.widgetNo} className="grid-stack-item" 
                                gs-id={w.widgetNo} gs-x={w.x} gs-y={w.y} gs-w={w.width} gs-h={w.height} 
                                gs-auto-position={w.autoPosition ? 'true' : undefined}
                                data-type={w.widgetType}>
                                <div className="grid-stack-item-content">
                                    {isEditMode && (
                                        <div className="btn-close-widget" onClick={() => removeWidgetToSidebar(w.widgetNo)}>
                                            <i className="bi bi-x-lg"></i>
                                        </div>
                                    )}
                                    {WIDGET_REGISTRY[w.widgetType]?.component}                                  
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 사이드바 (보관함) */}
            <div className={`widget-drawer ${isEditMode ? 'open' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-4 p-3">
                    <h5 className="fw-bold m-0"><i className="bi bi-box-seam me-2"></i> 위젯 보관함</h5> 
                    <button className="btn-close" onClick={() => toggleEditMode(false)}></button>
                </div>
                <div id="sidebar-content" className="px-3 pb-3 h-100 overflow-auto">
                    {sidebarItems.map((item) => (
                        <div key={item.widgetNo} className="sidebar-widget-item mb-3 cursor-grab"
                             gs-id={item.widgetNo} gs-w={item.width} gs-h={item.height} 
                             data-type={item.widgetType} 
                             draggable={true} 
                             onDragStart={(e) => handleDragStart(e, item)}
                             onDragEnd={handleDragEnd}
                             style={{ cursor: 'grab' }}
                            >
                            <div className="grid-stack-item-content w-100" style={{ pointerEvents: 'none' }}>
                                <span className="fw-bold text-dark small">
                                    <i className={`bi ${getWidgetIcon(item.widgetType)} me-2 text-primary`}></i>
                                    {getWidgetTitle(item.widgetType)}
                                </span>
                                <i className="bi bi-grip-vertical text-muted"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardMain;