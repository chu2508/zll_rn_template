import {
  Circle,
  DashPathEffect,
  Line,
  Text as SkiaText,
} from '@shopify/react-native-skia';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { CartesianChart, useChartTransformState } from 'victory-native';

import { BOSTON_MATRIX_COLORS, font, font2, getPointColor } from '../utils';

import { BostonMatrix } from '@src/store/resource/project';

// 添加波士顿矩阵组件
export const BostonMatrixChart = (props: { matrix: BostonMatrix[] }) => {
  const { t } = useTranslation();
  const { matrix } = props;
  // 计算中位数作为象限分割线
  const medianHours =
    matrix.reduce((sum, item) => sum + item.workHours, 0) / matrix.length;
  const medianROI =
    matrix.reduce((sum, item) => sum + item.roi, 0) / matrix.length;

  const { state: transformState } = useChartTransformState();

  // 修改图例数据使用 i18n
  const LegendList = [
    {
      color: BOSTON_MATRIX_COLORS.yellow,
      label: t('home.bostonMatrix.quadrants.cashCow'),
    },
    {
      color: BOSTON_MATRIX_COLORS.green,
      label: t('home.bostonMatrix.quadrants.starProject'),
    },
    {
      color: BOSTON_MATRIX_COLORS.blue,
      label: t('home.bostonMatrix.quadrants.questionMark'),
    },
    {
      color: BOSTON_MATRIX_COLORS.red,
      label: t('home.bostonMatrix.quadrants.deadDog'),
    },
  ];

  return (
    <View className="mx-4 mb-4 rounded-lg bg-white p-4">
      <Text className="mb-3 text-base font-medium">
        {t('home.bostonMatrix.title')}
      </Text>
      <View className="h-80">
        <CartesianChart
          data={matrix}
          xKey="roi"
          yKeys={['workHours', 'index']}
          transformState={transformState}
          domainPadding={{ left: 16, top: 16, bottom: 16, right: 16 }}
          xAxis={{
            font,
            formatXLabel: value => `${value}%`,
          }}
          yAxis={[
            {
              font,
              formatYLabel: value => `${value}h`,
              axisSide: 'right',
            },
          ]}>
          {({ points, chartBounds }) => {
            `strict`;
            // 获取数据范围
            const roiValues = matrix.map(d => d.roi);
            const workHoursValues = matrix.map(d => d.workHours);
            const minROI = Math.min(...roiValues);
            const maxROI = Math.max(...roiValues);
            const minHours = Math.min(...workHoursValues);
            const maxHours = Math.max(...workHoursValues);

            // 计算图表的实际宽度和高度
            const chartWidth = chartBounds.right - chartBounds.left;
            const chartHeight = chartBounds.bottom - chartBounds.top;

            // 计算比例尺
            const xScale = chartWidth / (maxROI - minROI);
            const yScale = chartHeight / (maxHours - minHours);

            // 计算中心线在画布上的位置
            const verticalLineX =
              chartBounds.left + (medianROI - minROI) * xScale;
            const horizontalLineY =
              chartBounds.top + chartHeight - (medianHours - minHours) * yScale;

            return (
              <>
                {/* 绘制水平中心线 */}
                <Line
                  p1={{ x: chartBounds.left, y: horizontalLineY }}
                  p2={{
                    x: chartBounds.right,
                    y: horizontalLineY,
                  }}
                  color="#9CA3AF"
                  style="stroke"
                  strokeWidth={2}>
                  <DashPathEffect intervals={[4, 4]} phase={0} />
                </Line>

                {/* 绘制垂直中心线 */}
                <Line
                  p1={{ x: verticalLineX, y: chartBounds.top }}
                  p2={{
                    x: verticalLineX,
                    y: chartBounds.bottom,
                  }}
                  color="#9CA3AF"
                  style="stroke"
                  strokeWidth={2}>
                  <DashPathEffect intervals={[4, 4]} phase={0} />
                </Line>

                {/* 绘制散点 */}
                {points.workHours.map((point, index) => {
                  const size = 5;
                  const projectIndex = points.index[index];
                  const project = matrix[projectIndex.yValue as number];

                  return (
                    <React.Fragment key={index}>
                      <Circle
                        cx={point.x as number}
                        cy={point.y as number}
                        r={size}
                        color={getPointColor(
                          point.xValue as number,
                          point.yValue as number,
                          medianHours,
                          medianROI,
                        )}
                        style="stroke"
                        strokeWidth={2}
                        opacity={0.8}
                      />
                      <SkiaText
                        font={font2}
                        x={(point.x as number) + 8}
                        y={(point.y as number) + 4}
                        text={`${project.name}`}
                      />
                    </React.Fragment>
                  );
                })}
              </>
            );
          }}
        </CartesianChart>
      </View>

      {/* 象限图例说明 */}
      <View className="mt-4 flex-row flex-wrap justify-center">
        {LegendList.map((legend, index) => {
          return (
            <View key={index} className="mx-2 flex-row items-center">
              <View
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: legend.color }}
              />
              <Text className="text-xs text-gray-500">{legend.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
