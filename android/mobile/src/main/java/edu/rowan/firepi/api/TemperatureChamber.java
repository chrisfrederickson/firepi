package edu.rowan.firepi.api;

import retrofit.Call;
import retrofit.http.Field;
import retrofit.http.FormUrlEncoded;
import retrofit.http.GET;
import retrofit.http.POST;
import retrofit.http.PUT;

/**
 * Created by Nick Felker on 12/14/2015.
 */
public interface TemperatureChamber {
    @FormUrlEncoded
    @GET("temp")
    Call<Temperature> getTemperature();

    @FormUrlEncoded
    @PUT("temp")
    Call<TemperatureResponse> setTemperature(@Field("newTemp") int newTemp);

}
