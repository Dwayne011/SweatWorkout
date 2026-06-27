package com.projectpb.workouts;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the local native workout-timer plugin before the bridge loads.
        registerPlugin(WorkoutTimerPlugin.class);
        super.onCreate(savedInstanceState);

        // Remove the WebView's native scroll indicators (the CSS already hides
        // the ::-webkit-scrollbar, but Android draws its own overlay scrollbar).
        try {
            WebView wv = getBridge().getWebView();
            if (wv != null) {
                wv.setVerticalScrollBarEnabled(false);
                wv.setHorizontalScrollBarEnabled(false);
                wv.setOverScrollMode(View.OVER_SCROLL_NEVER);
            }
        } catch (Exception ignored) {}
    }
}
