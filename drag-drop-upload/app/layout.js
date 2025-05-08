import "./globals.css";
export const metadata = {
  title: "Reconocimiento de Aves Argentinas",
  description: "Identifica especies de aves argentinas a partir de imágenes usando inteligencia artificial. Subí tu foto y descubrí la especie al instante.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
