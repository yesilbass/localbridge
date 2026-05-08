import { callAIProxy } from './ai';

export async function getAIResumeReview({ resumeBase64, experienceLevel }) {
  const parsed = await callAIProxy('resume_review', { resumeBase64, experienceLevel });

  const required = ['numeric_score', 'letter_grade', 'overall_feedback', 'sections'];
  const sectionKeys = ['contact_info', 'summary', 'experience', 'skills', 'education', 'formatting'];

  if (required.some((k) => parsed[k] == null)) {
    throw new Error(
      'We had trouble reading your resume. Make sure it\'s a text-based PDF, not a scanned image.',
    );
  }

  if (sectionKeys.some((k) => !parsed.sections[k])) {
    throw new Error(
      'We had trouble reading your resume. Make sure it\'s a text-based PDF, not a scanned image.',
    );
  }

  return parsed;
}
