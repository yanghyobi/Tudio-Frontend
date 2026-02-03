import { NavLink } from 'react-router-dom';
import '../../assets/css/admin/components/sidebar.css';

const Sidebar = () => {
    const getLinkClass = ({ isActive }) => isActive ? "nav-link active" : "nav-link";

    return (
        <nav className="sidebar shadow-lg">
            <div className="sidebar-main-scroll" id="sidebarAccordion">

                {/* 1. 회원 관리 그룹 */}
                <button className="sidebar-group-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#menu-user" aria-expanded="false">
                    <span>회원 관리</span><i className="bi bi-chevron-down toggle-icon"></i>
                </button>
                <div className="collapse" id="menu-user" data-bs-parent="#sidebarAccordion">
                     <ul className="nav flex-column collapse-inner">
                        <li className="nav-item">
                            <NavLink to="/admin/user/list" className={getLinkClass}>
                                회원 조회
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* 2. 고객센터 그룹 */}
                <button className="sidebar-group-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#menu-board" aria-expanded="false">
                    <span>고객센터</span><i className="bi bi-chevron-down toggle-icon"></i>
                </button>
                <div className="collapse" id="menu-board" data-bs-parent="#sidebarAccordion">
                    <ul className="nav flex-column collapse-inner">
                        <li className="nav-item">
                            <NavLink to="/admin/board/notice" className={getLinkClass}>
                                <i className="bi bi-megaphone me-2"></i> 공지사항
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/admin/board/inquiry" className={getLinkClass}>
                                <i className="bi bi-question-circle me-2"></i> 문의사항
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/admin/board/faq" className={getLinkClass}>
                                <i className="bi bi-question-square-fill me-2"></i> FAQ 관리
                            </NavLink>
                        </li>
                    </ul>
                </div>
                
                {/* 3. 설문 관리 그룹 */}
                <button className="sidebar-group-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#menu-survey" aria-expanded="false">
                    <span>설문 관리</span><i className="bi bi-chevron-down toggle-icon"></i>
                </button>
                <div className="collapse" id="menu-survey" data-bs-parent="#sidebarAccordion">
                    <ul className="nav flex-column collapse-inner">
                        <li className="nav-item">
                            <NavLink to="/admin/survey/SurveyList" className={getLinkClass}>
                                <i className="bi bi-clipboard-data me-2"></i> 설문 목록
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/admin/survey/SurveyForm" className={getLinkClass}>
                                <i className="bi bi-pencil-square me-2"></i> 설문 등록
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* 4. 정책 관리 그룹 */}
                <button className="sidebar-group-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#menu-policy" aria-expanded="false">
                    <span>정책 관리</span><i className="bi bi-chevron-down toggle-icon"></i>
                </button>
                <div className="collapse" id="menu-policy" data-bs-parent="#sidebarAccordion">
                    <ul className="nav flex-column collapse-inner">
                        <li className="nav-item">
                            <NavLink to="/admin/policy/terms" className={getLinkClass}>
                                <i className="bi bi-file-earmark-text me-2"></i> 이용약관 관리
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* 5. 로그 관리 그룹 */}
                <button className="sidebar-group-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#menu-log" aria-expanded="false">
                    <span>로그 관리</span><i className="bi bi-chevron-down toggle-icon"></i>
                </button>
                <div className="collapse" id="menu-log" data-bs-parent="#sidebarAccordion">
                    <ul className="nav flex-column collapse-inner">
                        <li className="nav-item">
                            <NavLink to="/admin/log/login" className={getLinkClass}>
                                <i className="bi bi-shield-lock me-2"></i> 로그인 로그
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/admin/log/error" className={getLinkClass}>
                                <i className="bi bi-exclamation-octagon me-2"></i> 오류 로그
                            </NavLink>
                        </li>
                        {/* <li className="nav-item">
                            <NavLink to="/admin/log/action" className={getLinkClass}>
                                <i className="bi bi-person-gear me-2"></i> 액션 로그
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/admin/log/batch" className={getLinkClass}>
                                <i className="bi bi-arrow-repeat me-2"></i> 배치 로그
                            </NavLink>
                        </li> */}
                    </ul>
                </div>

                {/* 6. 회의실 관리 */}
                <button 
                    className="sidebar-group-btn collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#menu-meetingRoom" 
                    aria-expanded="false"
                >
                    <span>회의실 관리</span>
                    <i className="bi bi-chevron-down toggle-icon"></i>
                </button>

                <div className="collapse" id="menu-meetingRoom" data-bs-parent="#sidebarAccordion">
                    <ul className="nav flex-column collapse-inner">
                        
                        {/* 1. 회의실 관리 */}
                        <li className="nav-item">
                            <NavLink to="/admin/meetingRoom/MeetingRoomList" className={getLinkClass}>
                                <i className="bi bi-gear me-2"></i> 회의실 관리
                            </NavLink>
                        </li>

                        {/* 2. 회의실 예약 관리 */}
                        <li className="nav-item">
                            <NavLink to="/admin/meetingRoom/MeetingReservationAdmin" className={getLinkClass}>
                                <i className="bi bi-calendar-week me-2"></i> 예약 관리
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* 7. 사업 관리 */}
                <button 
                    className="sidebar-group-btn collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#menu-" 
                    aria-expanded="false"
                >
                    <span>사업 관리</span>
                    <i className="bi bi-chevron-down toggle-icon"></i>
                </button>

                <div className="collapse" id="menu-" data-bs-parent="#sidebarAccordion">
                    <ul className="nav flex-column collapse-inner">
                        
                        {/* 1. 프로젝트 관리 */}
                        <li className="nav-item">
                            <NavLink to="/admin/project/Project" className={getLinkClass}>
                                <i className="bi bi-kanban me-2"></i> 프로젝트 관리
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;