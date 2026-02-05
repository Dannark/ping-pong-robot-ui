# Ping Pong Robot – App Mobile

App React Native que controla o robô de ping-pong via **Bluetooth clássico (SPP)**. Replica e estende a experiência do display TFT do robô com interface mais rica e intuitiva.

**Plataforma:** apenas **Android** (Bluetooth clássico; iOS não é suportado pelo módulo HC-05 / stack atual).

---

## Conexão com o Arduino

### Requisitos
- **Dispositivo Android** com Bluetooth.
- **Robô ligado** e módulo **HC-05** pareado com o celular (modo pareamento do HC-05, se necessário).
- **Permissões:** `BLUETOOTH`, `BLUETOOTH_CONNECT` (Android 12+). O app solicita em tempo de execução.

### Fluxo no app
1. **Home** → toque em **Conectar** (ou equivalente).
2. Tela **Connect** lista dispositivos **já pareados** (`getBondedDevices()`). Não há descoberta de dispositivos não pareados; o usuário deve parear o HC-05 nas configurações do Android antes.
3. Usuário toca em um dispositivo → `setBluetoothTargetDevice(btDevice)` e `dataSource.connect()`. A lib usa **RFCOMM** com delimiter `\n` e charset UTF-8.
4. Após conectado, o status fica “Conectado” e o app pode enviar **CONFIG**, **START** e **STOP**.

### Biblioteca
- **react-native-bluetooth-classic** (1.73.0-rc.17). API: `getBondedDevices()`, `device.connect(options)`, `device.write(data, 'utf-8')`, `device.disconnect()`.

---

## Protocolo de comunicação (app → Arduino)

Tudo é **texto por linha** (terminador `\n`). O Arduino **não envia respostas**; o app apenas envia comandos e assume que foram recebidos.

### Comandos

| Comando | Formato | Efeito no Arduino |
|--------|---------|-------------------|
| **Start** | `S\n` ou `START\n` | Chama `startRunning()`: inicia motores com velocidade reduzida e vai para tela RUNNING. |
| **Stop** | `P\n` ou `STOP\n` | Para todos os motores, `isRunning = false`, `currentScreen = SCREEN_HOME`. |
| **Config** | `C,v0,v1,...,v25\n` | Atualiza a struct `Config` no Arduino com 26 inteiros (ordem fixa). |

### Formato da linha de config (`C,...`)

26 valores inteiros separados por vírgula, na ordem abaixo. Valores float no app são enviados × 1000 (inteiro).

| Índice | Significado no Arduino | Exemplo (app → Arduino) |
|--------|------------------------|-------------------------|
| 0 | panMode (0=LIVE, 1=AUTO1, 2=AUTO2, 3=RANDOM) | 0 |
| 1 | tiltMode | 0 |
| 2 | panTarget × 1000 | 0 |
| 3 | tiltTarget × 1000 | 0 |
| 4–7 | panMin, panMax, tiltMin, tiltMax × 1000 | -1000, 1000, -1000, 1000 |
| 8 | panAuto1Speed × 1000 | 35 |
| 9 | panAuto2Step × 1000 | 250 |
| 10 | panAuto2PauseMs | 1000 |
| 11 | tiltAuto1Speed × 1000 | 35 |
| 12 | tiltAuto2Step × 1000 | 250 |
| 13 | tiltAuto2PauseMs | 1000 |
| 14 | panRandomMinDist × 1000 | 200 |
| 15 | panRandomPauseMs | 1500 |
| 16 | tiltRandomMinDist × 1000 | 200 |
| 17 | tiltRandomPauseMs | 1500 |
| 18 | launcherPower (0–255) | 255 |
| 19 | spinMode (0=NONE, 1=N, 2=NE, … 9=NW) | 0 |
| 20 | spinIntensity (0–512) | 255 |
| 21 | feederMode (0=CONT, 1=P1/1, 2=P2/1, 3=P2/2, 4=CUSTOM) | 0 |
| 22 | feederSpeed (0–255) | 200 |
| 23 | feederCustomOnMs | 1500 |
| 24 | feederCustomOffMs | 750 |
| 25 | timerIndex (0=OFF, 1=15s, … 5=5m) | 0 |

