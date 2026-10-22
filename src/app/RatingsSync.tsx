import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { clearRatings } from "./store/ratingsSlice";
import { fetchRatings } from "./store/ratingsThunks";
import { useAuth } from "./AuthContext";

interface RatingsSyncProps {
  children: React.ReactNode;
}

// This component syncs ratings with the Redux store when the signed-in
// user changes. Ratings are keyed to the user id, so every login refetches
// (a second user on the same client instance must never see the previous
// user's ratings) and a logout clears the store instead of leaving the
// previous user's ratings behind until a page refresh.
export default function RatingsSync({ children }: RatingsSyncProps) {
  const dispatch = useAppDispatch();
  const { user, ready } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!ready) return;
    if (userId) {
      dispatch(fetchRatings());
    } else {
      dispatch(clearRatings());
    }
  }, [userId, ready, dispatch]);

  return <>{children}</>;
}
