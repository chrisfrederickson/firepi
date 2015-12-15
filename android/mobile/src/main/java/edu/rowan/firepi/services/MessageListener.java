package edu.rowan.firepi.services;

import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.wearable.WearableListenerService;

import edu.rowan.firepi.MainActivity;
import edu.rowan.firepi.R;
import edu.rowan.firepi.SettingsManager;
import edu.rowan.firepi.api.TemperatureChamber;
import edu.rowan.firepi.api.TemperatureResponse;
import retrofit.Callback;
import retrofit.GsonConverterFactory;
import retrofit.Response;
import retrofit.Retrofit;

/**
 * Created by guest1 on 12/14/2015.
 */
public class MessageListener extends WearableListenerService {
    @Override
    public void onMessageReceived(MessageEvent messageEvent) {

    }

    @Override
    public void onDataChanged(DataEventBuffer dataEvents) {
        SettingsManager sm = new SettingsManager(getApplicationContext());
        sm.pullData(dataEvents);

        Retrofit client = new Retrofit.Builder()
                .baseUrl(MainActivity.BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        TemperatureChamber temperatureChamber = client.create(TemperatureChamber.class);
        temperatureChamber.setTemperature(sm.getInt(R.string.TARGET_TEMP)).enqueue(new Callback<TemperatureResponse>() {
            @Override
            public void onResponse(Response<TemperatureResponse> response, Retrofit retrofit) {

            }

            @Override
            public void onFailure(Throwable t) {

            }
        });
    }
}