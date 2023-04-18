import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  thresholds: {
    http_req_duration: ["p(99) < 3000"],
  },
  stages: [
    { duration: "30s", target: 25 },
    { duration: "1m", target: 25 },
    { duration: "20s", target: 0 },
  ],
};

export default function () {
  let res = http.get("http://localhost:3000/results/lawyers/France?readNotice=ok&region=paris&practiceArea=All&readDisclaimer=ok");
  // let res = http.get("http://localhost:3000/results?serviceType=lawyers&readNotice=ok&country=France&region=paris&practiceArea=All&readDisclaimer=ok");
  // Validate response status
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}