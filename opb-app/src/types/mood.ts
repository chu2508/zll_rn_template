export const COLORS = {
  // 很棒
  great: '#9CB16C',
  // 不错
  good: '#FFCE5D',
  // 一般
  neutral: '#BFA193',
  // 不好
  bad: '#FD814B',
  // 很糟
  terrible: '#A390FF',
};

// 定义心情区域的配置
export const MOOD_SECTIONS = [
  {
    color: COLORS.terrible,
    startAngle: 0,
    endAngle: 36,
    value: 2,
    emoji: '😢',
    label: 'terrible',
  },
  {
    color: COLORS.bad,
    startAngle: 36,
    endAngle: 72,
    value: 4,
    emoji: '😕',
    label: 'bad',
  },
  {
    color: COLORS.neutral,
    startAngle: 72,
    endAngle: 108,
    value: 6,
    emoji: '😐',
    label: 'neutral',
  },
  {
    color: COLORS.good,
    startAngle: 108,
    endAngle: 144,
    value: 8,
    emoji: '😊',
    label: 'good',
  },
  {
    color: COLORS.great,
    startAngle: 144,
    endAngle: 180,
    value: 10,
    emoji: '😄',
    label: 'great',
  },
  {
    color: COLORS.terrible,
    startAngle: 180,
    endAngle: 216,
    value: 2,
    emoji: '😢',
    label: 'terrible',
  },
  {
    color: COLORS.bad,
    startAngle: 216,
    endAngle: 252,
    value: 4,
    emoji: '😕',
    label: 'bad',
  },
  {
    color: COLORS.neutral,
    startAngle: 252,
    endAngle: 288,
    value: 6,
    emoji: '😐',
    label: 'neutral',
  },
  {
    color: COLORS.good,
    startAngle: 288,
    endAngle: 324,
    value: 8,
    emoji: '😊',
    label: 'good',
  },
  {
    color: COLORS.great,
    startAngle: 324,
    endAngle: 360,
    value: 10,
    emoji: '😄',
    label: 'great',
  },
];

export type MoodOption = (typeof MOOD_SECTIONS)[number];
