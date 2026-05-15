"use client"

import { useRouter } from "next/navigation"
import FloatingActionMenu from "@/components/ui/floating-action-menu"
import { Tag } from "lucide-react"

type Category = { id: number | string; name: string; slug: string }

interface Props {
  categories: Category[]
  currentCategory?: string
  currentQuery?: string
}

export default function ShopFilterMenu({ categories, currentCategory, currentQuery }: Props) {
  const router = useRouter()

  function navigate(categorySlug?: string) {
    const params = new URLSearchParams()
    if (currentQuery) params.set("q", currentQuery)
    if (categorySlug) params.set("category", categorySlug)
    const qs = params.toString()
    router.push(qs ? `/products?${qs}` : "/products")
  }

  const options = [
    {
      label: "All",
      Icon: <Tag className="h-3.5 w-3.5" />,
      onClick: () => navigate(undefined),
      active: !currentCategory,
    },
    ...categories.map((cat) => ({
      label: cat.name,
      Icon: <Tag className="h-3.5 w-3.5" />,
      onClick: () => navigate(cat.slug),
      active: currentCategory === cat.slug,
    })),
  ]

  return (
    <div className="hidden md:block">
      <FloatingActionMenu options={options} className="bottom-24" />
    </div>
  )
}
