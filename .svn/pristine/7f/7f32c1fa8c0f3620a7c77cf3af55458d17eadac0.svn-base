import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../assets/css/admin/components/header.css';

const Header = () => {

    // 네비게이션 훅 : 로그아웃 후 로그인 페이지로 이동하기 위함
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try{
                const response = await axios.get('/api/member/me');

                setUserInfo(response.data);
            }catch (error){
                console.error("사용자 정보 로딩 실패:", error);

                if(error.response){
                    const status = error.response.status;

                    switch (status) {
                        case 401: // [인증 실패] 토큰 만료 or 비로그인
                            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                            navigate('/login');
                            break;

                        case 403: // [권한 없음] 로그인 O, 하지만 관리자 권한 X
                            alert("관리자 권한이 없습니다. 메인 페이지로 이동합니다.");
                            const isDev = window.location.hostname === 'localhost';

                            if (isDev) {
                                // 개발 중일 땐 STS 포트(8060)로 강제 이동
                                window.location.href = 'http://localhost:8060/tudio/dashboard';
                            } else {
                                // 배포 후엔 같은 도메인을 쓰므로 뒷부분만 적어도 됨
                                window.location.href = '/tudio/dashboard';
                            }
                            break;

                        case 404: // [경로 에러] API 주소 오타 등
                            console.error("API 주소를 찾을 수 없습니다. (/api/member/me 확인 필요)");
                            break;

                        case 500: // [서버 내부 에러] 백엔드 코드 버그
                            alert("서버 시스템 오류가 발생했습니다. 관리자에게 문의하세요.");
                            break;

                        default: // 그 외 (400 Bad Request 등)
                            alert(`오류가 발생했습니다. (Code: ${status})`);
                    }
                }
            }finally{
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    const handleLogout = async () => {
    // 1. 확인창 띄우기
    const result = await Swal.fire({
        title: '로그아웃 하시겠습니까?',
        text: "안전하게 로그아웃 후 로그인 페이지로 이동합니다.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd', // Tudio 메인 블루
        cancelButtonColor: '#6e7881',
        confirmButtonText: '로그아웃',
        cancelButtonText: '취소',
        reverseButtons: true // 확인/취소 버튼 위치 반전 (선택 사항)
    });

    // 2. 사용자가 '로그아웃'을 클릭했을 때만 실행
    if (result.isConfirmed) {
        try {
            await axios.post('/api/member/logout');
            
            // 3. 성공 알림 (잠시 보여줬다가 이동)
            await Swal.fire({
                icon: 'success',
                title: '로그아웃 완료',
                text: '로그인 페이지로 이동합니다.',
                timer: 1500,
                showConfirmButton: false
            });

            // 4. 리다이렉트 로직
            const isDev = window.location.hostname === 'localhost';
            if (isDev) {
                window.location.href = 'http://localhost:8060/tudio/login';
            } else {
                window.location.href = '/tudio/login';
            }
        } catch (error) {
            console.warn("로그아웃 중 서버 에러", error);
            Swal.fire('오류', '로그아웃 처리 중 문제가 발생했습니다.', 'error');
        }
    }
};

    if (loading) return null;
    if (!userInfo) return null;

    return (
        <header>
            {/* fixed-top 클래스가 있어서 상단에 고정됩니다 */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top tudio-header border-bottom border-secondary">
                <div className="container-fluid px-4">
                    {/* 로고 클릭 시 /admin 홈으로 이동 */}
                    <Link className="navbar-brand tudio-brand" to="/admin">
                        <span className="text-primary">Tudio</span>
                        {/* style 속성은 객체(Object) 형태로 넣어야 합니다 */}
                    </Link>

                    <div className="d-flex align-items-center ms-auto">
                        <div className="text-white small me-3 opacity-75 d-flex align-items-center">
                            <div 
                                className="d-flex justify-content-center align-items-center rounded-circle me-2 bg-primary text-white fw-bold shadow-sm"
                                style={{ width: '32px', height: '32px', fontSize: '14px', letterSpacing: '-1px' }}
                            >
                                {userInfo.memberName ? userInfo.memberName.charAt(0) : 'A'}
                            </div>

                            <span>
                                {userInfo.memberName}({userInfo.memberId})
                            </span>
                        </div>

                        <button className="btn btn-header-outline btn-sm" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;