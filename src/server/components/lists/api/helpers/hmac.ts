import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import * as config from "server/config";

export default function hmacSha512(req: Request, res: Response, next: NextFunction) {
  const secretKey = config.HMAC_SECRET;

  if (!secretKey) {
    res.status(500).send("hmacSha512: secret key not provided");
    return;
  }
  const signature = crypto.createHmac("sha512", secretKey);

  signature.update(JSON.stringify(req.body));

  const digest = signature.digest("hex");

  if (digest !== req.headers.signature) {
    res.status(401).send("Unauthorized");
    return;
  }

  next();
}
