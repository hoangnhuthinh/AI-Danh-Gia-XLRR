import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, UploadCloud, Brain, FileText, AlertTriangle, CheckCircle, XCircle, ShieldAlert, DollarSign, User, Shield, ChevronDown, Search, MessageCircle, Send, X } from 'lucide-react';
import { parseDocument } from '../utils/fileParser';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { evaluateRisk } from '../utils/RiskEvaluator';
import { chatWithContext } from '../utils/geminiService';

export const AIImportView = ({ onCreateRequest, apiKey, onApiKeyUpdate, initialData }) => {
    const [importStep, setImportStep] = useState(initialData ? 'result' : 'upload'); // upload, scanning, result
    const [aiData, setAiData] = useState(initialData ? {
        analysis: initialData.aiAnalysis,
        extractedData: initialData.extractedData
    } : null);

    // If viewing existing data, we don't need upload logic initially
    useEffect(() => {
        if (initialData) {
            setImportStep('result');
            setAiData({
                analysis: initialData.aiAnalysis,
                extractedData: initialData.extractedData
            });
        }
    }, [initialData]);

    const [scanProgress, setScanProgress] = useState(0);
    const [scanMessage, setScanMessage] = useState('');
    const [scanError, setScanError] = useState(null); // Store error for display
    const [selectedFile, setSelectedFile] = useState(null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

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
        onApiKeyUpdate(key);
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
        setScanError(null); // Clear previous error

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
            setScanProgress(0);
            setScanMessage('');
            setScanError(error.message || 'Không thể đọc file');
            console.error('[AIImportView] Analysis error:', error);
        }
    };

    // Chat handler
    const sendChatMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const answer = await chatWithContext(userMessage, aiData.extractedData, apiKey);
            setChatMessages(prev => [...prev, { role: 'ai', text: answer }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'ai', text: 'Lỗi: ' + error.message }]);
        } finally {
            setIsChatLoading(false);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 px-2 sm:px-0">
            {/* HEADER STEPPER - Compact on mobile */}
            <div className="flex items-center justify-center mb-4 sm:mb-8">
                <div className={`flex items-center gap-1 sm:gap-2 ${importStep === 'upload' ? 'text-sky-accent font-bold' : 'text-sky-text-secondary'}`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-current flex items-center justify-center text-sm">1</div>
                    <span className="hidden sm:inline text-sm">Tải hồ sơ</span>
                </div>
                <div className="w-6 sm:w-16 h-0.5 bg-slate-200 mx-2 sm:mx-4"></div>
                <div className={`flex items-center gap-1 sm:gap-2 ${importStep === 'scanning' ? 'text-sky-accent font-bold' : 'text-sky-text-secondary'}`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-current flex items-center justify-center text-sm">2</div>
                    <span className="hidden sm:inline text-sm">AI Thẩm định</span>
                </div>
                <div className="w-6 sm:w-16 h-0.5 bg-slate-200 mx-2 sm:mx-4"></div>
                <div className={`flex items-center gap-1 sm:gap-2 ${importStep === 'result' ? 'text-sky-accent font-bold' : 'text-sky-text-secondary'}`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-current flex items-center justify-center text-sm">3</div>
                    <span className="hidden sm:inline text-sm">Kết quả</span>
                </div>
            </div>

            {/* STEP 1: UPLOAD */}
            {importStep === 'upload' && (
                <div
                    className="flex-1 flex flex-col items-center justify-center bg-sky-card rounded-xl border-2 border-dashed border-white/10 hover:border-sky-accent transition-colors cursor-pointer group p-12 relative overflow-hidden"
                    onClick={onUploadClick}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                    />
                    <div className="absolute inset-0 bg-sky-bg/30 -z-10"></div>

                    {!apiKey && (
                        <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center justify-center gap-2 text-red-500 animate-pulse">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold text-sm">Chưa cấu hình Google API Key! Hệ thống sẽ không thể phân tích.</span>
                        </div>
                    )}

                    <div className="w-24 h-24 bg-sky-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Briefcase className="w-10 h-10 text-sky-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-sky-text mb-2">Tải lên Tờ trình Phương án Xử lý nợ</h2>
                    <p className="text-sky-text-secondary mb-8 max-w-md text-center">Hệ thống AI sẽ phân tích dư nợ, TSĐB và khả năng trả nợ của khách hàng từ file PDF/DOCX.</p>
                    <button className="px-8 py-3 bg-sky-accent text-white font-bold rounded-xl shadow-lg shadow-sky-accent/20 hover:bg-sky-accent/90 transition-all flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Chọn File Hồ Sơ
                    </button>
                </div>
            )}

            {/* STEP 2: SCANNING */}
            {importStep === 'scanning' && (
                <div className="flex-1 flex flex-col items-center justify-center bg-sky-card rounded-xl border border-slate-200 shadow-sm relative overflow-hidden mx-2 sm:mx-0">
                    {!scanError && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-sky-accent shadow-[0_0_20px_rgba(109,106,255,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    )}
                    <div className="bg-sky-card p-4 sm:p-8 rounded-xl border border-slate-200 shadow-xl text-center z-10 w-full max-w-sm sm:w-96">
                        {scanError ? (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-red-500 mb-2">Lỗi phân tích</h3>
                                <p className="text-sm text-slate-500 mb-4 break-words">{scanError}</p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={() => {
                                            setScanError(null);
                                            setImportStep('upload');
                                        }}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={() => selectedFile && startAIAnalysis(selectedFile, apiKey)}
                                        className="px-4 py-2 bg-sky-accent text-white font-bold rounded-lg hover:bg-sky-accent/90 transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Brain className="w-16 h-16 text-sky-accent mx-auto mb-4 animate-bounce" />
                                <h3 className="text-xl font-bold text-sky-text mb-2">{scanMessage}</h3>
                                <div className="w-full bg-sky-bg rounded-full h-2 mb-2 overflow-hidden">
                                    <div className="bg-sky-accent h-2 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {importStep === 'result' && aiData && aiData.analysis && (() => {
                // === DATA EXTRACTION ===
                const totalDebt = aiData?.extractedData?.debtDetails?.totalOutstanding || 0;
                const principal = aiData?.extractedData?.debtDetails?.principal || 0;
                const interestPenalty = (aiData?.extractedData?.debtDetails?.interest || 0) + (aiData?.extractedData?.debtDetails?.penalty || 0);
                const collateralValue = aiData?.extractedData?.collateralDetails?.value || 0;
                const ltvRatio = totalDebt > 0 ? Math.round((collateralValue / totalDebt) * 100) : 0;
                const unsecuredGap = Math.max(0, totalDebt - collateralValue);

                // Triage color
                const triageStatus = aiData.ruleEvaluation?.triageStatus ||
                    (aiData.analysis.recommendation?.action === 'approve' ? 'green' :
                        aiData.analysis.recommendation?.action === 'reject' ? 'red' : 'yellow');

                const triageColors = {
                    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700', light: 'bg-green-50' },
                    yellow: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-700', light: 'bg-amber-50' },
                    red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-700', light: 'bg-red-50' }
                };
                const colors = triageColors[triageStatus] || triageColors.yellow;

                // Critical alerts (severity >= error)
                const criticalAlerts = (aiData.ruleEvaluation?.triggeredRules || [])
                    .filter(r => r.severity === 'critical' || r.severity === 'error');

                const hasTauTanRisk = criticalAlerts.some(r => r.code === 'R03');

                const formatMoney = (val) => {
                    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} tỷ`;
                    if (val >= 1000000) return `${Math.round(val / 1000000)} tr`;
                    return new Intl.NumberFormat('vi-VN').format(val);
                };

                return (
                    <div className="mt-4 animate-fade-in pb-6 space-y-4">

                        {/* ══════════════════════════════════════════════════════════════
                            SECTION 1: DECISION CARD - "3-Second View"
                        ══════════════════════════════════════════════════════════════ */}
                        <div className={`rounded-xl overflow-hidden border-2 ${colors.border} ${colors.light}`}>
                            {/* Header Bar */}
                            <div className={`${colors.bg} px-4 py-3 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    <div className="text-white font-bold text-lg">
                                        {triageStatus === 'green' ? '✓ DUYỆT NHANH' :
                                            triageStatus === 'red' ? '✗ CẢNH BÁO' : '? XEM XÉT'}
                                    </div>
                                    {hasTauTanRisk && (
                                        <span className="animate-pulse bg-white/20 px-2 py-1 rounded text-xs font-bold text-white">
                                            ⚠️ TẨU TÁN
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-white text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-base">{aiData.analysis.recoveryScore}</div>
                                        <div className="text-sm opacity-80">Điểm</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-base">{translateEnum(aiData.analysis.riskLevel)}</div>
                                        <div className="text-sm opacity-80">Rủi ro</div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                {/* Customer Name */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="font-bold text-lg text-slate-800">
                                        {aiData?.extractedData?.customerName || 'Khách hàng'}
                                    </div>
                                    <div className={`text-right ${colors.text}`}>
                                        <div className="text-xl font-bold">{ltvRatio}%</div>
                                        <div className="text-sm">LTV</div>
                                    </div>
                                </div>

                                {/* Key Info Bullets */}
                                <div className="text-sm text-slate-700 space-y-1">
                                    <div>• Nhóm nợ: <strong>{aiData?.extractedData?.customerStatus?.currentGroup || 'N/A'}</strong></div>
                                    <div>• Dư nợ: <strong>{formatMoney(totalDebt)}</strong> (Gốc {formatMoney(principal)} + Lãi <span className="text-amber-600">{formatMoney(interestPenalty)}</span>)</div>
                                    {unsecuredGap > 0 && (
                                        <div className="text-red-600">• Tổn thất: <strong>-{formatMoney(unsecuredGap)}</strong> {principal > collateralValue ? `(Mất gốc: -${formatMoney(principal - collateralValue)})` : '(Không mất gốc)'}</div>
                                    )}
                                </div>

                                {/* Critical Alerts */}
                                {criticalAlerts.length > 0 && (
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                        <div className="text-sm font-bold text-red-700 mb-1">🚨 CẢNH BÁO</div>
                                        {criticalAlerts.map((alert, idx) => (
                                            <div key={idx} className="text-sm text-red-700">• {alert.message}</div>
                                        ))}
                                    </div>
                                )}

                                {/* Strategic Summary - AI now generates max 50 chars */}
                                {aiData.analysis?.expertAssessment?.strategicView && (
                                    <div className="text-sm text-slate-600">
                                        → {aiData.analysis.expertAssessment.strategicView.substring(0, 80)}{aiData.analysis.expertAssessment.strategicView.length > 80 ? '...' : ''}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════════════
                            SECTION 2: FINANCIAL HEALTH - "The Scale"
                        ══════════════════════════════════════════════════════════════ */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-slate-600" />
                                <span className="font-bold text-sm text-slate-700">CÁN CÂN TÀI CHÍNH</span>
                            </div>

                            {/* Bullet Chart - Visual Scale */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">TSBĐ: <strong className="text-green-600">{formatMoney(collateralValue)}</strong></span>
                                    <span className="text-slate-600">Dư nợ: <strong className="text-blue-600">{formatMoney(totalDebt)}</strong></span>
                                </div>
                                {/* Progress Bar */}
                                <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${ltvRatio >= 100 ? 'bg-green-500' : ltvRatio >= 70 ? 'bg-amber-500' : 'bg-red-500'} transition-all`}
                                        style={{ width: `${Math.min(ltvRatio, 100)}%` }}
                                    ></div>
                                    {/* Target Line at 100% */}
                                    <div className="absolute top-0 right-0 w-0.5 h-full bg-blue-700"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                        {ltvRatio >= 100 ? 'ĐỦ BẢO ĐẢM' : `THIẾU ${formatMoney(unsecuredGap)}`}
                                    </div>
                                </div>
                            </div>

                            {/* Debt Breakdown + Collateral Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                                <div className="p-2 bg-slate-50 rounded">
                                    <div className="font-bold text-slate-700">{formatMoney(principal)}</div>
                                    <div className="text-slate-500">Nợ gốc</div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded">
                                    <div className="font-bold text-slate-700">{formatMoney(interestPenalty)}</div>
                                    <div className="text-slate-500">Lãi + Phạt</div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded">
                                    <div className={`font-bold ${aiData?.extractedData?.collateralDetails?.liquidityAssessment === 'High' ? 'text-green-600' : aiData?.extractedData?.collateralDetails?.liquidityAssessment === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>
                                        {translateEnum(aiData?.extractedData?.collateralDetails?.liquidityAssessment) || 'N/A'}
                                    </div>
                                    <div className="text-slate-500">Thanh khoản</div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded">
                                    <div className="font-bold text-slate-700 leading-tight">
                                        {aiData?.extractedData?.collateralDetails?.seizability || 'N/A'}
                                    </div>
                                    <div className="text-slate-500">Thu giữ</div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════════════
                            SECTION 3: TRI-PILLAR ANALYSIS
                        ══════════════════════════════════════════════════════════════ */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Pillar 1: Khách hàng */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="w-4 h-4 text-slate-600" />
                                    <span className="font-bold text-sm text-slate-700">KHÁCH HÀNG</span>
                                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${aiData?.extractedData?.customerStatus?.willingnessToRepay?.toLowerCase().includes('cao') || aiData?.extractedData?.customerStatus?.willingnessToRepay?.toLowerCase().includes('thiện') ? 'bg-green-100 text-green-700' :
                                        aiData?.extractedData?.customerStatus?.willingnessToRepay?.toLowerCase().includes('thấp') || aiData?.extractedData?.customerStatus?.willingnessToRepay?.toLowerCase().includes('không') ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {(() => {
                                            const willingness = aiData?.extractedData?.customerStatus?.willingnessToRepay?.toLowerCase() || '';
                                            if (willingness.includes('cao') || willingness.includes('thiện chí')) return 'Thiện chí';
                                            if (willingness.includes('thấp') || willingness.includes('không')) return 'Không hợp tác';
                                            return 'Bình thường';
                                        })()}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-500">Năng lực:</span>
                                        <div className="text-slate-700">{aiData?.extractedData?.customerCapability?.repaymentCapacity || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Pháp lý KH:</span>
                                        <div className="text-slate-700">{aiData?.extractedData?.customerStatus?.legalStatus || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pillar 2: Tài sản */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-slate-600" />
                                    <span className="font-bold text-sm text-slate-700">TÀI SẢN</span>
                                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${aiData?.extractedData?.collateralDetails?.legalStatus?.toLowerCase().includes('không tranh chấp') ? 'bg-green-100 text-green-700' :
                                        aiData?.extractedData?.collateralDetails?.legalStatus?.toLowerCase().includes('tranh chấp') ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {aiData?.extractedData?.collateralDetails?.legalStatus?.includes('tranh chấp') ? 'Tranh chấp' : 'OK'}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-500">Loại:</span>
                                        <div className="text-slate-700">{aiData?.extractedData?.collateralDetails?.type || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Tình trạng:</span>
                                        <div className="text-slate-700">{aiData?.extractedData?.collateralDetails?.usageStatus || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pillar 3: Phương án */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Briefcase className="w-4 h-4 text-slate-600" />
                                    <span className="font-bold text-sm text-slate-700">PHƯƠNG ÁN</span>
                                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${aiData?.extractedData?.proposedPlan?.sourceReliability === 'High' ? 'bg-green-100 text-green-700' :
                                        aiData?.extractedData?.proposedPlan?.sourceReliability === 'Low' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {aiData?.extractedData?.proposedPlan?.sourceReliability === 'High' ? 'Tin cậy' :
                                            aiData?.extractedData?.proposedPlan?.sourceReliability === 'Low' ? 'Rủi ro' : 'Trung bình'}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-500">Biện pháp:</span>
                                        <div className="text-slate-700 font-medium">{aiData?.extractedData?.proposedPlan?.summary || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Nguồn tiền:</span>
                                        <div className="text-slate-700">{aiData?.extractedData?.proposedPlan?.repaymentSource || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════════════
                            SECTION 4: STRATEGIC INSIGHTS (Collapsible)
                        ══════════════════════════════════════════════════════════════ */}
                        <div className="bg-white rounded-xl border border-slate-200">
                            <div className="p-4 flex items-center gap-2 border-b border-slate-100">
                                <Search className="w-4 h-4 text-slate-600" />
                                <span className="font-bold text-sm text-slate-700">PHÂN TÍCH CHUYÊN GIA</span>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* SWOT Matrix 2x2 */}
                                {aiData.analysis?.expertAssessment?.swot && (
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <div className="font-bold text-green-700 text-sm mb-1">💪 ĐIỂM MẠNH</div>
                                            {aiData.analysis.expertAssessment.swot.strengths?.map((s, i) => (
                                                <div key={i} className="text-slate-700">• {s}</div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-lg">
                                            <div className="font-bold text-red-700 text-sm mb-1">⚠️ ĐIỂM YẾU</div>
                                            {aiData.analysis.expertAssessment.swot.weaknesses?.map((w, i) => (
                                                <div key={i} className="text-slate-700">• {w}</div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="font-bold text-blue-700 text-sm mb-1">🎯 CƠ HỘI</div>
                                            {aiData.analysis.expertAssessment.swot.opportunities?.map((o, i) => (
                                                <div key={i} className="text-slate-700">• {o}</div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg">
                                            <div className="font-bold text-amber-700 text-sm mb-1">⚡ THÁCH THỨC</div>
                                            {aiData.analysis.expertAssessment.swot.threats?.map((t, i) => (
                                                <div key={i} className="text-slate-700">• {t}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hidden Risks */}
                                {aiData.analysis?.expertAssessment?.hiddenRisks?.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="font-bold text-red-700 text-sm mb-1">❓ RỦI RO ẨN AI PHÁT HIỆN</div>
                                        {aiData.analysis.expertAssessment.hiddenRisks.map((risk, idx) => (
                                            <div key={idx} className="text-sm text-red-700">• {risk}</div>
                                        ))}
                                    </div>
                                )}

                                {/* AI Reasoning */}
                                {aiData.analysis?.recommendation?.reason && (
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <div className="font-bold text-slate-700 text-sm mb-1">🤖 LÝ DO AI ĐỀ XUẤT</div>
                                        <div className="text-sm text-slate-600">{aiData.analysis.recommendation.reason}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════════════
                            SECTION 5: ACTIONABLE FOOTER
                        ══════════════════════════════════════════════════════════════ */}
                        <div className={`rounded-xl border-2 ${colors.border} p-4 space-y-4`}>
                            {/* Critical Note */}
                            {aiData.analysis?.recommendation?.criticalNote && (
                                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                                    <div className="text-xs font-bold text-amber-700">⚠️ LƯU Ý QUAN TRỌNG</div>
                                    <div className="text-sm text-amber-800">{aiData.analysis.recommendation.criticalNote}</div>
                                </div>
                            )}

                            {/* Todo Checklist */}
                            {aiData.analysis?.recommendation?.nextSteps?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-slate-500 mb-2">📋 CHECKLIST CHO CHUYÊN VIÊN</div>
                                    <div className="space-y-1">
                                        {aiData.analysis.recommendation.nextSteps.map((step, idx) => (
                                            <label key={idx} className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                                                <input type="checkbox" className="mt-0.5 rounded" />
                                                <span>{step}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                                <button
                                    onClick={() => onCreateRequest(aiData)}
                                    className={`px-6 py-2.5 ${colors.bg} text-white font-bold rounded-lg hover:opacity-90 transition-opacity`}
                                >
                                    {triageStatus === 'green' ? '✓ Duyệt & Lưu' :
                                        triageStatus === 'red' ? '✗ Từ chối & Lưu' : '? Xem xét & Lưu'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* API Key Modal */}
            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onSave={onApiKeySaved}
            />

            {/* Floating Chat Widget - only show on result step */}
            {importStep === 'result' && aiData && (
                <>
                    {/* Chat Toggle Button */}
                    {!isChatOpen && (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="fixed bottom-6 right-6 w-14 h-14 bg-sky-accent text-white rounded-full shadow-lg hover:bg-sky-accent/90 transition-all flex items-center justify-center z-50"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </button>
                    )}

                    {/* Chat Panel */}
                    {isChatOpen && (
                        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[450px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50">
                            {/* Header */}
                            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-sky-accent text-white rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    <span className="font-bold text-sm">HỎI AI VỀ HỒ SƠ</span>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {chatMessages.length === 0 && (
                                    <div className="text-center text-slate-400 text-sm py-8">
                                        Hỏi AI về hồ sơ này.<br />
                                        VD: "Rủi ro chính là gì?"
                                    </div>
                                )}
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-sky-accent text-white rounded-br-none'
                                            : 'bg-slate-100 text-slate-700 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 text-slate-500 p-2.5 rounded-lg text-sm animate-pulse">
                                            Đang trả lời...
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-slate-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                                        placeholder="Hỏi về hồ sơ..."
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-accent"
                                    />
                                    <button
                                        onClick={sendChatMessage}
                                        disabled={isChatLoading || !chatInput.trim()}
                                        className="px-3 py-2 bg-sky-accent text-white rounded-lg hover:bg-sky-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
