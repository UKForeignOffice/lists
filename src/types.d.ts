declare module "axios/dist/node/axios.cjs" {
  import axios from "axios";
  export default axios;
}

interface Result<Success, ErrorType extends Error = Error> {
  result?: Success;
  error?: ErrorType;
}
