import { NextResponse } from 'next/server';

const PREDICD_API_KEY = '0a462628f68e4dc40cf622dfc995b7993b8c2e0f';
const PREDICD_API_URL = 'https://www.predicd.com/api/v1';

export async function GET() {
  try {
    console.log('Fetching predictions from Predicd API...');
    const response = await fetch(`${PREDICD_API_URL}/matches/today/`, {
      headers: {
        'Authorization': `Token ${PREDICD_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`Predicd API responded with status ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} predictions`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

