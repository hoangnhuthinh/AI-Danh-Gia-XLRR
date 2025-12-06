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
          -   Chiến lược (strategicView): TỐI ĐA 50 KÝ TỰ! Format: "[Hành động] vì [lý do chính]". Ví dụ: "Cơ cấu vì KH thiện chí, TSBĐ đủ." hoặc "Thu giữ vì mất liên lạc."

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
    console.log("[geminiService] Calling Gemini API:", url.split('?')[0]); // Don't log the API key!
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

    console.log("[geminiService] Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[geminiService] API Error:", errorData);
      throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[geminiService] Raw response candidates:", data.candidates?.length);

    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
      console.error("[geminiService] Empty response structure:", data);
      throw new Error("Gemini returned empty response");
    }

    let textResponse = data.candidates[0].content.parts[0].text;
    console.log("[geminiService] Text response (first 500 chars):", textResponse.substring(0, 500));

    // Clean up markdown code blocks if present
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(textResponse);
    console.log("[geminiService] Parsed result - has analysis:", !!parsed.analysis, "has extractedData:", !!parsed.extractedData);
    return parsed;

  } catch (error) {
    console.error("[geminiService] Analysis Error:", error);
    throw new Error(`Lỗi phân tích AI: ${error.message}`);
  }
};

// Test API key connection
export const testApiKey = async (apiKey) => {
  if (!apiKey || apiKey.length < 10) return false;

  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond with: OK" }] }]
      })
    });

    if (!response.ok) {
      console.warn("[testApiKey] API test failed:", response.status);
      return false;
    }

    console.log("[testApiKey] ✅ API key is valid");
    return true;
  } catch (error) {
    console.warn("[testApiKey] Connection error:", error.message);
    return false;
  }
};

// Chat with AI about the analyzed document
export const chatWithContext = async (question, documentContext, apiKey) => {
  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const contextSummary = `
DỮ LIỆU HỒ SƠ ĐÃ PHÂN TÍCH:
- Khách hàng: ${documentContext.customerName || 'N/A'}
- Nhóm nợ: ${documentContext.customerStatus?.currentGroup || 'N/A'}
- Tổng dư nợ: ${documentContext.debtDetails?.totalOutstanding?.toLocaleString('vi-VN') || 'N/A'} VNĐ
- Nợ gốc: ${documentContext.debtDetails?.principal?.toLocaleString('vi-VN') || 'N/A'} VNĐ
- Lãi + Phạt: ${((documentContext.debtDetails?.interest || 0) + (documentContext.debtDetails?.penalty || 0)).toLocaleString('vi-VN')} VNĐ
- TSBĐ: ${documentContext.collateralDetails?.type || 'N/A'}, giá trị ${documentContext.collateralDetails?.value?.toLocaleString('vi-VN') || 'N/A'} VNĐ
- Thanh khoản TSBĐ: ${documentContext.collateralDetails?.liquidityAssessment || 'N/A'}
- Pháp lý TSBĐ: ${documentContext.collateralDetails?.legalStatus || 'N/A'}
- Thiện chí KH: ${documentContext.customerStatus?.willingnessToRepay || 'N/A'}
- Phương án đề xuất: ${documentContext.proposedPlan?.summary || 'N/A'}
- Nguồn tiền: ${documentContext.proposedPlan?.repaymentSource || 'N/A'}
`;

  const prompt = `Bạn là trợ lý AI hỗ trợ phân tích hồ sơ xử lý nợ. Dựa trên dữ liệu hồ sơ bên dưới, hãy trả lời câu hỏi của người dùng một cách NGẮN GỌN, SÚC TÍCH (tối đa 3-4 câu).

${contextSummary}

CÂU HỎI: ${question}

Trả lời bằng tiếng Việt, đi thẳng vào vấn đề:`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    return answer.trim();
  } catch (error) {
    console.error("[chatWithContext] Error:", error);
    throw error;
  }
};
