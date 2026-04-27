// ⚠️ 출시 전 IS_AD_PRODUCTION=true, PROD_INTERSTITIAL_ID 실제 광고 ID로 변경
const IS_AD_PRODUCTION = false;
const PROD_INTERSTITIAL_ID = "ait.v2.live.PASTE_REAL_INTERSTITIAL_ID_HERE";
const TEST_INTERSTITIAL_ID = "ait.v2.dev.test_interstitial";

const INTERSTITIAL_ID = IS_AD_PRODUCTION ? PROD_INTERSTITIAL_ID : TEST_INTERSTITIAL_ID;

export function showInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && window.AppsInToss?.showInterstitialAd) {
        // @ts-ignore
        window.AppsInToss.showInterstitialAd({
          adUnitId: INTERSTITIAL_ID,
          onClose: () => resolve(),
          onError: () => resolve(),
        });
      } else {
        resolve();
      }
    } catch (err) {
      console.warn("[InterstitialAd] 광고 표시 실패:", err);
      resolve();
    }
  });
}
