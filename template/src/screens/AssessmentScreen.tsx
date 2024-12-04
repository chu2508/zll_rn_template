// 主屏幕组件，整合所有子组件
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CircularMoodSelector from '../components/mood/CircularMoodSelector';
import ProgressIndicator from '../components/mood/ProgressIndicator';
import { useMoodAssessment } from '../hooks/useMoodAssessment';

const AssessmentScreen: React.FC = () => {
  const { selectedMood, currentQuestion, totalQuestions, handleMoodSelect } =
    useMoodAssessment();

  const [t] = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        {/* 顶部导航栏 */}
        <View className="flex-row justify-between items-center py-4">
          <TouchableOpacity>
            <Text className="text-gray-600">←</Text>
          </TouchableOpacity>
          <ProgressIndicator current={currentQuestion} total={totalQuestions} />
        </View>

        {/* 问题标题 */}
        <View className="mt-8">
          <Text className="text-2xl font-bold text-center">
            {t('mood.How would you describe your mood')}
          </Text>
        </View>

        {/* 选中的心情显示 */}
        <View className="items-center mt-8">
          <Text className="text-lg text-gray-600">
            {selectedMood
              ? `${t('mood.I Feel')}${t(`mood.${selectedMood.label}`)}`
              : t('mood.Select your mood')}
          </Text>
        </View>
        <View className="flex-1" />
        {/* 心情选择器 */}
        <View className="items-center h-52">
          <CircularMoodSelector onValueChange={handleMoodSelect} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AssessmentScreen;
