const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { query } = req.body;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768', // or use 'llama3-70b-8192' or 'gpt-4-turbo' if supported
        messages: [
          {
            role: 'user',
            content: `Provide detailed information about the medicine: ${query}. Include its usage, dosage, side effects, and any interactions.`,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });

  } catch (err) {
    console.error('GROQ API error:', err.message);
    res.status(500).json({ response: 'Failed to fetch information.' });
  }
});

module.exports = router;
