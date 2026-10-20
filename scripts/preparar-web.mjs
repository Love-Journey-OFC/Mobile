// Gera o dist/ do repositório web (Front-End) e copia para www/, que o Capacitor empacota no app.
// Só a cópia em www/ recebe os ajustes do app; os arquivos do site não mudam:
// - Font Awesome e Google Fonts passam a vir de arquivos locais (funcionam offline),
//   nas mesmas versões, famílias e pesos que o site carrega pela internet;
// - web/app-android.js é incluído em todas as páginas.
// O Front-End fica ao lado deste repositório (../Front-End) ou no caminho de LOVE_JOURNEY_WEB.
// Uso: npm run preparar
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(mobile, process.env.LOVE_JOURNEY_WEB || path.join("..", "Front-End"));
if (!existsSync(path.join(root, "scripts", "build-pages.mjs"))) {
  throw new Error(
    `Repositório Front-End não encontrado em ${root}. Clone-o ao lado deste repositório ou defina LOVE_JOURNEY_WEB.`,
  );
}
const www = path.join(mobile, "www");
const vendor = path.join(www, "vendor");
const modules = path.join(mobile, "node_modules");

const fontAwesomeCdn =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.1/css/all.min.css";
const googleFonts = {
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap":
    { family: "poppins", weights: [300, 400, 500, 600, 700] },
  "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap":
    { family: "nunito", weights: [400, 500, 600, 700, 800, 900] },
};

execFileSync(process.execPath, [path.join(root, "scripts", "build-pages.mjs")], {
  cwd: root,
  stdio: "inherit",
});

await rm(www, { recursive: true, force: true });
await cp(path.join(root, "dist"), www, { recursive: true });

// Font Awesome (mesma versão do cdnjs)
const fontAwesome = path.join(modules, "@fortawesome", "fontawesome-free");
await cp(path.join(fontAwesome, "css", "all.min.css"), path.join(vendor, "fontawesome", "css", "all.min.css"));
await cp(path.join(fontAwesome, "webfonts"), path.join(vendor, "fontawesome", "webfonts"), { recursive: true });

// Google Fonts (mesmas famílias e pesos, via Fontsource)
for (const { family, weights } of Object.values(googleFonts)) {
  const source = path.join(modules, "@fontsource", family);
  const target = path.join(vendor, "fonts", family);
  const pattern = new RegExp(`-(${weights.join("|")})-normal\\.woff2?$`);
  await mkdir(path.join(target, "files"), { recursive: true });
  for (const file of await readdir(path.join(source, "files"))) {
    if (pattern.test(file)) await cp(path.join(source, "files", file), path.join(target, "files", file));
  }
  const css = await Promise.all(weights.map((weight) => readFile(path.join(source, `${weight}.css`), "utf8")));
  await writeFile(path.join(target, "fonts.css"), css.join("\n"));
}
await cp(path.join(mobile, "web", "app-android.js"), path.join(www, "app", "app-android.js"));

const replaceExactly = (html, from, to, page) => {
  if (!html.includes(from)) throw new Error(`${page}: não encontrei ${from}`);
  return html.split(from).join(to);
};

const pages = (await readdir(www)).filter((file) => file.endsWith(".html"));
for (const page of pages) {
  let html = await readFile(path.join(www, page), "utf8");
  if (html.includes(fontAwesomeCdn))
    html = replaceExactly(html, fontAwesomeCdn, "./vendor/fontawesome/css/all.min.css", page);
  for (const [url, { family }] of Object.entries(googleFonts)) {
    if (html.includes(url)) html = replaceExactly(html, url, `./vendor/fonts/${family}/fonts.css`, page);
  }
  const leftover = html.match(/https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com\/css)[^"' ]*/);
  if (leftover) throw new Error(`${page}: recurso externo sem cópia local: ${leftover[0]}`);
  html = replaceExactly(html, "</head>", '  <script src="./app/app-android.js"></script>\n  </head>', page);
  await writeFile(path.join(www, page), html);
}

console.log(`www/ pronto a partir do dist/ (${pages.length} páginas, fontes e ícones locais)`);
