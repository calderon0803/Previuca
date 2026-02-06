
const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = 'src/data/impostorWords.js';

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match { word: "A", intruder: "B" } objects
    // We need to handle single and double quotes, and potential newlines
    const regex = /{\s*word:\s*['"](.+?)['"]\s*,\s*intruder:\s*['"](.+?)['"]\s*}/g;

    const wordsSet = new Set();
    let match;

    while ((match = regex.exec(content)) !== null) {
        if (match[1]) wordsSet.add(match[1]);
        if (match[2]) wordsSet.add(match[2]);
    }

    // Convert Set to sorted Array
    const uniqueWords = Array.from(wordsSet).sort();

    // Create new content
    const newContent = `export const wordBank = [\n    ` +
        uniqueWords.map(w => `{ word: "${w}" }`).join(',\n    ') +
        `\n];\n`;

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');

    console.log(`Success! Extracted ${uniqueWords.length} unique words.`);

} catch (err) {
    console.error("Error transforming file:", err);
}
