/*
 * Teste simples do módulo Bluetooth HC-05 - Arduino Mega
 *
 * HC-05 usa 3.3V em RXD; o Mega usa 5V em TX. SEM divisor de tensão
 * na linha TX -> RXD você pode QUEIMAR o HC-05. Use o esquema abaixo.
 *
 * === CONEXOES (com resistores 1k e 2k para nivel 5V -> 3.3V) ===
 *
 *   Arduino Mega          Resistores              HC-05
 *   ------------          ----------              -----
 *   Pin 18 (TX1) ----+---- 1k ----+---- RXD       (recebe max 3.3V)
 *                    |             |
 *                    +---- 2k ---- GND
 *                    (o ponto entre 1k e 2k vai no RXD do HC-05;
 *                     5V * 2k/(1k+2k) = 3.33V)
 *
 *   Pin 19 (RX1) --------------------------- TXD  (3.3V do HC-05 -> Mega aceita)
 *   Pin 22 (digital) ----------------------- STATE
 *   Pin 24 (digital) ----------------------- EN/KEY
 *   5V ------------------------------------- VCC
 *   GND ------------------------------------ GND
 *
 * Resumo: 1k entre pin 18 e RXD do HC-05; 2k entre RXD do HC-05 e GND.
 *         TXD do HC-05 direto no pin 19 (sem resistor).
 *
 * 1. Envie este sketch para o Mega e abra o Monitor Serial (9600).
 * 2. No celular: Configurações > Bluetooth > procurar "HC-05".
 * 3. Use um app "Serial Bluetooth Terminal" para conectar; dados aparecem aqui.
 */

#define BT_EN_PIN   24   // EN/KEY do módulo: LOW = modo normal (visível), HIGH = modo AT (não visível)
#define BT_STATE_PIN 22  // STATE do módulo -> indica conexão (depende do módulo)

void setup() {
  Serial.begin(9600);

  pinMode(BT_EN_PIN, OUTPUT);
  digitalWrite(BT_EN_PIN, LOW);    // LOW = modo pareamento (visível no celular). Se não aparecer, tente HIGH.

  pinMode(BT_STATE_PIN, INPUT);    // STATE: alguns módulos colocam HIGH quando conectado

  Serial1.begin(9600);              // Mesma taxa que o módulo (geralmente 9600 padrão)

  Serial.println("=== Teste Bluetooth ===");
  Serial.println("EN=LOW (modo pareamento). Procure no celular por HC-05 ou HC-06.");
  Serial.println("Se nao aparecer, mude no codigo para EN=HIGH e teste de novo.");
  Serial.println("STATE pino 22 | Dados do celular aparecem abaixo.");
  Serial.println("------------------------");
}

void loop() {
  static unsigned long lastPrint = 0;
  unsigned long now = millis();

  // A cada 2 segundos mostra o estado do pino STATE
  if (now - lastPrint >= 2000) {
    lastPrint = now;
    int state = digitalRead(BT_STATE_PIN);
    Serial.print("[STATE pino 22 = ");
    Serial.print(state);
    Serial.println(state ? " = possivel conexao]" : " = aguardando]");
  }

  // Se o celular enviar algo pela Serial1, repete no Monitor Serial (USB)
  if (Serial1.available()) {
    Serial.print("BT recebido: ");
    while (Serial1.available()) {
      char c = Serial1.read();
      Serial.write(c);
    }
    Serial.println();
  }

  delay(50);
}
