import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { selectAllRatings } from "./store/ratingsSlice";
import { fetchRatings } from "./store/ratingsThunks";
import { useAuth } from "./AuthContext";

interface RatingsSyncProps {
  children: React.ReactNode;
}

// This component syncs ratings with the Redux store when auth state changes.
// It fetches ratings when a user logs in and clears them on logout.
export default function RatingsSync({ children }: RatingsSyncProps) {
  const dispatch = useAppDispatch();
  const { user, ready } = useAuth();
  const ratings = useAppSelector(selectAllRatings);

  // Fetch ratings when user logs in and we haven't loaded them yet
  useEffect(() => {
    if (user && ready && ratings.length === 0) {
      dispatch(fetchRatings());
    }
  }, [user, ready, ratings.length, dispatch]);

  return <>{children}</>;
}
