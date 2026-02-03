import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SiteMain from "./pages/siteAdmin/SiteMain.jsx";

// [페이지 컴포넌트 import]
import UserList from "./pages/siteAdmin/user/UserList.jsx";
import BoardNotice from "./pages/siteAdmin/board/BoardNotice.jsx";
import BoardFaq from "./pages/siteAdmin/board/BoardFaq.jsx";
import BoardInquiry from "./pages/siteAdmin/board/BoardInquiry.jsx";
import SurveyList from "./pages/siteAdmin/survey-admin/SurveyList.jsx";
import SurveyForm from "./pages/siteAdmin/survey-admin/SurveyForm.jsx";
import SurveyResult from "./pages/siteAdmin/survey-admin/SurveyResult.jsx";
import LogLogin from "./pages/siteAdmin/log/LogLogin.jsx";
import LogError from "./pages/siteAdmin/log/LogError.jsx";
import LogAction from "./pages/siteAdmin/log/LogAction.jsx";
import LogBatch from "./pages/siteAdmin/log/LogBatch.jsx";
import PolicyTerms from "./pages/siteAdmin/policy/PolicyTerms.jsx";
import MeetingRoomList from "./pages/siteAdmin/meetingRoom/MeetingRoomList.jsx";
import MeetingReservationAdmin from "./pages/siteAdmin/meetingRoom/MeetingReservationAdmin.jsx";
import Project from "./pages/siteAdmin/project/Project.jsx";

import VideoMeetingRoom from "./pages/videoChat/VideoMeetingRoom.jsx";

import axios from 'axios';

axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 화상미팅 룸 라우터 */}
        <Route path="/video/room/:roomId" element={<VideoMeetingRoom />} />

        {/* /admin 경로로 들어오면 SiteMain 레이아웃을 보여줌 */}
        <Route path="/admin" element={<SiteMain />}>
          
          {/* 초기 화면 설정 (initUrl 대응) */}
          <Route index element={<Navigate to="/admin/user/list" replace />} />

          {/* 페이지 라우팅 */}
          {/* 회원 관리 */}
          <Route path="user/list" element={<UserList />} />

          {/* 게시판 관리 */}
          <Route path="board/notice" element={<BoardNotice />} />
          <Route path="board/faq" element={<BoardFaq />} />
          <Route path="board/inquiry" element={<BoardInquiry />} />
          <Route path="/admin/board/inquiry/:inquiryNo" element={<BoardInquiry />} />

          {/* 설문 관리 */}
          <Route path="survey/SurveyList" element={<SurveyList />} /> {/* 목록 */}
          <Route path="survey/SurveyForm" element={<SurveyForm />} /> {/* 등록/수정 */}
          <Route path="survey/SurveyResult" element={<SurveyResult />} /> {/* 결과 */}

          {/* 로그 관리 */}
          <Route path="log/login" element={<LogLogin />} />
          <Route path="log/error" element={<LogError />} />
          <Route path="log/action" element={<LogAction />} />
          <Route path="log/batch" element={<LogBatch />} />

          {/* 정책 관리 */}
          <Route path="policy/terms" element={<PolicyTerms />} />

          {/* 회의실 관리 */}
          <Route path="meetingRoom/meetingRoomList" element={<MeetingRoomList />} />
          <Route path="meetingRoom/MeetingReservationAdmin" element={<MeetingReservationAdmin />} />

          {/* 정책관리 */}
          <Route path="project/Project" element={<Project />} />  {/* 프로젝트 관리 */}


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;