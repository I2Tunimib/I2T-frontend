import i18n from "i18next";
import { initReactI18next } from "react-i18next";
const itaJSON = require("./i18n-it.json");
const engJSON = require("./i18n-en.json");

const resources = {
    it: {
        translation: itaJSON
    },
    en: {
        translation: engJSON
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "it",
        interpolation: {
            escapeValue: false,
        }
    })



export default i18n;