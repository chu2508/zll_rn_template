import RemixIcon from '@ui/icon/Remix';
import { useTranslation } from 'react-i18next';
import { TextInput, TextInputProps, View } from 'react-native';

export const SearchBar = (
  props: Pick<TextInputProps, 'value' | 'onChangeText'>,
) => {
  const { t } = useTranslation();
  return (
    <View className="mx-4 my-2 mb-4">
      <View className="flex-row items-center rounded-lg bg-white px-4 py-2">
        <TextInput
          {...props}
          className="ml-2 flex-1 text-black"
          placeholder={t('resource.searchBar.placeholder')}
          placeholderTextColor="#6B7280"
        />
        <RemixIcon name="search-2-line" size={20} color="#6B7280" />
      </View>
    </View>
  );
};
