export const RISK_TYPES = [
    { id: 'recovery', label: 'Xử lý & Thu hồi nợ', color: 'text-red-600 bg-red-50' },
    { id: 'restructure', label: 'Cơ cấu lại nợ', color: 'text-blue-600 bg-blue-50' },
    { id: 'seizure', label: 'Thu giữ Tài sản', color: 'text-purple-600 bg-purple-50' },
];

export const INITIAL_REQUESTS = [
    {
        id: 'XLN-2024-001',
        title: 'Phương án xử lý nợ KH Nguyễn Văn A - Nhóm 5',
        type: 'recovery',
        severity: 'high',
        amount: 5200000000, // Tổng dư nợ
        status: 'pending',
        requester: 'Trần Văn B (Cán bộ XLN)',
        department: 'Trung tâm Xử lý nợ - Vùng 1',
        date: '2024-11-20',
        description: 'Khách hàng nợ quá hạn 360 ngày. TSĐB là nhà xưởng định giá 4 tỷ. KH đề xuất bán TSĐB để trả gốc, xin miễn giảm 100% lãi phạt.',
        solution: 'Đồng ý cho KH tự bán TSĐB trong 3 tháng. Nếu không bán được sẽ tiến hành thu giữ.',
        comments: [],
        aiAnalysis: null
    },
    {
        id: 'XLN-2024-005',
        title: 'Cơ cấu nợ Công ty TNHH Hưng Thịnh',
        type: 'restructure',
        severity: 'medium',
        amount: 12500000000,
        status: 'approved',
        requester: 'Lê Thị C',
        department: 'Khối KHDN',
        date: '2024-11-15',
        description: 'DN gặp khó khăn tạm thời do đứt gãy chuỗi cung ứng. Dòng tiền về chậm.',
        solution: 'Giãn nợ gốc 6 tháng, giữ nguyên nhóm nợ.',
        comments: [],
        aiAnalysis: null
    }
];

export const MOCK_AI_RESULT = {
    extractedData: {
        customerName: "Nguyễn Văn A",
        customerInfo: {
            familyRelationships: "Vợ giáo viên, 2 con nhỏ. Gia đình cơ bản.",
            socialRelationships: "Uy tín tốt, chưa có tiền án.",
            movementRoute: "Hà Nội - Hưng Yên (thường xuyên).",
            personalityTraits: "Hợp tác, thật thà, đang lo lắng."
        },
        customerCapability: {
            job: "KD Vật liệu xây dựng tự do.",
            incomeSource: "Lợi nhuận cửa hàng (đang giảm).",
            accumulatedAssets: "Nhà ở Hưng Yên, xe tải 1.5T.",
            repaymentCapacity: "Yếu. Phụ thuộc bán hàng tồn."
        },
        customerStatus: {
            status: "Hoạt động cầm chừng.",
            repaymentHistory: "Quá hạn 3 kỳ.",
            willingnessToRepay: "Thiện chí cao. Chủ động xin cơ cấu.",
            currentGroup: "Nhóm 4",
            legalStatus: "Chưa khởi kiện."
        },
        currentMeasure: "Đôn đốc điện thoại & gặp mặt.",
        debtDetails: {
            totalOutstanding: 5200000000,
            principal: 5000000000,
            interest: 150000000,
            penalty: 50000000,
            note: "Gốc lớn. Lãi phạt tăng nhanh."
        },
        collateralDetails: {
            value: 6500000000,
            description: "Đất & tài sản gắn liền với đất tại Hưng Yên.",
            type: "Bất động sản",
            classification: "Đất ở nông thôn",
            usageStatus: "Để ở & kho bãi.",
            legalStatus: "Sổ đỏ chính chủ. Đang thế chấp.",
            verifiedStatus: "Đã thẩm định 20/10/2023.",
            seizability: "Dễ thu giữ. Không tranh chấp.",
            liquidityAssessment: "Medium"
        },
        proposedPlan: {
            summary: "Ân hạn gốc 12 tháng. Trả lãi hàng tháng.",
            repaymentSource: "Thu từ dự án mới.",
            sourceReliability: "Medium"
        }
    },
    analysis: {
        recoveryScore: 65,
        riskLevel: "High",
        recommendation: {
            action: "review",
            text: "Cần thẩm định lại nguồn thu",
            reason: "Dự án mới chưa chắc chắn. Cần xác minh hợp đồng.",
            criticalNote: "Kiểm tra pháp lý hợp đồng đầu ra.",
            nextSteps: [
                "Cung cấp hợp đồng kinh tế mới.",
                "Thẩm định thực tế KD.",
                "Định giá lại TSBĐ."
            ]
        },
        expertAssessment: {
            swot: {
                strengths: ["TSBĐ phủ nợ.", "KH thiện chí."],
                weaknesses: ["Dòng tiền yếu.", "Nợ nhóm 4."],
                opportunities: ["BĐS ấm lên.", "Dự án mới."],
                threats: ["Thanh khoản chậm.", "Giá VLXD biến động."]
            },
            hiddenRisks: [
                "Tẩu tán tài sản khác?",
                "Hợp đồng giả tạo?"
            ],
            strategicView: "Tạm chấp nhận cơ cấu. Giám sát chặt. Vi phạm 1 kỳ -> Thu giữ ngay."
        }
    },
    ruleEvaluation: {
        triageStatus: "yellow",
        autoRecommendation: "manual_review",
        triggeredRules: [
            {
                code: "R02",
                severity: "warning",
                message: "Nguồn trả nợ không đảm bảo."
            }
        ],
        ltvRatio: 0.8,
        confidenceScore: 0.75
    }
};
