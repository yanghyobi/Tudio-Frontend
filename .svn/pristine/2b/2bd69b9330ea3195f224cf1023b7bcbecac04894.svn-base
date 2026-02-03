import React from 'react';
import './Pagination.css';

/**
 * [공통 페이징 컴포넌트]
 * 
 * @param {Object} pagepageInfo - pagepageInfo 객체
 * @param {Function} onPageChange - 페이지 이동 함수(URL 변경용)
 */

const Pagination = ({pageInfo, onPageChange}) => {

    // 데이터가 없거나 로딩 전이면 아무것도 그리지 않음
    if(!pageInfo || pageInfo.totalRecordCount === 0){
        return null;
    }

    const { startPage, endPage, currentPage, totalPage } = pageInfo;

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className='pagination-area'>
            {startPage > 1 && (
                <button onClick={() => onPageChange(startPage - 1)} className='pg-btn prev'>
                    &lt; 이전
                </button>
            )}

            {pages.map((pageNum) => (
                <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`pg-btn ${currentPage === pageNum ? 'active' : ''}`}>
                    {pageNum}
                </button>
            ))}

            {endPage < totalPage && (
                <button  onClick={() => onPageChange(endPage + 1)} className='pg-btn next'>
                    다음 &gt;
                </button>
            )}
        </div>
    );
};

export default Pagination;