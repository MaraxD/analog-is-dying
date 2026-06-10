#include <AccelStepper.h>

// Define stepper pins
#define STEP_PIN 3      // Step pin
#define DIR_PIN 2       // Direction pin

// Microstepping control pins
#define MS1_PIN 7
// #define MS2_PIN 6

// // Steps per revolution for the motor
// const float stepsPerRevolution = 200;
// // Microstepping multiplier (1, 2, 4, 8, 16, or 32)
// int microstepSetting = 8;

// // AccelStepper instance in driver mode
// AccelStepper stepper(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);

// void setup() {
//   // Set microstepping pins as outputs
//   pinMode(MS1_PIN, OUTPUT);
//   pinMode(MS2_PIN, OUTPUT);

//   // Set microstepping mode (adjust as needed: HIGH or LOW)
//   digitalWrite(MS1_PIN, LOW);  // Set to LOW or HIGH for desired microstep setting
//   digitalWrite(MS2_PIN, LOW);  // Set to LOW or HIGH for desired microstep setting

//   // Set the desired RPM and the max RPM
//   float desiredRPM = 60; // Set the desired speed in rpm (revolutions per minute)
//   float MaxRPM = 120; // Set max speed in rpm (revolutions per minute)

//   // Calculate and set the desired and max speed in steps per second
//   float speedStepsPerSec = (microstepSetting * stepsPerRevolution*desiredRPM) / 60.0;
//   float Max_Speed_StepsPerSec = microstepSetting * stepsPerRevolution * MaxRPM / 60; // Specify max speed in steps/sec (converted from RPM)
//   stepper.setMaxSpeed(Max_Speed_StepsPerSec);
//   stepper.setSpeed(speedStepsPerSec);
// }

// void loop() {
//   // Run the motor at constant speed
  
//   stepper.runSpeed();
// }

#include <AccelStepper.h>
#include <MultiStepper.h>

int enablePin = 2;
int dirPin = 3;
int stepPin = 4;

// Microstepping control pins
int ms1Pin = 6;
int ms2Pin = 5;

// AccelStepper instance in driver mode
AccelStepper motor1(AccelStepper::DRIVER, stepPin, dirPin);

// Variables for managing state
int currentLevel = 0; // 0 = Sane AI (Chaotic motor), 3 = Crazy AI (Sane motor)
long targetPosition = 0;

void setup() {
  Serial.begin(9600); // Initialize Serial communication with the backend
  
  pinMode(ms1Pin, OUTPUT);
  pinMode(ms2Pin, OUTPUT);
  pinMode(enablePin, OUTPUT);
  
  // Set microstepping (HIGH, HIGH = 1/16 step for A4988)
  digitalWrite(ms1Pin, HIGH);
  digitalWrite(ms2Pin, HIGH);
  digitalWrite(enablePin, LOW); // LOW to enable the motor driver

  motor1.setMaxSpeed(2000);
  motor1.setAcceleration(2000);
}





void loop() {
  // Check for incoming serial data from the Python backend
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c >= '0' && c <= '3') {
      currentLevel = c - '0';
    }
  }

  // Motor behavior based on the current AI level
  if (currentLevel == 0) {
    // Level 0: AI is "good" -> Motor is highly chaotic (extremely fast, erratic, quick back-and-forth)
    // We max out the speed and acceleration so it instantly jerks
    motor1.setMaxSpeed(6000);
    motor1.setAcceleration(12000);
    
    // Pick a new random target whenever it reaches the destination
    if (motor1.distanceToGo() == 0) {
      // 50% chance of a sweeping jerk, 50% chance of a violent twitch
      if (random(0, 100) > 50) {
        targetPosition = random(-1500, 1500); // Medium-large wild sweep
      } else {
        targetPosition = random(-300, 300);   // Sharp violent twitch
      }
      motor1.moveTo(targetPosition);
    }
    motor1.run();
  } 
  else if (currentLevel == 1) {
    // Level 1: AI is starting to break -> Motor becomes slightly more regular but still fast
    motor1.setMaxSpeed(2000);
    motor1.setAcceleration(3000);
    
    if (motor1.distanceToGo() == 0) {
      // Wider, slightly slower sweeps
      targetPosition = random(-2000, 2000);
      motor1.moveTo(targetPosition);
    }
    motor1.run();
  }
  else if (currentLevel == 2) {
    // Level 2: AI is getting deranged -> Motor becomes predictable but still has some stop-and-go
    motor1.setMaxSpeed(1000);
    motor1.setAcceleration(1000);
    
    if (motor1.distanceToGo() == 0) {
      // Toggle back and forth predictably
      targetPosition = (targetPosition > 0) ? -3000 : 3000;
      motor1.moveTo(targetPosition);
    }
    motor1.run();
  }
  else if (currentLevel == 3) {
    // Level 3: AI is completely crazy -> Motor is perfectly sane (fast, continuous, steady rotation)
    // No acceleration curves, just infinite smooth spinning
    motor1.setMaxSpeed(1000);
    motor1.setSpeed(1000);
    motor1.runSpeed(); 
  }
}
