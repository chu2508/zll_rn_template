import * as React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

const PointerSvg = (props: SvgProps) => (
  <Svg width={80} height={80} {...props}>
    <Path
      fill="#3D2817"
      d="M40 75c15 0 27-12 27-27 0-11-15-31-23-41-2-2-3-2-4-2s-2 0-4 2c-8 10-23 30-23 41 0 15 12 27 27 27Zm0-37c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9Z"
    />
    <Circle cx={40} cy={47} r={5.5} fill="#fff" />
  </Svg>
);
export default PointerSvg;
