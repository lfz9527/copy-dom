import Icon from "@ant-design/icons";
import type { GetProps } from "antd";
import CssSvg from "~/assets/icon/css-icon.svg?react";
import JsSvg from "~/assets/icon/js-icon.svg?react";
import HtmlSvg from "~/assets/icon/html-icon.svg?react";
import Ipad from "~/assets/icon/ipad.svg?react";
import Pc from "~/assets/icon/pc.svg?react";
import Phone from "~/assets/icon/phone.svg?react";

export type CustomIconComponentProps = GetProps<typeof Icon>;

// 主题图标
export const HtmlSvgIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={HtmlSvg} {...props} />
);
// 时间升序图标
export const JsSvgIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={JsSvg} {...props} />
);
// 时间降序图标
export const CssSvgIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CssSvg} {...props} />
);

export const IpadIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Ipad} {...props} />
);
export const PcIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Pc} {...props} />
);

export const PhoneIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Phone} {...props} />
);

export default {
  HtmlSvgIcon,
  JsSvgIcon,
  CssSvgIcon,
  IpadIcon,
  PcIcon,
  PhoneIcon,
};
