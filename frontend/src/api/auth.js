// frontend/src/api/auth.js
// 인증 관련 API 요청 함수들을 여기에 작성합니다.
export const login = async (credentials) => {
    console.log('Login API call:', credentials);

    return {success: true, message: 'Login successful'};
};

export const register = async (userData) => {
    console.log('Register API call:', userData);

    return {success: true, message: 'Register successful'};
};

export const findId = async (name, phone) => {
    console.log('Find ID API call for:', {name, phone});

    if (name === '홍길동' && phone === '010-1234-5678') {
        return {success: true, foundId: 'user123'};
    } else {
        return {success: false, message: '일치하는 사용자를 찾을 수 없습니다.'};
    }
};

export const findPassword = async (name, email) => {
    console.log('Find Password API call for:', {name, email});
    
    if (name === '홍길동' && email === 'test@example.com') {
        return {success: true, message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.'};
    } else {
        return {success: false, message: '일치하는 사용자를 찾을 수 없습니다.'};
    }
};