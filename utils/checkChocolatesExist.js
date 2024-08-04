require('dotenv').config();
const { supabase } = require('../config/supabaseClient');

async function checkChocolatesExist() {
    try {
        // Fetch all chocolates from the database
        const { data, error } = await supabase
            .from('chocolates')
            .select('*');

        if (error) {
            console.error('Error checking chocolates in Supabase:', error);
            throw error;
        }

        // Return an object with the data and a boolean indicating existence
        return {
            chocolatesExist: data && data.length > 0,
            data: data || []
        };

    } catch (error) {
        console.error('Error in checkChocolatesExist:', error);
        throw error;
    }
}

module.exports = {
    checkChocolatesExist
};