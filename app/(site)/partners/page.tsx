import {
  ArrowUpRightIcon,
  BadgeCheckIcon,
  FileTextIcon,
  QrCodeIcon,
  ReceiptTextIcon,
  StoreIcon,
  ToggleRightIcon,
  UserPlusIcon,
  UtensilsIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { buttonTheme } from "@/components/ui/button"
import { CuisineMarquee } from "@/features/marketing/components/cuisine-marquee"

export const metadata: Metadata = {
  title: "For restaurants",
  description:
    "List your kitchen on NearPlate. No commission on orders, your own menu page and QR code.",
}

const STEPS = [
  {
    icon: UserPlusIcon,
    title: "Sign up",
    body: "Pick “I own a restaurant” and sign in with your email or Google.",
  },
  {
    icon: StoreIcon,
    title: "Add your kitchen",
    body: "Name, address, map pin and cuisines. Your menu can be built right away.",
  },
  {
    icon: FileTextIcon,
    title: "Share your papers",
    body: "Aadhaar, PAN, FSSAI licence and bank details, stored privately and encrypted.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Get approved",
    body: "We review your details, email you the result, and you go live.",
  },
] as const

const FEATURES = [
  {
    icon: ReceiptTextIcon,
    title: "Orders board",
    body: "New, accepted, cooking, out for delivery. Move each order on in one tap.",
  },
  {
    icon: UtensilsIcon,
    title: "Menu manager",
    body: "Categories, prices, photos, veg / egg / non-veg, and sold-out switches.",
  },
  {
    icon: QrCodeIcon,
    title: "Your own QR code",
    body: "A public menu page with a printable code for tables and takeaway bags.",
  },
  {
    icon: ToggleRightIcon,
    title: "Online in one tap",
    body: "Busy kitchen or closed for the day? Flip the switch and customers know.",
  },
] as const

const FAQ = [
  {
    question: "What does NearPlate charge?",
    answer:
      "Nothing per order. We don't take a commission, so you never have to inflate menu prices to cover one.",
  },
  {
    question: "What do I need to sign up?",
    answer:
      "Aadhaar (front and back), PAN card and number, your FSSAI certificate and 14-digit licence number, and a bank account with a cancelled cheque or passbook photo.",
  },
  {
    question: "Can I set up my menu before approval?",
    answer:
      "Yes. You keep full access to your menu and profile while we review your documents. You can go online once you're approved.",
  },
  {
    question: "Who sees my documents?",
    answer:
      "Only our review team. Documents sit in a private bucket and are opened through short-lived links, and bank and PAN numbers are encrypted at rest.",
  },
] as const

export default function PartnersPage() {
  return (
    <>
      <section className="grid border-b-2 border-inverted bg-inverted text-inverted lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6 p-4 py-12 md:p-10 md:py-16">
          <p className="font-mono text-[11px] tracking-wider text-highlight uppercase">
            NearPlate for restaurants
          </p>
          <h1 className="font-display text-6xl leading-[0.92] uppercase md:text-8xl">
            Your kitchen.
            <br />
            Your margin.
            <br />
            <span className="mark-highlight">Zero commission.</span>
          </h1>
          <p className="max-w-lg text-base opacity-80">
            Take orders from customers nearby without handing a cut of every
            bill to an app. You set the menu price, and you keep all of it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth?role=restaurant"
              className={buttonTheme({
                size: "xl",
                color: "neutral",
                variant: "outline",
                className:
                  "bg-highlight text-neutral-950 ring-highlight hover:bg-default",
              })}
            >
              List your kitchen
              <ArrowUpRightIcon aria-hidden />
            </Link>
            <Link
              href="/restaurant"
              className="inline-flex items-center px-2 font-mono text-xs font-medium tracking-wider uppercase underline-offset-4 hover:underline"
            >
              Already a partner? Open your dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center border-t-2 border-inverted bg-highlight p-8 text-neutral-950 lg:border-t-0 lg:border-l-2">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-display text-[10rem] leading-[0.8] md:text-[14rem]">
              0%
            </p>
            <p className="font-mono text-xs tracking-wider uppercase">
              Commission on every order. Forever.
            </p>
          </div>
        </div>
      </section>

      <CuisineMarquee
        words={[
          "Cloud kitchens",
          "Dhabas",
          "Cafés",
          "Bakeries",
          "Thali houses",
          "Tiffin services",
          "Sweet shops",
          "Biryani joints",
        ]}
      />

      <section
        aria-labelledby="partner-steps"
        className="border-b-2 border-inverted"
      >
        <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-inverted px-4 py-5 md:px-6">
          <h2
            id="partner-steps"
            className="font-display text-4xl leading-none uppercase md:text-5xl"
          >
            Live in four steps
          </h2>
          <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
            Save as you go. Pick up where you left off.
          </p>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="flex flex-col gap-4 border-b-2 border-inverted p-4 sm:odd:border-r-2 md:p-6 lg:border-r-2 lg:border-b-0 lg:last:border-r-0"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl leading-none">
                    0{index + 1}
                  </span>
                  <span className="grid size-10 place-items-center bg-inverted text-highlight">
                    <Icon aria-hidden className="size-5" />
                  </span>
                </div>
                <h3 className="font-display text-2xl uppercase">
                  {step.title}
                </h3>
                <p className="text-sm text-toned">{step.body}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <section
        aria-labelledby="partner-tools"
        className="grid border-b-2 border-inverted lg:grid-cols-[1fr_2fr]"
      >
        <div className="flex flex-col gap-3 border-b-2 border-inverted p-4 md:p-8 lg:border-r-2 lg:border-b-0">
          <h2
            id="partner-tools"
            className="font-display text-5xl leading-[0.9] uppercase md:text-6xl"
          >
            Everything to run the pass.
          </h2>
          <p className="text-sm text-toned">
            A dashboard built for a busy kitchen: big buttons, live orders and
            nothing you don&apos;t need.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <li
                key={feature.title}
                className={
                  "flex gap-4 border-inverted p-4 md:p-6 " +
                  (index % 2 === 0 ? "sm:border-r-2 " : "") +
                  (index < 2
                    ? "border-b-2"
                    : "max-sm:border-b-2 max-sm:last:border-b-0")
                }
              >
                <span className="grid size-10 shrink-0 place-items-center border-2 border-inverted bg-highlight text-neutral-950">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-2xl uppercase">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-toned">{feature.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section
        aria-labelledby="partner-faq"
        className="grid border-b-2 border-inverted lg:grid-cols-[1fr_2fr]"
      >
        <h2
          id="partner-faq"
          className="border-b-2 border-inverted p-4 font-display text-5xl leading-none uppercase md:p-8 lg:border-r-2 lg:border-b-0"
        >
          Questions
        </h2>
        <div>
          {FAQ.map((item) => (
            <details
              key={item.question}
              className="group border-b-2 border-inverted last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-display text-2xl uppercase hover:bg-highlight hover:text-neutral-950 md:px-8 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden
                  className="font-mono text-2xl transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl px-4 pb-5 text-sm text-toned md:px-8">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
