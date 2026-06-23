// #include <AccelStepper.h>

// // Define stepper pins
// #define STEP_PIN 3      // Step pin
// #define DIR_PIN 2       // Direction pin

// // Microstepping control pins
// #define MS1_PIN 7
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

// --- Motor 1 Pins ---
int enablePin1 = 2;
int dirPin1 = 5;
int stepPin1 = 4;
int ms1Pin1 = 6;
int ms2Pin1 = 3;

// --- Motor 2 Pins ---
int enablePin2 = 8;
int dirPin2 = 9;
int stepPin2 = 10;
int ms1Pin2 = 11;
int ms2Pin2 = 12;

// AccelStepper instances in driver mode
AccelStepper motor1(AccelStepper::DRIVER, stepPin1, dirPin1);
AccelStepper motor2(AccelStepper::DRIVER, stepPin2, dirPin2);

// Variables for managing state
int currentLevel = 0; // 0 = Sane AI (Chaotic motor), 3 = Crazy AI (Sane motor)
long targetPosition1 = 0;
long targetPosition2 = 0;

void setup() {
  Serial.begin(9600); // Initialize Serial communication with the backend
  
  // Setup Motor 1
  pinMode(ms1Pin1, OUTPUT);
  pinMode(ms2Pin1, OUTPUT);
  pinMode(enablePin1, OUTPUT);
  
  digitalWrite(ms1Pin1, HIGH);
  digitalWrite(ms2Pin1, HIGH);
  digitalWrite(enablePin1, LOW); // LOW to enable

  // Setup Motor 2
  pinMode(ms1Pin2, OUTPUT);
  pinMode(ms2Pin2, OUTPUT);
  pinMode(enablePin2, OUTPUT);
  
  digitalWrite(ms1Pin2, HIGH);
  digitalWrite(ms2Pin2, HIGH);
  digitalWrite(enablePin2, LOW); // LOW to enable

  // Configure initial speed and acceleration
  motor1.setMaxSpeed(2000);
  motor1.setAcceleration(2000);
  
  motor2.setMaxSpeed(2000);
  motor2.setAcceleration(2000);
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
    motor1.setMaxSpeed(6000);
    motor1.setAcceleration(12000);
    motor2.setMaxSpeed(6000);
    motor2.setAcceleration(12000);
    
    if (motor1.distanceToGo() == 0) {
      if (random(0, 100) > 50) { targetPosition1 = random(-1500, 1500); } 
      else { targetPosition1 = random(-300, 300); }
      motor1.moveTo(targetPosition1);
    }
    
    if (motor2.distanceToGo() == 0) {
      if (random(0, 100) > 50) { targetPosition2 = random(-1500, 1500); } 
      else { targetPosition2 = random(-300, 300); }
      motor2.moveTo(targetPosition2);
    }
    
    motor1.run();
    motor2.run();
  } 
  else if (currentLevel == 1) {
    // Level 1: AI is starting to break -> Motor becomes slightly more regular but still fast
    motor1.setMaxSpeed(2000);
    motor1.setAcceleration(3000);
    motor2.setMaxSpeed(2000);
    motor2.setAcceleration(3000);
    
    if (motor1.distanceToGo() == 0) {
      targetPosition1 = random(-2000, 2000);
      motor1.moveTo(targetPosition1);
    }
    
    if (motor2.distanceToGo() == 0) {
      targetPosition2 = random(-2000, 2000);
      motor2.moveTo(targetPosition2);
    }
    
    motor1.run();
    motor2.run();
  }
  else if (currentLevel == 2) {
    // Level 2: AI is getting deranged -> Motor becomes predictable but still has some stop-and-go
    motor1.setMaxSpeed(1000);
    motor1.setAcceleration(1000);
    motor2.setMaxSpeed(1000);
    motor2.setAcceleration(1000);
    
    if (motor1.distanceToGo() == 0) {
      targetPosition1 = (targetPosition1 > 0) ? -3000 : 3000;
      motor1.moveTo(targetPosition1);
    }
    
    if (motor2.distanceToGo() == 0) {
      targetPosition2 = (targetPosition2 > 0) ? -3000 : 3000;
      motor2.moveTo(targetPosition2);
    }
    
    motor1.run();
    motor2.run();
  }
  else if (currentLevel == 3) {
    // Level 3: AI is completely crazy -> Motor is perfectly sane (fast, continuous, steady rotation)
    motor1.setMaxSpeed(1000);
    motor1.setSpeed(1000);
    motor2.setMaxSpeed(1000);
    motor2.setSpeed(1000);
    
    motor1.runSpeed(); 
    motor2.runSpeed(); 
  }
}
