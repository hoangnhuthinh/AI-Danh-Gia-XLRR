import React, { useState, useRef } from 'react';
import { Briefcase, UploadCloud, Brain, FileText, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ArrowRight, Scale, Loader2, DollarSign, User, Shield, CheckCircle } from 'lucide-react';
import { parseDocument } from '../utils/fileParser';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { evaluateRisk } from '../utils/RiskEvaluator';

export const AIImportView = ({ onCreateRequest }) => {
    const [importStep, setImportStep] = useState('upload'); // upload, scanning, result
    const [aiData, setAiData] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanMessage, setScanMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('google_api_key') || '');
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!apiKey) {
                setIsApiKeyModalOpen(true);
            } else {
                startAIAnalysis(file, apiKey);
            }
        }
    };

    const onApiKeySaved = (key) => {
        setApiKey(key);
        if (selectedFile) {
            startAIAnalysis(selectedFile, key);
        }
    };

    const onUploadClick = () => {
        fileInputRef.current?.click();
    };

    const startAIAnalysis = async (file, key) => {
        setImportStep('scanning');
        setScanProgress(0);

        // Simulate scanning progress while parsing happens in background
        const steps = [
            { progress: 10, msg: `Đang đọc file ${file.name}...` },
            { progress: 30, msg: 'Gửi dữ liệu đến Gemini AI...' },
            { progress: 50, msg: 'Phân tích ngữ nghĩa & Rủi ro...' },
            { progress: 70, msg: 'Đánh giá tài sản & Dòng tiền...' },
            { progress: 90, msg: 'Tổng hợp khuyến nghị...' },
        ];

        let currentStep = 0;
        const progressInterval = setInterval(() => {
            if (currentStep < steps.length) {
                setScanProgress(steps[currentStep].progress);
                setScanMessage(steps[currentStep].msg);
                currentStep++;
            }
        }, 800);

        try {
            // Perform actual parsing with Gemini
            const result = await parseDocument(file, key);

            // Ensure progress bar completes
            clearInterval(progressInterval);
            setScanProgress(100);
            setScanMessage('Hoàn tất.');

            setTimeout(() => {
                // Run Logic Rules
                const evaluation = evaluateRisk(result);
                setAiData({ ...result, ruleEvaluation: evaluation });
                setImportStep('result');
            }, 500);

        } catch (error) {
            clearInterval(progressInterval);
            setScanMessage(`Lỗi: ${error.message || 'Không thể đọc file'}. Vui lòng thử lại.`);
            console.error(error);
        }
    };

    const translateEnum = (value) => {
        if (!value) return '';
        const map = {
            'High': 'Cao',
            'Medium': 'Trung bình',
            'Low': 'Thấp',
            'approve': 'Phê duyệt',
            'reject': 'Từ chối',
            'review': 'Thẩm định lại'
        };
        return map[value] || value;
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
            {/* HEADER STEPPER */}
            <div className="flex items-center justify-center mb-8">
                <div className={`flex items-center gap-2 ${importStep === 'upload' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">1</div>
                    <span>Tải hồ sơ nợ</span>
                </div>
                <div className="w-16 h-0.5 bg-slate-200 mx-4"></div>
                <div className={`flex items-center gap-2 ${importStep === 'scanning' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">2</div>
                    <span>AI Thẩm định</span>
                </div>
                <div className="w-16 h-0.5 bg-slate-200 mx-4"></div>
                <div className={`flex items-center gap-2 ${importStep === 'result' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">3</div>
                    <span>Kết quả & Đề xuất</span>
                </div>
            </div>

            {/* STEP 1: UPLOAD */}
            {importStep === 'upload' && (
                <div
                    className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors cursor-pointer group p-12 relative overflow-hidden"
                    onClick={onUploadClick}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                    />
                    <div className="absolute inset-0 bg-slate-50/50 -z-10"></div>
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Briefcase className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Tải lên Tờ trình Phương án Xử lý nợ</h2>
                    <p className="text-slate-500 mb-8 max-w-md text-center">Hệ thống AI sẽ phân tích dư nợ, TSĐB và khả năng trả nợ của khách hàng từ file PDF/DOCX.</p>
                    <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Chọn File Hồ Sơ
                    </button>
                </div>
            )}

            {/* STEP 2: SCANNING */}
            {importStep === 'scanning' && (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xl text-center z-10 w-96">
                        <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{scanMessage}</h3>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: RESULT */}
            {importStep === 'result' && aiData && (
                <div className="mt-8 animate-fade-in pb-10">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Kết quả Thẩm định & Đề xuất
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Phân tích bởi: <span className="font-semibold text-blue-600">Gemini 2.5 Flash (Vision Mode)</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right mr-4">
                                    <div className="text-sm text-slate-500">Recovery Score</div>
                                    <div className={`text-2xl font-bold ${aiData.analysis.recoveryScore >= 70 ? 'text-green-600' :
                                        aiData.analysis.recoveryScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {aiData.analysis.recoveryScore}/100
                                    </div>
                                </div>
                                <SeverityBadge level={aiData.analysis.riskLevel} />
                            </div>
                        </div>

                        {/* LOGIC RULES EVALUATION SECTION */}
                        {aiData.ruleEvaluation && (
                            <div className={`mx-6 mt-6 p-4 rounded-lg border-l-4 ${aiData.ruleEvaluation.triageStatus === 'green' ? 'bg-green-50 border-green-500' :
                                    aiData.ruleEvaluation.triageStatus === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
                                        'bg-red-50 border-red-500'
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-lg font-bold uppercase flex items-center gap-2 ${aiData.ruleEvaluation.triageStatus === 'green' ? 'text-green-800' :
                                                aiData.ruleEvaluation.triageStatus === 'yellow' ? 'text-yellow-800' :
                                                    'text-red-800'
                                            }`}>
                                            {aiData.ruleEvaluation.triageStatus === 'green' ? <CheckCircle className="w-6 h-6" /> :
                                                aiData.ruleEvaluation.triageStatus === 'yellow' ? <AlertTriangle className="w-6 h-6" /> :
                                                    <ShieldAlert className="w-6 h-6" />}

                                            {aiData.ruleEvaluation.triageStatus === 'green' ? 'ƯU TIÊN XỬ LÝ (LUỒNG XANH)' :
                                                aiData.ruleEvaluation.triageStatus === 'yellow' ? 'CẦN THẨM ĐỊNH THÊM (LUỒNG VÀNG)' :
                                                    'RỦI RO CAO (LUỒNG ĐỎ)'}
                                        </h3>
                                        <p className="text-slate-700 mt-1 font-medium">
                                            Đề xuất tự động: <span className="font-bold">
                                                {aiData.ruleEvaluation.autoRecommendation === 'approve_fast' ? 'Phê duyệt nhanh' :
                                                    aiData.ruleEvaluation.autoRecommendation === 'manual_review' ? 'Thẩm định thực tế & Bổ sung hồ sơ' :
                                                        aiData.ruleEvaluation.autoRecommendation === 'reject_or_seize' ? 'Từ chối hoặc Thu giữ TSBĐ' :
                                                            'Chuyển Lãnh đạo xem xét ngay'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Confidence Score</div>
                                        <div className="font-bold text-slate-700">{(aiData.ruleEvaluation.confidenceScore * 100).toFixed(0)}%</div>
                                    </div>
                                </div>

                                {/* Triggered Rules / Warnings */}
                                {aiData.ruleEvaluation.triggeredRules.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-black/10">
                                        <span className="text-xs font-bold uppercase text-slate-500 block mb-2">Cảnh báo cụ thể:</span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {aiData.ruleEvaluation.triggeredRules.map((rule, idx) => (
                                                <div key={idx} className={`flex items-start gap-2 text-sm p-2 rounded ${rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                        rule.severity === 'error' ? 'bg-red-50 text-red-700' :
                                                            rule.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <span><span className="font-bold">[{rule.code}]</span> {rule.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Extracted Data */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">1. Thông tin Hồ sơ</h3>

                                {/* Debt Details */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Thông tin Dư nợ
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Tổng dư nợ:</span>
                                            <span className="font-bold text-slate-800">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aiData.extractedData.debtDetails?.totalOutstanding || aiData.extractedData.totalOutstanding || 0)}
                                            </span>
                                        </div>
                                        {aiData.extractedData.debtDetails?.principal && (
                                            <div className="flex justify-between pl-4 border-l-2 border-slate-200">
                                                <span className="text-slate-500">Nợ gốc:</span>
                                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aiData.extractedData.debtDetails.principal)}</span>
                                            </div>
                                        )}
                                        {aiData.extractedData.debtDetails?.interest && (
                                            <div className="flex justify-between pl-4 border-l-2 border-slate-200">
                                                <span className="text-slate-500">Lãi & Phạt:</span>
                                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aiData.extractedData.debtDetails.interest + (aiData.extractedData.debtDetails.penalty || 0))}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Info & Status */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Thông tin Khách hàng
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-slate-500">Tên KH:</span>
                                            <span>{aiData.extractedData.customerName}</span>
                                        </div>

                                        {/* Status */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                                            <div>
                                                <span className="text-xs text-slate-400 block">Nhóm nợ</span>
                                                <span className="text-orange-600 font-medium">{aiData.extractedData.customerStatus?.currentGroup || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Pháp lý</span>
                                                <span className="text-slate-700">{aiData.extractedData.customerStatus?.legalStatus || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Thiện chí</span>
                                                <span className="text-slate-700">{aiData.extractedData.customerStatus?.willingnessToRepay || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Lịch sử</span>
                                                <span className="text-slate-700">{aiData.extractedData.customerStatus?.repaymentHistory || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Info & Capability */}
                                        <div className="pt-2 border-t border-slate-200 space-y-2">
                                            <div>
                                                <span className="text-xs text-slate-400 block">Quan hệ & Tính cách:</span>
                                                <p className="text-slate-600 italic">
                                                    {aiData.extractedData.customerInfo?.personalityTraits || ''} {aiData.extractedData.customerInfo?.socialRelationships || ''}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Nguồn thu & Tài sản:</span>
                                                <p className="text-slate-600">
                                                    {aiData.extractedData.customerCapability?.incomeSource || ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collateral */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Tài sản Bảo đảm
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Giá trị định giá:</span>
                                            <span className="font-bold text-blue-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aiData.extractedData.collateralDetails?.value || aiData.extractedData.collateralValue || 0)}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-slate-500 block mb-1">Mô tả:</span>
                                            <p className="text-slate-700">{aiData.extractedData.collateralDetails?.description || "Không có mô tả chi tiết"}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                                            <div>
                                                <span className="text-xs text-slate-400 block">Loại TS</span>
                                                <span className="text-slate-700">{aiData.extractedData.collateralDetails?.type || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Tình trạng</span>
                                                <span className="text-slate-700">{aiData.extractedData.collateralDetails?.usageStatus || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Pháp lý</span>
                                                <span className="text-slate-700">{aiData.extractedData.collateralDetails?.legalStatus || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 block">Thu giữ</span>
                                                <span className="text-slate-700">{aiData.extractedData.collateralDetails?.seizability || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {aiData.extractedData.collateralDetails?.liquidityAssessment && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-slate-500">Thanh khoản:</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${aiData.extractedData.collateralDetails.liquidityAssessment === 'High' ? 'bg-green-100 text-green-700' :
                                                    aiData.extractedData.collateralDetails.liquidityAssessment === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {translateEnum(aiData.extractedData.collateralDetails.liquidityAssessment)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Expert Analysis */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">2. Nhận định Chuyên gia (30 năm KN)</h3>

                                {/* Recommendation Box */}
                                <div className={`p-5 rounded-lg border-l-4 shadow-sm ${aiData.analysis.recommendation.action === 'approve' ? 'bg-green-50 border-green-500' :
                                    aiData.analysis.recommendation.action === 'reject' ? 'bg-red-50 border-red-500' :
                                        'bg-yellow-50 border-yellow-500'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        {aiData.analysis.recommendation.action === 'approve' ? <CheckCircle className="w-6 h-6 text-green-600 mt-1" /> :
                                            aiData.analysis.recommendation.action === 'reject' ? <XCircle className="w-6 h-6 text-red-600 mt-1" /> :
                                                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />}

                                        <div>
                                            <h4 className={`text-lg font-bold uppercase mb-1 ${aiData.analysis.recommendation.action === 'approve' ? 'text-green-800' :
                                                aiData.analysis.recommendation.action === 'reject' ? 'text-red-800' :
                                                    'text-yellow-800'
                                                }`}>
                                                {translateEnum(aiData.analysis.recommendation.action)}
                                            </h4>
                                            <p className="text-slate-700 mb-2 font-medium">
                                                {aiData.analysis.recommendation.reason}
                                            </p>
                                            {aiData.analysis.recommendation.criticalNote && (
                                                <div className="text-sm bg-white/50 p-2 rounded text-slate-800 italic">
                                                    <span className="font-bold text-red-600 not-italic">Lưu ý quan trọng: </span>
                                                    {aiData.analysis.recommendation.criticalNote}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expert Assessment (SWOT & Strategy) */}
                                {aiData.analysis.expertAssessment && (
                                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-purple-600" /> Góc nhìn Giám đốc Vùng
                                        </h4>

                                        <div className="space-y-4">
                                            {/* Strategic View */}
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiến lược xử lý</span>
                                                <p className="text-slate-800 font-medium mt-1">
                                                    {aiData.analysis.expertAssessment.strategicView}
                                                </p>
                                            </div>

                                            {/* Hidden Risks */}
                                            {aiData.analysis.expertAssessment.hiddenRisks?.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Rủi ro tiềm ẩn</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {aiData.analysis.expertAssessment.hiddenRisks.map((risk, idx) => (
                                                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                                <span className="text-red-400">•</span> {risk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* SWOT Summary */}
                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                                <div className="bg-green-50 p-2 rounded">
                                                    <div className="text-xs font-bold text-green-700 mb-1">Điểm mạnh</div>
                                                    <ul className="text-xs text-slate-600 list-disc list-inside">
                                                        {aiData.analysis.expertAssessment.swot?.strengths?.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                                <div className="bg-red-50 p-2 rounded">
                                                    <div className="text-xs font-bold text-red-700 mb-1">Điểm yếu</div>
                                                    <ul className="text-xs text-slate-600 list-disc list-inside">
                                                        {aiData.analysis.expertAssessment.swot?.weaknesses?.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Next Steps */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase">Các bước tiếp theo</h4>
                                    <ul className="space-y-2">
                                        {aiData.analysis.recommendation.nextSteps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                                                <span className="font-bold text-blue-400">{index + 1}.</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Modal */}
            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onSave={onApiKeySaved}
            />
        </div>
    );
};
