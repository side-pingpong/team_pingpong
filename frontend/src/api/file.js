/**
 * [가상의 API] 파일 업로드 요청
 * @param {FormData} formData - 파일 및 메타데이터
 * @returns {object} 업로드된 파일 정보
 */
export const uploadFileApi = async (formData) => {
    // 실제 프로젝트에서는 fetch 또는 axios를 사용하여 서버에 요청하는 코드가 들어갑니다.
    await new Promise(resolve => setTimeout(resolve, 500));

    // FormData에서 파일 이름 추출 (목업용)
    const fileName = formData.get('file').name;
    const chatId = formData.get('chatId');

    console.log(`[API MOCK] File Uploaded: ${fileName} to Chat ${chatId}`);

    return {
        id: Date.now(),
        name: fileName,
        url: 'https://mock.url/' + fileName, // 임시 URL
        size: formData.get('file').size,
        timestamp: new Date(),
        type: fileName.split('.').pop()
    };
};

/**
 * [가상의 API] 파일 목록 조회 요청
 * @param {number | null} chatId - 특정 채팅방 ID. null이면 모든 채팅방 파일 조회
 * @returns {Array} 파일 목록 배열
 */
export const fetchFilesApi = async (chatId = null) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockFiles = [
        { chatId: 101, chatName: '팀프로젝트', id: 201, name: 'Report.docx', url: '#', size: 102400, timestamp: new Date(2025, 10, 10), type: 'doc' },
        { chatId: 101, chatName: '팀프로젝트', id: 202, name: 'ChatImage.jpg', url: '#', size: 524288, timestamp: new Date(2025, 10, 19), type: 'image' },
        { chatId: 202, chatName: '민영', id: 203, name: 'Vacation.mp4', url: '#', size: 5242880, timestamp: new Date(2025, 10, 18), type: 'video' },
        { chatId: 303, chatName: '영경, 성훈', id: 204, name: 'Plan.xlsx', url: '#', size: 204800, timestamp: new Date(2025, 10, 19), type: 'excel' },
    ];

    if (chatId) {
        return mockFiles.filter(f => f.chatId === chatId);
    }
    return mockFiles; // 모든 파일 반환
};