// Vite's browser fixture loader imports local JPEG assets as URL strings.
declare module "*.jpg" {
  const url: string;
  export default url;
}
