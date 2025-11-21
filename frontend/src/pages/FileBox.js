// fetchFilesApi를 사용하여 모든 채팅방의 파일을 가져온 후, 이를 채팅방별로 그룹화

import React, {useState, useEffect, useMemo} from "react";
import {Download, FileText, Video, Image} from "lucide-react";
import {fetchFilesApi} from "../api/file";
import {handleFileDownload} from "../utils/fileUtils";
import {formatDate} from "../utils/timeUtils";
import Sidebar from "../components/Sidebar";
import { useNavigate } from 'react-router-dom';

export default function FileBox() {
    const [allFiles, setAllFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadAllFiles = async() => {
            setIsLoading(true);
            try{
                // fetchFilesApi 호출 (null 전달로 모든 파일 요청)
                const files = await fetchFilesApi(null);
                setAllFiles(files);
            } catch (error) {
                console.error('Failed to load all files:', error);
                alert('전체 파일 목록 불러오기 실패');
            } finally {
                setIsLoading(false);
            }
        };
        loadAllFiles();
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    // [데이터 가공] 파일 목록을 채팅방 ID와 날짜별로 그룹화
    const groupedByChatAndDate = useMemo(() => {
        return allFiles.reduce((acc, file) => {
            const chatKey = file.chatId;
            const dateKey = formatDate(file.timestamp); // timeUtils 재사용

            if (!acc[chatKey]) {
                acc[chatKey] = { chatName: file.chatName, groupedByDate: {} };
            }

            if (!acc[chatKey].groupedByDate[dateKey]) {
                acc[chatKey].groupedByDate[dateKey] = [];
            }
            acc[chatKey].groupedByDate[dateKey].push(file);
            return acc;
        }, {});
    }, [allFiles]);

    return (
            <div className="flex h-screen w-full bg-gray-900 mx-auto shadow-2xl">

            {/* 1. 사이드바 */}
                <Sidebar
                    activePath={window.location.pathname}
                    onNavigate={navigate} // navigate 함수를 onNavigate prop으로 전달
                />

            {isLoading && <p className="text-center text-gray-400">파일을 불러오는 중입니다...</p>}

            {!isLoading && Object.values(groupedByChatAndDate).length === 0 && (
                <p className="text-center text-gray-400">공유된 파일이 없습니다.</p>
            )}

            {!isLoading && Object.values(groupedByChatAndDate).map((chatGroup, chatIndex) => (
                <div key={chatIndex} className="mb-10 p-5 bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-5 text-indigo-400 border-b border-gray-600 pb-2">
                        {chatGroup.chatName}
                    </h2>

                    {/* 날짜별 그룹 렌더링 */}
                    {Object.entries(chatGroup.groupedByDate).map(([dateKey, files]) => (
                        <div key={dateKey} className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 ml-2">{dateKey}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                                {files.map(file => (
                                    <div key={file.id} className="bg-gray-700 p-3 rounded-lg shadow-md hover:bg-gray-600 transition-colors">
                                        <div className="flex justify-center items-center h-12 mb-2">
                                            {file.type === 'image' && <Image size={40} className="text-blue-400" />}
                                            {file.type === 'video' && <Video size={40} className="text-green-400" />}
                                            {['doc', 'pdf', 'xlsx', 'pptx', 'docx', 'xls'].includes(file.type) && <FileText size={40} className="text-red-400" />}
                                            {/* 기타 파일 타입 아이콘 처리 필요 */}
                                        </div>
                                        <p className="text-xs text-gray-300 truncate mb-1">{file.name}</p>
                                        <p className="text-xs text-gray-500 mb-2">{(file.size / 1024).toFixed(1)} KB</p>

                                        <button
                                            // 🚨 [재사용] fileUtils의 순수 다운로드 함수 호출
                                            onClick={() => handleFileDownload(file.url, file.name)}
                                            className="w-full bg-indigo-400 hover:bg-indigo-400 text-white text-xs py-1 rounded transition-colors flex items-center justify-center"
                                        >
                                            <Download size={12} className="mr-1" />
                                            다운로드
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}