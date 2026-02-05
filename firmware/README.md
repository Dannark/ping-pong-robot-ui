# Ping Pong Robot – Firmware

Firmware do robô que dispara bolinhas de ping-pong. Controlado por display TFT/OLED 0.96", joystick e (opcionalmente) por app via Bluetooth HC-05.

---

## Hardware do robô

### Controlador e interface
- **Arduino Mega 2560** – controlador principal.
- **Display TFT/OLED 0.96"** (128×64) – I²C, endereço 0x3C (driver SSD1306). Menu e feedback visual.
- **Joystick analógico** – eixos X/Y (A8, A9) e botão (pino 52). Navegação e confirmação (short/long press).

### Motores e shield
- **Shield de motor** (compatível com AFMotor) – 4 canais DC.
- **4× motores DC 130**:
  - **M1, M2, M3** – lançador e efeito (spin). Posições angulares no disco: M1 = 12h (0°), M2 = 4h (120°), M3 = 8h (240°). Velocidade e diferença entre eles definem direção e intensidade do spin.
  - **M4** – alimentador (feeder): empurra as bolinhas para o tubo vertical que leva ao lançador.

### Motor M4 (feeder) – reduções
O M4 precisa de torque alto para empurrar as bolinhas por um longo percurso vertical com folga. Por isso usa várias reduções:

1. **Primeira redução** – caixa de redução amarela (tipo “carrinho”), **1:48**.
2. **Segundo conjunto** – em série no mesmo eixo: **1:3** e **1:4** (total 1:12 nesse estágio).

Redução total no eixo da “hélice” (disco com 3 furos): **1:48 × 1:3 × 1:4 = 1:576**. O disco gira devagar, com torque suficiente para alimentar o tubo vertical.

### Servos
- **Servo 1 (TILT)** – pino 10. Inclinação (cima/baixo).
- **Servo 2 (PAN)** – pino 9. Direção horizontal (esquerda/direita).

Limites (MIN/MID/MAX) configuráveis na tela Settings e gravados em EEPROM.

### Bluetooth (HC-05)
- **Módulo HC-05** – conectado em **Serial1** (TX 18, RX 19), **9600 baud**. Envio de comandos do app (CONFIG/START/STOP). **Funciona apenas com Android**; o app mobile não suporta iOS para Bluetooth clássico (SPP).

Conexão do HC-05 com o Arduino Mega (divisor de tensão no RXD para 3,3 V):

- **Arduino TX (pino 18)** → resistor **1 kΩ** → **HC-05 RXD**. Nessa mesma junção (entre o 1 kΩ e o RXD), um resistor de **2 kΩ** vai para **GND**. Assim o RXD do HC-05 vê ~3,3 V (5 V × 2k/(1k+2k)).
- **HC-05 TXD** → **Arduino RX (pino 19)**. O HC-05 em geral é 3,3 V; o RX da Mega aceita 3,3 V, então costuma ser conexão direta.

```
                    Arduino Mega 2560
                    ┌─────────────────┐
                    │                 │
     Serial1 TX  ────┤ 18 (TX1)        │
                    │      │          │
                    │      │ 1kΩ      │
                    │      └──┬────────┤
                    │         │       │
                    │         ├───────┤
                    │         │ 2kΩ   │
                    │         │       │
     Serial1 RX  ────┤ 19 (RX1)◄──────┼──── HC-05 TXD
                    │         │       │
                    │        GND      │
                    │                 │
                    └─────────────────┘
                           │
                           │  (entre 1k e RXD)
                           ▼
                    ┌─────────────────┐
                    │      HC-05       │
                    │  RXD ◄── junção  │
                    │  TXD ────────────┼────► Arduino 19 (RX1)
                    │  GND, VCC, etc.  │
                    └─────────────────┘
```

---

## Arquitetura do firmware

O projeto está em `firmware/ping-pong-robot/`. Um único sketch (.ino) inclui vários módulos em C++.

### Fluxo principal (`ping-pong-robot.ino`)

1. **setup()**  
   Inicializa: Serial (debug), joystick, display, servos, motores, Bluetooth.

2. **loop()** (resumo):
   - **processBTInput()** – lê Serial1, acumula linhas e processa comandos (START/STOP/CONFIG).
   - **updateButton()** – atualiza short/long press do botão do joystick.
   - **updateRunningLogic()** – se `isRunning`, atualiza PAN/TILT (live ou auto), servos, motores do lançador (M1–M3) e do feeder (M4); respeita timer se configurado.
   - **updateAxisPreviewTargets()** – nas telas PAN/TILT, atualiza o alvo para preview dos modos auto/random.
   - **Long press** – em qualquer tela (exceto Home) volta para Home e para motores se estiver rodando.
   - **readNavEvent()** – lê joystick e gera eventos NAV_UP/DOWN/LEFT/RIGHT (com debounce/repeat).
   - **Switch por `currentScreen`** – trata navegação e botão para cada tela e chama o `render*` correspondente.

