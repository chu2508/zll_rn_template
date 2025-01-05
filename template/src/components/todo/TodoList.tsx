import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Todo, TodoPriorityNames, TodoStatus } from '@src/orm/models/todo';

type Props = {
  todos: Todo[];
  onToggleStatus: (todoId: string) => void;
  onAddTodo: (content: string) => void;
  onEditPress: (todo: Todo) => void;
  onDeletePress: (todoId: string) => void;
};

export function TodoList({
  todos,
  onToggleStatus,
  onAddTodo,
  onEditPress,
  onDeletePress,
}: Props) {
  const { t } = useTranslation();
  const [newTodo, setNewTodo] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // 分离待办和已完成的任务
  const pendingTodos = todos.filter(todo => todo.status === TodoStatus.TODO);
  const completedTodos = todos.filter(todo => todo.status === TodoStatus.DONE);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const renderTodoItem = (todo: Todo) => (
    <View
      key={todo.id}
      className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-sm">
      <View className="flex-row items-start">
        <TouchableOpacity
          className="mr-3 mt-1 h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white"
          onPress={() => onToggleStatus(todo.id)}>
          {todo.status === TodoStatus.DONE && (
            <RemixIcon name="check-line" size={16} color="#10B981" />
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={`flex-1 text-base ${
                todo.status === TodoStatus.DONE
                  ? 'text-gray-400 line-through'
                  : 'text-gray-900'
              }`}>
              {todo.content}
            </Text>
            <View className="ml-2 flex-row">
              <TouchableOpacity
                className="mx-1 h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
                onPress={() => onEditPress(todo)}>
                <RemixIcon name="edit-line" size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                className="mx-1 h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
                onPress={() => onDeletePress(todo.id)}>
                <RemixIcon name="delete-bin-line" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="mt-1 flex-row items-center">
            <View className="mr-2 rounded-full bg-blue-100 px-2 py-0.5">
              <Text className="text-xs text-blue-600">
                {TodoPriorityNames[todo.priority]}
              </Text>
            </View>
            {todo.dueDate && (
              <Text
                className={`text-xs ${
                  new Date(todo.dueDate) < new Date()
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}>
                {t('todo.list.dueDate', {
                  date: dayjs(todo.dueDate).format('MM-DD HH:mm'),
                })}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="rounded-lg bg-white p-4">
      {/* 添加待办输入框 */}
      <View className="mb-6 flex-row items-center">
        <TextInput
          className="mr-2 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          placeholder={t('todo.list.input.placeholder')}
          value={newTodo}
          onChangeText={setNewTodo}
          onSubmitEditing={handleAddTodo}
          returnKeyType="done"
        />
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-lg bg-blue-500"
          onPress={handleAddTodo}>
          <RemixIcon name="add-line" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 标题和筛选按钮 */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-medium">
          {t('todo.list.filter.pending', { count: pendingTodos.length })}
        </Text>
        <TouchableOpacity
          className="rounded-full bg-gray-100 px-3 py-1"
          onPress={() => setShowCompleted(!showCompleted)}>
          <Text className="text-sm text-gray-600">
            {showCompleted
              ? t('todo.list.filter.hideCompleted')
              : t('todo.list.filter.showCompleted')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 待办任务列表 */}
      <View className="space-y-1">
        {pendingTodos.length > 0 ? (
          pendingTodos.map(renderTodoItem)
        ) : (
          <Text className="text-center text-gray-500">
            {t('todo.list.empty')}
          </Text>
        )}
      </View>

      {/* 已完成任务列表 */}
      {showCompleted && completedTodos.length > 0 && (
        <View className="mt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">
            {t('todo.list.filter.completed', { count: completedTodos.length })}
          </Text>
          <View className="space-y-1">
            {completedTodos.map(renderTodoItem)}
          </View>
        </View>
      )}
    </View>
  );
}
