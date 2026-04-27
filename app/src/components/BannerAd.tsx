import { useEffect, useRef } from "react";

// ⚠️ 출시 전 반드시 변경:
// IS_AD_PRODUCTION=true 로 변경
// PROD_BANNER_ID에 콘솔에서 발급받은 실제 광고 ID 입력
const IS_AD_PRODUCTION = false;
const PROD_BANNER_ID = "ait.v2.live.PASTE_REAL_BANNER_ID_HERE";
const TEST_BANNER_ID = "ait.v2.dev.test_banner";

const BANNER_ID = IS_AD_PRODUCTION ? PROD_BANNER_ID : TEST_BANNER_ID;

export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      // 앱인토스 광고 SDK는 빌드 시 주입됨
      // @ts-ignore
      if (typeof window !== "undefined" && window.AppsInToss?.showBannerAd) {
        // @ts-ignore
        window.AppsInToss.showBannerAd({
          adUnitId: BANNER_ID,
          element: ref.current,
        });
      }
    } catch (err) {
      console.warn("[BannerAd] 광고 표시 실패:", err);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="my-3 w-full min-h-[60px] flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-400"
    >
      {!IS_AD_PRODUCTION && "광고 영역 (개발 모드)"}
    </div>
  );
}
