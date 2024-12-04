import { createIconSet } from 'react-native-vector-icons';
import { IconProps } from 'react-native-vector-icons/Icon';

import remixGlyphMap from './remixGlyphMap.json';

export type RemixIconNames = keyof typeof remixGlyphMap;

export interface RemixIconProps extends IconProps {
  name: RemixIconNames;
}

export interface RemixIconType extends React.ComponentClass<RemixIconProps> {}

const RemixIcon = createIconSet(remixGlyphMap, 'remixicon', 'remixicon.ttf');

export default RemixIcon as RemixIconType;

export const { Button, getImageSource, getImageSourceSync } = RemixIcon;
