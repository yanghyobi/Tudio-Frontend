import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import Swal from 'sweetalert2';
import "react-datepicker/dist/react-datepicker.css";
// CSS 임포트
import './MeetingRoomAdmin.css'; // 회의실 전용 (캘린더, 필터버튼 등)
import '../../../assets/css/admin/pages/AdminCommon.css'; // 공통 스타일

import { ko } from 'date-fns/locale';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

registerLocale('ko', ko);

const MeetingRoomList = () => {

  // --- State 관리 ---
  const [branches, setBranches] = useState([]);               // 지점 목록
  const [selectedBranch, setSelectedBranch] = useState(null); // 선택된 지점 ID
  const [rooms, setRooms] = useState([]);                     // 회의실 목록
  const [loading, setLoading] = useState(false);              // 로딩

  const [expandedRoomId, setExpandedRoomId] = useState(null); // 토글 열린 방 ID
  const [currentDate, setCurrentDate] = useState(new Date()); // 기준 날짜
  const [weekSchedule, setWeekSchedule] = useState([]);       // 스케줄 데이터
  const [selectedSlots, setSelectedSlots] = useState([]);     // 다중 선택 슬롯

  // 통계용 State
  const [roomStats, setRoomStats] = useState({
      totalRooms: 0,
      activeRooms: 0,
      maintenanceCount: 0, // 점검 중
      popularTimeData: []  // 시간대별 혼잡도 차트용
  });

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { 
      if (selectedBranch) {
          fetchRooms(selectedBranch);
          fetchRoomStatistics(selectedBranch);
      }
  }, [selectedBranch]);

  // --- API 호출 함수들 ---
  const fetchBranches = async () => {
    try {
      const res = await axios.get('http://localhost:8060/admin/meetingRoom/branchList');
      setBranches(res.data);
      if (res.data.length > 0) setSelectedBranch(res.data[0].branchId);
    } catch (e) { console.error("지점 로드 실패", e); }
  };

  const fetchRooms = async (branchId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8060/admin/meetingRoom/meetingRoomList?branchId=${branchId}`);
      setRooms(res.data);
      setExpandedRoomId(null);
      const total = res.data.length;
      const active = res.data.filter(r => r.roomStatus === 'Y').length;
      // roomStats 업데이트는 fetchRoomStatistics에서 일괄 처리 권장하지만, 일단 유지
    } catch (e) { console.error("회의실 로드 실패", e); } finally { setLoading(false); }
  };

  const fetchRoomStatistics = async (branchId) => {
      try {
          const roomRes = await axios.get(`http://localhost:8060/admin/meetingRoom/meetingRoomList?branchId=${branchId}`);
          const currentRooms = roomRes.data;
          const currentRoomIds = currentRooms.map(r => r.roomId);

          const resRes = await axios.get('http://localhost:8060/admin/meetingRoom/reservationList');
          const allReservations = resRes.data;

          let maintCount = 0;
          const timeCounts = { 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0 };

          allReservations.forEach(r => {
              if (currentRoomIds.includes(r.roomId)) {
                  if (r.resType === 'B' && (r.resStatus === 702 || r.resStatus === 704)) {
                      maintCount++;
                  }
                  if (r.resStatus !== 703 && r.resStatus !== 706) { 
                      const startH = parseInt(r.resStartdate.substring(11, 13));
                      const endH = parseInt(r.resEnddate.substring(11, 13));
                      for (let h = startH; h < endH; h++) {
                          if (timeCounts[h] !== undefined) timeCounts[h]++;
                      }
                  }
              }
          });

          const chartData = Object.keys(timeCounts).map(h => ({
              name: `${h}시`,
              count: timeCounts[h]
          }));

          setRoomStats({
              totalRooms: currentRooms.length,
              activeRooms: currentRooms.filter(r => r.roomStatus === 'Y').length,
              maintenanceCount: maintCount,
              popularTimeData: chartData 
          });

      } catch (e) { console.error("통계 로드 실패", e); }
  };

  const fetchWeekSchedule = async (roomId, date) => {
    const day = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];

    try {
      const res = await axios.get(`http://localhost:8060/admin/meetingRoom/weekSchedule`, {
        params: { roomId, startDate: sStr, endDate: eStr }
      });
      setWeekSchedule(res.data);
    } catch (e) { console.error("스케줄 로드 실패", e); }
  };

  useEffect(() => {
    if (expandedRoomId) {
      fetchWeekSchedule(expandedRoomId, currentDate);
      setSelectedSlots([]);
    }
  }, [expandedRoomId, currentDate]);

  // --- 이벤트 핸들러 ---
  const handleAdminCancel = async (reservationId, currentMemberName) => {
    const { value: reason } = await Swal.fire({
      title: '🔒 관리자 점검 전환',
      html: `현재 예약자: <b>${currentMemberName}</b><br>이 예약을 <span style="color:red">관리자 점검</span>으로 변경하시겠습니까?`,
      input: 'text', inputLabel: '변경 사유 (필수)', inputPlaceholder: '예: 긴급 시설 점검',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: '변경 확정', cancelButtonText: '취소',
      inputValidator: (value) => { if (!value) return '사유를 입력해야 합니다!'; }
    });

    if (!reason) return;

    try {
      await axios.post('http://localhost:8060/admin/meetingRoom/updateStatus', {
        reservationId: reservationId, memberNo: 12, projectNo: 0, resMeetingTitle: "회의실 점검중", 
        resStatus: 704, resType: 'B', resUpdmember: 12, resContent: reason 
      });
      Swal.fire('완료', '예약이 취소 처리되었습니다.', 'success');
      fetchWeekSchedule(expandedRoomId, currentDate);
      fetchRoomStatistics(selectedBranch);
    } catch (e) { Swal.fire('오류', '취소 처리에 실패했습니다.', 'error'); }
  };

  const handleBlockSelectedSlots = async () => {
    if (selectedSlots.length === 0) return;
    const { value: reason } = await Swal.fire({
      title: '🔒 예약 불가 설정', input: 'text',
      inputLabel: `선택한 ${selectedSlots.length}개의 시간을 막으시겠습니까?`,
      inputPlaceholder: '사유 입력 (예: 시설 점검)', showCancelButton: true,
      confirmButtonText: '설정', cancelButtonText: '취소',
      inputValidator: (value) => { if (!value) return '사유를 입력해야 합니다!'; }
    });

    if (!reason) return;

    try {
      const promises = selectedSlots.map(slot => {
        const startTimeStr = String(slot.hour).padStart(2, '0');
        const endTimeStr = String(slot.hour + 1).padStart(2, '0');
        return axios.post('http://localhost:8060/admin/meetingRoom/block', {
          roomId: expandedRoomId, memberNo: 12, projectNo: 0, 
          resMeetingTitle: "[관리자 점검]", resContent: reason,
          resStatus: 704, resType: 'B', 
          resStartdate: `${slot.date}T${startTimeStr}:00:00`,
          resEnddate: `${slot.date}T${endTimeStr}:00:00`
        });
      });
      await Promise.all(promises);
      Swal.fire('완료', '선택한 시간이 차단되었습니다.', 'success');
      setSelectedSlots([]); 
      fetchWeekSchedule(expandedRoomId, currentDate);
      fetchRoomStatistics(selectedBranch);
    } catch (e) { Swal.fire('오류', '처리 실패', 'error'); }
  };

  const handleSlotClick = (dateStr, hour) => {
    const bookedItem = weekSchedule.find(item => {
      const itemDate = typeof item.RES_DATE === 'string' ? item.RES_DATE.split(' ')[0] : '';
      if (itemDate !== dateStr) return false;
      const startH = parseInt(item.START_TIME.split(':')[0], 10);
      const endH = parseInt(item.END_TIME.split(':')[0], 10);
      return hour >= startH && hour < endH;
    });

    if (bookedItem) {
        const resId = bookedItem.RESERVATION_ID; 
        const memberName = bookedItem.MEMBER_NAME || '사용자'; 
        handleAdminCancel(resId, memberName);
        return; 
    }
    toggleSlotSelection(dateStr, hour);
  };

  const formatWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); 
    const end = new Date(start);
    end.setDate(start.getDate() + 6); 
    const format = (d) => {
      const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };
    return `${format(start)} (일) ~ ${format(end)} (토)`;
  };

  const moveWeek = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (dir * 7));
    setCurrentDate(newDate);
  };

  const toggleRoom = (roomId) => {
    if (expandedRoomId === roomId) { setExpandedRoomId(null); setSelectedSlots([]); }
    else { setExpandedRoomId(roomId); }
  };

  const toggleSlotSelection = (dateStr, hour) => {
    const exists = selectedSlots.find(s => s.date === dateStr && s.hour === hour);
    if (exists) setSelectedSlots(prev => prev.filter(s => !(s.date === dateStr && s.hour === hour)));
    else setSelectedSlots(prev => [...prev, { date: dateStr, hour }]);
  };

  const currentBranchName = branches.find(b => b.branchId === selectedBranch)?.branchName || '지점';

  return (
    // ★ 1. 공통 래퍼 클래스 적용
    <div className="admin-content-wrapper meeting-room-scope">
        
        {/* ★ 2. 공통 타이틀 영역 */}
        <div className="admin-title-row">
            <h2 className="admin-page-title">
                <i className="bi bi-gear"></i>
                회의실 관리
            </h2>
        </div>

        {/* --- [1] 통계 대시보드 (admin-dashboard-grid 사용) --- */}
        <div className="admin-dashboard-grid">
            
            {/* 1. 총 회의실 */}
            <div className="admin-stat-card">
                <div className="stat-header">
                    <i className="bi bi-building text-primary-custom"></i> 총 회의실
                </div>
                <div className="stat-value-row">
                    <span className="stat-value-big text-primary-custom">{roomStats.totalRooms}</span>
                    <span className="text-muted small">개실</span>
                </div>
                <p className="stat-desc">{currentBranchName} 전체 회의실</p>
            </div>

            {/* 2. 점검 중 */}
            <div className="admin-stat-card">
                <div className="stat-header">
                    <i className="bi bi-tools text-danger-custom"></i> 점검/관리 중
                </div>
                <div className="stat-value-row">
                    <span className="stat-value-big text-danger-custom">{roomStats.maintenanceCount}</span>
                    <span className="text-muted small">건</span>
                </div>
                <p className="stat-desc">현재 관리자가 차단한 예약</p>
            </div>

            {/* 3. 차트 (혼잡도) */}
            <div className="admin-stat-card">
                <div className="stat-header">
                    <i className="bi bi-graph-up"></i> 시간대별 예약 분포
                </div>
                <div style={{ width: '100%', height: 100 }}>
                    <ResponsiveContainer>
                        <BarChart data={roomStats.popularTimeData}>
                            <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}
                            />
                            <Bar dataKey="count" fill="#4dabf7" radius={[4, 4, 4, 4]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>


        {/* --- [2] 지점 탭 & 테이블 --- */}
        
        {/* 지점 선택 탭 */}
        <div className="filter-tabs">
            {branches.map(b => (
                <button
                    key={b.branchId}
                    className={`filter-btn ${selectedBranch === b.branchId ? 'active' : ''}`}
                    onClick={() => setSelectedBranch(b.branchId)}
                >
                    {b.branchName}
                </button>
            ))}
        </div>

        {/* 테이블 (공통 박스 적용) */}
        <div className="admin-common-box">
            <div style={{ padding: '20px' }}>
                <h4 style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', margin:0}}>
                    <i className="bi bi-building me-2"></i>{currentBranchName} 회의실 목록
                </h4>
            
                <div className="res-table-wrapper" style={{border:'none', boxShadow:'none', padding:0}}>
                    <table className="res-table" style={{marginTop:'20px'}}>
                        <thead>
                            <tr>
                                <th className="ps-4" style={{width:'60px'}}>No</th>
                                <th>회의실명</th>
                                <th>수용인원</th>
                                <th>상태</th>
                                <th className="text-center" style={{width:'80px'}}>스케줄</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-4">등록된 회의실이 없습니다.</td></tr>
                            ) : rooms.map((room, idx) => (
                            <React.Fragment key={room.roomId}>
                                {/* 회의실 행 */}
                                <tr 
                                    onClick={() => toggleRoom(room.roomId)} 
                                    style={{ cursor: 'pointer' }} 
                                    className={expandedRoomId === room.roomId ? 'table-active' : ''}
                                >
                                    <td className="ps-4">{idx + 1}</td>
                                    <td><span className="fw-bold">{room.roomName}</span></td>
                                    <td><span className="badge bg-light text-dark border">{room.roomCapacity}명</span></td>
                                    <td>
                                        {room.roomStatus === 'Y' 
                                            ? <span className="status-badge status-702">운영중</span> 
                                            : <span className="status-badge status-704">중단</span>}
                                    </td>
                                    <td className="text-center">
                                        <i className={`bi bi-chevron-${expandedRoomId === room.roomId ? 'up' : 'down'}`}></i>
                                    </td>
                                </tr>

                                {/* 스케줄러 확장 영역 */}
                                {expandedRoomId === room.roomId && (
                                    <tr>
                                        <td colSpan="5" style={{padding: '0', borderBottom: '1px solid #dee2e6'}}>
                                            <div style={{padding: '20px', backgroundColor: '#f8f9fa'}}>
                                                <div className="schedule-container" style={{marginBottom:0}}>
                                                
                                                    {/* 달력 컨트롤러 */}
                                                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 border-bottom">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={() => moveWeek(-1)}>
                                                                <i className="bi bi-chevron-left"></i>
                                                            </button>
                                                            <div className="custom-datepicker-wrapper">
                                                                <DatePicker
                                                                    selected={currentDate}
                                                                    onChange={(date) => setCurrentDate(date)}
                                                                    locale="ko"
                                                                    dateFormat="yyyy.MM.dd"
                                                                    popperPlacement="bottom-start"
                                                                    customInput={
                                                                        <button className="btn btn-light fw-bold border" style={{minWidth: '240px'}}>
                                                                            <i className="bi bi-calendar-check me-2 text-primary"></i>
                                                                            {formatWeekRange(currentDate)}
                                                                        </button>
                                                                    }
                                                                />
                                                            </div>
                                                            <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={() => moveWeek(1)}>
                                                                <i className="bi bi-chevron-right"></i>
                                                            </button>
                                                        </div>

                                                        {selectedSlots.length > 0 && (
                                                            <button className="btn btn-danger btn-sm fw-bold animate__animated animate__fadeIn" onClick={handleBlockSelectedSlots}>
                                                                <i className="bi bi-slash-circle me-1"></i> {selectedSlots.length}건 예약 막기
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* 주간 시간표 그리드 */}
                                                    <div className="week-grid">
                                                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => {
                                                            const d = new Date(currentDate);
                                                            d.setDate(currentDate.getDate() - currentDate.getDay() + i);
                                                            const dateStr = d.toISOString().split('T')[0];

                                                            return (
                                                                <div key={i} className="day-column">
                                                                    <div className={`day-header ${i === 0 ? 'text-danger' : i === 6 ? 'text-primary' : ''}`}>
                                                                        {day} ({d.getDate()})
                                                                    </div>
                                                                    <div className="time-slots">
                                                                        {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => {
                                                                            const bookedItem = weekSchedule.find(item => {
                                                                                const itemDate = typeof item.RES_DATE === 'string' ? item.RES_DATE.split(' ')[0] : '';
                                                                                if (itemDate !== dateStr) return false;
                                                                                const startH = parseInt(item.START_TIME.split(':')[0], 10);
                                                                                const endH = parseInt(item.END_TIME.split(':')[0], 10);
                                                                                return hour >= startH && hour < endH;
                                                                            });

                                                                            const isSelected = selectedSlots.some(s => s.date === dateStr && s.hour === hour);
                                                                            let label = "예약됨";
                                                                            let labelClass = "booked-label";

                                                                            if (bookedItem) {
                                                                                if (bookedItem.RES_TYPE === 'B') {
                                                                                    label = "관리자점검"; 
                                                                                    labelClass = "booked-label admin"; 
                                                                                } else {
                                                                                    label = "사용자예약"; 
                                                                                    labelClass = "booked-label user";
                                                                                }
                                                                            }

                                                                            return (
                                                                                <div
        key={hour}
        className={`time-slot ${bookedItem ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSlotClick(dateStr, hour)}
      >
        {/* 1. 시간 및 라벨 표시 */}
        <div className="slot-content">
          <span className="slot-time">{hour}:00</span>
          {bookedItem && <span className={labelClass}>{label}</span>}
        </div>

        {/* 2. 상세 내역 툴팁 (hover 시에만 노출) */}
        {bookedItem && (
          <div className="custom-tooltip">
            <div className="tooltip-header">
              <i className="bi bi-info-circle me-1"></i> 예약 상세 정보
            </div>
            <div className="tooltip-body">
              <div className="tooltip-row">
                <span className="tooltip-label">회의실</span>
                <span className="tooltip-value">{bookedItem.ROOM_NAME}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">시간</span>
                <span className="tooltip-value">{bookedItem.START_TIME} ~ {bookedItem.END_TIME}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">예약자</span>
                <span className="tooltip-value">{bookedItem.MEMBER_NAME || '정보 없음'}</span>
              </div>
              <div className="tooltip-divider"></div>
              <div className="tooltip-content-text">
                {bookedItem.RES_CONTENT || bookedItem.RES_MEETING_TITLE || '내용이 없습니다.'}
              </div>
            </div>
          </div>
        )}
      </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    <div className="p-2 text-end text-muted small border-top">
                                                        <span className="me-3"><i className="bi bi-square-fill text-white border me-1"></i>가능</span>
                                                        <span className="me-3"><i className="bi bi-square-fill text-primary opacity-50 me-1"></i>선택됨</span>
                                                        <span><i className="bi bi-square-fill text-secondary opacity-25 me-1"></i>불가(클릭하여 관리)</span>
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
    </div>
  );
};

export default MeetingRoomList;