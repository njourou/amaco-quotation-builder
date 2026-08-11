"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";

const PRODUCTS = [
  {
    id: "motor-private",
    name: "Motor Private",
    description:
      "Comprehensive or third party cover for private motor vehicles.",
    image: "/products/motor.png",
    href: "/quote/motor-private",
    learnMore: "https://www.amaco.co.ke/",
    tag: "Most popular",
    category: "Motor",
  },
  {
    id: "motor-commercial",
    name: "Motor Commercial",
    description:
      "Own goods or general cartage cover for commercial vehicles.",
    image: "/products/motor.png",
    href: "/quote/motor-commercial",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Motor",
  },
  {
    id: "iar",
    name: "Industrial All Risks",
    description:
      "Material damage and business interruption for industrial risks.",
    image: "/products/travel.jpg",
    href: "/quote/iar",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Property",
  },
  {
    id: "fire",
    name: "Fire & Perils",
    description:
      "Fire and allied perils on buildings, stock and fixtures.",
    image: "/products/personal-accident.jpeg",
    href: "/quote/fire",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Property",
  },
  {
    id: "fire-conloss",
    name: "Fire Consequential Loss",
    description:
      "Gross profit and increased cost of working after fire.",
    image: "/products/travel.jpg",
    href: "/quote/fire-conloss",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Property",
  },
  {
    id: "domestic-package",
    name: "Domestic Package",
    description:
      "Home buildings, contents, and liability cover in one package.",
    image: "/products/personal-accident.jpeg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Home",
  },
  {
    id: "burglary",
    name: "Burglary",
    description:
      "Protection against loss or damage from theft and burglary.",
    image: "/products/travel.jpg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Property",
  },
  {
    id: "marine-cargo",
    name: "Marine Cargo",
    description:
      "Cover for goods in transit by sea, air, or road.",
    image: "/products/travel.jpg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Marine",
  },
  {
    id: "goods-in-transit",
    name: "Goods in Transit",
    description:
      "Protection for goods while being transported inland.",
    image: "/products/motor.png",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Marine",
  },
  {
    id: "gpa",
    name: "Group Personal Accident",
    description:
      "Financial protection for groups against accidental injury or death.",
    image: "/products/personal-accident.jpeg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Accident",
  },
  {
    id: "wiba",
    name: "Work Injury Benefits (WIBA)",
    description:
      "Statutory cover for employees under the Work Injury Benefits Act.",
    image: "/products/personal-accident.jpeg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Liability",
  },
  {
    id: "public-liability",
    name: "Public Liability",
    description:
      "Cover for legal liability arising from injury or property damage to third parties.",
    image: "/products/travel.jpg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Liability",
  },
  {
    id: "professional-indemnity",
    name: "Professional Indemnity",
    description:
      "Protection against claims of professional negligence.",
    image: "/products/personal-accident.jpeg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Liability",
  },
  {
    id: "contractors-all-risks",
    name: "Contractors All Risks",
    description:
      "Cover for contract works, materials, and construction liabilities.",
    image: "/products/motor.png",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Engineering",
  },
  {
    id: "money",
    name: "Money Insurance",
    description:
      "Cover for cash, cheques and money in transit or on premises.",
    image: "/products/travel.jpg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Financial",
  },
  {
    id: "fidelity-guarantee",
    name: "Fidelity Guarantee",
    description:
      "Protection against employee fraud or dishonest acts.",
    image: "/products/personal-accident.jpeg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Financial",
  },
  {
    id: "electronic-equipment",
    name: "Electronic Equipment",
    description:
      "Cover for computers and electronic equipment against sudden damage.",
    image: "/products/travel.jpg",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Engineering",
  },
  {
    id: "bonds",
    name: "Bonds / Bid Bond",
    description:
      "Tender security and performance bonds for contracting and procurement.",
    image: "/products/motor.png",
    href: "/quotation/new",
    learnMore: "https://www.amaco.co.ke/",
    tag: null,
    category: "Financial",
  },
] as const;

export function HomePage() {
  return (
    <div className="flex-1">
      <section className="border-b border-border/60 bg-card px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              AMACO Quotation
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Insurance made simple, quoted online.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Choose a class to start a quotation — motor, fire, industrial
              risks, liability, marine and more.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-14">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            Insurance classes
          </h2>
        </div>
        <p className="mb-8 text-sm text-muted-foreground">
          Select a class for an instant quote, or learn more on the main AMACO
          website.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.04 * i, 0.4), duration: 0.3 }}
            >
              <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-shadow hover:shadow-md">
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-card/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    {product.category}
                  </span>
                  {product.tag ? (
                    <span className="absolute right-3 top-3 rounded-md bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {product.tag}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={product.href}
                      className="inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Get a Quote
                    </Link>
                    <Link
                      href={product.learnMore}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary"
                    >
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 bg-muted/40 px-4 py-10 sm:px-8">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-4">
          {[
            ["Regulated by IRA", "Licensed insurer in Kenya"],
            ["Excel-based rates", "Aligned to Master Quotation Template"],
            ["Instant quotes", "Premium breakdowns in real time"],
            ["Here to help", "Support every step of the way"],
          ].map(([title, desc]) => (
            <div key={title} className="text-center">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
