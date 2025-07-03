package com.prepbit.app;

import android.os.Bundle;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.os.Build;
import android.content.Context;
import android.util.Log;
import android.view.HapticFeedbackConstants;
import android.view.View;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onResume() {
    super.onResume();
    // Ensures the WebView fits the system windows (useful for immersive mode on certain devices)
    this.getBridge().getWebView().setFitsSystemWindows(true);
  }

  // Method to trigger sharp haptic feedback using HapticFeedbackConstants
  public void triggerSharpHapticFeedback(View view) {
    // Use the system's built-in haptic feedback constants for UI interactions (like button presses)
    if (view != null) {
      view.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);  // For virtual key press feedback (Home, Back buttons, etc.)
      Log.d("HapticFeedback", "Sharp haptic feedback triggered using HapticFeedbackConstants");
    }
  }
}
