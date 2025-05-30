export {};

declare global {
  interface Window {
    RUNTIME_CONFIG: {
      ENV: string;
    };
  }
}

// Alternative: If you prefer a more flexible approach
// declare global {
//   interface Window {
//     ENV: Record<string, string>;
//   }
// }