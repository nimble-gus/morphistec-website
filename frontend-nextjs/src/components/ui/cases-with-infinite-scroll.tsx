"use client";

/**
 * Cases with Infinite Scroll — @tommyjepsen / twblocks
 * https://21st.dev/@tommyjepsen/components/cases-with-infinite-scroll
 * Adapted for Oktae (logos + copy + brand tokens).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useLang } from "@/components/lang";

const LOGOS = [
  { src: "/1.png", name: "Antigua Hotel & Tours" },
  { src: "/2.png", name: "Nimblot" },
  { src: "/3.png", name: "Topcell" },
  { src: "/4.png", name: "Metal y Concreto" },
  { src: "/5.png", name: "Ultimate Capital Group" },
  { src: "/6.png", name: "Vyrex" },
  { src: "/7.png", name: "Cliente" },
  { src: "/8.png", name: "Cliente" },
  { src: "/11.png", name: "Zacsa" },
  { src: "/12.png", name: "Altus" },
] as const;

export function Case() {
  const { t } = useLang();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const id = window.setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent((c) => c + 1);
      }
    }, 3000);

    return () => window.clearTimeout(id);
  }, [api, current]);

  return (
    <div className="w-full py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 md:px-10">
        <div className="flex flex-col gap-10">
          <h2 className="max-w-xl text-left text-2xl font-medium tracking-tight text-ok-text sm:text-3xl md:text-4xl lg:max-w-2xl lg:text-5xl">
            {t.clients_title}
          </h2>
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{ align: "start", loop: false }}
          >
            <CarouselContent>
              {LOGOS.map((logo, index) => (
                <CarouselItem
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                  key={`${logo.src}-${index}`}
                >
                  <div className="flex aspect-square items-center justify-center rounded-md bg-white/[0.04] p-5 sm:p-6">
                    <div className="relative h-full w-full opacity-90">
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        fill
                        sizes="(max-width: 768px) 40vw, 160px"
                        className="object-contain object-center"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
