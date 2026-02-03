import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Footer from "./Footer.jsx";
import '../../assets/css/admin/layout.css';

const LoadingSpinner = () => (
  <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
      </div>
  </div>
);

const SiteMain = () => {
  return (
    <div className="admin-mode">
      <Header />

      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <Sidebar />
        <main className="main-content-wrap flex-grow-1 d-flex flex-column">
          
          <div id="dynamic-content" className="d-flex flex-column flex-grow-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </div>
          
          <Footer /> 
        </main>
      </div>
    </div>
  );
};

export default SiteMain;