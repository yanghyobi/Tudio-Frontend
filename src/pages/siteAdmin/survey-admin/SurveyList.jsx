import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Recharts
import { 
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer 
} from 'recharts';
import './Survey.css';
import '../../../assets/css/admin/pages/AdminCommon.css';

const SurveyList = () => {
    const [surveys, setSurveys] = useState([]); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // [Real Data State] 통계 데이터 상태 관리
    const [dashboardData, setDashboardData] = useState({
        totalParticipants: 0,
        todayIncrease: 0,
        totalMembers: 1, 
        weeklyTrend: [],
        participationData: [],
        participationRate: 0
    });

    useEffect(() => {
        fetchList();
        fetchDashboardStats(); 
    }, []);

    // 1. 목록 조회
    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/tudio/admin/survey/list');
            console.log("목록 데이터 확인:", res.data); // ★ 데이터 확인용 로그
            
            if (res.data && Array.isArray(res.data)) setSurveys(res.data);
            else setSurveys([]);
        } catch (err) {
            console.error("목록 로드 실패:", err);
            setSurveys([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. 대시보드 통계 조회
    const fetchDashboardStats = async () => {
        try {
            const res = await axios.get('/tudio/admin/survey/dashboard');
            console.log("통계 데이터 확인:", res.data); // ★ 데이터 확인용 로그
            
            if(!res.data || !res.data.basic) return;

            const { basic, weekly } = res.data;

            // ★ [안전 처리] DB 키값이 대문자일수도, 소문자일수도 있어서 둘 다 체크
            const totalPart = Number(basic.TOTAL_PARTICIPATION_COUNT || basic.total_participation_count || basic.totalParticipationCount || 0);
            const todayPart = Number(basic.TODAY_PARTICIPATION_COUNT || basic.today_participation_count || basic.todayParticipationCount || 0);
            const totalMem = Number(basic.TOTAL_MEMBER_COUNT || basic.total_member_count || basic.totalMemberCount || 1);

            // 주간 데이터 가공
            const trendData = (weekly || []).map(w => ({
                name: w.LABEL || w.label, 
                count: Number(w.COUNT || w.count || 0)
            }));

            // Pie Chart용 데이터 생성
            const notParticipated = totalMem - totalPart;
            const pieData = [
                { name: '참여 완료', value: totalPart },
                { name: '미참여', value: notParticipated < 0 ? 0 : notParticipated },
            ];

            setDashboardData({
                totalParticipants: totalPart,
                todayIncrease: todayPart,
                totalMembers: totalMem,
                weeklyTrend: trendData,
                participationData: pieData,
                participationRate: totalMem === 0 ? 0 : ((totalPart / totalMem) * 100).toFixed(1)
            });

        } catch (err) {
            console.error("통계 로드 실패:", err);
        }
    };

    const COLORS = ['#3182CE', '#E2E8F0'];

    return (
        <div className="admin-content-wrapper survey-scope">
            
            {/* 1. 타이틀 */}
            <div className="admin-title-row">
                <h2 className="admin-page-title">
                    <i className="bi bi-clipboard-data"></i>
                    설문 관리
                </h2>
            </div>

            {/* 2. 대시보드 그리드 */}
            <div className="admin-dashboard-grid">
                
                {/* 카드 1: 누적 참여자 */}
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <i className="bi bi-people-fill"></i> 누적 참여자 수
                    </div>
                    <div className="stat-value-row">
                        <span className="stat-value-big">{dashboardData.totalParticipants}</span>
                        <span className="stat-badge success">▲ {dashboardData.todayIncrease} today</span>
                    </div>
                    <p className="stat-desc">
                        전체 대비 참여율 <strong>{dashboardData.participationRate}%</strong>
                    </p>
                </div>

                {/* 카드 2: 주간 추이 */}
                <div className="admin-stat-card">
                    <div className="stat-header">
                        📈 최근 1달 주간 추이
                    </div>
                    <div style={{ width: '100%', height: '160px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData.weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#3182CE" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: '#3182CE', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 카드 3: 참여율 */}
                <div className="admin-stat-card" style={{ alignItems: 'center' }}>
                    <div className="stat-header" style={{ width: '100%' }}>
                        📊 전체 참여율
                    </div>
                    <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboardData.participationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {dashboardData.participationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', fontSize: '12px', color: '#718096' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3182CE' }}>{dashboardData.participationRate}%</div>
                            <div>참여</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 등록 버튼 & 목록 테이블 */}
            
            <div className="summary-container mb-4" style={{ display: 'block', minHeight: 'auto' }}>
                 <div className="d-flex justify-content-end align-items-center">
                    <button onClick={() => navigate('/admin/survey/SurveyForm')} className="btn-create-list">
                        <i className="bi bi-plus-lg"></i> 새 설문 등록
                    </button>
                 </div>
            </div>

            <div className="admin-common-box">
                <div style={{ padding: '20px' }}>
                    <h4 style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', margin:0}}>
                        <i className="bi bi-list-check me-2"></i>설문 목록
                    </h4>
                    
                    {loading ? (
                        <div className="text-center py-5">데이터를 불러오는 중입니다...</div>
                    ) : (
                        <table className="survey-table" style={{marginTop:'20px'}}>
                            <thead>
                                <tr>
                                    <th style={{width:'60px'}}>No</th>
                                    <th>제목</th>
                                    <th style={{width:'280px'}}>기간</th>
                                    <th style={{width:'100px'}}>상태</th>
                                    <th style={{width:'180px'}}>기능</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surveys && surveys.length > 0 ? (
                                    surveys.map((item, idx) => (
                                        <tr key={item.SURVEY_NO || idx} className="hover:bg-gray-50">
                                            <td className="text-center">{idx + 1}</td>
                                            
                                            {/* 제목 */}
                                            <td 
                                                className="survey-link"
                                                onClick={() => navigate('/admin/survey/SurveyForm', { state: { survey: item } })}
                                            >
                                                {item.SURVEY_TITLE || item.surveyTitle}
                                            </td>

                                            {/* 기간 */}
                                            <td className="text-center text-muted small">
                                                {item.SURVEY_START_DATE || item.surveyStartDate} ~ 
                                                {(item.SURVEY_CLOSE_STATUS === 'N' || item.surveyCloseStatus === 'N') ? (
                                                    <span className="text-primary ms-1 fw-bold">(진행중)</span>
                                                ) : (
                                                    <span className="text-danger ms-1 fw-bold">(마감)</span>
                                                )}
                                            </td>

                                            {/* 상태 */}
                                            <td className="text-center">
                                                {(item.SURVEY_CLOSE_STATUS === 'N' || item.surveyCloseStatus === 'N') ? (
                                                    <span className="survey-badge status-running" style={{whiteSpace: 'nowrap'}}>진행중</span>
                                                ) : (
                                                    <span className="survey-badge status-closed" style={{whiteSpace: 'nowrap'}}>마감</span>
                                                )}
                                            </td>

                                            {/* 버튼 */}
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/admin/survey/SurveyForm', { state: { survey: item } });
                                                        }}
                                                        className="btn btn-sm btn-outline-secondary fw-bold"
                                                        style={{borderRadius: '6px'}}
                                                    >
                                                        <i className="bi bi-gear-fill me-1"></i> 관리
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/survey/SurveyResult?surveyNo=${item.SURVEY_NO || item.surveyNo}`);
                                                        }}
                                                        className="btn btn-sm btn-outline-primary fw-bold"
                                                        style={{borderRadius: '6px'}}
                                                    >
                                                        <i className="bi bi-bar-chart-fill me-1"></i> 결과
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-5 text-muted">
                                            등록된 설문이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SurveyList;