### Módulos

| Arquivo        | Função |
|----------------|--------|
| **config.h/cpp** | Defines (pinos, tamanho do display, deadzone, etc.), enums (`Screen`, `NavEvent`, `AxisMode`, `FeederMode`, `SpinMode`), struct `Config` (pan/tilt, launcher, feeder, timer). Funções auxiliares para nomes e timers. |
| **utils.h/cpp** | `clampInt`, `clampFloat`, `joyToNorm` (analógico → -1..1), `applyIncremental` (ajuste de aim com stick). |
| **joystick.h/cpp** | `initJoystick`, `updateButton` (short/long press), `readNavEvent` (D-pad a partir de JOY_X/JOY_Y). |
| **display.h/cpp** | Inicialização do OLED, `drawHeader`, `drawMiniRadar`, `drawSpinVisualizer`, `drawFeederModeGraph`, `drawFeederRotor`. |
| **servos.h/cpp** | Inicialização, `updateServos(panNorm, tiltNorm)` (mapeia -1..1 para ângulos com MIN/MID/MAX), leitura/gravação de limites na EEPROM. |
| **motors.h/cpp** | Inicialização dos 4 motores (AF_DCMotor). `updateLauncherMotors(power, spinMode, spinIntensity)` (M1–M3 com spin por ângulo), `updateFeederMotor(speed, mode, customOnMs, customOffMs)` (M4 em contínuo ou pulsos). `stopAllMotors`, `runSingleMotor` (teste em Settings), cache para evitar writes desnecessários. |
| **logic.h/cpp** | Estado global (telas, índices de menu, `cfg`, `isRunning`, etc.). Lógica de auto: AUTO1 (velocidade contínua), AUTO2 (step + pause), RANDOM (alvo aleatório com pause). `updateRunningLogic()` aplica pan/tilt (live ou auto), atualiza servos e motores. `startRunning()` inicia com velocidade reduzida e sobe no próximo loop. |
| **screens.h/cpp** | Funções `render*` para cada tela: Home, Info, Wizard, Pan, Tilt, Launcher, Spin, Feeder, Timer, Running, Settings, Settings Servo, Settings Motor, Pan/Tilt Edit. |
| **bt_command.h/cpp** | `initBTCommand` (Serial1 9600), `processBTInput`. Protocolo por linhas: `S`/`START` = start, `P`/`STOP` = parar e ir para Home, `C,<26 ints>` = aplicar config (panMode, tiltMode, targets, limites, launcher, feeder, timer, etc.). |

### Telas (enum `Screen`)

- **HOME** – Start Wizard, Info, Settings.
- **WIZARD** – Pan, Tilt, Launcher, Feeder, Timer, START (entra em Running).
- **PAN / TILT** – Modo (LIVE, AUTO1, AUTO2, RANDOM), parâmetros (speed/step/min/max/pause), “Edit Target” em LIVE, Back.
- **PAN_EDIT / TILT_EDIT** – Ajuste do alvo com joystick em tempo real; servos acompanham.
- **LAUNCHER** – Power (0–255), Spin Config, Back.
- **SPIN** – Direction (N/NE/E/…/NONE), Intensity (0–512; >255 permite reverso em um motor), Back.
- **FEEDER** – Mode (CONT, P1/1, P2/1, P2/2, CUSTOM), Speed, On/Off em CUSTOM, Back.
- **TIMER** – OFF, 15s, 30s, 1m, 2m, 5m, Back.
- **RUNNING** – Mostra estado (timer, pan/tilt, power, spin); short press volta ao Wizard e para.
- **INFO** – Versão e “Max played” em segundos.
- **SETTINGS** – Servo 1, Servo 2, M1, M2, M3, M4 (teste individual), Back.
- **SETTINGS_SERVO** – Ajuste MIN/MID/MAX do servo selecionado; Back grava na EEPROM.
- **SETTINGS_MOTOR** – Teste de um motor (M1–M4) com barra de velocidade.

### Config e Bluetooth

A struct `Config` guarda todos os parâmetros de treino (pan/tilt, launcher, spin, feeder, timer). Ela não é persistida na EEPROM pelo firmware atual; apenas os limites dos servos são. O app pode enviar uma linha `C,<26 valores>` para sincronizar a config inteira antes de enviar START.

---

## Como compilar e gravar

1. Abrir `firmware/ping-pong-robot/ping-pong-robot.ino` no Arduino IDE (ou PlatformIO).
2. Placa: **Arduino Mega 2560**.
3. Instalar bibliotecas: **Adafruit GFX**, **Adafruit SSD1306**, **AFMotor** (ou a variante **AFMotor_R4** usada no código).
4. Compilar e gravar na Mega.

---

## App mobile

O app React Native (pasta `mobile/`) conecta ao robô via Bluetooth e envia a mesma config e comandos (CONFIG/START/STOP). Documentação completa do app: ver **`../mobile/README.md`**.
