import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Flame,
  MapPin,
  Star,
  Truck,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

const HIGHLIGHTS = [
  { label: "Local favourites", icon: MapPin },
  { label: "Reviewed menus", icon: BadgeCheck },
  { label: "Delivery to your door", icon: Truck },
]

export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-[#fff8f1] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 dark:bg-[#0d0908]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-0 size-80 rounded-full bg-orange-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-red-300/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-[2rem] border border-orange-950/10 bg-[#1b100c] shadow-[0_30px_80px_-40px_rgba(67,20,7,0.45)] duration-700 dark:border-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10"
          />

          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/20 bg-orange-200/10 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] text-orange-100 uppercase">
                <span className="size-1.5 rounded-full bg-orange-300 shadow-[0_0_0_4px_rgba(251,146,60,0.15)]" />
                Fresh from local ovens
              </span>

              <h1 className="mt-6 max-w-xl text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem] lg:leading-[1.05]">
                Fresh pizza,{" "}
                <span className="text-orange-300">right to your door</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75">
                Discover local pizzerias, explore their menus and order your
                favourite slices in a few clicks.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "h-11 gap-2 rounded-full bg-orange-500 px-5 font-semibold text-white shadow-lg shadow-orange-950/30 hover:bg-orange-400",
                  })}
                >
                  Browse the menu <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/sign-up"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "h-11 rounded-full border-white/25 bg-white/10 px-5 font-semibold text-white hover:bg-white/20 hover:text-white",
                  })}
                >
                  Become a vendor
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
                {HIGHLIGHTS.map(({ label, icon: Icon }) => (
                  <span key={label} className="flex items-center gap-2">
                    <Icon className="size-4 text-orange-300" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-80 lg:min-h-full">
              <Image
                src="/images/banner.jpg"
                alt="Freshly prepared pizza"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b100c]/90 via-transparent to-[#1b100c]/45" />
              <div className="absolute inset-4 rounded-[1.4rem] border border-white/15" />

              <div className="absolute top-5 right-5 z-20 hidden items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-medium text-white shadow-xl shadow-black/30 backdrop-blur-md sm:flex">
                <Star className="size-3.5 fill-orange-300 text-orange-300" />
                A local favourite
              </div>

              <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-[#1b100c]/75 p-3.5 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                  <Flame className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-white uppercase">
                    Made fresh
                  </p>
                  <p className="mt-0.5 text-sm text-white/70">
                    From neighbourhood ovens to your table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
