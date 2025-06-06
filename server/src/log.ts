let connection: any = null;
let isConnected = false;
const messageQueue: string[] = [];
const enableDebug = false; 

const log = {
  setConnection: (conn: any) => {
    connection = conn;
  },

  write: (message: string | object | undefined) => {
    if (message === undefined) {
      message = "undefined";
    }

    const logMessage = typeof message === "object" ? JSON.stringify(message) : message;

    if (isConnected && connection) {
      try {
        connection.console.log(logMessage);
      } catch (error) {
        console.error("[LSP Log] Connection log failed:", error);
      }
    } else {
      messageQueue.push(logMessage);
    }

    if (enableDebug) {
      console.log("[LSP Log] " + logMessage);
    }
  },

  flush: () => {
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift();
      if (msg && connection) {
        try {
          connection.console.log(msg);
        } catch (error) {
          console.error("[LSP Log] Connection log failed while flushing:", error);
        }
      }
    }
  },

  setConnected: (connected: boolean) => {
    isConnected = connected;
    if (isConnected) {
      log.flush();
    }
  },
};

export default log;