A geração da linha no app está em **`src/data/btProtocol.ts`**: `configToConfigLine(config)` e `getStartCommand()` / `getStopCommand()`.

---

## Como o Arduino interpreta e “responde”

- **Não há canal de resposta.** O Arduino só lê de `Serial1` no `loop()` em `processBTInput()`.
- Acumula caracteres até `\n` ou `\r`, monta uma linha e chama `processLine()`:
  - **S** ou **START** → `startRunning()` (entra em RUNNING e liga motores).
  - **P** ou **STOP** → para motores e volta para `SCREEN_HOME`.
  - **C,v0,...,v25** → preenche `cfg` (struct global), com clamps nos valores.
- O estado real (telas, motores, timer) existe só no Arduino. O app mantém um “espelho” local (config + run state) para UI e timer; se a conexão cair, o robô continua com a última config até receber STOP ou desligar.

---

## Arquitetura do app (resumo)

- **MVVM** por tela: `index.tsx` (container), `*.viewModel.ts` (lógica), `*.view.tsx` (UI). Repositórios para dados; nenhuma chamada de API direta na viewModel.
- **Navegação:** `RootStack.tsx` – stack com telas: Home, Connect, Wizard, Pan, Tilt, Launcher, Feeder, Timer, Running, TrainingComplete, Info, Settings, SettingsServoTilt, SettingsServoPan, SettingsMotorTest.

### Camada de dados

| Artefato | Função |
|----------|--------|
| **RobotConfig** / **DEFAULT_CONFIG** | Tipo e valores padrão da config (pan, tilt, launcher, spin, feeder, timer). |
| **RobotConfigRepository** | Config em memória; `getConfig`, `setConfig(partial)`, `subscribe`. Usado por Wizard e telas de ajuste. |
| **RobotConnectionDataSource** | Interface: `connect`, `disconnect`, `sendConfig`, `start`, `stop`, estado de conexão. |
| **BluetoothRobotConnectionDataSource** | Implementação real: usa `react-native-bluetooth-classic`, `setBluetoothTargetDevice`, `write(line)`. |
| **RobotConnectionRepository** | `startRun(config)` = `sendConfig(config)` + `start()`; `stopRun()` = `stop()`; mantém `runStartTime` e `runConfig` para Running/TrainingComplete. |
| **btProtocol.ts** | `configToConfigLine`, `getStartCommand`, `getStopCommand` – geração exata das linhas enviadas ao Arduino. |
| **PresetsRepository** | Presets do Wizard (AsyncStorage); load/save/delete; não existe no Arduino. |
| **HardwareSettingsRepository** (servos) | Limites de servos (min/mid/max) no app via AsyncStorage; **não são enviados ao Arduino**. No robô, os limites são ajustados no display e gravados em EEPROM. |

### Fluxo “Start” a partir do app

1. Usuário no **Wizard** toca **Start**.
2. `RobotConnectionRepository.startRun(config)`:
   - `dataSource.sendConfig(config)` → envia `C,<26 valores>\n`.
   - `dataSource.start()` → envia `S\n`.
3. Navegação para **Running**; o repositório guarda `runStartTime` e `runConfig`.
4. Na tela **Running**, o app mostra tempo decorrido/restante e pode chamar `stopRun()` (envia `P\n`) e voltar.

---

## Telas principais e equivalência com o Arduino

