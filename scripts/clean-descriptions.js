const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Function to clean up description
function cleanDescription(desc) {
    if (!desc) return desc;

    // Remove leading "to " if present
    let cleaned = desc.trim();

    // Remove "Received funding to" if already present (for re-runs)
    if (cleaned.startsWith('Received funding to ')) {
        cleaned = cleaned.substring('Received funding to '.length);
    }

    // Handle Blue Engine grant description
    if (cleaned.startsWith('Blue Engine Technology')) {
        cleaned = 'implement new technological solutions including software and hardware updates, website development, subscriptions for cloud-based applications, and computer equipment.';
    }
    // Remove "to fund a project to"
    else if (cleaned.startsWith('to fund a project to ')) {
        cleaned = cleaned.substring('to fund a project to '.length);
    }
    // Remove "to fund"
    else if (cleaned.startsWith('to fund ')) {
        cleaned = cleaned.substring('to fund '.length);
    }
    // Remove "fund " prefix
    else if (cleaned.startsWith('fund ')) {
        cleaned = cleaned.substring('fund '.length);
    }
    // Remove leading "to "
    else if (cleaned.startsWith('to ')) {
        cleaned = cleaned.substring(3);
    }

    // Ensure first letter is lowercase (unless it's a proper noun)
    if (cleaned.length > 0 && cleaned[0] !== cleaned[0].toLowerCase()) {
        // Check if it's likely a proper noun (followed by another capital or standalone)
        const words = cleaned.split(' ');
        const firstWord = words[0];
        // Common proper nouns that should stay capitalized
        const properNouns = ['Blue', 'Black', 'New', 'Jersey', 'Atlantic', 'Burlington'];
        if (!properNouns.includes(firstWord)) {
            cleaned = cleaned[0].toLowerCase() + cleaned.substring(1);
        }
    }

    // Add "Received funding to " prefix
    return 'Received funding to ' + cleaned;
}

// Clean all descriptions
data.grantees.forEach(grantee => {
    if (grantee.description) {
        grantee.description = cleanDescription(grantee.description);
    }
});

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✓ Cleaned descriptions for', data.grantees.length, 'grantees');
