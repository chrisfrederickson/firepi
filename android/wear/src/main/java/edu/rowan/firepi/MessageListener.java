package edu.rowan.firepi;

import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.WearableListenerService;

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
    }
}