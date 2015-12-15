package edu.rowan.firepi.api;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
/**
 * Created by Nick on 12/14/2015.
 */
public class TemperatureResponse {
    @SerializedName("response")
    @Expose
    private String response;

    /**
     *
     * @return
     * The response
     */
    public String getResponse() {
        return response;
    }

    /**
     *
     * @param response
     * The response
     */
    public void setResponse(String response) {
        this.response = response;
    }
}
