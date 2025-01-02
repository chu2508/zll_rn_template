import { useState } from 'react';

import { MOOD_SECTIONS, MoodOption } from '../types/mood';

export const useMoodAssessment = () => {
  const [selectedMood, setSelectedMood] = useState<MoodOption>(
    MOOD_SECTIONS[2],
  );
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 7;

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    // 这里可以添加其他逻辑，比如延迟后自动进入下一题
  };

  return {
    selectedMood,
    currentQuestion,
    totalQuestions,
    handleMoodSelect,
  };
};
