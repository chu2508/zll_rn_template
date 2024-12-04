import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { MOOD_SECTIONS, MoodOption } from '../../types/mood';
import PointerSvg from './pointer';

const { width } = Dimensions.get('window');
// 圆环大小
const CIRCLE_SIZE = width * 1.6;
// 内圆半径
const INNER_RADIUS = CIRCLE_SIZE / 3.6;
// 圆心
const CENTER = CIRCLE_SIZE / 2;

// 将角度转换为弧度
const toRad = (deg: number) => (deg * Math.PI) / 180;

// 计算扇形路径
const getArcPath = (
  startAngle: number,
  endAngle: number,
  outerRadius: number,
) => {
  // 计算扇形的起点和终点
  const start = {
    x: CENTER + outerRadius * Math.cos(toRad(startAngle)),
    y: CENTER + outerRadius * Math.sin(toRad(startAngle)),
  };
  const end = {
    x: CENTER + outerRadius * Math.cos(toRad(endAngle)),
    y: CENTER + outerRadius * Math.sin(toRad(endAngle)),
  };

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  // 构建实心扇形路径
  return `
    M ${CENTER} ${CENTER}
    L ${start.x} ${start.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
    Z
  `;
};

// 计算表情位置
const getEmojiPosition = (
  startAngle: number,
  endAngle: number,
  radius: number,
) => {
  const angle = (startAngle + endAngle) / 2;
  // 将表情放在内外圆之间的中心位置
  const r = INNER_RADIUS + (radius - INNER_RADIUS) / 2;
  return {
    x: CENTER + r * Math.cos(toRad(angle)),
    y: CENTER + r * Math.sin(toRad(angle)),
    rotation: angle + 90,
  };
};

interface CircularMoodSelectorProps {
  onValueChange: (value: MoodOption) => void;
}

const CircularMoodSelector: React.FC<CircularMoodSelectorProps> = ({
  onValueChange,
}) => {
  const rotation = useSharedValue(90);
  const prevRotation = useSharedValue(90);

  // 修改 calculateValue 函数
  const calculateMoodIndex = (angle: number) => {
    'worklet';

    // 1. 标准化到 0-360 范围
    let pointerAngle = ((angle % 360) + 360) % 360;

    // 2. 由于我们是顺时针旋转，需要反转角度
    pointerAngle = 360 - pointerAngle;

    // 4. 根据指针角度找到对应的扇形区域
    for (let i = 0; i < MOOD_SECTIONS.length; i++) {
      const section = MOOD_SECTIONS[i];
      if (
        pointerAngle >= section.startAngle &&
        pointerAngle < section.endAngle
      ) {
        return i;
      }
    }

    // 处理 360 度的情况
    if (pointerAngle >= 360) {
      return 0;
    }

    return 0; // 默认值
  };

  // 更新手势处理逻辑
  const gesture = Gesture.Pan()
    .onStart(() => {
      prevRotation.value = rotation.value;
    })
    .onUpdate(event => {
      // 只计算 x 方向的移动幅度
      const deltaX = event.translationX;
      // 根据 x 方向的移动幅度计算新的旋转角度
      const angleInDegrees = (deltaX / (CIRCLE_SIZE / 2)) * 180; // 计算旋转角度
      // 将角度限制在 0-360 之间
      let newRotation = prevRotation.value + angleInDegrees;
      if (newRotation > 360) {
        newRotation = newRotation - 360;
      }
      if (newRotation < 0) {
        newRotation = newRotation + 360;
      }

      rotation.value = newRotation; // 更新旋转角度
    })
    .onEnd(() => {
      const value = calculateMoodIndex(rotation.value);
      const mood = MOOD_SECTIONS[value];
      console.log('最终值:', mood, rotation.value);
      // 计算指针角度, 取当前心情的中心点
      const angle = Math.ceil(rotation.value / 36) * 36 - 18;
      // 添加弹性动画
      rotation.value = withSpring(angle, {
        mass: 2,
        damping: 100,
        stiffness: 200,
        overshootClamping: true,
        restDisplacementThreshold: 0.001,
      });

      runOnJS(onValueChange)(mood);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle}>
          <Svg
            style={[{ transform: [{ rotate: '-90deg' }] }]}
            width={CIRCLE_SIZE}
            height={CIRCLE_SIZE}>
            <G>
              {MOOD_SECTIONS.map((section, index) => {
                const pos = getEmojiPosition(
                  section.startAngle,
                  section.endAngle,
                  CENTER,
                );
                return (
                  <G key={index}>
                    <Path
                      d={getArcPath(
                        section.startAngle,
                        section.endAngle,
                        CENTER,
                      )}
                      fill={section.color}
                    />
                    <G
                      transform={`
                        translate(${pos.x},${pos.y}) 
                        rotate(${pos.rotation})
                      `}>
                      <SvgText
                        x={0}
                        y={0}
                        fontSize="80"
                        textAnchor="middle"
                        alignmentBaseline="middle">
                        {section.emoji}
                      </SvgText>
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>
      <View style={styles.innerCircle} />
      <View style={[styles.innerCircle, styles.innerView]} />
      <PointerSvg style={[styles.pointer]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    position: 'absolute',
    width: INNER_RADIUS * 2.2, // 直径为内圆半径的两倍
    height: INNER_RADIUS * 2.2,
    borderRadius: 999999, // 圆角为宽度的一半
    backgroundColor: 'transparent', // 内圆背景色
    borderWidth: 12,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  innerView: {
    backgroundColor: 'white',
    width: INNER_RADIUS * 2.2 - 24,
    height: INNER_RADIUS * 2.2 - 24,
    borderColor: 'transparent',
  },
  pointer: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -80 / 2 }],
    zIndex: 10,
    top: 105,
  },
});

export default CircularMoodSelector;
