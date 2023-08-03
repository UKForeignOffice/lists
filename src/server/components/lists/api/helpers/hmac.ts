import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import * as config from "server/config";

export default function hmacSha512(req: Request, res: Response, next: NextFunction) {
  const { result, error } = createSignatureDigest(req);

  if (error) {
    res.status(500).send(error);
    return;
  }

  if (result !== req.headers.signature) {
    res.status(401).send("Unauthorized");
    return;
  }

  next();
}

export function createSignatureDigest(req: Request) {
  const secretKey = config.HMAC_SECRET;

  if (!secretKey) {
    return { error: "Secret key not provided" };
  }

  const signature = crypto.createHmac("sha512", secretKey);
  signature.update(JSON.stringify(req.body));

  return { result: signature.digest("hex") };
}
