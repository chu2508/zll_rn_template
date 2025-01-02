import { Circle, Path, RoundedRect, Text } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { font } from '../utils';

import { BostonMatrix } from '@src/store/resource/project';

export function ToolTip({
  x,
  y,
  matrix,
  color,
}: {
  x: SharedValue<number>;
  y: SharedValue<number>;
  matrix: BostonMatrix;
  color: string;
}) {
  // 气泡框的样式配置
  const padding = 8;
  const borderRadius = 4;
  const triangleSize = 6;
  const textSpacing = 4;

  // 文本内容
  const texts = [
    matrix.name,
    `工时: ${matrix.workHours}h`,
    `ROI: ${matrix.roi}%`,
  ];

  // 计算文本尺寸
  const fontSize = 12;
  const lineHeight = fontSize + textSpacing;
  const boxWidth = 100; // 固定宽度
  const boxHeight = padding * 2 + texts.length * lineHeight;

  return (
    <>
      {/* 绘制气泡背景 */}
      <RoundedRect
        x={x.value - boxWidth / 2}
        y={y.value - boxHeight - triangleSize}
        width={boxWidth}
        height={boxHeight}
        r={borderRadius}
        color="rgba(0, 0, 0, 0.8)"
      />

      {/* 绘制小三角形 */}
      <Path
        path={`M ${x.value - triangleSize} ${y.value - triangleSize}
              L ${x.value} ${y.value}
              L ${x.value + triangleSize} ${y.value - triangleSize}
              Z`}
        color="rgba(0, 0, 0, 0.8)"
      />

      {/* 绘制文本 */}
      {texts.map((text, index) => (
        <Text
          key={index}
          x={x.value - boxWidth / 2 + padding}
          y={
            y.value -
            boxHeight -
            triangleSize +
            padding +
            lineHeight * (index + 0.8)
          }
          text={text}
          font={font}
          color="white"
        />
      ))}

      {/* 绘制指示点 */}
      <Circle cx={x} cy={y} r={4} color={color} style="fill" />
    </>
  );
}
