// ⚠️ 출시 전 IS_AD_PRODUCTION=true, PROD_REWARDED_ID 실제 광고 ID로 변경
const IS_AD_PRODUCTION = false;
const PROD_REWARDED_ID = "ait.v2.live.PASTE_REAL_REWARDED_ID_HERE";
const TEST_REWARDED_ID = "ait.v2.dev.test_rewarded";

const REWARDED_ID = IS_AD_PRODUCTION ? PROD_REWARDED_ID : TEST_REWARDED_ID;

/**
 * 리워드 광고 표시
 * @returns 광고를 끝까지 시청하면 true, 도중 닫거나 에러나면 false
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && window.AppsInToss?.showRewardedAd) {
        // @ts-ignore
        window.AppsInToss.showRewardedAd({
          adUnitId: REWARDED_ID,
          onReward: () => resolve(true),
          onClose: () => resolve(false),
          onError: () => resolve(false),
        });
      } else {
        // 개발 모드: 즉시 보상
        if (!IS_AD_PRODUCTION) {
          console.info("[RewardedAd] 개발 모드 — 즉시 보상");
          resolve(true);
        } else {
          resolve(false);
        }
      }
    } catch (err) {
      console.warn("[RewardedAd] 광고 표시 실패:", err);
      resolve(false);
    }
  });
}
