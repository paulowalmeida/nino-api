# Nino — Diretrizes de Frontend

## Stack

- **Framework:** Next.js (app router)
- **Component lib:** própria, construída sobre Radix UI primitivos
- **Estilização:** CSS variables para tokens (cor, tipografia, espaçamento) — essencial para o white-label funcionar
- **Animações:** Framer Motion com moderação; preferir CSS transitions para elementos recorrentes (performance em WebView)

---

## Arquitetura de Apps

Uma aplicação por perfil, responsiva. Não uma SPA única com roteamento por role.

| App | Canais |
|---|---|
| Gestor de pedidos | Web + WebView (Android/iOS) |
| Consumidor | Web + WebView (Android/iOS) |
| Entregador | Web + WebView (Android/iOS) |
| Admin Nino | Web + WebView (Android/iOS) |
| Suporte Nino | Web |

---

## Estratégia Mobile (WebView + Casca Nativa)

Modelo adotado por Itaú, Nubank e outras fintechs brasileiras:

- Casca nativa (Android/iOS) responsável por: câmera, notificações push, biometria, deep links
- Conteúdo 100% web renderizado dentro de um WebView
- Uma codebase só — sem React Native, sem Flutter
- Custo de manutenção drasticamente menor

**Atenção:** animações pesadas travam em celulares mid-range via WebView. Testar sempre em dispositivos reais de entrada.

---

## Component Library (White-Label)

Os tokens de design precisam ser configuráveis por tenant desde o início.

```css
/* Exemplo de tokens via CSS variables */
:root {
  --color-primary: #e63946;
  --color-secondary: #457b9d;
  --font-body: 'Inter', sans-serif;
  --radius-card: 12px;
}
```

No onboarding do tenant, a API retorna `primaryColor`, `secondaryColor` etc. O front injeta as variáveis dinamicamente — cada restaurante vê sua própria identidade visual.

Referência de arquitetura: [Radix UI](https://www.radix-ui.com/) + CSS variables.

---

## Dados Sensíveis no Painel de Suporte

Mascarar dados de usuários finais **na API**, não no frontend.

- Criar endpoint/perfil específico que já retorna dados anonimizados
- Mais seguro (dado nunca trafega plaintext) e auditável
- Exemplo: `email` → `w***@gmail.com`, `whatsapp` → `(91) *****-4321`

---

## UX / Experiência

Referência de qualidade: iFood. Público-alvo não é técnico.

- Animações amigáveis e feedback visual imediato
- Estados de loading, erro e vazio sempre tratados
- Fluxos curtos — o dono de restaurante não lê manual
- Acessibilidade desde o início (Radix já ajuda muito aqui)
