import type React from "react"
import type { ViewStyle } from "react-native"
import type { SvgProps } from "react-native-svg"

interface SvgIconProps extends SvgProps {
  size?: number
  color?: string
  style?: ViewStyle
}

export const SvgIcon: React.FC<SvgIconProps> = ({ size = 24, color = "#000", style, ...props }) => {
  return <props.children width={size} height={size} fill={color} style={style} {...props} />
}
