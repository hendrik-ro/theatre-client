import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from ".";

// Typed hooks for Redux
// Usage: const dispatch = useAppDispatch()
export const useAppDispatch: () => AppDispatch = useDispatch;

// Usage: const ratings = useAppSelector(state => state.ratings)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
