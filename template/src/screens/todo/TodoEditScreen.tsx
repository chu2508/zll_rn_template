import { useNavigation, useRoute } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import * as Yup from 'yup';

import { showToast } from '@src/components/common/Toast';
import { RootRouterParams } from '@src/navigation/types';
import {
  Todo,
  TodoPriority,
  TodoPriorityNames,
  TodoStatus,
} from '@src/orm/models/todo';
import { TodoRepository } from '@src/orm/models/todo.repo';

type Props = StackScreenProps<RootRouterParams, 'TodoEdit'>;

const validationSchema = Yup.object().shape({
  content: Yup.string().required('内容不能为空'),
  priority: Yup.string().required('请选择优先级'),
  dueDate: Yup.date().nullable(),
});

const PriorityIcon: Record<TodoPriority, RemixIconNames> = {
  [TodoPriority.URGENT_IMPORTANT]: 'alarm-warning-fill',
  [TodoPriority.IMPORTANT]: 'star-fill',
  [TodoPriority.URGENT]: 'timer-flash-fill',
  [TodoPriority.NORMAL]: 'checkbox-circle-fill',
};

const PriorityColor: Record<TodoPriority, string> = {
  [TodoPriority.URGENT_IMPORTANT]: 'bg-red-500',
  [TodoPriority.IMPORTANT]: 'bg-yellow-500',
  [TodoPriority.URGENT]: 'bg-orange-500',
  [TodoPriority.NORMAL]: 'bg-blue-500',
};

export function TodoEditScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { todoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // 加载待办数据
  useEffect(() => {
    loadTodo();
  }, [todoId]);

  const loadTodo = async () => {
    try {
      setLoading(true);
      const todoData = await TodoRepository.findOneBy({ id: todoId });
      if (!todoData) {
        showToast('待办事项不存在');
        navigation.goBack();
        return;
      }
      setTodo(todoData);
    } catch (error) {
      console.error('加载待办失败:', error);
      showToast('加载待办失败');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Partial<Todo>) => {
    try {
      await TodoRepository.update(todoId, values);
      showToast('保存成功');
      navigation.goBack();
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!todo) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Formik
        initialValues={{
          content: todo.content,
          priority: todo.priority,
          dueDate: todo.dueDate,
          status: todo.status,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <View className="space-y-4 p-4">
            {/* 内容输入 */}
            <View className="rounded-lg bg-white p-4">
              <Text className="mb-2 text-base font-medium">待办内容</Text>
              <TextInput
                className="min-h-[80px] rounded-lg border border-gray-200 p-3"
                value={values.content}
                onChangeText={handleChange('content')}
                onBlur={handleBlur('content')}
                multiline
                placeholder="请输入待办事项内容..."
                textAlignVertical="top"
              />
              {errors.content && touched.content && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors.content}
                </Text>
              )}
            </View>

            {/* 优先级选择 */}
            <View className="rounded-lg bg-white p-4">
              <Text className="mb-4 text-base font-medium">优先级</Text>
              <View className="flex-row flex-wrap justify-between">
                {Object.entries(TodoPriority).map(([key, value]) => (
                  <TouchableOpacity
                    key={value}
                    className={`mb-2 w-[48%] flex-row items-center rounded-lg p-3 ${
                      values.priority === value
                        ? `${PriorityColor[value]} border-2 border-white`
                        : 'border-2 border-gray-100 bg-gray-50'
                    }`}
                    onPress={() => setFieldValue('priority', value)}>
                    <RemixIcon
                      name={PriorityIcon[value]}
                      size={20}
                      color={values.priority === value ? '#FFF' : '#6B7280'}
                    />
                    <Text
                      className={`ml-2 ${
                        values.priority === value
                          ? 'font-medium text-white'
                          : 'text-gray-600'
                      }`}>
                      {TodoPriorityNames[value]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 截止日期 */}
            <View className="rounded-lg bg-white p-4">
              <Text className="mb-2 text-base font-medium">截止日期</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-200 p-3"
                onPress={() => setDatePickerOpen(true)}>
                <View className="flex-row items-center">
                  <RemixIcon name="calendar-line" size={20} color="#6B7280" />
                  <Text className="ml-2 text-gray-600">
                    {values.dueDate
                      ? dayjs(values.dueDate).format('YYYY-MM-DD HH:mm')
                      : '请选择截止日期'}
                  </Text>
                </View>
                {values.dueDate && (
                  <TouchableOpacity
                    className="h-6 w-6 items-center justify-center rounded-full bg-gray-100"
                    onPress={() => setFieldValue('dueDate', null)}>
                    <RemixIcon name="close-line" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <DatePicker
                modal
                open={datePickerOpen}
                date={values.dueDate || new Date()}
                mode="datetime"
                title="选择截止日期"
                confirmText="确定"
                cancelText="取消"
                onConfirm={date => {
                  setDatePickerOpen(false);
                  setFieldValue('dueDate', date);
                }}
                onCancel={() => setDatePickerOpen(false)}
              />
            </View>

            {/* 状态切换 */}
            <View className="rounded-lg bg-white p-4">
              <Text className="mb-4 text-base font-medium">状态</Text>
              <View className="flex-row justify-around">
                {[TodoStatus.TODO, TodoStatus.DONE].map(status => (
                  <TouchableOpacity
                    key={status}
                    className={`flex-row items-center rounded-lg px-6 py-3 ${
                      values.status === status
                        ? 'border-2 border-blue-200 bg-blue-50'
                        : 'border-2 border-gray-100 bg-gray-50'
                    }`}
                    onPress={() => setFieldValue('status', status)}>
                    <RemixIcon
                      name={
                        status === TodoStatus.DONE
                          ? 'checkbox-circle-fill'
                          : 'checkbox-blank-circle-line'
                      }
                      size={20}
                      color={
                        values.status === status
                          ? status === TodoStatus.DONE
                            ? '#10B981'
                            : '#3B82F6'
                          : '#6B7280'
                      }
                    />
                    <Text
                      className={`ml-2 ${
                        values.status === status
                          ? status === TodoStatus.DONE
                            ? 'text-green-600'
                            : 'text-blue-600'
                          : 'text-gray-600'
                      }`}>
                      {status === TodoStatus.DONE ? '已完成' : '待完成'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 保存按钮 */}
            <TouchableOpacity
              className="rounded-lg bg-blue-500 p-4"
              onPress={() => handleSubmit()}>
              <Text className="text-center font-medium text-white">保存</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
