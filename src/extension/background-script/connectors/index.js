import Native from "./native";
import Lnd from "./lnd";
import CLightning from "./c-lightning";
import LndHub from "./lndhub";
import LnBits from "./lnbits";
import Base from "./base";

const connectors = {
  base: Base,
  native: Native,
  lnd: Lnd,
  lndhub: LndHub,
  lnbits: LnBits,
  clightning: CLightning,
};

export default connectors;
