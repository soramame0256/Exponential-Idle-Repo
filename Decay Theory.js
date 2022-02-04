import { ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "exponent_decay_theory";
var name = "Exponent Decay Theory";
var description = "Simple";
var authors = "soramame_256";
var version = 1;

var currency;
var c1;
var c1Exp;
var init = () => {
    currency = theory.createCurrency();
    //基本変数
    let getDesc = (level) => "c_1=" + getC1(level).toString(0);
    c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10,Math.log2(2))));
    c1.getDescription= (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getInfo(c1.level + amount));
}
var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = \\frac{" + c1.level + "^{" + BigNumber.from(c1.level).pow(0.4) + "}} {c_1^{1.5}}";
    return result;
}
//var getTau = () => currency.value^0.1;
var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    if(c1.level >= 1){
        currency.value += dt * (BigNumber.from(c1.level).pow(BigNumber.from(c1.level).pow(0.4))/(getC1(c1.level).pow(1.5)));
    }
}
var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.1}"
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getTau = () => BigNumber.from(currency.value).pow(0.1)
init();