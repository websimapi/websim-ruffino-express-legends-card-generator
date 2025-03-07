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
        2. Staff Card: Including name, role, and unique abilities like Josh (Master Technician) or Elizabeth (Customer Relations Expert)
        3. Tool & Upgrade Card: Including name and effects
        4. Service Challenge Card: Including challenge name, difficulty, requirements and rewards

        Response should follow this JSON schema:
        {
          name: string; // Card name with role for staff cards (e.g. "Josh - Master Technician")
          description: string; // Detailed background and personality for staff, or specs/history for vehicles
          type: string; // "Vehicle", "Staff", "Tool", or "Challenge"
          attributes: string; // Key abilities or stats - keep brief, put details in description
          impact: string; // Gameplay effects and special abilities
        }

        For staff examples:
        {
          "name": "Elizabeth - Customer Relations Expert",
          "description": "A charismatic professional with years of experience in automotive customer service. Known for turning difficult situations into opportunities and maintaining strong client relationships.",
          "type": "Staff",
          "attributes": "Client Trust | Communication | Management",
          "impact": "Boosts satisfaction ratings +20% | Can reroll challenge outcomes"
        }
        {
          "name": "Josh - Master Technician", 
          "description": "A highly skilled veteran mechanic with over 15 years of experience. Specializes in complex diagnostics and engine rebuilds. Mentors junior staff members.",
          "type": "Staff",
          "attributes": "Expert Diagnostics | Leadership | Training",
          "impact": "Reduces repair time 50% | Prevents one service failure per game"
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
      prompt: `Professional automotive repair shop scene showing ${description}. Digital illustration style, clean lines, professional appearance, well-lit garage environment with tools and equipment visible. Clear full view of entire scene without cropping.`,
      width: 512,
      height: 512
    });
    return result.url;
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
}