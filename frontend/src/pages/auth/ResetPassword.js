// frontend/src/pages/ResetPassword/ResetPassword.js
import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import AuthForm from '../../components/auth/AuthForm';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import {resetPassword} from "../../api/auth";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [userInfo] = useState({name: '홍길동', id: 'user123'});
    const [passwords, setPasswords] = useState({newPassword: '', confirmPassword: ''});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setPasswords({...passwords, [name]: value});
    };

    const handleResetPassword = async () => {
        if (!passwords.newPassword) {
            alert('새 비밀번호를 입력해주세요.');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        console.log(`비밀번호 재설정 시도: 사용자 ${userInfo.id}`);
        try {
            const response = await resetPassword(passwords.newPassword, passwords.confirmPassword);
            console.log('비밀번호 재설정 성공:', response);
            alert('비밀번호가 성공적으로 재설정되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            alert('비밀번호 재설정 중 오류가 발생했습니다.');
        }
    };

    const inputStyle = "w-full h-12 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonBaseStyle = "h-12 flex items-center justify-center px-4 rounded-md shadow-sm text-sm font-medium transition-colors";
    const mainButtonStyle = `${buttonBaseStyle} w-full bg-[#2563eb] text-white hover:bg-[#2563eb]/90`;
    const labelStyle = "block text-sm font-medium text-gray-700 text-left";
    const requiredMark = <span className="text-red-500">*</span>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-sm mx-auto pt-5">
                <Logo/>
                <AuthForm>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <label htmlFor="name" className={labelStyle}>이름</label>
                            <Input
                                id="name"
                                name="name"
                                value={userInfo.name}
                                readOnly
                                className={`${inputStyle} mt-1 bg-gray-100 cursor-not-allowed`}
                            />
                        </div>
                        <div>
                            <label htmlFor="id" className={labelStyle}>ID</label>
                            <Input
                                id="id"
                                name="id"
                                value={userInfo.id}
                                readOnly
                                className={`${inputStyle} mt-1 bg-gray-100 cursor-not-allowed`}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className={labelStyle}>새 비밀번호 {requiredMark}</label>
                            <Input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                className={`${inputStyle} mt-1`}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className={labelStyle}>새 비밀번호 확인 {requiredMark}</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                className={`${inputStyle} mt-1`}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleResetPassword} className={mainButtonStyle}>
                            비밀번호 재설정
                        </Button>
                    </div>
                </AuthForm>
            </div>
        </div>
    );
}
