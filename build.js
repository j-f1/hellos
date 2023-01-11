#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const langs = fs
  .readdirSync(path.join(__dirname, "src"))
  .filter((lang) => lang !== "test.sh");
const dockerCompose =
  `version: "3.3"\nservices:\n  ` +
  langs
    .map((lang) =>
      [
        `${lang}:`,
        `  build:`,
        `    context: ./src`,
        `    dockerfile: ${lang}/Dockerfile`,
      ].join("\n  ")
    )
    .join("\n  ");

fs.writeFileSync(path.join(__dirname, "docker-compose.yml"), dockerCompose);

for (const lang of langs) {
  let dockerfile =
    fs.readFileSync(
      path.join(__dirname, "src", lang, "Dockerfile.prefix"),
      "utf-8"
    ) + "\n";
  if (dockerfile.includes("alpine"))
    dockerfile += "RUN apk add --no-cache bash\n";
  dockerfile += "WORKDIR /home\n";
  dockerfile += `COPY ${lang} /home\n`;
  dockerfile += "COPY test.sh /usr/bin/run-test\n";
  dockerfile += `ENTRYPOINT ["run-test", "${lang}"]`;
  fs.writeFileSync(path.join(__dirname, "src", lang, "Dockerfile"), dockerfile);
}
