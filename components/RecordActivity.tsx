import { Platform } from "react-native";

const RecordActivity = Platform.select({
  native: () => require("./RecordActivity.native").default,
  default: () => require("./RecordActivity.web").default,
})();

export default RecordActivity;
