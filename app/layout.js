import { NextAuthProvider } from "./providers";

export const metadata = {
  title: "Login App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}