
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationState, Scenario } from "../types";

export class GeminiInsightsService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeCurrentState(state: SimulationState) {
    try {
      const prompt = `
        Analyze the following operational state of a customer support team:
        - Active Cases in Queue: ${state.queueLength}
        - Current Agents: ${state.agentCount}
        - Case Arrival Rate: ${state.arrivalRate} cases/hr
        - Current Breach Probability: ${state.projectedBreachProbability}%
        - Cumulative Breaches: ${state.breachCount}
        
        Provide a concise, expert operational insight and 3 recommended actions.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "riskLevel", "recommendations"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return null;
    }
  }

  async evaluateScenario(baseState: SimulationState, scenario: Scenario) {
    try {
      const prompt = `
        Evaluate this "What-If" scenario for a support queue:
        BASE STATE: ${baseState.queueLength} cases, ${baseState.agentCount} agents.
        CHANGE: ${scenario.name} (Adding ${scenario.agentAdjustment} agents).
        
        Predict the outcome compared to baseline. Be realistic about operational friction.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breachReduction: { type: Type.NUMBER, description: "Percentage reduction in breaches" },
              waitTimeChange: { type: Type.NUMBER, description: "Change in minutes" },
              recommendation: { type: Type.STRING }
            },
            required: ["breachReduction", "waitTimeChange", "recommendation"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini scenario evaluation failed:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiInsightsService();
