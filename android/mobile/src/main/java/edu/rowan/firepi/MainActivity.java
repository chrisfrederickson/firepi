package edu.rowan.firepi;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.view.Window;
import android.view.WindowManager;
import android.widget.NumberPicker;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.wearable.Wearable;

import java.util.Set;

import edu.rowan.firepi.api.Temperature;
import edu.rowan.firepi.api.TemperatureChamber;
import edu.rowan.firepi.api.TemperatureResponse;
import retrofit.Callback;
import retrofit.GsonConverterFactory;
import retrofit.Response;
import retrofit.Retrofit;

public class MainActivity extends AppCompatActivity implements GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {
    private TemperatureChamber temperatureChamber;
    public static final String BASE_URL = "127.0.0.1/api/v1";
    private boolean running = true;
    private SettingsManager sm;
    private GoogleApiClient mGoogleApiClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Retrofit client = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        temperatureChamber = client.create(TemperatureChamber.class);
        sm = new SettingsManager(MainActivity.this);

        NumberPicker np = (NumberPicker) findViewById(R.id.numberPicker);
        np.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, final int newVal) {
                temperatureChamber.setTemperature(newVal).enqueue(new Callback<TemperatureResponse>() {
                    @Override
                    public void onResponse(Response<TemperatureResponse> response, Retrofit retrofit) {
                        TemperatureResponse tr = response.body();
                        Toast.makeText(MainActivity.this, tr.getResponse(), Toast.LENGTH_SHORT).show();
                        sm.setInt(R.string.TARGET_TEMP, newVal);
                        sm.pushData();
                    }

                    @Override
                    public void onFailure(Throwable t) {

                    }
                });
            }
        });

        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addApiIfAvailable(Wearable.API)
                        // Optionally, add additional APIs and scopes if required.
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .build();
        mGoogleApiClient.connect();
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

            temperatureChamber.getTemperature().enqueue(new retrofit.Callback<Temperature>() {
                @Override
                public void onResponse(Response<Temperature> response, Retrofit retrofit) {
                    double temperature = response.body().getTemp();
                    ((TextView) findViewById(R.id.textView)).setText(getString(R.string.current_temperature, temperature));

                    //Colors!
                    if(temperature < 25) { //Base temperature
                        findViewById(R.id.relativeLayout).setBackgroundColor(getResources().getColor(R.color.md_blue_400));
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            Window window = getWindow();
                            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                            window.setStatusBarColor(getResources().getColor(R.color.md_blue_700));
                        }
                    } else {
                        findViewById(R.id.relativeLayout).setBackgroundColor(getResources().getColor(R.color.md_red_400));
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            Window window = getWindow();
                            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                            window.setStatusBarColor(getResources().getColor(R.color.md_red_700));
                        }
                    }
                    if(mGoogleApiClient.isConnected()) {
                        sm.setInt(R.string.CURRENT_TEMP, (int) temperature);
                        sm.pushData();
                    }
                }

                @Override
                public void onFailure(Throwable t) {

                }
            });
            if(running)
                sendEmptyMessageDelayed(0, 1000);
        }
    };

    @Override
    public void onConnected(Bundle bundle) {
        sm.setSyncableSettingsManager(mGoogleApiClient);
    }

    @Override
    public void onConnectionSuspended(int i) {

    }

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {

    }
}
