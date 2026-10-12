import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getSession } from "@/features/auth/session"
import { FeedEmpty } from "@/features/discover/components/feed-empty"
import { FeedSkeleton } from "@/features/discover/components/feed-skeleton"
import { HomeFeed } from "@/features/discover/components/home-feed"
import { LocationBar } from "@/features/discover/components/location-bar"
import { parseFeedFilters } from "@/features/discover/location"
import { getFeedLocation } from "@/features/discover/resolve-location"
import { CuisineMarquee } from "@/features/marketing/components/cuisine-marquee"
import { FairShare } from "@/features/marketing/components/fair-share"
import { HomeHero } from "@/features/marketing/components/home-hero"
import { HowItWorks } from "@/features/marketing/components/how-it-works"
import { PartnerBand } from "@/features/marketing/components/partner-band"

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await getSession()
  if (user?.role === "restaurant") redirect("/restaurant")

  const filters = parseFeedFilters(await searchParams)
  const location = await getFeedLocation()

  return (
    <>
      <HomeHero
        locationLabel={location?.label ?? null}
        showGuestAction={!user}
      />
      <CuisineMarquee />

      {location ? (
        <Suspense
          key={`${location.lng},${location.lat},${filters.cuisine ?? ""},${filters.veg}`}
          fallback={
            <>
              <LocationBar label={location.label} openCount={null} />
              <FeedSkeleton />
            </>
          }
        >
          <HomeFeed location={location} filters={filters} />
        </Suspense>
      ) : (
        <section id="restaurants" className="scroll-mt-(--ui-header-height)">
          <LocationBar label={null} openCount={null} />
          <FeedEmpty
            title="Where are you hungry?"
            description="Share your location to see restaurants that are open near you right now."
          />
        </section>
      )}

      <HowItWorks />
      <FairShare />
      <PartnerBand />
    </>
  )
}
