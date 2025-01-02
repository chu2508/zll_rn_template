import RemixIcon, { RemixIconNames } from '@ui/icon/Remix';
import { useCallback, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

export type ActionItem = {
  icon: RemixIconNames;
  label: string;
  onPress: () => void;
};

type Props = {
  actions: ActionItem[];
  icon?: RemixIconNames;
};

export function FloatingActionButton({ actions, icon = 'add-line' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleMenu = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  }, [isOpen, animation]);

  return (
    <View className="absolute bottom-6 right-6">
      {/* 子按钮 */}
      {actions.map((action, index) => {
        // 计算环形布局的位置
        const totalButtons = actions.length;
        // 在180度(π弧度)范围内均匀分布
        const angleStep = Math.PI / (totalButtons + 2);
        // 起始角度为90度(π/2)，然后依次递减
        const angle = Math.PI / 2 - angleStep * (index + 1);
        const radius = 55; // 调整半径大小

        // 计算x和y的位移
        const translateX = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -Math.cos(angle) * radius], // 使用余弦计算x偏移
        });

        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -Math.sin(angle) * radius], // 使用正弦计算y偏移
        });

        const style = {
          transform: [{ translateX }, { translateY }],
          opacity: animation,
          zIndex: -1,
        };

        return (
          <Animated.View key={index} className="absolute" style={style}>
            <View className="items-center">
              {/* 按钮 */}
              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-full bg-blue-500 shadow-lg"
                onPress={() => {
                  toggleMenu();
                  action.onPress();
                }}>
                <RemixIcon name={action.icon} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}

      {/* 主按钮 */}
      <TouchableOpacity
        className="h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
        activeOpacity={0.8}
        onPress={toggleMenu}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          }}>
          <RemixIcon name={icon} size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
