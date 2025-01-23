declare module "react-native-debug" {
   interface Debugger {
      (namespace: string): DebuggerInstance;
      enable(namespaces: string): void;
      disable(): void;
      enabled(namespace: string): boolean;
   }

   interface DebuggerInstance {
      (formatter: any, ...args: any[]): void;
      enabled: boolean;
      log: (...args: any[]) => any;
      namespace: string;
      extend(namespace: string, delimiter?: string): DebuggerInstance;
   }

   const debug: Debugger;
   export default debug;
}
