import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      wallet_address: "Wallet Address",
      network: "Network",
      network_base: "Base Mainnet",
      contract_balance: "Contract Balance",
      timeout_days: "Timeout Period",
      time_left: "Time Left",
      owner: "Owner",
      beneficiary: "Beneficiary",
      set_beneficiary: "Set Beneficiary",
      keep_alive: "Send KeepAlive",
      withdraw: "Withdraw (Owner)",
      withdraw_beneficiary: "Withdraw (Beneficiary)",
      input_beneficiary: "Enter Beneficiary Address",
      switch_to_base: "Please switch to Base Mainnet to continue.",
      usage_title: "How to Use",
      usage_desc: "This tool allows you to set an inheritor for your ETH. If you don't interact for a period of time, your beneficiary can claim your assets.",
      total_deposit: "Your Total Deposited ETH"
    }
  },
  zh: {
    translation: {
      wallet_address: "钱包地址",
      network: "网络",
      network_base: "Base 主网",
      contract_balance: "合约余额",
      timeout_days: "超时时间",
      time_left: "剩余时间",
      owner: "拥有者",
      beneficiary: "继承人",
      set_beneficiary: "设置继承人",
      keep_alive: "发送续命",
      withdraw: "提现（拥有者）",
      withdraw_beneficiary: "提现（继承人）",
      input_beneficiary: "输入继承人地址",
      switch_to_base: "请切换到 Base 主网以继续操作。",
      usage_title: "使用说明",
      usage_desc: "本工具可设定继承人，在您长期未活跃时，让继承人领取您的资产。",
      total_deposit: "您存入的 ETH 总额"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // 默认语言
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;