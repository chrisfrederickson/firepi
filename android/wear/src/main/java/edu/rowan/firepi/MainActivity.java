package edu.rowan.firepi;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.support.wearable.view.WatchViewStub;
import android.view.Window;
import android.view.WindowManager;
import android.widget.NumberPicker;
import android.widget.TextView;

public class MainActivity extends Activity {
    private SettingsManager sm;
    private boolean running;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ((NumberPicker) findViewById(R.id.numberPicker)).setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
                sm = new SettingsManager(MainActivity.this);
                sm.setInt(R.string.TARGET_TEMP, newVal);
                sm.pushData();
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        running = true;
        looper.sendEmptyMessage(0);
    }

    @Override
    public void onStop() {
        super.onStop();
        running = false;
    }

    Handler looper = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            ((NumberPicker) findViewById(R.id.numberPicker)).setValue(sm.getInt(R.string.TARGET_TEMP));
            updateTemperature(sm.getInt(R.string.CURRENT_TEMP));
            if(running)
                sendEmptyMessageDelayed(0, 1000);
        }
    };

    public void updateTemperature(double t) {
        ((TextView) findViewById(R.id.textView)).setText(getString(R.string.current_temperature, t));
        //Colors!
        if(t < 25) { //Base temperature
            findViewById(R.id.box).setBackgroundColor(getResources().getColor(R.color.md_blue_400));
        } else {
            findViewById(R.id.box).setBackgroundColor(getResources().getColor(R.color.md_red_400));
        }
    }
}
