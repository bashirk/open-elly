import { NextApiRequest, NextApiResponse } from 'next';

interface Candidate {
  output: string;
  safetyRatings: Array<{ category: string; probability: string }>;
}

interface ResponseData {
  candidates: Candidate[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { inputData, chart } = req.body;
    const prompt = `Based on ${inputData} generate a valid JSON in which each element is an object for Recharts API for chart ${chart} without new line characters '\n'. Strictly using this FORMAT and naming:
[{ "name": "a", "value": 12 }]. Make sure field name always stays named name. Instead of naming value field value in JSON, name it based on user metric and make it the same across every item.\n Make sure the format use double quotes and property names are string literals. Provide JSON data only. `;

const API_KEY = process.env.GEMINI_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

const requestData = {
  "contents": [{
    "parts": [{
      "text": prompt
    }]
  }]
};

const jsonResponse = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestData),
})
  .then(response => response.json())
  .then((data) => {
    console.log(data); // This will print the API response
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response data');
    }
  });

res.status(200).send(jsonResponse);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
