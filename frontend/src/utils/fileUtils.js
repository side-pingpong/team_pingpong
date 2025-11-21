// UI/브라우저 관련 순수 로직

import {fetchFilesApi} from "../api/file";

/**
 * 파일 다운로드 로직
 * @param {string} url - 다운로드할 파일의 url
 * @param {string} fileName - 파일의 이름
 */
export const handleFileDownload = (url, fileName) => {
    // 브라우저 DOM 조작, 다운로드 시작 등 순수한 프런트엔드 기능
    try {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // 파일명 설정
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('File download failed:', error);
        alert('파일 다운로드에 실패했습니다.');
    }
};

/**
 * 파일 목록 날짜별 그룹화 로직
 * @param {Array} files - 파일 객체 배열 (timestamp 포함)
 * @param {function} dateFormatter - 날짜를 문자열 키로 변환하는 함수 (예: formatDate)
 * @return {object} 날짜 키로 그룹화된 객체
 */
export const groupFilesByDate = (files, dateFormatter) => {
    return files.reduce((acc, file) => {
        const dateKey = dateFormatter(files.timestamp);
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(file);
        return acc;
    }, {});
};