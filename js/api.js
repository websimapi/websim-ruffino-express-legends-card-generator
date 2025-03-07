export async function getCardDescription() {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a creative description for a new Ruffino Express Legends card. Choose one of these card types:
        1. Vehicle Card: Including make, model, condition, and special abilities
        2. Staff Card: Including name, role, and unique abilities
        3. Tool & Upgrade Card: Including name and effects
        4. Service Challenge Card: Including challenge name, difficulty, requirements and rewards

        Response should follow this JSON schema:
        {
          name: string; // Card name
          description: string; // Detailed description 
          type: string; // "Vehicle", "Staff", "Tool", or "Challenge"
          attributes: string; // Key stats for Vehicle/Staff cards, or requirements/rewards for Challenge cards
          impact: string; // Effects on gameplay mechanics
        }

        Example response (generate something completely different):
        {
          "name": "Master Tech Sarah",
          "description": "A highly skilled technician specializing in diagnostic troubleshooting. Her keen eye and years of experience give her an edge in complex repairs.",
          "type": "Staff",
          "attributes": "Expert Diagnostics | Team Leadership | Training",
          "impact": "Reduces diagnostic time by 50% | Can mentor other staff cards"
        }`,
        data: ""
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching card description:', error);
    return {
      name: 'Error',
      description: 'Failed to generate card description',
      type: 'Unknown',
      attributes: 'Unknown', 
      impact: 'Unknown'
    };
  }
}

export async function generateCardImage(description) {
  try {
    const result = await websim.imageGen({
      prompt: `Professional style trading card art of an auto repair shop scene showing ${description}. Digital illustration style, clean lines, automotive repair theme, professional appearance, well-lit garage environment, tools and equipment visible, full scene visible`,
      aspect_ratio: "1:1",
    });
    return result.url;
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
}

