// Filename: src/utils/problemutility.js
const axios = require('axios');

const getLanguageId=(lang)=>{
    const language={
        'JavaScript': 63,
        'Python': 71,
        'Java': 62,
        'C++': 54
    }
    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions) => {
  try {
    const url = 'http://localhost:2358/submissions/batch?base64_encoded=false&wait=true';

    const data = {
      submissions: submissions.map(sub => ({
        language_id: sub.language_id,
        source_code: sub.source_code,
        stdin: sub.stdin || ''
      }))
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('Batch submission error:', error.response?.data || error.message);
    return null;
  }
};

module.exports={getLanguageId, submitBatch}