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
      
      prompt = `Generate a unique and creative staff card description for ${selectedStaff}${isRobCard ? " (In Memoriam)" : ""} at Ruffino Express Auto Repair.

Craft a completely new and different variation each time - no repetition of previous descriptions.

For context, here are their roles:
- Elizabeth: Managing Partner, operations and customer service expert
- Josh: Master Technician, bald appearance, specializes in complex repairs
- Liz: Customer Relations Specialist, communication expert
- Rob: Senior Technician (In Memoriam), remembered for exceptional skill and friendly demeanor
- Dylan: Diagnostic Specialist, troubleshooting expert

Response must be unique each time and follow this JSON schema:
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
      // Get a random card subtype for variety
      const cardTypes = ["Vehicle", "Tool", "Challenge"];
      const selectedType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      
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

      prompt = `Generate a unique ${selectedType} card for Ruffino Express Legends auto repair game. 
      
Create a completely new card - ensure it's different from any previous generations.

For Vehicle cards: Use combinations from these elements but create unique variations:
Brands: ${vehicleBrands.join(', ')}
Types: ${vehicleTypes.join(', ')}
Common Repairs: ${commonRepairs.join(', ')}

For Tool cards: Create unique shop equipment, diagnostic tools, or specialty repair items.

For Challenge cards: Design interesting repair scenarios with specific requirements and rewards.

Response must follow this JSON schema with unique values each time:
{
  name: string; // Descriptive name appropriate to the type
  description: string; // Detailed unique background info
  type: string; // "${selectedType}"
  height: string; // Vehicle: dimensions, Tool: size class, Challenge: scope 
  weight: string; // Vehicle: weight class, Tool: portability, Challenge: difficulty
  attributes: string; // Unique features and capabilities
  impact: string; // Creative gameplay effects specific to this card
}

Make this card completely unique from any previous generations.`;
    }

    const completion = await websim.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are a creative card generator for an auto repair themed card game. Always generate unique, non-repetitive content that varies in creative ways while staying true to the theme."
      },
      {
        role: "user",
        content: prompt
      }],
      json: true
    });

    const data = JSON.parse(completion.content);
    
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