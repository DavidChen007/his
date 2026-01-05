
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMedicalAdvice(symptoms: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `作为一名专业的辅助诊断医生，请根据以下症状提供初步诊断建议（仅供参考）和建议处方药品：
      
      症状：${symptoms}
      
      请以 JSON 格式返回，包含字段：diagnosis (诊断建议), analysis (分析过程), medications (建议药品列表)。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            analysis: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["diagnosis", "analysis", "medications"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function summarizePatientRecord(patient: any) {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `请总结该患者的病历情况：姓名${patient.name}, 年龄${patient.age}, 症状${patient.symptoms}, 诊断${patient.diagnosis}.`
    });
    return response.text;
}
