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

// --- RAMPS 1.4 Motor 1 (X-Axis) - "Writing Hand" ---
const int enablePin1 = 38;
const int dirPin1 = 55;
const int stepPin1 = 54;

// --- RAMPS 1.4 Motor 2 (Y-Axis) - "Tapping Hand" ---
const int enablePin2 = 56;
const int dirPin2 = 61;
const int stepPin2 = 60;

// --- RAMPS 1.4 Motor 3 (Z-Axis) ---
const int enablePin3 = 62;
const int dirPin3 = 48;
const int stepPin3 = 46;

// --- RAMPS 1.4 Motor 4 (E0-Axis) ---
const int enablePin4 = 24;
const int dirPin4 = 28;
const int stepPin4 = 26;

// AccelStepper instances in driver mode
AccelStepper motor1(AccelStepper::DRIVER, stepPin1, dirPin1);
AccelStepper motor2(AccelStepper::DRIVER, stepPin2, dirPin2);
AccelStepper motor3(AccelStepper::DRIVER, stepPin3, dirPin3);
AccelStepper motor4(AccelStepper::DRIVER, stepPin4, dirPin4);

// Variables for managing state
int currentLevel = 0; // 0 = Sane AI (Chaotic motor), 3 = Crazy AI (Sane motor)
long targetPosition1 = 0;
long targetPosition2 = 0;
long targetPosition3 = 0;
long targetPosition4 = 0;

// Alternating logic variables for Hands 1 and 2
int activeHand = 1; // 1 = Writing (Motor 1), 2 = Tapping (Motor 2)
unsigned long handSwitchTime = 0;
const unsigned long HAND_DURATION = 7000; // Each hand acts for 3 seconds before switching

void setup() {
  Serial.begin(9600); // Initialize Serial communication with the backend
  
  // Enable pins setup
  pinMode(enablePin1, OUTPUT);
  pinMode(enablePin2, OUTPUT);
  pinMode(enablePin3, OUTPUT);
  pinMode(enablePin4, OUTPUT);
  
  // LOW enables the drivers on RAMPS boards
  digitalWrite(enablePin1, LOW); 
  digitalWrite(enablePin2, LOW); 
  digitalWrite(enablePin3, LOW); 
  digitalWrite(enablePin4, LOW); 

  // Configure initial speed and acceleration
  configureMotors(2000, 2000);
}

void configureMotors(float maxSpeed, float acceleration) {
  motor1.setMaxSpeed(maxSpeed);
  motor1.setAcceleration(acceleration);
  motor2.setMaxSpeed(maxSpeed);
  motor2.setAcceleration(acceleration);
  motor3.setMaxSpeed(maxSpeed);
  motor3.setAcceleration(acceleration);
  motor4.setMaxSpeed(maxSpeed);
  motor4.setAcceleration(acceleration);
}

void setConstantSpeed(float speed) {
  motor1.setMaxSpeed(speed);
  motor1.setSpeed(speed);
  motor2.setMaxSpeed(speed);
  motor2.setSpeed(speed);
  motor3.setMaxSpeed(speed);
  motor3.setSpeed(speed);
  motor4.setMaxSpeed(speed);
  motor4.setSpeed(speed);
}

void runConstantSpeed() {
  motor1.runSpeed();
  motor2.runSpeed();
  motor3.runSpeed();
  motor4.runSpeed();
}

void runWithAcceleration() {
  motor1.run();
  motor2.run();
  motor3.run();
  motor4.run();
}

long getRandomChaoticTarget() {
  if (random(0, 100) > 50) {
    return random(-1500, 1500); // Medium-large wild sweep
  } else {
    return random(-300, 300);   // Sharp violent twitch
  }
}

