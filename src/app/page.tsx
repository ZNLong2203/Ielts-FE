import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "../utils/getQueryClient";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

import LandingPage from "./landingPage";

export default function Home() {
  const queryClient = getQueryClient();

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <LandingPage />
      </HydrationBoundary>
    </main>
  );
}
