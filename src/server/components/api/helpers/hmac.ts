import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import * as config from "server/config";

export default function validateSignature(req: Request, res: Response, next: NextFunction) {
  const digest = createSignatureDigest(req.body);

  if (digest !== req.headers.signature) {
    res.status(401).send("Unauthorised");
    return;
  }

  next();
}

export function createSignatureDigest(data: Record<string, string>) {
  const secretKey = config.HMAC_SECRET!;

  const signature = crypto.createHmac("sha512", secretKey);
  signature.update(JSON.stringify(data));

  return signature.digest("hex");
}
