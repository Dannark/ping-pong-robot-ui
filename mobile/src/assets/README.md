# Assets

Coloca aqui imagens e ícones do app.

- **`images/`** – imagens (PNG, JPG, etc.)
- **`icons/`** – ícones (PNG recomendado para React Native)

## Uso no código

```tsx
// Imagem
import logo from '../assets/images/logo.png';
<Image source={logo} style={{ width: 100, height: 100 }} />

// Ou com require (útil para listas dinâmicas)
<Image source={require('../assets/images/logo.png')} />
```

Os ficheiros `.gitkeep` servem para manter as pastas no Git quando estão vazias; podes apagá-los quando adicionares ficheiros.
