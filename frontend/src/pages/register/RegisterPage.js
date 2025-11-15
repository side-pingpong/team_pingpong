// frontend/src/pages/Register/RegisterPage.js
import React, {useState} from 'react';
import AuthForm from '../../components/auth/AuthForm';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import {register} from '../../api/auth';

function RegisterPage() {
    const [form, setForm] = useState({
        id: '',
        verificationCode: '',
        password: '',
        passwordConfirm: '',
        name: '',
        nickname: '',
        phone1: '',
        phone2: '',
        phone3: '',
    });

    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [isIdVerified, setIsIdVerified] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleRequestVerification = () => {
        if (!form.id) {
            alert('ID(E-mail)를 입력해주세요.');
            return;
        }
        console.log(`ID 인증 요청: ${form.id}`);
        setIsVerificationSent(true);
        alert('인증번호가 발송되었습니다.');
    };

    const handleConfirmVerification = () => {
        console.log(`인증번호 확인: ${form.verificationCode}`);
        setIsIdVerified(true);
        alert('ID 사용이 가능합니다.');
    };

    const handleRegister = async () => {
        // 필수 항목 유효성 검사
        const requiredFields = {
            id: 'ID(E-mail)',
            password: '비밀번호',
            passwordConfirm: '비밀번호 확인',
            name: '이름',
            phone1: '핸드폰 번호',
            phone2: '핸드폰 번호',
            phone3: '핸드폰 번호',
        };

        for (const field in requiredFields) {
            if (!form[field]) {
                alert(`필수 항목인 ${requiredFields[field]}을(를) 입력해주세요.`);
                return;
            }
        }

        if (!isIdVerified) {
            alert('ID 인증을 완료해주세요.');
            return;
        }
        if (form.password !== form.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        const fullPhoneNumber = `${form.phone1}-${form.phone2}-${form.phone3}`;
        const userData = {...form, phone: fullPhoneNumber};
        console.log('회원가입 시도:', userData);

        try {
            const response = await register(userData);
            console.log('회원가입 성공:', response);
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
        } catch (error) {
            console.error('회원가입 실패:', error);
        }
    };

    const inputStyle = "w-full h-12 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonBaseStyle = "h-12 flex items-center justify-center px-4 rounded-md shadow-sm text-sm font-medium transition-colors";
    const mainButtonStyle = `${buttonBaseStyle} w-full bg-[#2563eb] text-white hover:bg-[#2563eb]/90`;
    const subButtonStyle = `${buttonBaseStyle} w-28 bg-[#2563eb] text-white hover:bg-[#2563eb]/90 whitespace-nowrap`;
    const labelStyle = "block text-sm font-medium text-gray-700 text-left";
    const requiredMark = <span className="text-red-500">*</span>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-sm mx-auto pt-5">
                <Logo/>
                <AuthForm>
                    <div className="flex flex-col space-y-4">
                        {/* ID 입력 및 인증 */}
                        <div>
                            <label htmlFor="id" className={labelStyle}>ID (E-mail) {requiredMark}</label>
                            <div className="flex space-x-2 mt-1">
                                <Input
                                    id="id"
                                    type="email"
                                    name="id"
                                    placeholder="official@pingpong.com"
                                    value={form.id}
                                    onChange={handleChange}
                                    className={`${inputStyle} flex-grow`}
                                    disabled={isIdVerified}
                                />
                                <Button type="button" onClick={handleRequestVerification} disabled={isIdVerified}
                                        className={subButtonStyle}>
                                    {isIdVerified ? '인증완료' : '인증요청'}
                                </Button>
                            </div>
                        </div>

                        {/* 인증번호 입력 */}
                        {isVerificationSent && !isIdVerified && (
                            <div>
                                <label htmlFor="verificationCode" className={labelStyle}>인증번호 {requiredMark}</label>
                                <div className="flex space-x-2 mt-1">
                                    <Input
                                        id="verificationCode"
                                        name="verificationCode"
                                        value={form.verificationCode}
                                        onChange={handleChange}
                                        className={`${inputStyle} flex-grow`}
                                    />
                                    <Button type="button" onClick={handleConfirmVerification}
                                            className={subButtonStyle}>
                                        확인
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className={labelStyle}>비밀번호 {requiredMark}</label>
                            <Input id="password" type="password" name="password" placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
                                   value={form.password} onChange={handleChange} className={`${inputStyle} mt-1`}/>
                        </div>
                        <div>
                            <label htmlFor="passwordConfirm" className={labelStyle}>비밀번호 확인 {requiredMark}</label>
                            <Input id="passwordConfirm" type="password" name="passwordConfirm"
                                   value={form.passwordConfirm} onChange={handleChange}
                                   className={`${inputStyle} mt-1`}/>
                        </div>
                        <div>
                            <label htmlFor="name" className={labelStyle}>이름 {requiredMark}</label>
                            <Input id="name" name="name" placeholder="ex: 홍길동" value={form.name} onChange={handleChange}
                                   className={`${inputStyle} mt-1`}/>
                        </div>
                        <div>
                            <label htmlFor="nickname" className={labelStyle}>닉네임</label>
                            <Input id="nickname" name="nickname" placeholder="미입력시 실명사용" value={form.nickname}
                                   onChange={handleChange} className={`${inputStyle} mt-1`}/>
                        </div>

                        {/* 핸드폰 번호 */}
                        <div>
                            <label className={labelStyle}>핸드폰 번호 {requiredMark}</label>
                            <div className="flex items-center justify-between space-x-2 mt-1">
                                <Input name="phone1" placeholder="010" value={form.phone1} onChange={handleChange}
                                       className={`${inputStyle} text-center`} maxLength="3"/>
                                <span>-</span>
                                <Input name="phone2" placeholder="1234" value={form.phone2} onChange={handleChange}
                                       className={`${inputStyle} text-center`} maxLength="4"/>
                                <span>-</span>
                                <Input name="phone3" placeholder="5678" value={form.phone3} onChange={handleChange}
                                       className={`${inputStyle} text-center`} maxLength="4"/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button onClick={handleRegister} className={mainButtonStyle}>
                            가입하기
                        </Button>
                    </div>
                </AuthForm>
            </div>
        </div>
    );
}

export default RegisterPage;