import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useHaptics = () => {
  const triggerHaptic = async () => {
    const platform = Capacitor.getPlatform();
    if (platform !== 'ios') {
      for (let i = 0; i < 3; i++) {
        await Haptics.vibrate({ duration: 15 });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  const triggerRefreshHaptic = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
  };

  const triggerErrorHaptic = async () => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      await Haptics.vibrate({ duration: 300 });
    } else {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  };

  const triggerArticleLoadHaptic = async () => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      for (let i = 0; i < 3; i++) {
        await Haptics.vibrate({ duration: 15 });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } else {
      // iOS doesn't support custom vibration patterns, so we'll use a light impact.
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  return { triggerHaptic, triggerRefreshHaptic, triggerErrorHaptic, triggerArticleLoadHaptic };
};
