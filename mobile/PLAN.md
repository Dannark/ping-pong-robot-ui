# Plano – UI do App Ping Pong Robot

## Objetivo
Interface que replica e supera o display TFT do robô: navegação entre telas, boa UI/UX, todas as funções do display e mais personalização.

## Fluxo do display atual (Arduino)
- **Home** → Start Wizard | Info | Settings
- **Wizard** → Pan | Tilt | Launcher | Feeder | Timer | **START**
- **Pan** → Mode (LIVE/AUTO1/AUTO2) | Edit Target / Speed / Step | Back
- **Tilt** → idem
- **Launcher** → Power (0–255) | Spin Config | Back
- **Spin** → Direction (N/NE/E/…) | Intensity (0–512) | Back + preview M1/M2/M3
- **Feeder** → Mode (CONT/P1/1/P2/2) | Speed | Back
- **Timer** → OFF / 15s / 30s / 1m / 2m / 5m | Back
- **Running** → controle ao vivo + tempo + Back
- **Settings** → Servo 1 | Servo 2 | M1 | M2 | M3 | Back
- **Settings Servo** → MIN, MID, MAX | Back
- **Settings Motor** → teste M1/M2/M3 com barra de velocidade
- **Info** → versão, stats, Back

## Navegação no app
- **Stack** principal: Home → Wizard → (Pan | Tilt | Launcher → Spin | Feeder | Timer) → Running.
- **Stack** Settings: Home → Settings → (Servo | Motor).
- **Modal** ou tela simples: Info.
- Botão "Voltar" consistente; em Running, destaque para "Stop".

## Fases de implementação

### Fase 1 – Base e primeiras telas (agora)
1. Remover template; adicionar React Navigation (stack).
2. Tema: cores, tipografia, espaçamento (dark-first, legível).
3. **Home**: 3 opções (Start Wizard, Info, Settings).
4. **Wizard**: lista Pan, Tilt, Launcher, Feeder, Timer + botão START.
5. Navegação funcional entre Home ↔ Wizard; placeholders para as demais.

### Fase 2 – Configuração do robô
6. **Pan** / **Tilt**: modo (LIVE / AUTO1 / AUTO2), parâmetros, “Edit target” (slider ou joystick virtual).
7. **Launcher**: slider Power; navegação para **Spin**.
8. **Spin**: seletor de direção (8 + NONE), slider Intensity, preview M1/M2/M3.
9. **Feeder**: modo (CONT / P1/1 / P2/2), slider Speed.
10. **Timer**: seletor OFF / 15s / 30s / 1m / 2m / 5m.

### Fase 3 – Running e Settings
11. **Running**: estado “ao vivo”, tempo decorrido/restante, indicador BT se aplicável, botão Stop.
12. **Settings**: Servo 1/2 (MIN, MID, MAX), teste Motor M1/M2/M3.

### Fase 4 – Bluetooth e polish
13. Conectar comandos ao robô via BT; indicador “controlado por app”.
14. Info (versão, stats); ajustes finos de UI/UX.

## Diretrizes UI/UX
- **Dark theme** como padrão (olhar no display em ambiente de jogo).
- **Contraste** e tamanhos de toque adequados (mín. ~44pt).
- **Headers** claros; ações principais sempre visíveis.
- **Sliders** para valores numéricos (Power, Intensity, Speed, etc.).
- **Listas** com seta/chevron para sub-telas; item selecionado destacado.
- Consistência com o fluxo do TFT para quem já usa o robô.
