require('dotenv').config();
const express = require('express');
const { generateNewChocolate } = require('./utils/generateNewChocolate');
const { supabase } = require('./config/supabaseClient');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Function to generate and insert a new chocolate
async function generateAndInsertChocolate() {
    try {
        const newChocolate = await generateNewChocolate();
        const { data, error } = await supabase
            .from('chocolates')
            .insert([newChocolate]);

        if (error) throw error;
        console.log('New chocolate generated and inserted:', newChocolate);
    } catch (error) {
        console.error('Error generating or inserting new chocolate:', error);
    }
}

// Routes
app.get('/api/chocolates', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chocolates')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching chocolates:', error);
        res.status(500).json({ error: 'Failed to fetch chocolates' });
    }
});

app.post('/api/chocolates', async (req, res) => {
    try {
        const newChocolate = await generateNewChocolate();
        const { data, error } = await supabase
            .from('chocolates')
            .insert([newChocolate]);

        if (error) throw error;
        res.status(201).json({ message: "New chocolate created", chocolate: newChocolate });
    } catch (error) {
        console.error('Error generating or inserting new chocolate:', error);
        res.status(500).json({ error: 'Failed to create new chocolate' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server and generate a new chocolate
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await generateAndInsertChocolate();
});