import { useNavigation, useRoute } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import { t } from 'i18next';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import * as Yup from 'yup';

import { showToast } from '@src/components/common/Toast';
import { getLanguageCode } from '@src/i18n/language';
import { RootRouterParams } from '@src/navigation/types';
import { Project } from '@src/orm/models/project';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

// 扩展表单值类型，添加projectId和createdAt
type LogFormValues = {
  projectId: string;
  workHours?: number;
  investment?: number;
  revenue?: number;
  remark?: string;
  createdAt: Date;
};

// 修改验证模式
const validationSchema = Yup.object()
  .shape({
    projectId: Yup.string().required(
      t('project.log.create.projectInfo.validation.required'),
    ),
    workHours: Yup.number()
      .transform(value => (isNaN(value) ? undefined : value))
      .nullable()
      .min(0, t('project.log.create.workHours.validation.min')),
    investment: Yup.number()
      .transform(value => (isNaN(value) ? undefined : value))
      .nullable()
      .min(0, t('project.log.create.investment.validation.min')),
    revenue: Yup.number()
      .transform(value => (isNaN(value) ? undefined : value))
      .nullable()
      .min(0, t('project.log.create.revenue.validation.min')),
    remark: Yup.string().max(
      500,
      t('project.log.create.remark.validation.maxLength'),
    ),
    createdAt: Yup.date().required(
      t('project.log.create.createdAt.validation.required'),
    ),
  })
  .test(
    'at-least-one',
    t('project.log.create.validation.atLeastOne'),
    value => {
      const { workHours, investment, revenue } = value as LogFormValues;
      // 检查是否至少有一个字段有有效值
      return !!(
        (typeof workHours === 'number' && workHours > 0) ||
        (typeof investment === 'number' && investment > 0) ||
        (typeof revenue === 'number' && revenue > 0)
      );
    },
  );

