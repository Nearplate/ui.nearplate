import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BackLink } from "@/components/layout/back-link"
import {
  getMenuBySlug,
  getRestaurantBySlug,
} from "@/features/discover/api/discover-api"
import { MenuList } from "@/features/discover/components/menu-list"
import { RestaurantHero } from "@/features/discover/components/restaurant-hero"
import type { MenuItem, Restaurant } from "@/features/restaurant/schemas"
import { ApiError } from "@/lib/api/client"

const NOT_FOUND = 404

interface RestaurantPageProps {
  params: Promise<{ slug: string }>
}

async function loadRestaurant(
  slug: string
): Promise<{ restaurant: Restaurant; menu: MenuItem[] }> {
  try {
    const [restaurant, menu] = await Promise.all([
      getRestaurantBySlug(slug),
      getMenuBySlug(slug),
    ])
    return { restaurant, menu }
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND) notFound()
    throw error
  }
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const restaurant = await getRestaurantBySlug(slug)
    return {
      title: restaurant.name,
      description: restaurant.description ?? undefined,
    }
  } catch {
    return {}
  }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params
  const { restaurant, menu } = await loadRestaurant(slug)

  return (
    <>
      <div className="border-b-2 border-inverted px-4 py-1.5">
        <BackLink href="/#restaurants">All restaurants</BackLink>
      </div>
      <RestaurantHero restaurant={restaurant} />
      <MenuList
        restaurant={{
          id: restaurant.id,
          slug: restaurant.slug,
          name: restaurant.name,
          status: restaurant.status,
        }}
        items={menu}
      />
    </>
  )
}
