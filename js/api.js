// Keep track of previous generations to avoid repetition
let previousGenerations = {
  staff: [],
  vehicle: [],
  tool: [],
  challenge: []
};

// Max items to keep in history
const MAX_HISTORY = 10;

export async function getCardDescription() {
  try {
    const isStaffCard = Math.random() < 0.5;
    
    let prompt;
    if (isStaffCard) {
      const staffRoll = Math.random();
      let selectedStaff;
      
      // Josh and Liz have higher probability (35% each)
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

      const isRobCard = selectedStaff === "Rob";

      // Build negative examples from history
      const previousExamples = previousGenerations.staff
        .map(prev => `Previous card:\n${JSON.stringify(prev, null, 2)}`)
        .join('\n\n');
      
      prompt = `Generate a unique and creative staff card description for ${selectedStaff}${isRobCard ? " (In Memoriam)" : ""} at Ruffino Express Auto Repair.

Create a card that is distinctly different from these previous generations:

${previousExamples}

For context, here are their roles:
- Elizabeth: Managing Partner, operations and customer service expert
- Josh: Master Technician, bald appearance, specializes in complex repairs
- Liz: Customer Relations Specialist, communication expert
- Rob: Senior Technician (In Memoriam), remembered for exceptional skill and friendly demeanor
- Dylan: Diagnostic Specialist, troubleshooting expert

Key points to vary:
- Create unique personality traits and backstory elements
- Vary their expertise focus and specialties
- Generate different skill combinations
- Develop new and creative impact effects
- Use different terminology and phrasing

Response must follow this JSON schema:
{
  name: string; // Staff name with role (e.g. "Josh - Master Technician") 
  description: string; // Unique personality traits and background story
  type: string; // Always "Staff"
  height: string; // Experience level (e.g. "Master Level", "Expert Class", "Senior Grade")
  weight: string; // Area of expertise (e.g. "Engine Specialist", "Customer Relations", "Shop Operations")
  attributes: string; // Key skills and traits - be creative and vary these
  impact: string; // Unique gameplay effects that fit their role
}`;

    } else {
      const cardTypes = ["Vehicle", "Tool", "Challenge"];
      const selectedType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      
      // Get relevant previous generations
      const previousExamples = previousGenerations[selectedType.toLowerCase()]
        .map(prev => `Previous card:\n${JSON.stringify(prev, null, 2)}`)
        .join('\n\n');

      const vehicleBrands = [
        "Ford", "Chevrolet", "Toyota", "Honda", "Jeep", "RAM", "Dodge", 
        "Nissan", "Hyundai", "Kia", "Subaru", "Volkswagen", "BMW", "Mercedes-Benz"
      ];
      
      const vehicleTypes = [
        "Truck", "SUV", "Sedan", "Crossover", "Van", "Sports Car", 
        "Luxury Vehicle", "Hybrid", "Electric Vehicle"
      ];

      const commonRepairs = [
        "Transmission", "Engine", "Brakes", "Suspension", "Electrical",
        "Cooling System", "Exhaust", "Steering", "AC System"
      ];

      const toolCategories = [
        "Diagnostic Equipment", "Specialty Tools", "Lift Systems",
        "Power Tools", "Hand Tools", "Safety Equipment"
      ];

      const challengeTypes = [
        "Emergency Repairs", "Complex Diagnostics", "Performance Upgrades",
        "Maintenance Services", "Custom Modifications", "Technical Inspections"
      ];

      prompt = `Generate a unique ${selectedType} card for Ruffino Express Legends auto repair game.

Create a card that is distinctly different from these previous generations:

${previousExamples}

Available elements to combine creatively:
${selectedType === 'Vehicle' ? `
Brands: ${vehicleBrands.join(', ')}
Types: ${vehicleTypes.join(', ')}
Common Repairs: ${commonRepairs.join(', ')}` : 
selectedType === 'Tool' ? `
Tool Categories: ${toolCategories.join(', ')}` :
`Challenge Categories: ${challengeTypes.join(', ')}`}

Key points to vary:
- Create unique combinations and scenarios
- Vary attributes and capabilities
- Generate different impact effects
- Use creative terminology and descriptions
- Develop innovative gameplay mechanics

Response must follow this JSON schema:
{
  name: string; // Descriptive name appropriate to the type
  description: string; // Detailed unique background info
  type: string; // "${selectedType}"
  height: string; // Vehicle: dimensions, Tool: size class, Challenge: scope 
  weight: string; // Vehicle: weight class, Tool: portability, Challenge: difficulty
  attributes: string; // Unique features and capabilities
  impact: string; // Creative gameplay effects specific to this card
}`;
    }

    const completion = await websim.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are a creative card generator for an auto repair themed card game. Generate unique, non-repetitive content that varies substantially from previous generations while staying true to the theme. Each card should feel distinct and original."
      },
      {
        role: "user",
        content: prompt
      }],
      json: true
    });

    const data = JSON.parse(completion.content);
    
    // Store in history and maintain max size
    const type = data.type.toLowerCase();
    previousGenerations[type] = [data, ...previousGenerations[type]].slice(0, MAX_HISTORY);
    
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

export async function generateCardImage(description, name) {
  try {
    const isStaffMember = description.toLowerCase().includes('technician') || 
                         description.toLowerCase().includes('specialist') ||
                         description.toLowerCase().includes('relations') ||
                         description.toLowerCase().includes('managing partner');

    let prompt = '';
    if (isStaffMember) {
      // Special handling for specific staff members
      if (name.toLowerCase().includes('josh')) {
        prompt = `Professional 35mm portrait photo of a bald male auto technician in blue work uniform, confident and experienced looking, standing in an auto repair shop, head and shoulders shot, clear lighting, high quality, photorealistic`;
      } else if (name.toLowerCase().includes('rob')) {
        prompt = `Professional 35mm portrait photo of a large-built male auto technician with scruffy appearance and facial hair in blue work uniform, warm and friendly expression, standing in an auto repair shop, head and shoulders shot, clear lighting, high quality, photorealistic`;
      } else if (name.toLowerCase().includes('liz')) {
        prompt = `Professional 35mm portrait photo of a female customer service specialist in business casual attire, warm and professional expression, standing in an auto repair shop office, head and shoulders shot, clear lighting, high quality, photorealistic`;
      } else {
        prompt = `Professional 35mm portrait photo of an auto repair shop ${description}, in appropriate attire, standing in an auto repair shop environment, head and shoulders shot, clear lighting, high quality, photorealistic`;
      }
    } else {
      if (description.toLowerCase().includes('vehicle') || description.toLowerCase().includes('car') || description.toLowerCase().includes('truck')) {
        prompt = `Professional automotive photography of ${description}. Clean studio lighting, 3/4 view angle, high quality product photo style, centered composition`;
      } else {
        prompt = `Professional product photography of ${description} in an auto repair shop setting. Clean lighting, centered composition, high quality`;
      }
    }

    const result = await websim.imageGen({
      prompt: `${prompt}. Clear background, balanced composition, professional quality`,
      width: 1024,
      height: 1024
    });

    return result.url;
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
}