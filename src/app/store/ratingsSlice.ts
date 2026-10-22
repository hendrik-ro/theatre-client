import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserMovieRating } from "../../types/rating";

export interface RatingsState {
  // Map of movieId -> rating for O(1) lookups
  byMovieId: Record<string, number>;
  // All ratings as array (maintained for potential future use)
  allRatings: UserMovieRating[];
  // Loading state
  loading: boolean;
  // Error state
  error: string | null;
}

const initialState: RatingsState = {
  byMovieId: {},
  allRatings: [],
  loading: false,
  error: null,
};

export const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    // Start loading
    fetchRatingsStart(state) {
      state.loading = true;
      state.error = null;
    },

    // Successfully fetched all ratings
    fetchRatingsSuccess(state, action: PayloadAction<UserMovieRating[]>) {
      state.loading = false;
      state.allRatings = action.payload;
      state.byMovieId = {};
      for (const rating of action.payload) {
        state.byMovieId[rating.movieId] = rating.rating;
      }
    },

    // Failed to fetch ratings
    fetchRatingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add or update a rating
    setRating(state, action: PayloadAction<UserMovieRating>) {
      const { movieId, rating } = action.payload;
      state.byMovieId[movieId] = rating;
      // Update in allRatings array
      const existingIndex = state.allRatings.findIndex(
        (r) => r.movieId === movieId,
      );
      if (existingIndex >= 0) {
        state.allRatings[existingIndex] = action.payload;
      } else {
        state.allRatings.push(action.payload);
      }
    },

    // Remove a rating
    removeRating(state, action: PayloadAction<string>) {
      const movieId = action.payload;
      delete state.byMovieId[movieId];
      state.allRatings = state.allRatings.filter((r) => r.movieId !== movieId);
    },

    // Clear all ratings (on logout)
    clearRatings(state) {
      state.byMovieId = {};
      state.allRatings = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchRatingsStart,
  fetchRatingsSuccess,
  fetchRatingsFailure,
  setRating,
  removeRating,
  clearRatings,
} = ratingsSlice.actions;

export default ratingsSlice.reducer;

// Selectors
export const selectRatingByMovieId = (
  state: { ratings: RatingsState },
  movieId: string,
) => state.ratings.byMovieId[movieId];

export const selectAllRatings = (state: { ratings: RatingsState }) =>
  state.ratings.allRatings;

export const selectRatingsLoading = (state: { ratings: RatingsState }) =>
  state.ratings.loading;

export const selectRatingsError = (state: { ratings: RatingsState }) =>
  state.ratings.error;
