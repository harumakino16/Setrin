// X広告のイベントトラッキング用ユーティリティ
export const trackTwitterEvent = (eventId, parameters = {}) => {
  if (window.twq) {
    twq('event', eventId, parameters);
  }
};

// 主要なイベントID
export const TWITTER_EVENTS = {
  SIGN_UP: 'tw-p2lun-signup',
  PREMIUM_VIEW: 'tw-p2lun-premium_view',
  PREMIUM_CLICK: 'tw-p2lun-premium_click',
  PREMIUM_CONVERSION: 'tw-p2lun-conversion',
  FEATURE_USE: 'tw-p2lun-feature_use'
}; 