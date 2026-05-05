#!/usr/bin/env bun
import { spawn, type ChildProcess } from "child_process";

const PORT = 3000;

let untun: ChildProcess | null = null;

const vite = spawn("bun", ["x", "vite", "dev", "--port", String(PORT)], {
  stdio: ["inherit", "pipe", "pipe"],
});

vite.stdout.on("data", (data: Buffer) => {
  const text = data.toString();
  process.stdout.write(text);

  const match = text.match(/Local:\s+https?:\/\/localhost:(\d+)/);
  if (match && !untun) {
    const actualPort = parseInt(match[1], 10);
    console.log(`\n🔗 Starting tunnel on port ${actualPort}...\n`);

    untun = spawn("bun", ["x", "untun", "tunnel", "--port", String(actualPort)], {
      stdio: ["inherit", "pipe", "inherit"],
    });

    untun.stdout?.on("data", (data: Buffer) => {
      const text = data.toString();
      process.stdout.write(text);

      const urlMatch = text.match(/Tunnel ready at (https?:\/\/([^/\s]+))/);
      if (urlMatch) {
        const fullUrl = urlMatch[1];
        const hostname = urlMatch[2];
        console.log(`\n🌍 Public URL: ${fullUrl}\n`);

        // Send request to Vite to add host to allowedHosts
        fetch(`http://localhost:${actualPort}/__vite_ping`)
          .catch(() => {});
      }
    });

    untun.stderr?.on("data", (data: Buffer) => {
      process.stderr.write(data);
    });

    untun.on("error", (err: Error) => {
      console.error("Tunnel error:", err.message);
    });
  }
});

vite.stderr?.on("data", (data: Buffer) => {
  process.stderr.write(data);
});

const cleanup = () => {
  vite.kill();
  untun?.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

vite.on("error", cleanup);
