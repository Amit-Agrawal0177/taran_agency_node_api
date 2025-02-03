const { default: axios } = require("axios");
module.exports = {
  async getenv() {
    try {
      msg_ret = await axios.post(
        `http://vault.9930i.com/v1/auth/userpass/login/${process.env.project}`,
        { password: process.env.vault_password }
      );
      options = {
        headers: { "X-Vault-Token": msg_ret.data.auth.client_token },
        form: {},
      };
      msg_ret = await axios.get(
        `https://vault.9930i.com/v1/kv/9930i/${process.env.project}.env`,
        options
      );
      process.env = msg_ret.data.data;
      // console.log(msg_ret.data.data);
      console.log("env setup done");
      return msg_ret.data.data;
    } catch (err) {
      console.log("error", err);
      process.exit(0);
    }
  },
};
