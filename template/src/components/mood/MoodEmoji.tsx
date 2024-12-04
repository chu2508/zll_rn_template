// 表情符号组件，用于展示单个心情选项
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface MoodEmojiProps {
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}

const MoodEmoji: React.FC<MoodEmojiProps> = ({
  emoji,
  isSelected,
  onPress,
  color,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-12 h-12 rounded-full justify-center items-center ${
        isSelected ? 'border-2 border-gray-400' : ''
      }`}
      style={{ backgroundColor: isSelected ? color : 'transparent' }}>
      <Text className="text-2xl">{emoji}</Text>
    </TouchableOpacity>
  );
};

export default MoodEmoji;
