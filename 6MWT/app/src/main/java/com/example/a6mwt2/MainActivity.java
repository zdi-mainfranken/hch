package com.example.a6mwt2;

import static android.view.View.INVISIBLE;
import static android.view.View.VISIBLE;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.icu.text.DecimalFormat;
import android.icu.text.NumberFormat;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.util.Timer;
import android.widget.Toast;


import com.google.android.material.bottomnavigation.BottomNavigationView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.example.a6mwt2.databinding.ActivityMainBinding;


public class MainActivity extends AppCompatActivity {
    private SensorManager sensorManager;
    private Sensor sensor;
    private int count;

    private ActivityMainBinding binding;
    private Button myButton;
    private TextView counter;
    private TextView turner;
    private long tempNum = 0L;


    private float[] roationMatrix = new float[9];
    float[] accelerometerReading = new float[3];
    float[] magneotometerReading = new float[3];
    float[] orientationalAngles = new float[3];
    private double start;




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        BottomNavigationView navView = findViewById(R.id.nav_view);
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                R.id.navigation_home, R.id.navigation_dashboard, R.id.navigation_notifications)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_activity_main);
        NavigationUI.setupActionBarWithNavController(this, navController, appBarConfiguration);
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        sensor = sensorManager.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);

        myButton = findViewById(R.id.button);
        counter = findViewById(R.id.textView2);
        turner = findViewById(R.id.textView4);
        Sensor accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        Sensor magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);

        sensorManager.registerListener(sensorEventListener, accelerometer, SensorManager.SENSOR_DELAY_GAME);
        sensorManager.registerListener(sensorEventListener, magnetometer, SensorManager.SENSOR_DELAY_GAME);

        myButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                myButton.setVisibility(INVISIBLE);
                counter.setVisibility(VISIBLE);
                turner.setVisibility(VISIBLE);
                SensorManager.getRotationMatrix(roationMatrix, null, accelerometerReading, magneotometerReading );
                SensorManager.getOrientation(roationMatrix, orientationalAngles);
                //isTurned(sensorManager, sensor);
                new CountDownTimer(5000,1000){
                    public void onTick(long millisUntilFinished) {
                        // Used for formatting digit to be in 2 digits only
                        NumberFormat f = new DecimalFormat("00");
                        long hour = (millisUntilFinished / 3600000) % 24;
                        long min = (millisUntilFinished / 60000) % 60;
                        long sec = (millisUntilFinished / 1000) % 60;
                        counter.setText(f.format(hour) + ":" + f.format(min) + ":" + f.format(sec));


                    }
                    // When the task is over it will print 00:00:00 there
                    public void onFinish() {
                        counter.setText("00:00:00");
                        SensorManager.getRotationMatrix(roationMatrix,null , accelerometerReading, magneotometerReading);
                        SensorManager.getOrientation(roationMatrix, orientationalAngles );
                        start = Math.toDegrees(orientationalAngles[0]);
                        new CountDownTimer(360000,1000){
                            public void onTick(long millisUntilFinished) {
                                // Used for formatting digit to be in 2 digits only
                                NumberFormat f = new DecimalFormat("00");
                                long hour = (millisUntilFinished / 3600000) % 24;
                                long min = (millisUntilFinished / 60000) % 60;
                                long sec = (millisUntilFinished / 1000) % 60;
                                counter.setText(f.format(hour) + ":" + f.format(min) + ":" + f.format(sec));
                                if(tempNum == sec ){

                                }
                                else {
                                    isTurned(sensorManager,sensor);
                                    tempNum= sec;
                                }

                            }
                            // When the task is over it will print 00:00:00 there
                            public void onFinish() {
                                counter.setText("00:00:00");

                            }
                        }.start();
                    }

                }.start();
            }

        });


    }


    private final SensorEventListener sensorEventListener = new SensorEventListener() {
        @Override
        public void onSensorChanged(SensorEvent event) {
            if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
                System.arraycopy(event.values, 0, accelerometerReading, 0, event.values.length);
            } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
                System.arraycopy(event.values, 0, magneotometerReading, 0, event.values.length);
            }

        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {
        }
    };
    private void isTurned(SensorManager sm, Sensor s){
        SensorManager.getRotationMatrix(roationMatrix,null , accelerometerReading, magneotometerReading);
        SensorManager.getOrientation(roationMatrix, orientationalAngles );
        double actual = Math.abs(start -Math.toDegrees(orientationalAngles[0]));
        if (actual > 120 && actual<240) {
            count++;
            start = start+180;
            if(start>180) start = start -360;
        }
        turner.setText( "" + count);


    }

}