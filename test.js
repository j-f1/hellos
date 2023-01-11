#!/usr/bin/env node

const max = 10;

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const langs = fs
  .readdirSync(path.join(__dirname, "src"))
  .filter((lang) => lang !== "test.sh");

const timingRe =
  /^(WARNING: The requested image's platform[^\n]+and no specific platform was requested\n)?\nreal\t(?<real>\d+m[\d.]+s)\nuser\t(?<user>\d+m[\d.]+s)\nsys\t(?<sys>\d+m[\d.]+s)\n/;

function parseTime(time) {
  const [minutes, seconds] = time.split("m");
  return (Number(minutes) * 60 + Number(seconds.slice(0, -1))) * 1000;
}

function run(lang) {
  const { stdout, stderr } = spawnSync("docker", ["run", `hellos-${lang}`], {
    encoding: "utf-8",
    stdio: "pipe",
  });
  const match = timingRe.exec(stderr);
  if (stdout !== "Hello, world!\n" || !match) {
    console.error(`Test failed for ${lang}!`);
    console.log({ stdout, stderr });
    return false;
  }
  return Object.fromEntries(
    Object.entries(match.groups).map(([key, value]) => [key, parseTime(value)])
  );
}
const results = {};
for (const lang of langs) {
  results[lang] = [];
  for (let i = 0; i < max; i++) {
    process.stdout.write(`\rRunning ${lang}... ${i + 1}/${max}     `);
    const result = run(lang);
    if (result) {
      results[lang].push(result);
    } else {
      break;
    }
  }
}
fs.writeFileSync(path.join(__dirname, "results.json"), JSON.stringify(results));

const averages = Object.keys(results)
  .map((lang) => {
    const { real, user, sys } = results[lang].reduce(
      (acc, { real, user, sys }) => ({
        real: acc.real + real,
        user: acc.user + user,
        sys: acc.sys + sys,
      }),
      { real: 0, user: 0, sys: 0 }
    );
    return {
      lang,
      real: real / max,
      user: user / max,
      sys: sys / max,
    };
  })
  .sort((a, b) => b.real - a.real);

console.log(
  "\n" + averages.map(({ lang, real }) => `${lang}: ${real}ms`).join("\n")
);
