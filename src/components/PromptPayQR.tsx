"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { promptPayPayload } from "@/lib/promptpay";
import { formatBaht } from "@/lib/utils";

export function PromptPayQR({
  target,
  amount,
  size = 180,
  showMeta = true,
}: {
  target: string;
  amount?: number;
  size?: number;
  showMeta?: boolean;
}) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    const payload = promptPayPayload(target, amount);
    QRCode.toDataURL(payload, { margin: 1, width: size * 2, errorCorrectionLevel: "M" })
      .then((u) => active && setUrl(u))
      .catch(() => active && setUrl(""));
    return () => {
      active = false;
    };
  }, [target, amount, size]);

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-neutral-100">
        <div className="mb-1.5 flex items-center justify-center gap-1.5">
          <span className="rounded bg-[#003D6A] px-1.5 py-0.5 text-[10px] font-bold text-white">PromptPay</span>
        </div>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} width={size} height={size} alt="PromptPay QR" style={{ width: size, height: size }} />
        ) : (
          <div style={{ width: size, height: size }} className="animate-pulse rounded-lg bg-neutral-100" />
        )}
      </div>
      {showMeta && (
        <div className="mt-2 text-center">
          {amount != null && amount > 0 && <p className="text-lg font-extrabold text-brand-700">฿{formatBaht(amount, true)}</p>}
          <p className="text-xs text-neutral-400">พร้อมเพย์: {target}</p>
        </div>
      )}
    </div>
  );
}
