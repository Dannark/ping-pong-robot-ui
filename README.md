# Ping Pong Robot

Robô que dispara bolinhas de ping-pong, com projeto em impressão 3D, Arduino Mega e interface por display + joystick e/ou app Android via Bluetooth.

**Repositório:** [github.com/Dannark/ping-pong-robot-ui](https://github.com/Dannark/ping-pong-robot-ui)

---

## Sobre o projeto

O robô é montado em peças **impressas em 3D**, com foco em **baixo custo** e **modularidade**: dá para trocar partes, reimprimir e adaptar conforme a necessidade. A maior parte da montagem é por **encaixe**, com uso mínimo de parafusos — apenas **M2×6 ou M2×8** para fixar a caixa de redução extra do motor do alimentador (feeder).

### Por que motores DC 130?

A ideia foi usar **motores DC 130 simples**: apesar de fracos e subestimados, são leves, baratos e fáceis de encontrar. O projeto tenta **otimizar ao máximo** o lançamento com eles. Motores brushless provavelmente dariam um spin com mais facilidade, mas o desafio aqui foi trazer o mesmo desempenho para algo **barato e funcional**. Os DC 130 têm força suficiente para:

- **Disparo médio/forte em linha reta**
- **Spin com bastante efeito**, em troca de um pouco de alcance final (menos força no disparo)

Os motores são especificados para 6 V, mas neste projeto **funcionam melhor alimentados com 7,5 V ou 9 V** — suficiente para não queimar os motores de imediato. **Atenção:** alguns DC 130 de baixa qualidade **não são compatíveis** com shields de motor para Arduino e só rodam quando alimentados direto fora da shield. Vale comprar **motores DC 130 de qualidade** (como os que vêm em kits de rodinhas com redução para Arduino).

### Por que não motor de passo no feeder?

No início foi usado motor de passo no alimentador, mas ele era lento e ocupava **dois canais da shield (M3 e M4)**. O controle fino de passo não era tão útil: o que importava era alimentar o lançador com torque o suficiente sendo o mais rápido possível sem travar as bolinhas. Com um **motor DC 130 comum** no feeder, dá para configurar velocidades bem mais altas (configuravel com mais ou menos velocidades a depender das reduções das engrenagens ou ajuste de speed no software), o que **aumenta a taxa de bolinhas por minuto** e ainda libera **três motores dedicados só para o lançador**, permitindo **spin em todas as direções** (back, top, sides e diagonais).

### Performance

Os disparos são **estáveis**. Alimentando com **7,5 V**, a taxa fica em torno de **65–69 bolinhas por minuto**. Tanto a interface do **display** quanto o **app** são bem personalizáveis: limites dos servos, frequência do feeder, randomização de pan/tilt e outras opções independentes. Em uso geral o robô tem **performance constante e boa**, com força suficiente para rebater bolas médias e lentas — não para bolas ultra-rápidas.

---

## Hardware

### Obrigatório

| Item | Observação |
|------|------------|
| **Arduino Mega 2560** | Controlador principal. |
| **Shield de motor** | Compatível com AFMotor (ex.: L293D). A V1 não é requisito rígido; foi a usada no projeto. |
| **4× motores DC 130** | Um deles **com caixa de redução 1:48** (aquela amarela de eixo duplo; um dos eixos deve ser cortado) — esse é o motor do **feeder**. Os outros três são do **lançador** (spin). Preferir motores de qualidade, compatíveis com shield. |
| **4× rolamentos 6700zz** | Dois na cabeça do lançador (pan/tilt) para reduzir atrito; dois na redução do motor do feeder. |
| **Folha de EVA** | Para as rodas de atrito. |
| **Filamento flexível** (recomendado) | Para imprimir as rodas. |

### Interface (pelo menos uma)

Sem uma interface você não consegue comandar o robô. É necessário **um** dos conjuntos abaixo (ou os dois):

| Opção | Itens |
|-------|--------|
| **Display + joystick** | Display **OLED 0,96"** (128×64, I²C) + **joystick** analógico. Menu no display e navegação pelo joystick. |
| **Bluetooth** | Módulo **HC-05** (ou similar). Controle pelo **app Android** (iOS não suportado). |

### Opcionais

- **2 servos** para pan e tilt da cabeça do lançador.
- **Display + joystick** e **Bluetooth** ao mesmo tempo: dá para usar o robô pelo display ou pelo app.

---

## Estrutura do repositório e documentação

Este repositório contém o **firmware** (Arduino) e o **app mobile** (React Native). Cada parte tem um README próprio com detalhes de hardware, protocolo e uso.

| Pasta | Conteúdo | Documentação |
|-------|----------|--------------|
| **[firmware/](firmware/)** | Código do Arduino Mega: display, joystick, motores, servos, Bluetooth. Pinagem, módulos, telas do display, conexão do HC-05 (com diagrama). | **[firmware/README.md](firmware/README.md)** — guia do firmware e hardware do robô |
| **[mobile/](mobile/)** | App Android (React Native): conexão Bluetooth, protocolo (CONFIG/START/STOP), telas, diferenças em relação ao display. | **[mobile/README.md](mobile/README.md)** — guia do app e da comunicação com o robô |

Sugestão de leitura:

1. **Começar por [firmware/README.md](firmware/README.md)** — hardware completo (motores, reduções do M4, display, joystick, diagrama do Bluetooth), arquitetura do firmware e como compilar/gravar.
2. **Depois [mobile/README.md](mobile/README.md)** — como o app se conecta ao Arduino, formato dos comandos, telas e o que é específico do app (presets, spin “random” na UI, etc.).

---

## Licença e contribuição

Projeto aberto. Para contribuir ou reportar problemas, use o repositório: [github.com/Dannark/ping-pong-robot-ui](https://github.com/Dannark/ping-pong-robot-ui).
