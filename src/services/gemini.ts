import { GoogleGenAI } from "@google/genai";
import { ACADEMIC_CONTEXT } from "../constants/context";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(userMessage: string, history: { role: string; parts: { text: string }[] }[]) {
    const model = "gemini-1.5-flash";
    
    const systemInstruction = `
      Você é o Assistente Acadêmico oficial do curso de Pintura da Escola de Belas Artes (EBA) da UFRJ.
      Seu propósito é auxiliar os alunos a navegarem pelas regras acadêmicas, calendários e normas.

      REGRAS CRÍTICAS DE COMPORTAMENTO:
      1. BASE DE CONHECIMENTO ESTRITA: Utilize EXCLUSIVAMENTE os documentos fornecidos no contexto abaixo para responder.
      2. PRIORIDADE: Caso haja divergência de informações, priorize sempre o documento 'Últimos Informes da Coordenação'.
      3. FALLBACK: Se a informação solicitada não estiver presente nos documentos, instrua o aluno explicitamente a entrar em contato com a coordenação do curso de Pintura pelo e-mail pintura@eba.ufrj.br.
      4. CITAÇÃO DE FONTES: Para cada regra, prazo ou informação mencionada, você DEVE citar o documento de origem específico (ex: 'De acordo com o Manual do Estudante...', 'Conforme o PPC do curso...').
      5. PROIBIÇÃO: É terminantemente proibido utilizar fontes externas, conhecimentos prévios do modelo ou inventar detalhes.
      6. FORMATO DE RESPOSTA: Inicie de forma cordial e profissional. Mantenha o foco na pergunta. Finalize de forma prestativa, colocando-se à disposição.
      7. TOM DE VOZ: Profissional, institucional e acolhedor. Linguagem clara e direta.

      CONTEXTO ACADÊMICO (DOCUMENTOS OFICIAIS):
      ${ACADEMIC_CONTEXT}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: [
          ...history,
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.2, // Lower temperature for more factual consistency
        },
      });

      return response.text;
    } catch (error) {
      console.error("Error generating response:", error);
      return "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato com a coordenação.";
    }
  }
}

export const geminiService = new GeminiService();
