import crypto from "crypto";

onmessage = (event) => {
  console.log(event);

  if (event.data.type === "ENCRYPT") {
    const sharedKey = event.data.sharedKey;
    const base64File = event.data.base64File;

    const IV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(sharedKey, "hex"),
      IV
    );
    let encrypt = cipher.update(base64File, "base64", "hex");
    encrypt += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    const payload = IV.toString("hex") + encrypt + authTag;
    const payload64 = Buffer.from(payload, "hex").toString("base64");
    postMessage(payload64);
  } else {
    console.log("got", event.data.id);
    const payload = Buffer.from(event.data.base64String, "base64").toString(
      "hex"
    );
    const iv = payload.substr(0, 32);
    const encrypted = payload.substr(32, payload.length - 64);
    const authTag = payload.substr(payload.length - 32, 32);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(event.data.sharedKey, "hex"),
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decryptedMessage = decipher.update(encrypted, "hex", "base64");
    decryptedMessage += decipher.final("base64");

    let buffer = Buffer.from(
      decryptedMessage.substring(decryptedMessage.indexOf("base64") + 6),
      "base64"
    );
    console.log("sent");
    postMessage([buffer.buffer, event.data.id]);
  }
};
