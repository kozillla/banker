"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var readline = require('readline');
var fs = require('fs');
var Command;
(function (Command) {
    Command["LOAN"] = "LOAN";
    Command["PAYMENT"] = "PAYMENT";
    Command["BALANCE"] = "BALANCE";
})(Command || (Command = {}));
var Banker = /** @class */ (function () {
    function Banker(filename) {
        var _this = this;
        this.setupReadingInterface = function () {
            _this.readInterface = readline.createInterface({
                input: fs.createReadStream(_this.filename)
            });
            _this.readInterface.on('line', function (line) {
                _this.parseLine(line);
            });
            _this.readInterface.on('error', function () {
                // TO DO
                // HANDLE ERRORS ON FILE READ
                console.error('ERROR CANT PROCESS : ', _this.filename);
            });
        };
        this.parseLoanInput = function (lineData) {
            var _a, _b;
            var loan = {
                bankName: lineData[1],
                borrowerName: lineData[2],
                principalAmount: Number(lineData[3]),
                numberOfYearsOfLoanPeriod: Number(lineData[4]),
                rateOfIntrest: Number(lineData[5]) * 0.01
            };
            _this.loanData = __assign(__assign({}, _this.loanData), (_a = {}, _a[loan.bankName] = __assign(__assign({}, _this.loanData[loan.bankName]), (_b = {}, _b[loan.borrowerName] = {
                principalAmount: loan.principalAmount,
                numberOfYearsOfLoanPeriod: loan.numberOfYearsOfLoanPeriod,
                rateOfInterest: loan.rateOfIntrest
            }, _b)), _a));
        };
        this.getBalance = function (balanceQuery) {
            var _a;
            // find borower data entry
            var customerLoanData = (_a = _this.loanData[balanceQuery.bankName]) === null || _a === void 0 ? void 0 : _a[balanceQuery.borrowerName];
            if (!customerLoanData) {
                console.error('ERROR IN PROCESSIN BALANCE');
                return '';
            }
            // calculate customer interest
            var intrest = customerLoanData.principalAmount *
                customerLoanData.numberOfYearsOfLoanPeriod *
                customerLoanData.rateOfInterest;
            // calculate customer total amount
            var totalAmount = customerLoanData.principalAmount + intrest;
            // calculate total amount of EMIS
            var totalEmi = customerLoanData.numberOfYearsOfLoanPeriod * 12;
            // claculate number of emis left
            var remainingEmis = totalEmi - balanceQuery.emiNumber;
            // calculate payment per emi
            var montlyEmi = Math.ceil(totalAmount / totalEmi);
            // calculate amount paid
            var paid = Math.ceil(balanceQuery.emiNumber * montlyEmi);
            // extra emis
            var extraEmis = 0;
            // process relevant payments per customer
            if (_this.paymentData[balanceQuery.bankName] &&
                _this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName] &&
                _this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName]
                    .emiNumber <= balanceQuery.emiNumber) {
                paid = Math.ceil(paid +
                    _this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName]
                        .lumpSumAmount);
                // calculate extra emis repayments
                extraEmis = Math.floor(_this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName]
                    .lumpSumAmount / montlyEmi);
            }
            return "".concat(balanceQuery.bankName, " ").concat(balanceQuery.borrowerName, " ").concat(Math.ceil(paid), " ").concat(Math.floor(remainingEmis - extraEmis));
        };
        this.printOutput = function (output) {
            console.log(output);
        };
        this.parseBalanceInput = function (lineData) {
            var balanceQuery = {
                bankName: lineData[1],
                borrowerName: lineData[2],
                emiNumber: Number(lineData[3])
            };
            return balanceQuery;
        };
        this.parsePayment = function (lineData) {
            var _a, _b;
            var paymentInput = {
                bankName: lineData[1],
                borrowerName: lineData[2],
                lumpSum: Number(lineData[3]),
                emiNumber: Number(lineData[4])
            };
            _this.paymentData = __assign(__assign({}, _this.paymentData), (_a = {}, _a[paymentInput.bankName] = __assign(__assign({}, _this.paymentData[paymentInput.bankName]), (_b = {}, _b[paymentInput.borrowerName] = {
                lumpSumAmount: paymentInput.lumpSum,
                emiNumber: paymentInput.emiNumber
            }, _b)), _a));
        };
        this.parseLine = function (line) {
            var lineData = line.split(' ');
            switch (lineData[0]) {
                case Command.LOAN:
                    _this.parseLoanInput(lineData);
                    break;
                case Command.PAYMENT:
                    _this.parsePayment(lineData);
                    break;
                case Command.BALANCE:
                    var parsedData = _this.parseBalanceInput(lineData);
                    var balance = _this.getBalance(parsedData);
                    _this.printOutput(balance);
                    break;
                default:
                    // TO DO
                    // HANDLE UNDEFINED COMMENT
                    break;
            }
        };
        this.filename = filename;
        this.setupReadingInterface();
        this.loanData = {};
        this.paymentData = {};
    }
    return Banker;
}());
exports["default"] = Banker;
