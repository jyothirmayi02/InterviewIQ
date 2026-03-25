process.chdir('c:/Users/jyoth/OneDrive/Desktop/InterviewIQ/backend');
const Groq = require('groq-sdk');
console.log('Groq', typeof Groq);
try {
  const g = new Groq({ apiKey:'x' });
  console.log('inst', typeof g, !!g.chat);
} catch (e) {
  console.error('err', e.message);
}
