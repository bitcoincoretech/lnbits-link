import memoizee from "memoizee";
import Base from "./base";

class CLightning extends Base {
  constructor(connectorConfig, globalSettings) {
    super(connectorConfig, globalSettings);
    this.config = connectorConfig;
    this.getInfo = memoizee(
      () => this.request("GET", "/v1/getinfo", undefined, {}),
      {
        promise: true,
        maxAge: 20000,
        preFetch: true,
        normalizer: () => "getinfo",
      }
    );
  }

  async request(method, path, args, defaultValues) {
    let body = null;
    let query = "";
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (method === "POST") {
      body = JSON.stringify(args);
      headers.append("Content-Type", "application/json");
    } else if (args !== undefined) {
      query = `?`;
    }
    if (this.config.macaroon) {
      headers.append("macaroon", this.config.macaroon);
    }
    try {
      const res = await fetch(this.config.url + path + query, {
        method,
        headers,
        body,
      });
      if (!res.ok) {
        let errBody;
        try {
          errBody = await res.json();
          if (!errBody.error) {
            throw new Error();
          }
        } catch (err) {
          throw new Error({
            statusText: res.statusText,
            status: res.status,
          });
        }
        console.log("errBody", errBody);
        throw errBody;
      }
      let data = await res.json();
      if (defaultValues) {
        data = Object.assign(Object.assign({}, defaultValues), data);
      }
      return { data };
    } catch (err) {
      console.error(`API error calling ${method} ${path}`, err);
      // Thrown errors must be JSON serializable, so include metadata if possible
      if (err.code || err.status || !err.message) {
        throw err;
      }
      throw err.message;
    }
  }
}

export default CLightning;
