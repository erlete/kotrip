export type ThemedAsset = {
  light: string;
  dark: string;
};

type ThemedAssetOptions =
  | {
      light: string;
      dark?: string;
    }
  | {
      path: string;
      filename: string;
      extension?: string;
      darkFilename?: string;
      hasDarkVariant?: boolean;
    };

export function themedAsset(options: ThemedAssetOptions): ThemedAsset {
  if ('light' in options) {
    return {
      light: options.light,
      dark: options.dark ?? options.light,
    };
  }

  const {
    path,
    filename,
    extension = 'png',
    darkFilename,
    hasDarkVariant = true,
  } = options;

  const basePath = `/assets/${path}`;
  const light = `${basePath}/${filename}.${extension}`;
  const dark = hasDarkVariant
    ? `${basePath}/${darkFilename ?? `${filename}-dark`}.${extension}`
    : light;

  return { light, dark };
}
