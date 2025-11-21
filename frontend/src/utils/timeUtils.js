export const isSameDay = (date1, date2) => {
    if (!(date1 instanceof Date) || isNaN(date1) || !(date2 instanceof Date) || isNaN(date2)) return false;
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

// 날짜 포맷팅 함수
export const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = days[date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`;
}

/**
 * 채팅 목록의 마지막 메시지 시간을 포맷합니다. (UX 기준)
 * - 오늘: HH:MM (24시간제)
 * - 어제: '어제'
 * - 올해: MM.DD
 * - 이전: YYYY.MM.DD
 * @param {string|Date} timestamp - 날짜/시간 데이터 (ISO 문자열 또는 Date 객체)
 * @returns {string} 포맷된 시간 문자열
 */
export const formatChatTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date)) return '';

    const now = new Date();

    // 1. 오늘인지 확인 (HH:MM)
    if (isSameDay(date, now)) {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24시간제
        });
    }

    // 2. 어제인지 확인
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(date, yesterday)) {
        return '어제';
    }

    // 3. 올해인지 확인 (MM.DD)
    if (date.getFullYear() === now.getFullYear()) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}.${day}`;
    }

    // 4. 그 외 (YYYY.MM.DD)
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}.${month}.${day}`;
};