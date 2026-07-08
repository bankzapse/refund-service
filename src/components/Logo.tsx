import { cn } from "@/lib/utils";

/**
 * โลโก้ ถุงเขียว — อักษรย่อ "TK" (Thung Khiao) สีขาวบนสี่เหลี่ยมมนสีเขียว
 * ใช้เรขาคณิต (ไม่พึ่งฟอนต์) เพื่อให้ render ได้ทั้งเว็บและ native (icon/splash)
 */
export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="ถุงเขียว (TK)"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tk-grad" x1="8" y1="6" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22c55e" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#tk-grad)" />
      {/* TK monogram */}
      <g fill="#ffffff">
        {/* T */}
        <rect x="8" y="15" width="15" height="4" rx="1.2" />
        <rect x="13.5" y="15" width="4" height="18" rx="1.2" />
        {/* K */}
        <rect x="25" y="15" width="4" height="18" rx="1.2" />
      </g>
      <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M29 24 L37.5 15.5" />
        <path d="M29 24 L37.5 33" />
      </g>
    </svg>
  );
}

/** โลโก้ + ชื่อแบรนด์ ถุงเขียว */
export function LogoWordmark({
  size = 32,
  className,
  subtitle,
}: {
  size?: number;
  className?: string;
  subtitle?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Logo size={size} />
      <span className="leading-none">
        <span className="block text-lg font-extrabold tracking-tight text-neutral-900">
          ถุง<span className="text-brand-600">เขียว</span>
        </span>
        {subtitle && <span className="block text-[11px] font-medium text-neutral-400">{subtitle}</span>}
      </span>
    </span>
  );
}
