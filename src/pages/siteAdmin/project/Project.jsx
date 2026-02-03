import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie 
} from 'recharts';
// ★ 공통 CSS 및 테이블 스타일
import '../../../assets/css/admin/pages/AdminCommon.css'; 
import '../survey-admin/Survey.css';

const Project = () => {
  // 1. [상태 관리] 유형 필터 및 리스트 확장
  const [selectedType, setSelectedType] = useState('ALL'); 
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // 2. [데이터] 프로젝트 유형
  const projectTypes = [
    { id: 'ALL', name: '전체' },
    { id: 'IT', name: 'IT' }, { id: 'MKT', name: '마케팅' }, { id: 'ENT', name: '엔터테인먼트' },
    { id: 'CONST', name: '건설' }, { id: 'SEC', name: '증권' }, { id: 'EDU', name: '학교' },
    { id: 'DES', name: '디자인' }, { id: 'RND', name: '연구' }, { id: 'MFG', name: '제조&생산' },
    { id: 'FNB', name: 'F&B' }, { id: 'ETC', name: '기타' },
  ];

  // 3. [통계 데이터]
  const platformStats = {
    totalProjects: 128,        // 전체 누적: 128개 (초기 운영 단계)
    activeProjects: 42,        // 활성 프로젝트: 42개
    avgMembers: 5.2,           // 평균 팀원: 소규모 팀 위주
    status: { 
        running: 42,           // 진행중
        completed: 78,         // 완료됨
        stopped: 8             // 중단됨 (적은 수치)
    },
    quarterlyGrowth: [
        { name: '24.1Q', created: 12, active: 8 },   // 서비스 오픈 초기
        { name: '24.2Q', created: 28, active: 15 },
        { name: '24.3Q', created: 55, active: 28 },
        { name: '24.4Q', created: 89, active: 35 },
        { name: '25.1Q', created: 128, active: 42 }, // 현재
    ],
    // [Pie Chart용 데이터]
    typeDistribution: [
      { name: 'IT', count: 50 },
      { name: '마케팅', count: 30 },
      { name: '엔터', count: 18 },
      { name: '제조', count: 12 },
      { name: '건설', count: 8 },
      { name: '교육', count: 8 },
      { name: '기타', count: 2 },
    ]
  };

  // 4. [리스트 데이터]
  const projects = [
    {
    id: 201,
    name: "올리브영 온라인몰 유지보수",
    team: "CJ올리브영",
    type: "IT",
    status: "running",
    members: 9,
    progress: 72
  },
  {
    id: 202,
    name: "대형 프랜차이즈 주문 시스템 개선",
    team: "패밀리레스토랑 본사",
    type: "FNB",
    status: "completed",
    members: 7,
    progress: 100
  },
  {
    id: 203,
    name: "금융사 내부 업무 포털 개편",
    team: "미래증권",
    type: "SEC",
    status: "running",
    members: 14,
    progress: 48
  },
  {
    id: 204,
    name: "이벤트 페이지 필터 기능 고도화",
    team: "외주 클라이언트 A사",
    type: "MKT",
    status: "running",
    members: 6,
    progress: 85
  },
  {
    id: 205,
    name: "교육기관 LMS 유지보수",
    team: "국내 대학 B",
    type: "EDU",
    status: "stopped",
    members: 5,
    progress: 25
  },
{
      id: 1001,
      name: "차세대 글로벌 ERP 시스템 구축",
      team: "LG CNS / 솔루션사업부",
      type: "IT",
      status: "running",
      members: 45,
      progress: 32
    },
    {
      id: 1002,
      name: "2026 S/S 시즌 브랜드 리브랜딩 캠페인",
      team: "제일기획 / 크리에이티브 2팀",
      type: "MKT",
      status: "running",
      members: 12,
      progress: 68
    },
    {
      id: 1003,
      name: "친환경 전기차 배터리 패키징 공정 개선",
      team: "SK온 / 생산기술팀",
      type: "MFG",
      status: "completed",
      members: 28,
      progress: 100
    },
    {
      id: 1004,
      name: "마이데이터 기반 자산관리 앱 고도화",
      team: "KB국민은행 / DT본부",
      type: "SEC",
      status: "running",
      members: 18,
      progress: 88
    },
    {
      id: 1005,
      name: "신도시 랜드마크 복합문화공간 설계",
      team: "현대건설 / 건축설계팀",
      type: "CONST",
      status: "stopped", // 중단된 현실적인 케이스
      members: 15,
      progress: 45
    },
    {
      id: 1006,
      name: "AI 기반 학습자 맞춤형 튜터링 봇 개발",
      team: "뤼이드 / AI 리서치팀",
      type: "EDU",
      status: "running",
      members: 8,
      progress: 15
    },
    {
        id: 1007,
        name: "글로벌 아이돌 팬덤 플랫폼 UI/UX 개편",
        team: "하이브 / 플랫폼기획팀",
        type: "ENT",
        status: "running",
        members: 22,
        progress: 55
      },

  ];

  const filteredProjects = selectedType === 'ALL' 
    ? projects 
    : projects.filter(p => p.type === selectedType);

  const toggleProject = (id) => {
    setExpandedProjectId(expandedProjectId === id ? null : id);
  };

  // ★ 원형 그래프용 다양한 색상 배열
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="admin-content-wrapper survey-scope">
      
      {/* 2. 타이틀 */}
      <div className="admin-title-row">
        <h2 className="admin-page-title">
            <i className="bi bi-globe"></i>
            프로젝트 관리
        </h2>
      </div>

      {/* --- [1] 상단 KPI 카드 섹션 --- */}
      <div className="admin-dashboard-grid">
          
          {/* 1. 전체 프로젝트 수 */}
          <div className="admin-stat-card">
              <div className="stat-header">
                  <i className="bi bi-collection text-primary"></i> 전체 프로젝트
              </div>
              <div className="stat-value-row">
                  <span className="stat-value-big text-primary">
                    {platformStats.totalProjects.toLocaleString()}
                  </span>
                  <span className="text-muted small">개</span>
              </div>
              <p className="stat-desc">전체 누적 생성 수</p>
          </div>

          {/* 2. 운영 현황 */}
          <div className="admin-stat-card">
              <div className="stat-header">
                  <i className="bi bi-activity text-success"></i> 운영 현황
              </div>
              <div className="d-flex flex-column gap-1 w-100 mt-2">
                  <div className="d-flex justify-content-between small">
                    <span className="fw-bold text-primary">진행중</span>
                    <span>{platformStats.status.running.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">완료됨</span>
                    <span>{platformStats.status.completed.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-danger">중단됨</span>
                    <span>{platformStats.status.stopped.toLocaleString()}</span>
                  </div>
              </div>
          </div>

          {/* 3. 평균 참여 인원 */}
          <div className="admin-stat-card">
              <div className="stat-header">
                  <i className="bi bi-people text-info"></i> 평균 참여 인원
              </div>
              <div className="stat-value-row">
                  <span className="stat-value-big text-dark">{platformStats.avgMembers}</span>
                  <span className="text-muted small">명</span>
              </div>
              <p className="stat-desc">팀 협업 활성도 지표</p>
          </div>
      </div>

      {/* --- [2] 차트 섹션 --- */}
      <div className="row mb-4" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        
        {/* 왼쪽: 분기별 성장 (Line Chart) */}
        <div className="admin-stat-card">
            <h5 className="stat-header">
                <i className="bi bi-graph-up-arrow me-2"></i>분기별 프로젝트 생성 추이
            </h5>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <LineChart data={platformStats.quarterlyGrowth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}/>
                        <Legend />
                        <Line type="monotone" dataKey="created" name="신규 생성" stroke="#4A90E2" strokeWidth={3} dot={{r:4}} />
                        <Line type="monotone" dataKey="active" name="활성 프로젝트" stroke="#82ca9d" strokeWidth={2} dot={{r:3}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 오른쪽: 유형별 분포 (★ Pie Chart로 변경됨) */}
        <div className="admin-stat-card">
            <h5 className="stat-header">
                <i className="bi bi-pie-chart me-2"></i>유형별 분포
            </h5>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={platformStats.typeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60} // 도넛 모양 (가운데 비움)
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="name"
                        >
                            {platformStats.typeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value, name) => [`${value}개`, name]}
                            contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}
                        />
                        {/* 하단 범례 추가 */}
                        <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize:'12px'}} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- [3] 프로젝트 리스트 --- */}
      
      <div className="admin-common-box">
        <div style={{ padding: '20px' }}>
            <div className="d-flex justify-content-between align-items-center pb-3">
                <h4 style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', margin:0}}>
                    <i className="bi bi-list-columns me-2"></i>실시간 이용 현황
                </h4>
            </div>

            {/* 필터 탭 */}
            <div className="d-flex gap-2 pb-3" style={{ overflowX: 'auto', whiteSpace:'nowrap' }}>
                {projectTypes.map(type => (
                <button
                    key={type.id}
                    className={`btn btn-sm ${selectedType === type.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{borderRadius: '20px', padding: '6px 16px', fontWeight:'600'}}
                    onClick={() => setSelectedType(type.id)}
                >
                    {type.name}
                </button>
                ))}
            </div>
            
            {/* 테이블 */}
            <table className="survey-table" style={{marginTop:'0'}}>
                <thead>
                <tr>
                    <th className="ps-4" style={{width:'50px'}}>No</th>
                    <th>프로젝트명</th>
                    <th>워크스페이스(팀)</th>
                    <th>타입</th>
                    <th>참여인원</th>
                    <th>상태</th>
                    <th>진행률</th>
                    <th className="text-center" style={{width:'60px'}}></th>
                </tr>
                </thead>
                <tbody>
                {filteredProjects.length === 0 ? (
                    <tr><td colSpan="8" className="text-center p-4">해당 조건의 프로젝트가 없습니다.</td></tr>
                ) : filteredProjects.map((project, idx) => (
                    <React.Fragment key={project.id}>
                    <tr 
                        onClick={() => toggleProject(project.id)} 
                        style={{ cursor: 'pointer' }} 
                        className={expandedProjectId === project.id ? 'bg-light' : ''}
                    >
                        <td className="ps-4 text-center">{idx + 1}</td>
                        <td><span className="fw-bold">{project.name}</span></td>
                        <td><span className="text-primary small fw-bold">{project.team}</span></td>
                        <td><span className="badge bg-light text-secondary border">{projectTypes.find(t=>t.id===project.type)?.name}</span></td>
                        <td className="text-center">{project.members}명</td>
                        <td className="text-center">
                        {project.status === 'running' && <span className="survey-badge status-running">진행중</span>}
                        {project.status === 'completed' && <span className="survey-badge bg-success text-white">완료</span>}
                        {project.status === 'stopped' && <span className="survey-badge status-closed">중단</span>}
                        </td>
                        <td style={{width: '150px'}}>
                            <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1" style={{height: '6px', backgroundColor:'#eee', borderRadius:'3px'}}>
                                <div className="progress-bar bg-primary" style={{width: `${project.progress}%`, borderRadius:'3px'}}></div>
                            </div>
                            <span className="small text-muted ms-2" style={{minWidth:'30px'}}>{project.progress}%</span>
                            </div>
                        </td>
                        <td className="text-center">
                        <i className={`bi bi-chevron-${expandedProjectId === project.id ? 'up' : 'down'}`}></i>
                        </td>
                    </tr>

                    {/* 상세 확장 영역 */}
                    {expandedProjectId === project.id && (
                        <tr>
                        <td colSpan="8" className="p-0 border-bottom">
                            <div className="p-4" style={{backgroundColor: '#f8f9fa'}}>
                                <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded border shadow-sm">
                                <div>
                                    <h6 className="mb-1 fw-bold text-dark">🔍 프로젝트 상세 관리</h6>
                                    <p className="mb-0 text-muted small">ID: {project.id} | 생성일: 2024.01.15</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-danger">강제 중단</button>
                                    <button className="btn btn-sm btn-outline-secondary">데이터 백업</button>
                                </div>
                                </div>
                            </div>
                        </td>
                        </tr>
                    )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Project;