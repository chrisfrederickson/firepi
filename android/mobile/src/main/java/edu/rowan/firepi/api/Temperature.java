package edu.rowan.firepi.api;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
/**
 * Created by Nick on 12/14/2015.
 */
public class Temperature {
    @SerializedName("temp")
    @Expose
    private double temp;

    /**
     *
     * @return
     * The response
     */
    public double getTemp() {
        return temp;
    }

    /**
     *
     * @param temp
     * The response
     */
    public void setTemperature(double temp) {
        this.temp = temp;
    }
}
