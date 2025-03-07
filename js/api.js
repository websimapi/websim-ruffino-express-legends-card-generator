export async function getCardDescription() {
  try {
    // 50/50 chance of staff vs other card types
    const isStaffCard = Math.random() < 0.5;
    
    let prompt;
    if (isStaffCard) {
      // Weighted staff selection
      const staffRoll = Math.random();
      let selectedStaff;
      
      // Josh and Liz have higher probability (35% each)
      // Others split remaining 30% (10% each)
      if (staffRoll < 0.35) {
        selectedStaff = "Josh";
      } else if (staffRoll < 0.70) {
        selectedStaff = "Liz";
      } else if (staffRoll < 0.80) {
        selectedStaff = "Elizabeth";
      } else if (staffRoll < 0.90) {
        selectedStaff = "Rob";
      } else {
        selectedStaff = "Dylan";
      }

      // Special handling for Rob's cards
      const isRobCard = selectedStaff === "Rob";
      
      prompt = `Generate details for a Ruffino Express Legends staff card focused on ${selectedStaff}${isRobCard ? " (In Memoriam)" : ""}. Choose from these staff personas:

1. Elizabeth – Managing Partner: Expert in customer service management and operations
2. Josh – Master Technician: Advanced diagnostics and repair expert, bald appearance
3. Liz – Customer Relations Specialist: Communication and customer satisfaction expert 
4. Rob – Senior Technician (In Memoriam): ${isRobCard ? "Dedicated senior technician remembered for his exceptional skill, friendly demeanor, and ability to handle the most challenging repairs. Large build with a scruffy appearance, he left a lasting impact on the shop and its customers." : "Complex repair and problem-solving specialist"}
5. Dylan – Diagnostic Specialist: Expert in vehicle diagnostics and troubleshooting

Response should follow this JSON schema:
{
  name: string; // Staff name with role (e.g. "Josh - Master Technician")
  description: string; // Detailed background and personality description 
  type: string; // Always "Staff"
  height: string; // Experience level (e.g. "Expert Level")
  weight: string; // Specialty focus (e.g. "Diagnostics")
  attributes: string; // Key skills and specialties
  impact: string; // Special abilities and gameplay effects
}`;

    } else {
      prompt = `Generate a creative description for a new Ruffino Express Legends card. Choose one of these card types:
        1. Vehicle Card: Including make, model, condition, and special abilities
        2. Tool & Upgrade Card: Including name and effects
        3. Service Challenge Card: Including challenge name, difficulty, requirements and rewards

        Response should follow this JSON schema:
        {
          name: string; // Card name
          description: string; // Detailed background or specifications
          type: string; // "Vehicle", "Tool", or "Challenge" 
          height: string; // For vehicles: dimensions, for tools: size class, for challenges: scope
          weight: string; // For vehicles: weight class, for tools: handling metric, for challenges: difficulty level
          attributes: string; // Key features or stats - keep brief
          impact: string; // Gameplay effects and special abilities
        }

        Example Vehicle response:
        {
          "name": "2020 Chevrolet Tahoe LT",
          "description": "A well-maintained SUV featuring premium brake system upgrades and a recently overhauled transmission. Known for exceptional durability and reliability in challenging service conditions.",
          "type": "Vehicle", 
          "height": "Full-Size SUV",
          "weight": "5,500 lbs",
          "attributes": "Durability 8/10 | Premium Brakes | New Transmission",
          "impact": "Can handle two repair tasks per turn | 25% faster service completion"
        }`;
    }

    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        data: ""
      }),
    });
    
    const data = await response.json();
    // Ensure type is set
    if (!data.type) {
      data.type = isStaffCard ? "Staff" : "Vehicle";
    }
    return data;
  } catch (error) {
    console.error('Error fetching card description:', error);
    return {
      name: 'Error',
      description: 'Failed to generate card description',
      type: 'Unknown',
      height: 'Unknown',
      weight: 'Unknown',
      attributes: 'Unknown',
      impact: 'Unknown'
    };
  }
}