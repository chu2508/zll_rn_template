import dayjs from 'dayjs';
import { Between, IsNull, Not } from 'typeorm';
import { create } from 'zustand';

import { Log } from '@src/orm/models/log';
import { LogRepository } from '@src/orm/models/log.repo';
import { calculateRoi } from '@src/utils/statistical';

export enum TimeRange {
  YEAR = 'year',
  MONTH = 'month',
  WEEK = 'week',
}

export interface RoiStats {
  totalWorkHours: number;
  totalInvestment: number;
  totalRevenue: number;
  roi: number;
  roiChange: number;
}

export interface ChartData {
  profit: {
    day: number;
    investment: number;
    revenue: number;
    roi: number;
    hours: number;
  }[];
}
export interface OverviewSlice {
  currentDate: Date;
  timeRange: TimeRange;
  roiStats: RoiStats;
  chartData: ChartData;
  setTimeRange(range: TimeRange): void;
  initOverview(): Promise<void>;
  previous(): void;
  next(): void;
}

export const useOverviewStore = create<OverviewSlice>((set, get) => ({
  currentDate: dayjs().startOf('month').toDate(),
  timeRange: TimeRange.MONTH,
  roiStats: {
    totalWorkHours: 0,
    totalInvestment: 0,
    totalRevenue: 0,
    roi: 0,
    roiChange: 0,
  },
  chartData: {
    workHours: [],
    profit: [],
  },
  bostonMatrix: [],
  previous: () => {
    const { currentDate, timeRange } = get();
    const date = dayjs(currentDate);
    set({ currentDate: date.subtract(1, timeRange).toDate() });
    get().initOverview();
  },
  next: () => {
    const { currentDate, timeRange } = get();
    const date = dayjs(currentDate);
    set({ currentDate: date.add(1, timeRange).toDate() });
    get().initOverview();
  },

  setTimeRange: (timeRange: TimeRange) => {
    const currentDate = dayjs().startOf(timeRange).toDate();
    set({ timeRange, currentDate });
    get().initOverview();
  },

  initOverview: async () => {
    const { currentDate, timeRange } = get();
    // 当前时间范围
    const { startDate, endDate } = getTimes(timeRange, currentDate);
    // 上一期时间范围
    const { startDate: prevStartDate, endDate: prevEndDate } = getTimes(
      timeRange,
      dayjs(currentDate).subtract(1, timeRange).toDate(),
    );

    // 获取项目和日志数据
    const logs = await LogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        projectId: Not(IsNull()),
      },
      order: {
        createdAt: 'ASC',
      },
    });
    const prevLogs = await LogRepository.find({
      where: {
        createdAt: Between(prevStartDate, prevEndDate),
      },
      order: {
        createdAt: 'ASC',
      },
    });
    // 计算统计数据
    const prevStats = calculateRoiStats(prevLogs);
    const stats = calculateRoiStats(logs, prevStats);

    // 生成图表数据
    const chartData = generateChartData(logs, startDate, endDate);
    set({ roiStats: stats, chartData });
  },
}));

// 计算统计数据
function calculateRoiStats(logs: Log[], prevState?: RoiStats): RoiStats {
  const totals = logs.reduce(
    (acc, log) => {
      acc.workHours += log.workHours || 0;
      acc.investment += log.investment || 0;
      acc.revenue += log.revenue || 0;
      return acc;
    },
    { workHours: 0, investment: 0, revenue: 0 },
  );

  const roi = calculateRoi(totals.investment, totals.revenue);

  // 计算环比数据
  const prevRoi = prevState?.roi || 0;
  const roiChange = roi - prevRoi;

  return {
    totalWorkHours: totals.workHours,
    totalInvestment: totals.investment,
    totalRevenue: totals.revenue,
    roi,
    roiChange,
  };
}

// 生成图表数据
function generateChartData(
  logs: Log[],
  startDate: Date,
  endDate: Date,
): ChartData {
  const days = dayjs(endDate).diff(startDate, 'day') + 1;

  // 初始化每天的数据
  const dailyData = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    return {
      day,
      workHours: 0,
      tasks: 0,
      investment: 0,
      revenue: 0,
    };
  });

  // 填充实际数据
  logs.forEach(log => {
    const dayIndex = dayjs(log.createdAt).diff(startDate, 'day');
    if (dayIndex >= 0 && dayIndex < days) {
      const data = dailyData[dayIndex];
      if (log.workHours) {
        data.workHours += log.workHours;
        data.tasks += 1;
      }
      if (log.investment) data.investment += log.investment;
      if (log.revenue) data.revenue += log.revenue;
    }
  });

  // 转换为图表所需格式
  return {
    profit: dailyData.map(({ day, investment, revenue, workHours }) => ({
      day,
      investment,
      revenue,
      hours: workHours,
      roi: calculateRoi(investment, revenue),
    })),
  };
}

function getTimes(timeRange: TimeRange, currentDate: Date) {
  const date = dayjs(currentDate);

  // 根据时间范围获取开始和结束时间
  let startDate: Date, endDate: Date;
  switch (timeRange) {
    case TimeRange.YEAR:
      startDate = date.startOf('year').toDate();
      endDate = date.endOf('year').toDate();
      break;
    case TimeRange.MONTH:
      startDate = date.startOf('month').toDate();
      endDate = date.endOf('month').toDate();
      break;
    case TimeRange.WEEK:
      startDate = date.startOf('week').toDate();
      endDate = date.endOf('week').toDate();
      break;
  }

  return { startDate, endDate };
}
