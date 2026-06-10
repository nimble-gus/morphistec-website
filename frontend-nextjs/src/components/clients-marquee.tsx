"use client";

import Image from "next/image";

export function ClientsMarquee() {
  const logos = [
    "/1.png",
    "/2.png",
    "/3.png",
    "/4.png",
    "/5.png",
    "/6.png",
    "/7.png",
    "/8.png",
  ];

  const items = [...logos, ...logos, ...logos];

  return (
    <div className="relative overflow-hidden border-y border-ok-line py-6 sm:py-7">
      <div className="absolute bottom-0 left-0 top-0 z-[2] w-16 bg-gradient-to-r from-ok-black to-transparent sm:w-40" />
      <div className="absolute bottom-0 right-0 top-0 z-[2] w-16 bg-gradient-to-l from-ok-black to-transparent sm:w-40" />

      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap sm:gap-14">
        {items.map((src, i) => (
          <div key={`${src}-${i}`} className="relative h-8 w-[108px] shrink-0 opacity-90 sm:h-10 sm:w-[140px]">
            <Image
              src={src}
              alt={`Cliente ${i % logos.length + 1}`}
              fill
              sizes="140px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
