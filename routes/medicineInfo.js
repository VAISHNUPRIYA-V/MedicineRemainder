const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { query } = req.body;

  try {
    const openFDAUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"+OR+openfda.generic_name:"${query}"`;

    const response = await axios.get(openFDAUrl);

    if (response.data.results && response.data.results.length > 0) {
      const firstResult = response.data.results[0];
      let usage = firstResult.indications_and_usage ? firstResult.indications_and_usage[0] : 'Usage information not available.';
      let sideEffects = firstResult.adverse_reactions ? firstResult.adverse_reactions[0] : 'Side effects information not available.';
      let dosage = firstResult.dosage_and_administration ? firstResult.dosage_and_administration[0] : 'Dosage information not available.';
      let interactions = firstResult.drug_interactions ? firstResult.drug_interactions[0] : 'Drug interactions information not available.';
      let warnings = firstResult.warnings_and_precautions ? firstResult.warnings_and_precautions[0] : 'Warnings and precautions not available.';

      const formattedResponse = {
  usage: usage,
  dosage: dosage,
  sideEffects: sideEffects,
  interactions: interactions,
  warnings: warnings,
  disclaimer: "**Please note:** This information is sourced from the openFDA API and may not be exhaustive. Always consult a healthcare professional for medical advice."
};
res.json({ response: formattedResponse });

      res.json({ response: formattedResponse });
    } else {
      res.status(404).json({ response: `No information found for "${query}" on openFDA.` });
    }
  } catch (err) {
    console.error('openFDA API error:', err.message);
    res.status(500).json({ response: 'Failed to fetch information from openFDA.' });
  }
});

module.exports = router;