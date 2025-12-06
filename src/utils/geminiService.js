export const analyzeDocumentWithGemini = async (base64Data, mimeType, apiKey) => {
  // Use the model that we verified works via curl
  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const prompt = `
      Bạn là một GIÁM ĐỐC XỬ LÝ NỢ CẤP CAO với hơn 30 năm kinh nghiệm trong lĩnh vực ngân hàng và tái cấu trúc doanh nghiệp.
      Nhiệm vụ của bạn là phân tích hồ sơ/tờ trình xử lý nợ đính kèm để đưa ra đánh giá sắc sảo, thận trọng và phương án xử lý tối ưu nhất.

      Hãy phân tích tài liệu đính kèm và trích xuất/đánh giá các thông tin sau:

      1.  **Thông tin Dư nợ (Debt Details)**:
          -   Tổng dư nợ, tách bóc nợ gốc, lãi, phạt (nếu có).
          -   Cơ cấu nợ hiện tại.
      2.  **Trạng thái Khách hàng (Customer Status)**:
          -   Nhóm nợ hiện tại.
          -   Lịch sử quan hệ tín dụng (có nợ xấu tại TCTD khác không?).
          -   Tình trạng pháp lý của KH (đang hoạt động, dừng hoạt động, hay đang tranh chấp?).
      3.  **Tài sản Bảo đảm (Collateral)**:
          -   Mô tả chi tiết tài sản.
          -   Giá trị định giá gần nhất.
          -   Tính thanh khoản (Dễ bán hay khó bán?).
          -   Tình trạng pháp lý TSĐB (Có tranh chấp, bị kê biên không?).
      4.  **Phương án Xử lý & Nguồn tiền (Resolution Plan & Cash Flow)**:
          -   Phương án KH đề xuất là gì?
          -   Nguồn tiền trả nợ từ đâu? (Kinh doanh, bán tài sản, hay vay ngoài?).
          -   Đánh giá tính khả thi của nguồn tiền này (Cao/Trung bình/Thấp).
      LƯU Ý QUAN TRỌNG VỀ VĂN PHONG (TONE & STYLE):
      - **NGẮN GỌN, SÚC TÍCH**: Tuyệt đối KHÔNG viết văn dài dòng. GĐ Vùng cần đọc nhanh.
      - **TRỌNG TÂM**: Đi thẳng vào vấn đề. Ví dụ: thay vì "Khách hàng có tính cách rất hòa đồng...", hãy viết "Hòa đồng, hợp tác tốt."
      - **GẠCH ĐẦU DÒNG**: Sử dụng các ý chính.
      - **TIẾNG VIỆT**: 100% Tiếng Việt.

      5.  **Nhận định Chuyên gia (Expert Assessment)**:
          -   Phân tích SWOT nhanh (Điểm mạnh/Yếu/Cơ hội/Rủi ro).
          -   Rủi ro tiềm ẩn: Vạch trần các điểm mờ.
          -   Chiến lược: Đề xuất ngắn gọn (Cơ cấu/Thu giữ).

      LƯU Ý QUAN TRỌNG: 
      - Tất cả các nội dung văn bản (description, summary, reason, strategicView,...) PHẢI trả về bằng TIẾNG VIỆT.
      - Các giá trị Enum (High, Medium, Low, approve, reject...) giữ nguyên tiếng Anh.

      Trả về kết quả CHỈ LÀ MỘT JSON DUY NHẤT (không có markdown block) với cấu trúc sau:
      {
        "extractedData": {
          "customerName": "string",
          "customerInfo": {
            "familyRelationships": "string", // Quan hệ gia đình
            "socialRelationships": "string", // Quan hệ xã hội
            "movementRoute": "string", // Lộ trình di chuyển
            "personalityTraits": "string" // Đặc điểm tính cách
          },
          "customerCapability": {
            "job": "string", // Công việc
            "incomeSource": "string", // Nguồn thu nhập
            "accumulatedAssets": "string", // Tài sản tích lũy
            "repaymentCapacity": "string" // Khả năng trả nợ
          },
          "customerStatus": {
            "status": "string", // Tình trạng của KH
            "repaymentHistory": "string", // Lịch sử trả nợ
            "willingnessToRepay": "string", // Thiện chí trả nợ
            "currentGroup": "string",
            "legalStatus": "string"
          },
          "currentMeasure": "string", // Biện pháp XLRR hiện tại
          "debtDetails": {
            "totalOutstanding": number,
            "principal": number,
            "interest": number,
            "penalty": number,
            "note": "string"
          },
          "collateralDetails": {
            "value": number,
            "description": "string",
            "type": "string", // Loại TS
            "classification": "string", // Phân loại chi tiết TS
            "usageStatus": "string", // Tình trạng sử dụng
            "legalStatus": "string", // Tính pháp lý
            "verifiedStatus": "string", // Đã xác minh TSBĐ
            "seizability": "string", // Khả năng thu giữ
            "liquidityAssessment": "High" | "Medium" | "Low" // Thanh khoản của TS
          },
          "proposedPlan": {
            "summary": "string",
            "repaymentSource": "string", // Nguồn tiền
            "sourceReliability": "High" | "Medium" | "Low"
          }
        },
          "customerStatus": {
            "currentGroup": "string",
            "history": "string",
            "legalStatus": "string"
          },
          "collateralDetails": {
            "description": "string",
            "value": number,
            "liquidityAssessment": "High" | "Medium" | "Low",
            "legalStatus": "string"
          },
          "proposedPlan": {
            "summary": "string",
            "repaymentSource": "string",
            "sourceReliability": "High" | "Medium" | "Low"
          }
        },
        "analysis": {
          "recoveryScore": number (0-100),
          "riskLevel": "Low" | "Medium" | "High",
          "expertAssessment": {
            "swot": {
              "strengths": ["string"],
              "weaknesses": ["string"],
              "opportunities": ["string"],
              "threats": ["string"]
            },
            "hiddenRisks": ["string"],
            "strategicView": "string"
          },
          "recommendation": {
            "action": "approve" | "reject" | "review",
            "text": "string",
            "reason": "string",
            "criticalNote": "string",
            "nextSteps": ["string"]
          }
        }
      }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
      throw new Error("Gemini returned empty response");
    }

    let textResponse = data.candidates[0].content.parts[0].text;
    // Clean up markdown code blocks if present
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(textResponse);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Lỗi phân tích AI: ${error.message}`);
  }
};
