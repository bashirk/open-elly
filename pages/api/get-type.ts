import { NextApiRequest, NextApiResponse } from 'next';
import { useSession } from 'next-auth/react';
import {
  getUserIdByEmail,
  getUserCredits,
} from '../../utils/helper';

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
  if (req.method !== 'POST') {
  res.status(405).json({ error: 'Method not allowed' });
  return;
}

// const { data: session } = useSession();
// const { prompt, session } = await getSession({ req });
// let credits = 0;
// let row_id = null;

// console.log(req.body)
// console.log(req)
//   row_id = await getUserIdByEmail(session.user?.email);
//   credits = await getUserCredits(row_id);
  
// if (session && credits <= 0) {
//   res.status(403).json({
//     error: "You don't have enough credits to generate a chart",
//   });
//   return;
// }

  try {
    const { inputData } = req.body;
    const prompt = `The following are the possible chart types supported by the code provided: area, bar, line, composed, scatter, pie, radar, radialBar, treemap, and funnel. Given the user input: ${inputData}, identify the best chart type to display, if the user specified a chart type, use that. Return just one word
`;

    // Initialize the Gemini
    const API_KEY = process.env.BARD_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const requestData = {
      "contents": [{
        "parts": [{
          "text": prompt
        }]
      }]
    };
    
    const chartType = await fetch(url, {
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

    if (
      !chartType ||
      chartType.includes('AI-model') ||
      chartType.includes('programmed') ||
      chartType.includes('model') ||
      chartType.includes('AI')
    ) {
      throw new Error('Failed to generate output data');
    }

    res.status(200).json(chartType);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
