# Love Journey — Aplicativo Android

O app é o **mesmo front-end do site** ([Love-Journey-OFC/Front-End](https://github.com/Love-Journey-OFC/Front-End)) empacotado com [Capacitor](https://capacitorjs.com). Nenhuma página, CSS ou JS é duplicado aqui: tudo vem do `dist/` gerado pelo repositório Front-End.

```
Front-End ── node scripts/build-pages.mjs ──► dist/ ──► Mobile/www/ ── cap sync ──► Mobile/android/ ──► APK/AAB
```

## Organização das pastas

Os dois repositórios ficam **lado a lado**:

```
GitHub/
├── Front-End/   # site (HTML, CSS, JS, assets, API do Diário com IA)
└── Mobile/      # este repositório
```

Se o Front-End estiver em outro lugar, defina `LOVE_JOURNEY_WEB` com o caminho dele antes dos comandos.

## O que fica aqui

| Arquivo | Função |
|---|---|
| `package.json` | Dependências do Capacitor e scripts do app |
| `capacitor.config.json` | Configuração do app (id, nome, tela inicial, plugins) |
| `scripts/preparar-web.mjs` | Roda o build do Front-End, copia `dist/` para `www/` e aplica os ajustes do app |
| `scripts/gradle.mjs` | Roda o Gradle no Windows, macOS ou Linux |
| `web/app-android.js` | Script que só roda no app (exportação de arquivos) |
| `recursos/logo.png` | Origem do ícone e do splash (cópia de `assets/imgs/logo-icone.png` do Front-End) |
| `android/` | Projeto nativo Android (abrir no Android Studio) |
| `www/` | Cópia gerada do `dist/` (ignorada no Git) |

### Ajustes aplicados só na cópia `www/`

Os arquivos do site não mudam. Na cópia que vai para o app, `preparar-web.mjs`:

- troca o Font Awesome do cdnjs e as Google Fonts (Poppins, Nunito) por cópias locais nas **mesmas versões, famílias e pesos** (`vendor/`), para ícones e fontes funcionarem sem internet. Verificado: posição, tamanho e fonte de todos os elementos das 16 páginas, em 390 px e 1280 px, iguais aos do site;
- inclui `app/app-android.js` em todas as páginas.

O script falha se encontrar um link de CDN ou Google Fonts que não saiba copiar. Se uma página nova do site usar outra família ou peso, acrescente em `googleFonts` e o pacote `@fontsource/<família>` correspondente.

- **appId:** `br.com.lovejourney.app` (não pode mudar depois de publicar na Play Store).
- **Tela inicial:** `boas-vindas.html` (`server.appStartPath`). O `index.html` continua no pacote, igual ao site.
- **Endereço interno:** `https://localhost`. Não altere `androidScheme` nem `hostname`: o `localStorage` do app fica preso a esse endereço e os dados salvos se perderiam.

## Requisitos

- Node 22+
- [Android Studio](https://developer.android.com/studio) com Android SDK 36, ou só o SDK (command-line tools)
- JDK 21 (o Android Studio já traz um; configure `JAVA_HOME` ou use o do Android Studio)

## Comandos

```powershell
npm install          # primeira vez
npm run sync         # build do Front-End + cópia para www/ + cap sync android
npm run abrir        # abre o projeto no Android Studio
npm run apk          # gera APK de debug: android/app/build/outputs/apk/debug/
npm run apk-release  # gera APK assinado para enviar a testadores: android/app/build/outputs/apk/release/ (precisa da keystore)
npm run aab          # gera AAB de release para a Play Store (precisa da keystore)
npm run verificar    # confere a sintaxe dos scripts
```

Sempre que o site mudar (atualize o Front-End com `git pull`), rode `npm run sync` antes de gerar o app.

O GitHub Actions (`.github/workflows/android.yml`) baixa o Front-End, gera o APK de debug a cada push e o deixa para download nos artefatos da execução.

Para regenerar ícone e splash depois de trocar `recursos/logo.png`:

```powershell
npx @capacitor/assets@3.0.5 generate --android --assetPath recursos --iconBackgroundColor "#FFFFFF" --iconBackgroundColorDark "#FFFFFF" --splashBackgroundColor "#FFFFFF" --splashBackgroundColorDark "#FFFFFF"
```

## Assinatura (APK de release e AAB)

1. Crie a keystore **uma única vez** e guarde-a com backup fora do repositório. Sem ela não é possível atualizar o app instalado nem publicar atualizações na Play Store:
   ```powershell
   keytool -genkeypair -v -keystore love-journey-release.jks -alias love-journey -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Coloque o `.jks` na raiz deste repositório (`*.jks` está no `.gitignore`), copie `android/keystore.properties.example` para `android/keystore.properties` e preencha as senhas. Esse arquivo também fica fora do Git.
3. Antes de cada versão, aumente `versionCode` e `versionName` em `android/app/build.gradle`.
4. `npm run apk-release` gera `app-release.apk`; `npm run aab` gera `android/app/build/outputs/bundle/release/app-release.aab`. Os dois saem assinados.

## Diário com IA

- No app, `js/diario-com-ia.js` (no Front-End) chama `https://front-end-4cu.pages.dev/api/chat` (no site continua `/api/chat`).
- O plugin `CapacitorHttp` faz o `fetch` sair pela camada nativa, então **não é preciso CORS** no servidor.
- A `GEMINI_API_KEY` continua só no Cloudflare. Nenhuma chave vai para o app.

## Exportar arquivos

O CSV de emoções, o JSON do Diário com IA e o currículo do dashboard profissional são baixados no site com um link `blob:`, que o WebView do Android ignora. No app, `web/app-android.js` intercepta esse download, salva o arquivo no cache (`@capacitor/filesystem`) e abre o compartilhar do Android (`@capacitor/share`), onde a pessoa escolhe salvar no aparelho, no Drive ou enviar. Nenhum JS do site foi alterado para isso.

## Limitações conhecidas

- **Precisa de internet** para o Diário com IA e para as 5 imagens do Unsplash em Desafios.
- **Link de publicação da Comunidade:** o botão de copiar link usa o endereço da página; no app ele é `https://localhost/...`, que não abre fora do app.
- **Tamanho:** cerca de 50 MB, por causa de PNGs grandes em `assets/` do Front-End.
