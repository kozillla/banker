"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var banker_1 = require("../src/banker");
var sinon = require('sinon');
var readline = require('readline');
var fs = require('fs');
// stubs
sinon.stub(readline, 'createInterface').callsFake(function () {
    return {
        on: function () { }
    };
});
sinon.stub(fs, 'createReadStream');
describe('Banker functionality ', function () {
    it('test parsing LOAN command', function () {
        var data = {
            IDIDI: {
                Dale: {
                    principalAmount: 5000,
                    numberOfYearsOfLoanPeriod: 1,
                    rateOfInterest: 0.06
                }
            }
        };
        var banker = new banker_1["default"]('');
        (0, chai_1.expect)(banker.loanData).to.eql({});
        banker.parseLine('LOAN IDIDI Dale 5000 1 6');
        (0, chai_1.expect)(banker.loanData).to.eql(data);
    });
    it('test parsing PAYMENT command', function () {
        var data = { UON: { Shelly: { lumpSumAmount: 7000, emiNumber: 12 } } };
        var banker = new banker_1["default"]('');
        (0, chai_1.expect)(banker.paymentData).to.eql({});
        banker.parseLine('PAYMENT UON Shelly 7000 12');
        (0, chai_1.expect)(banker.paymentData).to.eql(data);
    });
    it('test BALANCE query command', function () {
        var banker = new banker_1["default"]('');
        (0, chai_1.expect)(banker.paymentData).to.eql({});
        banker.parseLine('LOAN IDIDI Dale 5000 1 6');
        banker.parseLine('PAYMENT IDIDI Dale 1000 5');
        var balanceQuery = {
            bankName: 'IDIDI',
            borrowerName: 'Dale',
            emiNumber: 3
        };
        var balanceString = banker.getBalance(balanceQuery);
        (0, chai_1.expect)(balanceString).to.equal('IDIDI Dale 1326 9');
    });
});
