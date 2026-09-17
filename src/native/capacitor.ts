import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const isNativeRuntime = () => Capacitor.isNativePlatform();

export async function shareText(title: string, text: string) {
  if (!isNativeRuntime()) {
    await navigator.clipboard?.writeText(text);
    return;
  }

  await Share.share({
    title,
    text,
    dialogTitle: title,
  });
}

export async function saveTextFile(fileName: string, text: string) {
  if (!isNativeRuntime()) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return fileName;
  }

  const result = await Filesystem.writeFile({
    path: fileName,
    data: text,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  });

  return result.uri;
}
