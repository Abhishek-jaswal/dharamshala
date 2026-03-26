import PocketBase from 'pocketbase';

// SSR-safe singleton — only instantiated in the browser
let _pb: PocketBase | null = null;

export function getPb(): PocketBase {
  if (!_pb) {
    _pb = new PocketBase(
      process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
    );
  }
  return _pb;
}