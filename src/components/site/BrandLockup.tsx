import Image from "next/image";

interface BrandLockupProps {
  iconSize?: number;
  priority?: boolean;
}

export default function BrandLockup({ iconSize = 40, priority = false }: BrandLockupProps) {
  const titleClass = iconSize >= 44 ? "text-xl" : "text-lg";

  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/brand/app-icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-[22%] shadow-lg shadow-red-900/20"
        priority={priority}
      />
      <span className="min-w-0 leading-none">
        <span className={`block whitespace-nowrap ${titleClass} font-extrabold tracking-tight text-[#2B0B0E]`}>
          CORE<span className="text-red-800">CHAIN</span>
        </span>
        <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.24em] text-red-800">
          DIGITAL ASSET INVESTMENT
        </span>
      </span>
    </span>
  );
}
