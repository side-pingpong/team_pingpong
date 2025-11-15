// frontend/src/pages/Login/index.js
import React, {useState} from 'react';
import AuthForm from '../../components/auth/AuthForm';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import {login} from '../../api/auth';
import naverLogo from '../../assets/images/naver_login.png';
import kakaoLogo from '../../assets/images/kakao_login.png';

export default function Login() {
    const [form, setForm] = useState({id: '', password: ''});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleLogin = async () => {
        console.log('로그인 시도:', form);
        try {
            const response = await login(form);
            console.log('로그인 성공:', response);
        } catch (error) {
            console.error('로그인 실패:', error);
        }
    };

    const handleSocialLogin = (provider) => {
        // 백엔드 OAuth2 엔드포인트로 리다이렉트
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
    };

    // Google 버튼과 크기를 맞추기 위한 스타일
    const loginButtonBaseStyle = "w-full h-12 flex items-center justify-center px-4 rounded-md shadow-sm text-sm font-medium transition-colors";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-sm mx-auto pt-5">
                <Logo/>
                <AuthForm>
                    <div className="flex flex-col space-y-4">
                        <Input
                            name="id"
                            placeholder="ID"
                            value={form.id}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mt-4 text-sm text-center">
                        <a href="/register" className="text-gray-600 hover:text-gray-900">회원가입</a>
                        <span className="mx-2 text-gray-300">|</span>
                        <a href="/findId" className="text-gray-600 hover:text-gray-900">ID찾기</a>
                        <span className="mx-2 text-gray-300">|</span>
                        <a href="/findPassword" className="text-gray-600 hover:text-gray-900">비밀번호 찾기</a>
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleLogin}
                                className={`${loginButtonBaseStyle} bg-[#2563eb] text-white hover:bg-[#2563eb]/90`}>로그인</Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-300 space-y-3">
                        {/* Google Login Button */}
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className={`${loginButtonBaseStyle} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}
                        >
                            <div className="flex items-center">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
                                     className="w-5 h-5 mr-3">
                                    <path fill="#EA4335"
                                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4"
                                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05"
                                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853"
                                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </svg>
                                <span>구글 로그인</span>
                            </div>
                        </button>

                        {/* Naver Login Button */}
                        <button
                            onClick={() => handleSocialLogin('naver')}
                            className={`${loginButtonBaseStyle} bg-[#03C75A] text-white hover:bg-opacity-90`}
                        >
                            <div className="flex items-center">
                                <img src={naverLogo} alt="Naver" className="w-5 h-5 mr-3"/>
                                <span>네이버 로그인</span>
                            </div>
                        </button>

                        {/* Kakao Login Button */}
                        <button
                            onClick={() => handleSocialLogin('kakao')}
                            className={`${loginButtonBaseStyle} bg-[#FEE500] text-black hover:bg-opacity-90`}
                        >
                            <div className="flex items-center">
                                <img src={kakaoLogo} alt="Kakao" className="w-5 h-5 mr-3"/>
                                <span>카카오 로그인</span>
                            </div>
                        </button>
                    </div>
                </AuthForm>
            </div>
        </div>
    );
}