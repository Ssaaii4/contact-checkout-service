"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
var express_1 = require("express");
var zod_1 = require("zod");
var client_1 = require("@prisma/client");
var app = (0, express_1.default)();
app.use(express_1.default.json());
var prisma = new client_1.PrismaClient();
var contactSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phoneNumber: zod_1.z.string().optional()
});
app.post('/checkout', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, _a, email, phoneNumber, matched, newContact, primary, _i, matched_1, contact, all, emails, phones, secondaries, exists;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                parsed = contactSchema.safeParse(req.body);
                if (!parsed.success)
                    return [2 /*return*/, res.status(400).json({ error: "Invalid input" })];
                _a = parsed.data, email = _a.email, phoneNumber = _a.phoneNumber;
                return [4 /*yield*/, prisma.contact.findMany({
                        where: {
                            OR: [
                                email ? { email: email } : undefined,
                                phoneNumber ? { phoneNumber: phoneNumber } : undefined
                            ].filter(Boolean)
                        },
                        orderBy: { createdAt: 'asc' }
                    })];
            case 1:
                matched = _c.sent();
                if (!(matched.length === 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.contact.create({
                        data: { email: email, phoneNumber: phoneNumber }
                    })];
            case 2:
                newContact = _c.sent();
                return [2 /*return*/, res.json({
                        contact: {
                            primaryContactId: newContact.id,
                            emails: [email].filter(Boolean),
                            phoneNumbers: [phoneNumber].filter(Boolean),
                            secondaryContactIds: []
                        }
                    })];
            case 3:
                primary = (_b = matched.find(function (c) { return c.linkPrecedence === 'primary'; })) !== null && _b !== void 0 ? _b : matched[0];
                _i = 0, matched_1 = matched;
                _c.label = 4;
            case 4:
                if (!(_i < matched_1.length)) return [3 /*break*/, 7];
                contact = matched_1[_i];
                if (!(contact.linkPrecedence === 'primary' && contact.id !== primary.id)) return [3 /*break*/, 6];
                return [4 /*yield*/, prisma.contact.update({
                        where: { id: contact.id },
                        data: {
                            linkPrecedence: 'secondary',
                            linkedId: primary.id
                        }
                    })];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7: return [4 /*yield*/, prisma.contact.findMany({
                    where: {
                        OR: [{ id: primary.id }, { linkedId: primary.id }]
                    }
                })];
            case 8:
                all = _c.sent();
                emails = new Set();
                phones = new Set();
                secondaries = [];
                all.forEach(function (c) {
                    if (c.email)
                        emails.add(c.email);
                    if (c.phoneNumber)
                        phones.add(c.phoneNumber);
                    if (c.linkPrecedence === 'secondary')
                        secondaries.push(c.id);
                });
                exists = all.some(function (c) { return c.email === email && c.phoneNumber === phoneNumber; });
                if (!(!exists && (email || phoneNumber))) return [3 /*break*/, 10];
                return [4 /*yield*/, prisma.contact.create({
                        data: {
                            email: email,
                            phoneNumber: phoneNumber,
                            linkPrecedence: 'secondary',
                            linkedId: primary.id
                        }
                    })];
            case 9:
                _c.sent();
                if (email)
                    emails.add(email);
                if (phoneNumber)
                    phones.add(phoneNumber);
                _c.label = 10;
            case 10:
                res.json({
                    contact: {
                        primaryContactId: primary.id,
                        emails: Array.from(emails),
                        phoneNumbers: Array.from(phones),
                        secondaryContactIds: secondaries
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
app.listen(3000, function () { return console.log('Running on http://localhost:3000'); });
