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
var c1, c2;
var c1Exp;
var init = () => {
    currency = theory.createCurrency();
    //基本変数
    let getDesc = (level) => "c_1=" + getC1(level).toString(0);
    c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10,Math.log2(2))));
    c1.getDescription= (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    c1.boughtOrRefunded = (level) => theory.invalidatePrimaryEquation();
    c1.canBeRefunded = (_) => true;
    let getDesc2 = (level) => "c_2=" + getC2(level).toString(0);
    c2 = theory.createUpgrade(1, currency, new ExponentialCost(40,3));
    c2.getDescription= (_) => Utils.getMath(getDesc2(c2.level));
    c2.getInfo = (amount) => Utils.getMathTo(getDesc2(c2.level), getDesc2(c2.level + amount));
    c2.boughtOrRefunded = (level) => theory.invalidatePrimaryEquation();
    c2.canBeRefunded = (_) => true;
    //恒久アップグレード
    theory.createPublicationUpgrade(0, currency,BigNumber.from("10000"));
    //マイルストーン
    theory.setMilestoneCost(new LinearCost(100, 100));
    c1Exp = theory.createMilestoneUpgrade(0, 3);
    c1Exp.description = (_) => "\downarrow c_1 exponent by 0.1"
    c1Exp.info = (amount) => "\downarrow c_1 exponent by " + 0.1*amount
    c1Exp.canBeRefunded = (_) => true;
    
}
var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 55;
    let c1expred = 0;
    if(c1Exp.level >= 1) {
        c1expred += c1Exp.level*0.1;
    }
    let result = "\\dot{\\rho} = \\frac{" + c1.level + "^\\sqrt {c_2}} {c_1^{" + (1.5-c1expred) + "}}";
    return result;
}
var getTau = () => currency.value^0.1;
var tick = (elapsedTime, multiplier) => {
    let bonus = theory.publicationMultiplier;
    let dt = BigNumber.from(elapsedTime * multiplier*bonus);
    if(c1.level >= 1){
        currency.value += dt * (BigNumber.from(c1.level).pow(getC2(c2.level).pow(0.5))/(getC1(c1.level).pow(1.5)));
    }
}
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.1}"
var getPublicationMultiplier = (tau) => tau.pow(1.12)
var getPublicationMultiplierFormula = (symbol) => symbol + "^{1.12}"
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => Utils.getStepwisePowerSum(level, 2, 100000000, 1);
var getTau = () => BigNumber.from(currency.value).pow(0.1)
init();