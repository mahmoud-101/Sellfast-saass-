
import { PowerStudioResult } from '../types';
import { ENV } from '../utils/env';
import { parseRobustJSON } from '../utils/safeJson';

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
        "competitors": "Competitive landscape overview"
      },
      "adScript": "Full advertising script in Arabic",
      "targetAudience": {
        "demographics": "Age, gender, interests",
        "psychographics": "Mindset and motivations"
      },
      "kpis": {
        "expectedCTR": "Expected click-through rate",
        "expectedROAS": "Expected return on ad spend"
      }
    }
  `;

  const apiKey = ENV.XAI_API_KEY;
  if (!apiKey) {
    console.warn('[Grok] XAI API key not configured — returning empty strategy');
    return {};
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: strategyPrompt }],
        model: 'grok-beta',
        stream: false,
        temperature: 0
      })
    });

    if (!response.ok) {
      console.warn(`[Grok] API error: ${response.status}`);
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('[Grok] Empty response from API');
      return {};
    }

    return parseRobustJSON(content, {});
  } catch (error) {
    console.warn('[Grok] Service error:', error);
    return {};
  }
}

export async function runGrokCreativeDirector(productDescription: string, targetAudience: string): Promise<Partial<PowerStudioResult>> {
  const apiKey = ENV.XAI_API_KEY;
  if (!apiKey) return {};

  const directorPrompt = `
    Role: You are a creative director for a top advertising agency.
    Analyze this product and create 3 unique creative angles:

    Product: ${productDescription}
    Target: ${targetAudience}

    Return a JSON object with this exact structure:
    {
      "creativeAngles": [
        {
          "concept": "Creative concept name",
          "hook": "Attention-grabbing hook",
          "emotionalTrigger": "Primary emotion to target",
          "visualDirection": "Detailed visual prompt for AI image generation",
          "adCopy": "Complete ad copy in Arabic"
        }
      ]
    }
  `;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: directorPrompt }],
        model: 'grok-beta',
        stream: false,
        temperature: 0.7
      })
    });

    if (!response.ok) return {};
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return parseRobustJSON(content || '', {});
  } catch {
    return {};
  }
}

/**
 * Cinematic motion prompt generator (stub — returns static prompt)
 */
export function getCinematicMotionPrompt(scene: string): string {
  return `Cinematic tracking shot: ${scene}. Professional lighting, high production value, 24fps film look.`;
}
