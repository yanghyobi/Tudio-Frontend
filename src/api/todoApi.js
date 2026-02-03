import axios from 'axios';

// API 기본 경로 (package.json proxy 설정에 따라 조정)
const BASE_URL = '/tudio/todo';

// 목록 조회
export const getTodoList = async (memberNo, projectNo) => {
    try {
        const response = await axios.get(`${BASE_URL}/list`, {
            params: { memberNo, projectNo }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching todos:", error);
        return [];
    }
};

// 등록
export const registerTodo = async (todoData) => {
    // todoData: { memberNo, projectNo, todoContent, todoStrdate, todoEnddate }
    const response = await axios.post(`${BASE_URL}/insert`, todoData);
    return response.data; // "OK" 반환 예상
};

// 상태 변경 (완료/미완료)
export const updateTodoStatus = async (todoNo, currentStatus) => {
    const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
    const response = await axios.post(`${BASE_URL}/updateStatus`, {
        todoNo,
        todoStatus: newStatus
    });
    return response.data;
};

// 내용 수정
export const updateTodoContent = async (todoNo, content) => {
    const response = await axios.post(`${BASE_URL}/updateContent`, {
        todoNo,
        todoContent: content
    });
    return response.data;
};

// 삭제
export const deleteTodo = async (todoNo) => {
    const response = await axios.post(`${BASE_URL}/delete`, { todoNo });
    return response.data;
};