import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "./utils/getQueryClient";

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
