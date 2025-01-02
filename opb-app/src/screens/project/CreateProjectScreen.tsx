import { useNavigation, useRoute } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import { TFunction } from 'i18next';
import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
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
import {
  ProjectFormValues,
  ProjectStatus,
  ProjectStatusNames,
} from '@src/orm/models/project';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

// 定义验证模式
const validationSchema = (t: TFunction) =>
  Yup.object<ProjectFormValues>().shape({
    name: Yup.string()
      .required(t('project.create.name.validation.required'))
      .max(50, t('project.create.name.validation.maxLength')),
    targetAmount: Yup.number()
      .required(t('project.create.targetAmount.validation.required'))
      .min(0, t('project.create.targetAmount.validation.min'))
      .typeError(t('project.create.targetAmount.validation.invalid')),
    status: Yup.string()
      .oneOf(Object.values(ProjectStatus))
      .required(t('project.create.status.validation.required')),
    description: Yup.string().max(
      500,
      t('project.create.description.validation.maxLength'),
    ),
    createdAt: Yup.date().required(t('project.create.createdAt.label')),
  });

// 状态选择器组件
const statuses = [
  {
    value: ProjectStatus.PLANNING,
    label: ProjectStatusNames[ProjectStatus.PLANNING],
  },
  {
    value: ProjectStatus.DEVELOPING,
    label: ProjectStatusNames[ProjectStatus.DEVELOPING],
  },
  {
    value: ProjectStatus.OPERATING,
    label: ProjectStatusNames[ProjectStatus.OPERATING],
  },
  {
    value: ProjectStatus.ARCHIVED,
    label: ProjectStatusNames[ProjectStatus.ARCHIVED],
  },
];

const StatusSelector = ({
  value,
  onChange,
}: {
  value: ProjectStatus;
  onChange: (status: ProjectStatus) => void;
}) => {
  return (
    <View className="flex-row flex-wrap">
      {statuses.map(status => (
        <TouchableOpacity
          key={status.value}
          className={`mb-2 mr-2 rounded-full px-4 py-2 ${
            value === status.value ? 'bg-blue-500' : 'bg-gray-100'
          }`}
          onPress={() => onChange(status.value)}>
          <Text
            className={value === status.value ? 'text-white' : 'text-gray-600'}>
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

type ScreenProps = StackScreenProps<RootRouterParams, 'CreateProject'>;

// 扩展表单值类型
type FormValues = {
  name: string;
  targetAmount: string;
  status: ProjectStatus;
  description?: string;
  createdAt: Date;
};

const DEFAULT_INITIAL_VALUES = {
  name: '',
  targetAmount: '',
  status: ProjectStatus.PLANNING,
  description: '',
  createdAt: new Date(), // 添加默认创建时间
};

export function CreateProjectScreen() {
  const navigation = useNavigation<ScreenProps['navigation']>();
  const route = useRoute<ScreenProps['route']>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { t } = useTranslation();

  const addProject = useResourceStore(s => s.addProject);
  const initProjects = useResourceStore(s => s.initProjects);
  const getProjectById = useResourceStore(s => s.getProjectById);
  const editProject = useResourceStore(s => s.editProject);
  const projectId = route.params?.projectId;
  const deleteProject = useResourceStore(s => s.deleteProject);

  const [initialValues] = useState<FormValues>(() => {
    if (!projectId) {
      return DEFAULT_INITIAL_VALUES;
    }
    const project = getProjectById(projectId);
    if (!project) {
      return DEFAULT_INITIAL_VALUES;
    }

    return {
      name: project.name,
      targetAmount: project.targetAmount.toString(),
      status: project.status,
      description: project.description,
      createdAt: project.createdAt,
    };
  });

  useLayoutEffect(() => {
    if (projectId) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                t('project.create.delete.title'),
                t('project.create.delete.message'),
                [
                  {
                    text: t('project.create.delete.cancel'),
                    style: 'cancel',
                  },
                  {
                    text: t('project.create.delete.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteProject(projectId);
                        navigation.popToTop();
                      } catch (error: any) {
                        showToast(error.message || t('project.create.error'));
                      }
                    },
                  },
                ],
              );
            }}
            className="mr-4">
            <RemixIcon name="delete-bin-line" size={20} color="#EF4444" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, projectId, deleteProject, t]);

  const handleFormSubmit = async (values: any) => {
    try {
      const { hasReachedProjectLimit } = useRootStore.getState();
      const projectCount = useResourceStore.getState().projects.length;
      if (hasReachedProjectLimit(projectCount)) {
        showToast(t('subscription.project_limit_reached'));
        return;
      }
      if (projectId) {
        await editProject(projectId, values as unknown as ProjectFormValues);
      } else {
        await addProject(values as unknown as ProjectFormValues);
      }
      initProjects();
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || t('project.create.error'));
    }
  };
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema(t)}
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
            <View className="p-4">
              {/* 基本信息卡片 */}
              <View className="mb-4 rounded-lg bg-white p-4">
                <Text className="mb-4 text-base font-medium">
                  {t('project.create.title')}
                </Text>

                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.create.name.label')}
                  </Text>
                  <TextInput
                    className={`rounded-lg border p-2 ${
                      errors.name && touched.name
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    placeholder={t('project.create.name.placeholder')}
                  />
                  {errors.name && touched.name && (
                    <Text className="mt-1 text-xs text-red-500">
                      {errors.name}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.create.targetAmount.label')}
                  </Text>
                  <TextInput
                    className={`rounded-lg border p-2 ${
                      errors.targetAmount && touched.targetAmount
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    value={values.targetAmount as unknown as string}
                    onChangeText={handleChange('targetAmount')}
                    onBlur={handleBlur('targetAmount')}
                    placeholder={t('project.create.targetAmount.placeholder')}
                    keyboardType="numeric"
                  />
                  {errors.targetAmount && touched.targetAmount && (
                    <Text className="mt-1 text-xs text-red-500">
                      {errors.targetAmount}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm text-gray-600">
                    {t('project.create.status.label')}
                  </Text>
                  <StatusSelector
                    value={values.status}
                    onChange={value => setFieldValue('status', value)}
                  />
                </View>

                {/* 添加创建时间选择 */}
                <View className="mb-4">
                  <Text className="mb-1 text-sm text-gray-600">
                    {t('project.create.createdAt.label')}
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between rounded-lg border border-gray-200 p-2"
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
                    title={t('project.create.createdAt.picker.title')}
                    confirmText={t('project.create.createdAt.picker.confirm')}
                    cancelText={t('project.create.createdAt.picker.cancel')}
                    onConfirm={date => {
                      setDatePickerOpen(false);
                      setFieldValue('createdAt', date);
                    }}
                    onCancel={() => {
                      setDatePickerOpen(false);
                    }}
                  />
                </View>
              </View>

              {/* 项目描述卡片 */}
              <View className="mb-4 rounded-lg bg-white p-4">
                <Text className="mb-4 text-base font-medium">
                  {t('project.create.description.label')}
                </Text>
                <TextInput
                  className={`h-32 rounded-lg border p-2 ${
                    errors.description && touched.description
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  placeholder={t('project.create.description.placeholder')}
                  multiline
                  textAlignVertical="top"
                />
                {errors.description && touched.description && (
                  <Text className="mt-1 text-xs text-red-500">
                    {errors.description}
                  </Text>
                )}
              </View>

              {/* 提交按钮 */}
              <TouchableOpacity
                className="mb-4 rounded-lg bg-blue-500 p-4"
                onPress={() => handleSubmit()}>
                <Text className="text-center text-white">
                  {t('project.create.save')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