| App | Arduino (display) | Observação |
|-----|-------------------|------------|
| **Home** | HOME | App tem cards: Conectar, Start Wizard, Info, Settings. |
| **Connect** | — | Só no app: listar pareados e conectar ao HC-05. |
| **Wizard** | WIZARD | Pan, Tilt, Launcher, Feeder, Timer + Start. Preview visual rico (Aim, Feeder, Spin). |
| **Pan / Tilt** | SCREEN_PAN / SCREEN_TILT | Mesmos modos (LIVE, AUTO1, AUTO2, RANDOM) e parâmetros. App tem sliders/inputs; Arduino usa joystick. |
| **Launcher** | SCREEN_LAUNCHER + SCREEN_SPIN | Power e spin (direção + intensidade). |
| **Feeder** | SCREEN_FEEDER | Modos e velocidade; CUSTOM com on/off em ms. |
| **Timer** | SCREEN_TIMER | OFF, 15s, 30s, 1m, 2m, 5m. |
| **Running** | SCREEN_RUNNING | App mostra tempo, config atual, previews; botão Stop envia `P\n`. |
| **TrainingComplete** | — | Só no app: tela ao fim do timer (vibração/notificação opcional). |
| **Settings** | SCREEN_SETTINGS | Servo Tilt/Pan, teste M1–M4. Limites de servo no app ficam no app (AsyncStorage); no robô ficam na EEPROM. |
| **Info** | SCREEN_INFO | Versão / estatísticas. |

---

## Diferenças importantes (app vs Arduino)

1. **Spin “Random”**  
   No app existe **spinRandom** e **spinRandomIntervalSec**. O protocolo envia **apenas uma direção de spin** (campo 19). O Arduino mantém essa direção fixa. O “random” no app é **só visual**: a cada N segundos o app troca a direção exibida na UI; o robô **não** recebe atualizações de spin durante o run. Para spin realmente aleatório no robô seria preciso enviar novas linhas `C,...` periodicamente (não implementado).

2. **Timer e fim de treino**  
   O Arduino usa `timerMsByIndex` e para sozinho ao atingir o tempo, voltando para HOME. O app também calcula tempo restante; ao chegar a zero dispara notificação/vibração (se habilitado) e chama `stopRun()` e navega para **TrainingComplete**.

3. **Limites dos servos**  
   No Arduino: editados na tela Settings e salvos em EEPROM. No app: **HardwareSettingsRepository** (ServoTilt/ServoPan) persiste no AsyncStorage; **não há envio desses valores para o robô**. São duas fontes de verdade independentes.

4. **Presets**  
   Só no app (PresetsRepository, Wizard menu “Save/Load preset”). O Arduino não conhece presets.

5. **Conexão**  
   O app precisa estar conectado para Start/Stop/Config terem efeito. O display e o joystick do robô funcionam mesmo sem app.

---

## O que é necessário para conectar ao Arduino

- **Android** (iOS não suportado).
- HC-05 **já pareado** com o dispositivo.
- App com permissão **Bluetooth (Connect)**.
- Robô ligado e HC-05 em modo SPP (comunicação serial).
- **Ordem recomendada:** 1) Conectar (tela Connect); 2) Configurar no Wizard; 3) Start (envia config + start). Para parar: Stop na tela Running ou no robô (long press para Home).

---

## Referência rápida para colaboradores e agentes

- **Protocolo:** linhas terminadas em `\n`. Comandos: `S`, `P`, `C,<26 ints>`. Código de geração: `src/data/btProtocol.ts`.
- **Conexão:** `src/data/BluetoothRobotConnectionDataSource.ts` e `src/screens/Connect/`.
- **Config global do treino:** `RobotConfigRepository` + `RobotConfig` em `src/data/RobotConfig.ts`.
- **Início/fim de run:** `RobotConnectionRepository.startRun` / `stopRun`; telas Wizard e Running.
- **Diferenças com o firmware:** spinRandom só na UI do app; limites de servo não sincronizados; presets e TrainingComplete só no app; Arduino não envia nada de volta.

Documentação do hardware e do firmware (incluindo diagrama do HC-05): **`../firmware/README.md`**.