void loop() {
  // Check for incoming serial data from the Python backend
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c >= '0' && c <= '3') {
      currentLevel = c - '0';
    }
  }

  // Handle alternating timer ONLY during Level 3
  if (currentLevel == 3) {
    if (millis() - handSwitchTime > HAND_DURATION) {
      handSwitchTime = millis();
      activeHand = (activeHand == 1) ? 2 : 1;
    }
  }

  // Motor behavior based on the current AI level
  if (currentLevel == 0) {
    // Level 0: AI is "good" -> Motors are highly chaotic (extremely fast, erratic, quick back-and-forth)
    motor1.setMaxSpeed(6000);
    motor1.setAcceleration(12000);
    motor2.setMaxSpeed(6000);
    motor2.setAcceleration(12000);
    motor3.setMaxSpeed(6000);
    motor3.setAcceleration(12000);
    motor4.setMaxSpeed(6000);
    motor4.setAcceleration(12000);
    
    // Motor 1 Logic
    if (motor1.distanceToGo() == 0) {
      if (random(0, 100) > 50) motor1.moveTo(random(-1500, 1500));
      else motor1.moveTo(random(-300, 300));
    }
    
    // Motor 2 Logic
    if (motor2.distanceToGo() == 0) {
      if (random(0, 100) > 50) motor2.moveTo(random(-1500, 1500));
      else motor2.moveTo(random(-300, 300));
    }
    
    // Motor 3 Logic
    if (motor3.distanceToGo() == 0) {
      if (random(0, 100) > 50) motor3.moveTo(random(-1500, 1500));
      else motor3.moveTo(random(-300, 300));
    }
    
    // Motor 4 Logic
    if (motor4.distanceToGo() == 0) {
      if (random(0, 100) > 50) motor4.moveTo(random(-1500, 1500));
      else motor4.moveTo(random(-300, 300));
    }

    motor1.run();
    motor2.run();
    motor3.run();
    motor4.run();
  } 
  else if (currentLevel == 1) {
    // Level 1: AI is "getting weird" -> Motors are slightly less chaotic
    motor1.setMaxSpeed(2000);
    motor1.setAcceleration(3000);
    motor2.setMaxSpeed(2000);
    motor2.setAcceleration(3000);
    motor3.setMaxSpeed(2000);
    motor3.setAcceleration(3000);
    motor4.setMaxSpeed(2000);
    motor4.setAcceleration(3000);
    
    if (motor1.distanceToGo() == 0) motor1.moveTo(random(-2000, 2000));
    if (motor2.distanceToGo() == 0) motor2.moveTo(random(-2000, 2000));
    if (motor3.distanceToGo() == 0) motor3.moveTo(random(-2000, 2000));
    if (motor4.distanceToGo() == 0) motor4.moveTo(random(-2000, 2000));

    motor1.run();
    motor2.run();
    motor3.run();
    motor4.run();
  }
  else if (currentLevel == 2) {
    // Level 2: AI is "deranged" -> Motors are predictable, moderate sweeps
    motor1.setMaxSpeed(1000);
    motor1.setAcceleration(2000);
    motor2.setMaxSpeed(1000);
    motor2.setAcceleration(2000);
    motor3.setMaxSpeed(1000);
    motor3.setAcceleration(2000);
    motor4.setMaxSpeed(1000);
    motor4.setAcceleration(2000);
    
    // Motor 1 Logic
    if (motor1.distanceToGo() == 0) {
      if (motor1.currentPosition() > 0) motor1.moveTo(-3000);
      else motor1.moveTo(3000);
    }
    
    // Motor 2 Logic
    if (motor2.distanceToGo() == 0) {
      if (motor2.currentPosition() > 0) motor2.moveTo(-3000);
      else motor2.moveTo(3000);
    }
    
    // Motor 3 Logic
    if (motor3.distanceToGo() == 0) {
      if (motor3.currentPosition() > 0) motor3.moveTo(-3000);
      else motor3.moveTo(3000);
    }
    
    // Motor 4 Logic
    if (motor4.distanceToGo() == 0) {
      if (motor4.currentPosition() > 0) motor4.moveTo(-3000);
      else motor4.moveTo(3000);
    }

    motor1.run();
    motor2.run();
    motor3.run();
    motor4.run();
  }
  else if (currentLevel == 3) {
    // Level 3: AI is completely crazy -> Motors are perfectly sane (endless smooth rotation)
    motor1.setMaxSpeed(1000);
    motor2.setMaxSpeed(1000);
    motor3.setMaxSpeed(1000);
    motor4.setMaxSpeed(1000);
    
    // setSpeed runs the motor at a constant velocity without acceleration/deceleration
    motor1.setSpeed(1000);
    motor2.setSpeed(1000);
    motor3.setSpeed(1000);
    motor4.setSpeed(1000);

    motor1.runSpeed();
    motor2.runSpeed();
    motor3.runSpeed();
    motor4.runSpeed();
  }
}
