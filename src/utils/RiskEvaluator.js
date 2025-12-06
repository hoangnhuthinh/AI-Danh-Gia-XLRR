/**
 * RiskEvaluator.js
 * 
 * Logic engine to evaluate Debt Recovery Proposals (PA XLRR) based on AI-extracted data.
 * Implements rules defined in logic_rules_proposal.md.
 */

export const evaluateRisk = (aiData) => {
    if (!aiData) return null;

    const { analysis, debtDetails, collateralDetails, customerStatus, proposedPlan, customerInfo, expertAssessment } = aiData.extractedData ? aiData : { extractedData: aiData }; // Handle potential structure variations if needed, but assuming standard structure based on mockData

    // Helper to safely access nested properties
    const safeGet = (obj, path, defaultValue = null) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    };

    // --- Data Extraction & Normalization ---
    const recoveryScore = safeGet(aiData, 'analysis.recoveryScore', 0);
    const riskLevel = safeGet(aiData, 'analysis.riskLevel', 'High');
    const totalOutstanding = safeGet(aiData, 'extractedData.debtDetails.totalOutstanding', 0);
    const collateralValue = safeGet(aiData, 'extractedData.collateralDetails.value', 0);
    const legalStatus = safeGet(aiData, 'extractedData.collateralDetails.legalStatus', '');
    const willingness = safeGet(aiData, 'extractedData.customerStatus.willingnessToRepay', '');
    const sourceReliability = safeGet(aiData, 'extractedData.proposedPlan.sourceReliability', 'Low');
    const repaymentCapacity = safeGet(aiData, 'extractedData.customerCapability.repaymentCapacity', '');
    const movementRoute = safeGet(aiData, 'extractedData.customerInfo.movementRoute', '');
    const hiddenRisks = safeGet(aiData, 'analysis.expertAssessment.hiddenRisks', []);
    const repaymentHistory = safeGet(aiData, 'extractedData.customerStatus.repaymentHistory', '');
    const liquidityAssessment = safeGet(aiData, 'extractedData.collateralDetails.liquidityAssessment', '');

    const ltvRatio = collateralValue > 0 ? totalOutstanding / collateralValue : 999; // High LTV if no collateral

    const triggeredRules = [];

    // --- 2. Specific Flags (Rules R01-R05) ---

    // R01: Rủi ro Pháp lý TSBĐ
    const isLegalOk = legalStatus.toLowerCase().includes('sổ đỏ') || legalStatus.toLowerCase().includes('không tranh chấp');
    const isLegalBad = legalStatus.toLowerCase().includes('tranh chấp') || legalStatus.toLowerCase().includes('chưa có sổ');
    if (!isLegalOk || isLegalBad) {
        triggeredRules.push({
            code: 'R01',
            severity: 'error', // Red flag
            message: 'Pháp lý TSBĐ chưa rõ ràng hoặc có tranh chấp.'
        });
    }

    // R02: Nguồn thu Bấp bênh
    if (sourceReliability === 'Low' || repaymentCapacity.toLowerCase().includes('yếu')) {
        triggeredRules.push({
            code: 'R02',
            severity: 'warning',
            message: 'Nguồn trả nợ không đảm bảo.'
        });
    }

    // R03: Rủi ro Tẩu tán
    const hasHiddenRisk = Array.isArray(hiddenRisks) && hiddenRisks.some(r => r.toLowerCase().includes('tẩu tán'));
    if (hasHiddenRisk) {
        triggeredRules.push({
            code: 'R03',
            severity: 'critical',
            message: 'Cảnh báo khẩn: Có dấu hiệu tẩu tán tài sản.'
        });
    }

    // R04: Mâu thuẫn Thông tin
    if (willingness.toLowerCase().includes('cao') && repaymentHistory.toLowerCase().includes('quá hạn dài')) {
        triggeredRules.push({
            code: 'R04',
            severity: 'info',
            message: 'Nghi vấn: Khách hàng thiện chí nhưng lịch sử trả nợ xấu.'
        });
    }

    // R05: Biến động Giá trị
    if (liquidityAssessment === 'Low') {
        triggeredRules.push({
            code: 'R05',
            severity: 'warning',
            message: 'TSBĐ khó thanh khoản. Cần định giá thận trọng.'
        });
    }

    // --- 1. Triage Logic (Phân luồng) ---
    let triageStatus = 'red'; // Default to Red
    let autoRecommendation = 'manual_review';

    // Check Green Lane
    const isGreen =
        recoveryScore >= 80 &&
        riskLevel === 'Low' &&
        ltvRatio <= 0.7 &&
        isLegalOk &&
        (willingness.toLowerCase().includes('thiện chí') || willingness.toLowerCase().includes('cao'));

    // Check Yellow Lane
    const isYellow =
        (recoveryScore >= 50 && recoveryScore < 80) ||
        riskLevel === 'Medium' ||
        (ltvRatio > 0.7 && ltvRatio <= 1.0) ||
        sourceReliability === 'Medium';

    if (isGreen) {
        triageStatus = 'green';
        autoRecommendation = 'approve_fast';
    } else if (isYellow) {
        triageStatus = 'yellow';
        autoRecommendation = 'manual_review';
    } else {
        triageStatus = 'red';
        autoRecommendation = 'reject_or_seize';
    }

    // Override based on Critical Rules
    if (triggeredRules.some(r => r.severity === 'critical')) {
        triageStatus = 'red';
        autoRecommendation = 'escalate_immediate';
    }

    return {
        triageStatus,
        autoRecommendation,
        triggeredRules,
        ltvRatio,
        confidenceScore: 0.85 // Placeholder or calculated based on data completeness
    };
};
