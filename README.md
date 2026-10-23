<div align="center">

<img src="./recursos/logo.png" alt="Logo do Love Journey" width="96" />

# Love Journey — Android

**Uma jornada para se conhecer, se entender e construir relações mais saudáveis, agora no celular.**

Aplicativo Android do Love Journey. É o **mesmo front-end do site** ([Love-Journey-OFC/Front-End](https://github.com/Love-Journey-OFC/Front-End)) empacotado com [Capacitor](https://capacitorjs.com), com a mesma aparência, as mesmas páginas e os mesmos dados locais.

![Android](https://img.shields.io/badge/Android_7.0+-3DDC84?style=flat-square&logo=android&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_22+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle_8-02303A?style=flat-square&logo=gradle&logoColor=white)
![JDK 21](https://img.shields.io/badge/JDK_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Licença MIT](https://img.shields.io/badge/licença-MIT-4CAF77?style=flat-square)

[Como funciona](#como-funciona) · [Primeiros passos](#primeiros-passos) · [Instalar no celular](#instalar-no-celular) · [Enviar para outras pessoas](#enviar-o-app-para-outras-pessoas)

</div>

---

## Sumário

- [Sobre o app](#sobre-o-app)
- [Tecnologias](#tecnologias)
- [Como funciona](#como-funciona)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Primeiros passos](#primeiros-passos)
- [Comandos](#comandos)
- [Instalar no celular](#instalar-no-celular)
- [Enviar o app para outras pessoas](#enviar-o-app-para-outras-pessoas)
- [Assinatura e Play Store](#assinatura-e-play-store)
- [Diário com IA](#diário-com-ia)
- [Exportar arquivos](#exportar-arquivos)
- [Segurança](#segurança)
- [CI](#ci-github-actions)
- [Ícone e splash](#ícone-e-splash)
- [Problemas comuns](#problemas-comuns)
- [Limitações conhecidas](#limitações-conhecidas)
- [Licença](#licença)

---

## Sobre o app

O Love Journey é uma aplicação de autoconhecimento, comunicação e educação sobre relacionamentos para jovens e adolescentes. Este repositório **não reescreve o site**: ele pega o `dist/` gerado pelo Front-End e o transforma em um app Android instalável.

- Mesmas páginas, cores, fontes e ícones do site.
- Ícones e fontes funcionam **sem internet** (cópias locais nas mesmas versões).
- O app abre direto em `boas-vindas.html`.
- Os dados ficam no próprio aparelho (`localStorage`), como no navegador.
- Exportações (CSV de emoções, JSON do Diário com IA, currículo do profissional) abrem o compartilhar do Android.

| | |
|---|---|
| **Nome** | Love Journey |
| **appId** | `br.com.lovejourney.app` |
| **Android mínimo** | 7.0 (API 24) |
| **Android alvo** | API 36 |
| **Versão** | 1.0 (`versionCode 1`) |

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | HTML, CSS e JavaScript puros, vindos do Front-End |
| Ponte web → nativo | Capacitor 8.5.3 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`) |
| Plugins | `@capacitor/filesystem` 8.1.5, `@capacitor/share` 8.0.3, `CapacitorHttp` (embutido) |
| Ícones e fontes offline | `@fortawesome/fontawesome-free` 7.3.1, `@fontsource/poppins` e `@fontsource/nunito` 5.3.0 |
| Projeto nativo | Android (Java), Gradle 8.14.3, JDK 21, Android SDK 36 |
| Scripts | Node.js 22+ (ES modules, sem dependências extras) |
| CI | GitHub Actions |

---

## Como funciona

```
Front-End ── node scripts/build-pages.mjs ──► dist/ ──► Mobile/www/ ── cap sync ──► Mobile/android/ ──► APK / AAB
```

1. `npm run preparar` roda o build do Front-End (`scripts/build-pages.mjs`) e copia o `dist/` para `www/`.
2. Na cópia `www/` (os arquivos do site **não mudam**):
   - os links do Font Awesome no cdnjs e das Google Fonts viram cópias locais em `www/vendor/`, nas mesmas versões, famílias e pesos;
   - todas as páginas recebem `app/app-android.js` (script que só roda no app).
3. `cap sync android` copia o `www/` e os plugins para o projeto nativo em `android/`.
4. O Gradle gera o APK ou o AAB.

A aparência foi conferida página a página: posição, tamanho e fonte de todos os elementos das 16 páginas, em 390 px e 1280 px, iguais aos do site.

### Configuração (`capacitor.config.json`)

| Opção | Valor | Por quê |
|---|---|---|
| `appId` | `br.com.lovejourney.app` | Identidade do app. **Não pode mudar depois de publicar na Play Store** |
| `server.appStartPath` | `/boas-vindas.html` | Tela inicial do app. O `index.html` continua no pacote |
| `server.androidScheme` | `https` | O app roda em `https://localhost` |
| `CapacitorHttp.enabled` | `true` | O `fetch` sai pela camada nativa, sem CORS |
| `SystemBars.insetsHandling` | `native` | A barra de status não cobre o conteúdo, sem mexer no CSS |

> **Não altere `appId`, `androidScheme` nem `hostname`.** O `localStorage` fica preso ao endereço `https://localhost`; mudar isso apaga, na prática, os diários, emoções e desafios salvos de quem já usa o app.

---

## Estrutura de pastas

Os dois repositórios ficam **lado a lado**:

```
GitHub/
├── Front-End/   # site (HTML, CSS, JS, assets, API do Diário com IA)
└── Mobile/      # este repositório
```

Se o Front-End estiver em outro lugar, defina a variável `LOVE_JOURNEY_WEB` com o caminho dele antes dos comandos.

```
Mobile/
├── android/                        # projeto nativo (abrir no Android Studio)
│   ├── app/build.gradle            # versão do app e assinatura de release
│   └── keystore.properties.example # modelo das senhas da keystore
├── recursos/logo.png               # origem do ícone e do splash
├── scripts/
│   ├── preparar-web.mjs            # build do Front-End → www/ + ajustes do app
│   └── gradle.mjs                  # roda o Gradle no Windows, macOS ou Linux
├── web/app-android.js              # exportação de arquivos no app
├── www/                            # gerado (fora do Git)
├── capacitor.config.json
└── package.json
```

---

## Primeiros passos

### Requisitos

- [Node.js](https://nodejs.org) 22 ou mais novo
- [Android Studio](https://developer.android.com/studio) com o Android SDK 36 (ou só o SDK pela linha de comando)
- JDK 21 (o Android Studio já traz um; aponte o `JAVA_HOME` para ele ou para outro JDK 21)
- O repositório Front-End clonado ao lado deste

### Instalação

```powershell
cd C:\caminho\para\GitHub
git clone https://github.com/Love-Journey-OFC/Front-End.git
git clone https://github.com/Love-Journey-OFC/Mobile.git
cd Mobile
npm install
npm run apk
```

O APK de debug sai em `android/app/build/outputs/apk/debug/app-debug.apk`.

> Rode os comandos **dentro da pasta `Mobile`**. Fora dela o npm não encontra o `package.json`.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala as dependências (primeira vez) |
| `npm run preparar` | Build do Front-End e cópia para `www/` |
| `npm run sync` | `preparar` + `cap sync android` |
| `npm run abrir` | Abre o projeto no Android Studio |
| `npm run apk` | Gera o APK de debug |
| `npm run apk-release` | Gera o APK de release assinado (precisa da keystore) |
| `npm run aab` | Gera o AAB de release para a Play Store (precisa da keystore) |
| `npm run verificar` | Confere a sintaxe dos scripts |

Sempre que o site mudar, atualize o Front-End (`git pull` na pasta dele) e gere o app de novo. Todos os comandos de build já rodam o `sync`.

---

## Instalar no celular

1. No celular, ative as **Opções do desenvolvedor** (toque 7 vezes em *Número da versão* em *Sobre o telefone*) e, dentro delas, a **Depuração USB**.
2. Conecte o celular no computador pelo cabo e aceite a autorização que aparece na tela.
3. No PowerShell:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices                       # o celular deve aparecer como "device"
& $adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

O `&` é obrigatório no PowerShell para executar um caminho que está em uma variável ou entre aspas. O `-r` reinstala mantendo os dados do app.

Também dá para rodar direto pelo Android Studio (`npm run abrir` → botão *Run*).

---

## Enviar o app para outras pessoas

O APK de debug funciona, mas o ideal para testadores é o **APK de release assinado**: menor, otimizado e sempre com a mesma assinatura, o que permite instalar versões novas por cima sem perder os dados.

1. Configure a keystore uma vez (veja [Assinatura](#assinatura-e-play-store)).
2. Gere o APK:
   ```powershell
   npm run apk-release
   ```
3. Envie `android/app/build/outputs/apk/release/app-release.apk` (WhatsApp, Drive, e-mail...).
4. Quem receber abre o arquivo no celular e permite **instalar apps de fontes desconhecidas** quando o Android pedir.

Para atualizar quem já tem o app, aumente o `versionCode` e gere o APK com a **mesma keystore**. Com outra keystore o Android recusa a atualização.

---

## Assinatura e Play Store

1. Crie a keystore **uma única vez** e guarde uma cópia de segurança fora do repositório. Sem ela não é possível atualizar o app instalado nem publicar atualizações na Play Store:
   ```powershell
   keytool -genkeypair -v -keystore love-journey-release.jks -alias love-journey -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Coloque o `.jks` na raiz deste repositório, copie `android/keystore.properties.example` para `android/keystore.properties` e preencha as senhas:
   ```properties
   storeFile=../love-journey-release.jks
   storePassword=
   keyAlias=love-journey
   keyPassword=
   ```
   Os dois arquivos estão no `.gitignore`. **Nunca faça commit deles.**
3. Antes de cada versão, aumente `versionCode` (número inteiro, sempre maior) e `versionName` (ex.: `"1.1"`) em `android/app/build.gradle`.
4. Gere:
   - `npm run apk-release` → `android/app/build/outputs/apk/release/app-release.apk`
   - `npm run aab` → `android/app/build/outputs/bundle/release/app-release.aab` (formato exigido pela Play Store)

Sem o `keystore.properties`, o build de release sai sem assinatura e não instala.

---

## Diário com IA

- No app, `js/diario-com-ia.js` (no Front-End) detecta o Capacitor e chama a API de produção, `https://front-end-4cu.pages.dev/api/chat`. No site continua `/api/chat`.
- O `CapacitorHttp` faz a requisição pela camada nativa, então **não foi preciso liberar CORS** no servidor.
- Sem internet, o diário mostra uma mensagem pedindo para conferir a conexão.
- Se o domínio de produção mudar, atualize a URL em `js/diario-com-ia.js` no Front-End.

---

## Exportar arquivos

No site, o CSV de emoções, o JSON do Diário com IA e o currículo do dashboard profissional são baixados por um link `blob:`, que o WebView do Android ignora. No app, `web/app-android.js` intercepta esse download, salva o arquivo no cache (`@capacitor/filesystem`) e abre o compartilhar do Android (`@capacitor/share`), onde a pessoa escolhe salvar no aparelho, no Drive ou enviar. Nenhum JS do site foi alterado para isso.

---

## Segurança

- **Nenhuma chave de API no app.** A `GEMINI_API_KEY` fica só nos secrets do Cloudflare Pages.
- O app recebe apenas o `dist/` do site: `.git`, `.env`, `docs/`, `.claude/`, `lib/` e `server.mjs` não entram.
- Keystore (`*.jks`, `*.keystore`) e `android/keystore.properties` ficam fora do Git.

---

## CI (GitHub Actions)

`.github/workflows/android.yml` roda a cada push e pull request (e manualmente, pelo botão *Run workflow*):

1. Baixa este repositório e o Front-End lado a lado.
2. Instala Node 22 e JDK 21 (Temurin).
3. `npm ci`, `npm run verificar` e `npm run apk`.
4. Publica o `app-debug.apk` nos **artefatos** da execução (aba *Actions* → execução → *Artifacts*).

---

## Ícone e splash

Gerados a partir de `recursos/logo.png` (cópia de `assets/imgs/logo-icone.png` do Front-End), com fundo branco. Para regenerar depois de trocar o logo:

```powershell
npx @capacitor/assets@3.0.5 generate --android --assetPath recursos --iconBackgroundColor "#FFFFFF" --iconBackgroundColorDark "#FFFFFF" --splashBackgroundColor "#FFFFFF" --splashBackgroundColorDark "#FFFFFF"
```

Confira depois se o comando não reformatou o `android/app/src/main/AndroidManifest.xml`; se reformatou, desfaça com `git checkout -- android/app/src/main/AndroidManifest.xml`.

---

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `npm error enoent Could not read package.json` | O comando foi rodado fora da pasta. Entre em `Mobile` antes (`cd ...\GitHub\Mobile`) |
| `Repositório Front-End não encontrado em ...` | O Front-End não está ao lado do Mobile. Clone-o em `GitHub/Front-End` ou defina `LOVE_JOURNEY_WEB` |
| `recurso externo sem cópia local` ou `não encontrei ...` no `preparar` | Uma página do site passou a usar outro CDN, família ou peso de fonte. Acrescente em `googleFonts` em `scripts/preparar-web.mjs` e instale o `@fontsource/<família>` correspondente |
| `JAVA_HOME is not set` ou versão errada do Java | Aponte o `JAVA_HOME` para um JDK 21 (por exemplo, o `jbr` do Android Studio) |
| `SDK location not found` | Instale o Android SDK 36 e defina `ANDROID_HOME` (no Windows, normalmente `%LOCALAPPDATA%\Android\Sdk`) |
| Erro de sintaxe ao chamar o `adb` no PowerShell | Use `&` antes do caminho: `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | O app instalado tem outra assinatura (ex.: debug × release). Desinstale o antigo e instale de novo |
| App de release não instala | Falta o `android/keystore.properties`, então o APK saiu sem assinatura |

---

## Limitações conhecidas

- **Precisa de internet** para o Diário com IA e para as 5 imagens do Unsplash em Desafios. O resto funciona offline.
- **Link de publicação da Comunidade:** o botão de copiar link usa o endereço da página; no app ele é `https://localhost/...`, que não abre fora do app.
- **Tamanho:** cerca de 50 MB, por causa de PNGs grandes em `assets/` do Front-End.
- Só Android por enquanto. O mesmo projeto Capacitor pode receber iOS no futuro (`@capacitor/ios`), o que exige um Mac.

---

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](./LICENSE).

<div align="center">

Feito com cuidado pela equipe **Love Journey**.

**[Versão web: front-end-4cu.pages.dev/boas-vindas](https://front-end-4cu.pages.dev/boas-vindas)**

</div>
