"use client";

// Error boundary ระดับบนสุด — กันจอขาวเมื่อมี error ที่ไม่ถูกจับ
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#f6f7f6" }}>
          <div style={{ maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>😵‍💫</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "8px 0" }}>เกิดข้อผิดพลาด</h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้ง</p>
            <button
              onClick={reset}
              style={{ background: "#16a34a", color: "#fff", border: 0, borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
