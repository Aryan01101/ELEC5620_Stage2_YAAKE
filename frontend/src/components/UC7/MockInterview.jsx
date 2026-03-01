import React, { useState } from 'react';
import InterviewSetup from './InterviewSetup';
import InterviewSession from './InterviewSession';
import InterviewResults from './InterviewResults';
import { mockInterviewAPI } from '../../services/api';

/**
 * MockInterview - Main Controller Component
 * Orchestrates the flow between setup, session, and results
 */
const MockInterview = () => {
  const [currentStep, setCurrentStep] = useState('setup'); // 'setup', 'session', 'results'
  const [interviewData, setInterviewData] = useState(null);
  const [results, setResults] = useState(null);

  /**
   * Handle starting the interview
   * Calls backend API to create interview session and get first question
   */
  const handleStartInterview = async (formData) => {
    try {
      const token = localStorage.getItem('yaake_token');

      if (!token) {
        throw new Error('Please login to start the interview');
      }

      // Use API service instead of direct fetch
      const data = await mockInterviewAPI.startInterview(formData);

      if (!data) {
        throw new Error('Failed to start interview');
      }

      // Save interview data and move to session
      setInterviewData(data);
      setCurrentStep('session');
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  };

  /**
   * Handle finishing the interview
   * Calls backend API to generate feedback and scores
   */
  const handleFinishInterview = async () => {
    try {
      // Use API service instead of direct fetch
      const data = await mockInterviewAPI.finishInterview(interviewData.interviewId);

      if (!data) {
        throw new Error('Failed to finish interview');
      }

      // Save results and move to results page
      setResults(data);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error finishing interview:', error);
      alert('Failed to get results: ' + error.message);
    }
  };

  /**
   * Handle starting a new interview
   * Resets state and goes back to setup
   */
  const handleStartNewInterview = () => {
    setCurrentStep('setup');
    setInterviewData(null);
    setResults(null);
  };

  // Render appropriate component based on current step
  return (
    <div>
      {currentStep === 'setup' && (
        <InterviewSetup onStartInterview={handleStartInterview} />
      )}

      {currentStep === 'session' && (
        <InterviewSession
          interviewData={interviewData}
          onFinishInterview={handleFinishInterview}
        />
      )}

      {currentStep === 'results' && (
        <InterviewResults
          results={results}
          onStartNewInterview={handleStartNewInterview}
        />
      )}
    </div>
  );
};

export default MockInterview;
