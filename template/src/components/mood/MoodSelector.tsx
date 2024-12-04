// 心情选择器组件，负责展示心情选择器UI
import React from 'react';
import { View } from 'react-native';

import { MOOD_OPTIONS, Mood } from '../../types/mood';
import MoodEmoji from './MoodEmoji';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
}) => {
  return (
    <View className="w-full h-32 relative">
      {/* 使用弧形背景 */}
      <View className="w-full h-full bg-gray-100 rounded-full overflow-hidden">
        <View className="flex-row justify-between absolute bottom-0 w-full px-4 pb-2">
          {MOOD_OPTIONS.map(option => (
            <MoodEmoji
              key={option.value}
              emoji={option.emoji}
              isSelected={selectedMood === option.value}
              onPress={() => onMoodSelect(option.value)}
              color={option.color}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default MoodSelector;
