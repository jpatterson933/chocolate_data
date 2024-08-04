require('dotenv').config();
const axios = require('axios');
const { checkChocolatesExist } = require('./checkChocolatesExist');

async function generateNewChocolate() {
    try {
        // First, check if chocolates exist and get the current list
        const { chocolatesExist, data: existingChocolates } = await checkChocolatesExist();

        // Prepare the list of existing chocolates for the prompt
        const existingChocolatesList = chocolatesExist
            ? existingChocolates.map(c => c.name).join(', ')
            : 'No existing chocolates';

        // Prepare the prompt for Perplexity API
        const prompt = `Generate a new unique chocolate that does not exist in the following list: ${existingChocolatesList}.
    
    Provide the information in this format:
    name | type | cocoa_percentage | ingredients | origin | brand
    
    Where:
    - name is a unique name for the chocolate (string)
    - type is the type of chocolate (string, e.g., "Dark", "Milk", "White")
    - cocoa_percentage is an integer between 0 and 100
    - ingredients is a comma-separated list of ingredients (string)
    - origin is the country or region of origin for the cocoa (string)
    - brand is the name of the chocolate brand (string)
    
    Ensure all fields are filled and separated by ' | '.`;

        // Call Perplexity API
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-sonar-large-128k-online",
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const content = response.data.choices[0].message.content;

            // Process the API response
            const [name, type, cocoaPercentage, ingredients, origin, brand] = content.split('|').map(item => item.trim());

            // Prepare the data for insertion into Supabase
            const newChocolate = {
                name,
                type,
                cocoa_percentage: parseInt(cocoaPercentage),
                ingredients: ingredients.split(',').map(i => i.trim()),
                origin,
                brand
            };

            return newChocolate;
        } else {
            throw new Error(`API request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Error in generateNewChocolate:', error);
        throw error;
    }
}

module.exports = {
    generateNewChocolate
};