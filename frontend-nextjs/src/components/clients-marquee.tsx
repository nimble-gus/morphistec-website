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
  ];

  const items = [...logos, ...logos];

  return (
    <div className="relative border-y border-ok-line py-7 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-40 z-[2] bg-gradient-to-r from-ok-black to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-40 z-[2] bg-gradient-to-l from-ok-black to-transparent" />

      <div className="flex items-center gap-14 animate-marquee whitespace-nowrap w-max">
        {items.map((src, i) => (
          <div key={`${src}-${i}`} className="relative h-10 w-[140px] shrink-0 opacity-90">
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
