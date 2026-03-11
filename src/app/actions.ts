'use server';

// This is a placeholder for a potential server action to submit data to an external service like Google Sheets.
// It is not currently used in the leaderboard flow but is kept for future reference.
export async function submitSurvey(data: {
  name: string;
  email?: string;
  challengeAnswers: { question: string; answered: string; isCorrect: boolean }[];
  finalScore: number;
}) {
  console.log('Challenge Data Submitted:');
  console.log('Player Name:', data.name);
  console.log('Player Email:', data.email || 'Not provided');
  console.log('Challenge Answers:', JSON.stringify(data.challengeAnswers, null, 2));
  console.log('Final Score:', data.finalScore);

  // Here you would typically send data to a Google Sheet using an API.
  // This is a placeholder for that functionality.
  try {
    // const response = await fetch('YOUR_GOOGLE_SHEET_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...data,
    //     submittedAt: new Date().toISOString(),
    //   }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to submit to Google Sheet');
    // }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    return { success: true, message: 'شكراً لمشاركتك! تم تسجيل بياناتك بنجاح.' };
  } catch (error) {
    console.error('Submission Error:', error);
    return { success: false, message: 'حدث خطأ ما أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.' };
  }
}
