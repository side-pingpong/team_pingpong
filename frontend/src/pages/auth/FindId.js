// frontend/src/pages/FindId/FindId.js
import React, {useState} from 'react';
import AuthForm from '../../components/auth/AuthForm';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import {findId} from '../../api/auth';

export default function FindId() {
    const [form, setForm] = useState({name: '', phone: ''});
    const [foundId, setFoundId] = useState('');

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleFindId = async () => {
        console.log('ID 찾기 시도:', form);
        if (!form.name || !form.phone) {
            alert('이름과 핸드폰 번호를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await findId(form.name, form.phone);
            if (response.success) {
                const maskedId = response.foundId.substring(0, 3) + '***';
                setFoundId(maskedId);
            } else {
                alert(response.message);
                setFoundId('');
            }
        } catch (error) {
            console.error('ID 찾기 실패:', error);
            alert('ID 찾기 중 오류가 발생했습니다.');
            setFoundId('');
        }
    };

    const inputStyle = "w-full h-12 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonBaseStyle = "h-12 flex items-center justify-center px-4 rounded-md shadow-sm text-sm font-medium transition-colors";
    const mainButtonStyle = `${buttonBaseStyle} w-full bg-[#2563eb] text-white hover:bg-[#2563eb]/90`;

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
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="핸드폰 번호"
                                value={form.phone}
                                onChange={handleChange}
                                className={`${inputStyle} mt-1`}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleFindId} className={mainButtonStyle}>
                            ID 찾기
                        </Button>
                    </div>

                    {/* ID 찾기 결과 표시 */}
                    {foundId && (
                        <div className="mt-6 p-4 border rounded-md text-center bg-gray-100">
                            회원님의 ID는 <strong className="font-bold">{foundId}</strong> 입니다.
                        </div>
                    )}
                </AuthForm>
            </div>
        </div>
    );
}
