import {
  type BannerAction,
  type BannerState,
  createBannerSlice,
} from "@web/app/store/banner-slice";
import { create } from "zustand";

type State = BannerState;
type Action = BannerAction;

const useStore = create<State & Action>()((...a) => createBannerSlice(...a));

export default useStore;
