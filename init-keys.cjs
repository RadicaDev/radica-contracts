const fs = require("fs");
const path = require("path");
const { generatePrivateKey, privateKeyToAddress } = require("viem/accounts");

const privateKeyPath = path.join(__dirname, "./crypto-keys/privateKey.ts");
const addressPath = path.join(__dirname, "./crypto-keys/address.ts");

const cryptoKeysDir = path.dirname(privateKeyPath);
if (!fs.existsSync(cryptoKeysDir)) {
  fs.mkdirSync(cryptoKeysDir, { recursive: true });
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
}

if (fs.existsSync(addressPath)) {
  console.log("Address file already exists. No action needed.");
} else {
  if (fs.existsSync(privateKeyPath)) {
    const privateKeyContent = fs.readFileSync(privateKeyPath, "utf8");
    const privateKeyMatch = privateKeyContent.match(/const sk =\n  "(.*)";/);
    if (privateKeyMatch) {
      const secretKey = privateKeyMatch[1];
      const address = privateKeyToAddress(secretKey);
      const addressContent = `const address = "${address}";\n\nexport default address;\n`;
      writeFile(addressPath, addressContent);
      console.log(
        "Derived address from existing private key and saved to address.ts",
      );
    } else {
      console.error("Invalid format in privateKey.ts");
    }
  } else {
    const secretKey = generatePrivateKey();
    const privateKeyContent = `const sk =\n  "${secretKey}";\n\nexport default sk;\n`;
    writeFile(privateKeyPath, privateKeyContent);

    const address = privateKeyToAddress(secretKey);
    const addressContent = `const address = "${address}";\n\nexport default address;\n`;
    writeFile(addressPath, addressContent);

    console.log(
      "Generated new private key and address, saved to privateKey.ts and address.ts",
    );
  }
}
