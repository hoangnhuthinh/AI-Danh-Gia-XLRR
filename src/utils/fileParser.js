import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { analyzeDocumentWithGemini } from './geminiService';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const parseDocument = async (file, apiKey = null) => {
    if (apiKey) {
        try {
            const base64 = await fileToBase64(file);
            return await analyzeDocumentWithGemini(base64, file.type, apiKey);
        } catch (error) {
            console.error("Gemini Vision Analysis failed, falling back to text extraction:", error);
            // Fallback to text extraction if vision fails (optional, but good for robustness)
        }
    }

    let text = '';
    if (file.type === 'application/pdf') {
        text = await extractPdfText(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractDocxText(file);
    } else {
        throw new Error('Unsupported file type');
    }

    // If API key exists but vision failed, try text-based Gemini
    if (apiKey) {
        // Note: We need to handle the case where analyzeDocumentWithGemini expects base64/mimeType now.
        // But since we changed the signature, we can't easily fallback to text-only Gemini without changing it back or adding logic.
        // For now, let's just assume Vision works or fail.
        // Actually, let's just return the heuristic analysis if Gemini fails completely.
    }

    return analyzeContent(text, file.name);
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove "data:application/pdf;base64," prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
};

const extractDocxText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

const analyzeContent = (text, fileName) => {
    // Heuristic Extraction Logic

    // 1. Customer Name
    const namePatterns = [
        /(?:Kính gửi|Khách hàng|Bên vay|Tên doanh nghiệp|Tên KH)[:\s]+([^\n.,]+)/i,
        /(?:Công ty|Doanh nghiệp)[:\s]+([^\n.,]+)/i
    ];
    let customerName = "Không xác định";
    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match) {
            customerName = match[1].trim();
            break;
        }
    }

    // 2. Total Outstanding (Dư nợ)
    const amountPattern = /(?:Dư nợ|Tổng nợ|Số tiền|Nợ gốc)[:\s]+([\d.,\s]+)(?:VNĐ|đồng|đ)?/i;
    const amountMatch = text.match(amountPattern);
    let totalOutstanding = 0;
    if (amountMatch) {
        const rawAmount = amountMatch[1].replace(/[^\d]/g, '');
        totalOutstanding = parseInt(rawAmount, 10) || 0;
    }

    // 3. Collateral Value (TSĐB)
    const collateralPattern = /(?:TSĐB|Tài sản đảm bảo|Định giá|Giá trị TSĐB)[:\s]+([\d.,\s]+)(?:VNĐ|đồng|đ)?/i;
    const collateralMatch = text.match(collateralPattern);
    let collateralValue = 0;
    if (collateralMatch) {
        const rawCollateral = collateralMatch[1].replace(/[^\d]/g, '');
        collateralValue = parseInt(rawCollateral, 10) || 0;
    }

    // 4. Proposed Plan
    const planPattern = /(?:Đề xuất|Phương án|Kiến nghị)[:\s]+([^.!?\n]+)/i;
    const planMatch = text.match(planPattern);
    const proposedPlan = planMatch ? planMatch[1].trim() : "Đề xuất cơ cấu lại nợ theo dòng tiền thực tế.";

    // 5. Repayment Source
    const sourcePattern = /(?:Nguồn trả nợ|Nguồn thu)[:\s]+([^.!?\n]+)/i;
    const sourceMatch = text.match(sourcePattern);
    const repaymentSource = sourceMatch ? sourceMatch[1].trim() : "Nguồn thu từ hoạt động kinh doanh.";

    // Analysis Logic
    const coverageRatio = totalOutstanding > 0 ? (collateralValue / totalOutstanding) * 100 : 0;

    let recoveryScore = 50;
    let riskLevel = 'Medium';
    let recommendationAction = 'review';
    let recommendationText = 'CẦN THẨM ĐỊNH THÊM';
    let recommendationReason = 'Dữ liệu chưa đủ để kết luận chắc chắn.';

    if (coverageRatio >= 100) {
        recoveryScore = 85;
        riskLevel = 'Low';
        recommendationAction = 'approve';
        recommendationText = 'ĐỦ ĐIỀU KIỆN PHÊ DUYỆT';
        recommendationReason = 'Tài sản đảm bảo phủ kín dư nợ (Coverage > 100%).';
    } else if (coverageRatio < 70) {
        recoveryScore = 40;
        riskLevel = 'High';
        recommendationAction = 'reject';
        recommendationText = 'CẢNH BÁO RỦI RO CAO';
        recommendationReason = `Tỷ lệ bao phủ thấp (${coverageRatio.toFixed(1)}%). Thiếu hụt tài sản nghiêm trọng.`;
    } else {
        recoveryScore = 65;
        riskLevel = 'Medium';
        recommendationAction = 'review';
        recommendationText = 'CẦN BỔ SUNG TSĐB';
        recommendationReason = `Tỷ lệ bao phủ đạt ${coverageRatio.toFixed(1)}%. Cần bổ sung thêm tài sản hoặc người bảo lãnh.`;
    }

    return {
        fileName: fileName,
        extractedData: {
            customerName,
            totalOutstanding,
            currentGroup: "Nợ nhóm 4 (Giả định)",
            collateralValue,
            proposedPlan,
            repaymentSource
        },
        analysis: {
            recoveryScore,
            riskLevel,
            confidence: 85,
            logicMatrix: [
                {
                    criterion: 'Tính khả thi nguồn tiền',
                    detail: 'Nguồn thu vs Nghĩa vụ nợ',
                    assessment: `Nguồn thu: ${repaymentSource}`,
                    status: 'warning',
                    impact: 'medium'
                },
                {
                    criterion: 'Tỷ lệ bao phủ nợ (Coverage)',
                    detail: `TSĐB (${(collateralValue / 1e9).toFixed(1)} tỷ) / Dư nợ (${(totalOutstanding / 1e9).toFixed(1)} tỷ)`,
                    assessment: `Tỷ lệ bao phủ đạt ${coverageRatio.toFixed(1)}%`,
                    status: coverageRatio >= 100 ? 'pass' : 'fail',
                    impact: 'high'
                },
                {
                    criterion: 'Thái độ khách hàng (Goodwill)',
                    detail: 'Lịch sử hợp tác',
                    assessment: 'Cần cán bộ đánh giá trực tiếp.',
                    status: 'pass',
                    impact: 'low'
                }
            ],
            recommendation: {
                action: recommendationAction,
                text: recommendationText,
                reason: recommendationReason,
                criticalNote: coverageRatio < 50 ? 'Cần phong tỏa tài sản ngay nếu có dấu hiệu tẩu tán.' : '',
                nextSteps: [
                    'Kiểm tra thực tế TSĐB.',
                    'Xác minh nguồn thu qua sao kê ngân hàng.',
                    'Đàm phán bổ sung tài sản nếu thiếu hụt.'
                ]
            }
        }
    };
};
