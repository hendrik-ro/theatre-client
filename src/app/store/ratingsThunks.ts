import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllRatings, rateMovie, deleteRating } from "../../api/ratings";
import {
  fetchRatingsStart,
  fetchRatingsSuccess,
  fetchRatingsFailure,
  setRating,
  removeRating,
} from "./ratingsSlice";

// Async thunk to fetch all ratings for the current user
export const fetchRatings = createAsyncThunk(
  "ratings/fetchAll",
  async (_, { dispatch }) => {
    dispatch(fetchRatingsStart());
    try {
      const ratings = await fetchAllRatings();
      dispatch(fetchRatingsSuccess(ratings));
      return ratings;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch ratings";
      dispatch(fetchRatingsFailure(message));
      throw error;
    }
  },
);

// Async thunk to rate a movie
export const rateMovieThunk = createAsyncThunk(
  "ratings/rateMovie",
  async (
    { movieId, rating }: { movieId: string; rating: number },
    { dispatch },
  ) => {
    const result = await rateMovie(movieId, rating);
    dispatch(setRating(result));
    return result;
  },
);

// Async thunk to delete a rating
export const deleteRatingThunk = createAsyncThunk(
  "ratings/deleteRating",
  async (movieId: string, { dispatch }) => {
    await deleteRating(movieId);
    dispatch(removeRating(movieId));
    return movieId;
  },
);