// 项目选择器组件
const ProjectSelector = ({
  value,
  projects,
  onChange,
  error,
  touched,
  disabled,
}: {
  value: string;
  projects: Project[];
  onChange: (id: string) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProject = projects.find(p => p.id === value);

  return (
    <View className="mb-4">
      {!disabled && (
        <Text className="mb-1 text-sm text-gray-600">
          {t('project.log.create.selectProject.label')}
        </Text>
      )}
      <TouchableOpacity
        className={`flex-row items-center justify-between rounded-lg border p-2 ${
          error && touched ? 'border-red-300' : 'border-gray-200'
        } ${disabled ? 'bg-gray-100' : ''}`}
        onPress={() => setIsOpen(!isOpen)}
        disabled={disabled}>
        <Text className={disabled ? 'text-gray-400' : ''}>
          {selectedProject?.name ||
            t('project.log.create.selectProject.placeholder')}
        </Text>
        {!disabled && (
          <RemixIcon
            name={isOpen ? 'arrow-up-s-line' : 'arrow-down-s-line'}
            size={20}
            color="#6B7280"
          />
        )}
      </TouchableOpacity>
      {isOpen && (
        <View className="mt-1 rounded-lg border border-gray-200 bg-white">
          {projects.map(project => (
            <TouchableOpacity
              key={project.id}
              className={`border-b border-gray-100 p-3 ${
                project.id === value ? 'bg-blue-50' : ''
              }`}
              onPress={() => {
                onChange(project.id);
                setIsOpen(false);
              }}>
              <Text
                className={
                  project.id === value ? 'text-blue-500' : 'text-gray-700'
                }>
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {error && touched && (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      )}
    </View>
  );
};

type ScreenProps = StackScreenProps<RootRouterParams, 'CreateLog'>;

export function CreateLogScreen() {
  const navigation = useNavigation();
  const route = useRoute<ScreenProps['route']>();
  const defaultProjectId = route.params?.projectId;
  const projects = useResourceStore(s => s.projects);
  const addLog = useResourceStore(s => s.addLog);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation();

  const initialValues: LogFormValues = {
    projectId: defaultProjectId || '',
    workHours: undefined,
    investment: undefined,
    revenue: undefined,
    remark: '',
    createdAt: new Date(),
  };

  const handleFormSubmit = async (values: any) => {
    try {
      await validationSchema.validate(values);
      console.log('提交日志', values);
      await addLog(values);
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || '未知错误');
      console.error('error', error);
    }
  };
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <View className="flex-1 p-4">
              {/* 项目选择卡片 */}
              <View className="mb-4 rounded-lg bg-white p-4">
                <Text className="mb-4 text-base font-medium">
                  {t('project.log.create.projectInfo.label')}
                </Text>
                <ProjectSelector
                  value={values.projectId}
                  projects={projects}
                  onChange={value => setFieldValue('projectId', value)}
                  error={errors.projectId}
                  touched={touched.projectId}
                  disabled={!!defaultProjectId}
                />
              </View>

              {/* 基本信息卡片 */}
              <View className="mb-4 rounded-lg bg-white p-4">
                <Text className="mb-4 text-base font-medium">
                  {t('project.log.create.logInfo')}
                </Text>

                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.log.create.createdAt.label')}
                  </Text>
                  <TouchableOpacity
                    className={`flex-row items-center justify-between rounded-lg border p-2 ${
                      errors.createdAt && touched.createdAt
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    onPress={() => setDatePickerOpen(true)}>
                    <Text>
                      {dayjs(values.createdAt).format(t('timeFormat.date'))}
                    </Text>
                    <RemixIcon name="calendar-line" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={datePickerOpen}
                    date={values.createdAt}
                    mode="date"
                    locale={getLanguageCode()}
                    title={t('project.log.create.createdAt.picker.title')}
                    confirmText={t(
                      'project.log.create.createdAt.picker.confirm',
                    )}
                    cancelText={t('project.log.create.createdAt.picker.cancel')}
                    onConfirm={date => {
                      setDatePickerOpen(false);
                      setFieldValue('createdAt', date);
                    }}
                    onCancel={() => {
                      setDatePickerOpen(false);
                    }}
                  />
                  {errors.createdAt && touched.createdAt && (
                    <Text className="mt-1 text-xs text-red-500">
                      {errors.createdAt as any}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.log.create.workHours.label')}
                  </Text>
                  <TextInput
                    className={`rounded-lg border p-2 ${
                      errors.workHours && touched.workHours
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    value={values.workHours?.toString()}
                    onChangeText={handleChange('workHours')}
                    onBlur={handleBlur('workHours')}
                    placeholder={t('project.log.create.workHours.placeholder')}
                    keyboardType="numeric"
                  />
                  {errors.workHours && touched.workHours && (
                    <Text className="mt-1 text-xs text-red-500">
                      {errors.workHours}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.log.create.investment.label')}
                  </Text>
                  <TextInput
                    className={`rounded-lg border p-2 ${
                      errors.investment && touched.investment
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    value={values.investment?.toString()}
                    onChangeText={handleChange('investment')}
                    onBlur={handleBlur('investment')}
                    placeholder={t('project.log.create.investment.placeholder')}
                    keyboardType="numeric"
                  />
                  {errors.investment && touched.investment && (
                    <Text className="mt-1 text-xs text-red-500">
                      {errors.investment}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.log.create.revenue.label')}
                  </Text>
                  <TextInput
                    className={`rounded-lg border p-2 ${
                      errors.revenue && touched.revenue
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    value={values.revenue?.toString()}
                    onChangeText={handleChange('revenue')}
                    onBlur={handleBlur('revenue')}
                    placeholder={t('project.log.create.revenue.placeholder')}
                    keyboardType="numeric"
                  />
                  {errors.revenue && touched.revenue && (
                    <Text className="mt-1 text-xs text-red-500">
                      {errors.revenue}
                    </Text>
                  )}
                </View>
              </View>

              {/* 备注卡片 */}
              <View className="mb-4 rounded-lg bg-white p-4">
                <Text className="mb-4 text-base font-medium">
                  {t('project.log.create.remark.label')}
                </Text>
                <TextInput
                  className={`h-32 rounded-lg border p-2 ${
                    errors.remark && touched.remark
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                  value={values.remark}
                  onChangeText={handleChange('remark')}
                  onBlur={handleBlur('remark')}
                  placeholder={t('project.log.create.remark.placeholder')}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled={false}
                  blurOnSubmit={false}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
                {errors.remark && touched.remark && (
                  <Text className="mt-1 text-xs text-red-500">
                    {errors.remark}
                  </Text>
                )}
              </View>

              {/* 提交按钮 */}
              <TouchableOpacity
                className="mb-4 rounded-lg bg-blue-500 p-4"
                onPress={() => handleSubmit()}>
                <Text className="text-center text-white">
                  {t('project.log.create.save')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
