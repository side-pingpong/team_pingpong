// frontend/src/pages/FindPassword/FindPassword.js
import React, {useState} from 'react';
import {findPassword} from '../../api/auth';
import {useNavigate} from "react-router-dom";
import AuthForm from '../../components/auth/AuthForm';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';

export default function FindPassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({name: '', email: '', verificationCode: ''});
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleRequestVerification = async () => {
        if (!form.name || !form.email) {
            alert('이름과 이메일을 모두 입력해주세요.');
            return;
        }
        console.log(`인증 요청: ${form.name}, ${form.email}`);

        try {
            const response = await findPassword(form.name, form.email);
            if (response.success) {
                setIsVerificationSent(true);
                alert(response.message);
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('비밀번호 찾기 요청 실패:', error);
            alert('비밀번호 찾기 요청 중 오류가 발생했습니다.');
        }
    };

    const handleConfirmAndNavigate = () => {
        console.log(`인증번호 확인: ${form.verificationCode}`);
        alert('인증되었습니다. 비밀번호 재설정 페이지로 이동합니다.');
        navigate('/resetPassword', {state: {email: form.email}});
    };


    const inputStyle = "w-full h-12 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonBaseStyle = "h-12 flex items-center justify-center px-4 rounded-md shadow-sm text-sm font-medium transition-colors";
    const mainButtonStyle = `${buttonBaseStyle} w-full bg-[#2563eb] text-white hover:bg-[#2563eb]/90`;
    const subButtonStyle = `${buttonBaseStyle} w-28 bg-[#2563eb] text-white hover:bg-[#2563eb]/90 whitespace-nowrap`;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-sm mx-auto pt-5">
                <Logo/>
                <AuthForm>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <Input
                                id="name"
                                name="name"
                                placeholder="이름"
                                value={form.name}
                                onChange={handleChange}
                                className={`${inputStyle} mt-1`}
                            />
                        </div>
                        <div>
                            <div className="flex space-x-2 mt-1">
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="ID (E-mail)"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`${inputStyle} flex-grow`}
                                />
                                <Button type="button" onClick={handleRequestVerification} className={subButtonStyle}>
                                    인증요청
                                </Button>
                            </div>
                        </div>

                        {isVerificationSent && (
                            <div>
                                <Input
                                    id="verificationCode"
                                    name="verificationCode"
                                    placeholder="인증번호"
                                    value={form.verificationCode}
                                    onChange={handleChange}
                                    className={`${inputStyle} mt-1`}
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleConfirmAndNavigate} className={mainButtonStyle}
                                disabled={!isVerificationSent}>
                            확인
                        </Button>
                    </div>
                </AuthForm>
            </div>
        </div>
    );
}