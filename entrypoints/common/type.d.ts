import { CLICK_DIR } from "~/entrypoints/common/constant/index";

export type ClickDirection = keyof typeof CLICK_DIR; // '0' | '2'
export type ClickAction = (typeof CLICK_DIR)[ClickDirection]; // 'LEFT_CLICK' | 'RIGHT_CLICK'
