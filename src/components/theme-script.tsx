// Se ejecuta antes del primer paint para evitar el "flash" del tema
// incorrecto: aplica el data-theme guardado en localStorage al <html>.
const THEME_SCRIPT = `
try {
  var theme = localStorage.getItem("walley-theme");
  if (theme === "light" || theme === "dark") {
    document.documentElement.setAttribute("data-theme", theme);
  }
} catch (e) {}
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
