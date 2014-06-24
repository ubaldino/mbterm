

void setup() {
  Serial.begin( 9600 );
  Serial1.begin( 9600 );
}


void loop() {

  if(  Serial.available() ){
      
      Serial.println( " -- "+char( Serial.read() ) );
  }
  delay( 10 );
}