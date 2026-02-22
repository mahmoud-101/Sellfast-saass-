
import { PowerStudioResult } from '../types';

const XAI_API_KEY = process.env.XAI_API_KEY;

export async function runGrokStrategy(goal: string, targetMarket: string, dialect: string): Promise<Partial<PowerStudioResult>> {
    const strategyPrompt = `
    Role: You are a world-class strategic marketing expert.
    Task: Create a complete high-end marketing strategy in ARABIC for the following:
    Project Goal: ${goal}
    Target Market: ${targetMarket}
    Preferred Dialect: ${dialect}

    Return a JSON object with this exact structure (No markdown, just pure JSON):
    {
      "analysis": "Executive summary of the strategy",
      "visualPrompt": "Detailed English prompt for AI image generation representing the brand",
      "marketAnalysis": {
        "demand": "Market demand level",
        "trends": ["Trend 1", "Trend 2"],
        "customerBehavior": "Behavior analysis",
        "opportunities": ["Opportunity 1"],
        "challenges": ["Challenge 1"],
        "competitorGaps": ["Gap 1"]
      },
      "personas": [
        {
          "name": "Persona Name",
          "demographics": {"age": "Age", "gender": "Gender", "income": "Income", "location": "Location"},
          "lifestyle": "Lifestyle description",
          "interests": ["Interest 1"],
          "painPoints": ["Problem 1"],
          "buyingTriggers": ["Why they buy"],
          "trustFactors": ["Why they trust"],
          "platforms": ["Platform 1"],
          "preferredContent": "Content type"
        }
      ],
      "swot": {
        "strengths": ["S1"],
        "weaknesses": ["W1"],
        "opportunities": ["O1"],
        "threats": ["T1"],
        "impactAnalysis": "Detailed impact study"
      },
      "valueProp": {
        "usp": "Unique selling point",
        "slogan": "Catchy Arabic slogan",
        "functionalBenefit": "Practical benefit",
        "emotionalBenefit": "Emotional benefit",
        "whyUs": "Reasons to choose us"
      },
      "channelPlan": {
        "organic": {"platforms": ["P1"], "axes": ["Axis 1"], "frequency": "Posts/week"},
        "ads": {"platforms": ["P1"], "objectives": "Campaign goals"},
        "extra": {"influencers": "Role", "whatsapp": "Role", "email": "Role", "seo": "Role"}
      },
      "contentPlan": {
        "educational": ["10 ideas here"],
        "entertainment": ["10 ideas here"],
        "sales": ["10 ideas here"],
        "mixRatio": "e.g., 70% useful, 30% sales"
      }
    }
    `;

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${XAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-2-latest",
                messages: [
                    { role: "system", content: "You are a professional marketing consultant. Respond only with JSON." },
                    { role: "user", content: strategyPrompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;
    } catch (error) {
        console.error("Grok API Error:", error);
        throw new Error("فشل محرك Grok في تحليل البيانات، يرجى المحاولة لاحقاً.");
    }
}

/**
 * استخدام Grok لكتابة أوامر الحركة السينمائية
 */
export async function getCinematicMotionPrompt(sceneDescription: string, cameraAngle: string): Promise<string> {
    const prompt = `Act as a cinematic director. Convert this scene description into a technical AI VIDEO MOTION PROMPT. 
    Scene: ${sceneDescription}
    Angle: ${cameraAngle}
    Focus on: Fluid camera movement, light changes, and specific object animation. 
    Return ONLY the English motion prompt text.`;

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${XAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-2-latest",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        return `Cinematic ${cameraAngle} with smooth natural movement and high-end lighting transitions.`;
    }
}
