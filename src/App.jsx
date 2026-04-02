import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, Search, Download, ArrowUpDown, ChevronRight, BarChart3, Filter,
  CheckCircle, AlertTriangle, XCircle, ArrowLeft, Info, Briefcase, PlusCircle,
  Trash2, Edit3, RefreshCw, Clock, X, Save
} from "lucide-react";

/* ═══════════════════════════════════════════
   COLORS & THEME
   ═══════════════════════════════════════════ */
const C = {
  bg: "#0a0a0f", card: "#13131a", cardHover: "#1a1a24", border: "#2a2a3a",
  primary: "#6366f1", primaryLight: "#818cf8", success: "#22c55e", warning: "#f59e0b",
  danger: "#ef4444", text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  pie: ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6","#14b8a6","#f97316","#84cc16","#e879f9","#fbbf24","#2dd4bf","#fb923c","#a78bfa","#34d399"],
};

/* ═══════════════════════════════════════════
   SECTOR / CATEGORY DATA
   ═══════════════════════════════════════════ */
const DEFENSIVE_SECTORS = ["食料品","医薬品","情報・通信","電力・ガス","サービス業","不動産","保険業","小売業","繊維製品"];
const CYCLICAL_SECTORS = ["輸送用機器","卸売業","鉄鋼","化学","機械","電気機器","銀行業","証券","建設業","海運業","ゴム製品","その他金融","金属製品","ガラス・土石"];

const MONTH_LABELS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

/* ═══════════════════════════════════════════
   SAMPLE PORTFOLIO (from spreadsheet 1)
   ═══════════════════════════════════════════ */
const INITIAL_PORTFOLIO = [
  {code:"1343",name:"NFJ-REIT",sector:"ETF・他",shares:25,buyPrice:1780,currentPrice:2063,annualDiv:75,divMonth:[3,6,9,12]},
  {code:"1414",name:"ショーボンドHD",sector:"建設業",shares:16,buyPrice:1216,currentPrice:1416,annualDiv:55,divMonth:[6,12]},
  {code:"1878",name:"大東建託",sector:"建設業",shares:7,buyPrice:2972,currentPrice:3687,annualDiv:170,divMonth:[3,9]},
  {code:"1928",name:"積水ハウス",sector:"建設業",shares:5,buyPrice:3375,currentPrice:3551,annualDiv:129,divMonth:[1,7]},
  {code:"1951",name:"エクシオグループ",sector:"建設業",shares:7,buyPrice:1511,currentPrice:2744,annualDiv:70,divMonth:[3,9]},
  {code:"2003",name:"日東富士製粉",sector:"食料品",shares:8,buyPrice:1453,currentPrice:1843,annualDiv:86,divMonth:[3,9]},
  {code:"2124",name:"JAC Recruitment",sector:"サービス業",shares:10,buyPrice:903,currentPrice:863,annualDiv:40,divMonth:[3]},
  {code:"2169",name:"CDS",sector:"サービス業",shares:5,buyPrice:1776,currentPrice:1820,annualDiv:70,divMonth:[12]},
  {code:"2296",name:"伊藤ハム米久HD",sector:"食料品",shares:2,buyPrice:3840,currentPrice:6010,annualDiv:130,divMonth:[3,9]},
  {code:"2393",name:"日本ケアサプライ",sector:"サービス業",shares:6,buyPrice:1905,currentPrice:2425,annualDiv:74,divMonth:[3]},
  {code:"2502",name:"アサヒ",sector:"食料品",shares:6,buyPrice:1705,currentPrice:1575,annualDiv:56,divMonth:[6,12]},
  {code:"3003",name:"ヒューリック",sector:"不動産",shares:4,buyPrice:1355,currentPrice:1860,annualDiv:52,divMonth:[6,12]},
  {code:"3076",name:"あいHD",sector:"情報・通信",shares:3,buyPrice:1838,currentPrice:2805,annualDiv:62,divMonth:[6]},
  {code:"3231",name:"野村不動産HD",sector:"不動産",shares:11,buyPrice:809,currentPrice:1038,annualDiv:45,divMonth:[3,9]},
  {code:"3333",name:"あさひ",sector:"小売業",shares:16,buyPrice:1355,currentPrice:1335,annualDiv:50,divMonth:[2]},
  {code:"3771",name:"システムリサーチ",sector:"情報・通信",shares:5,buyPrice:1832,currentPrice:1738,annualDiv:58,divMonth:[3,9]},
  {code:"3817",name:"SRAHD",sector:"情報・通信",shares:3,buyPrice:3870,currentPrice:4740,annualDiv:120,divMonth:[3]},
  {code:"3834",name:"朝日ネット",sector:"情報・通信",shares:14,buyPrice:633,currentPrice:663,annualDiv:28,divMonth:[3,9]},
  {code:"3901",name:"マークラインズ",sector:"情報・通信",shares:6,buyPrice:1678,currentPrice:1544,annualDiv:52,divMonth:[12]},
  {code:"4008",name:"住友精化",sector:"化学",shares:30,buyPrice:888,currentPrice:1236,annualDiv:56,divMonth:[3,9]},
  {code:"4042",name:"東ソー",sector:"化学",shares:3,buyPrice:1761,currentPrice:2390,annualDiv:80,divMonth:[3,9]},
  {code:"4097",name:"高圧ガス工業",sector:"化学",shares:8,buyPrice:1142,currentPrice:1130,annualDiv:42,divMonth:[3,9]},
  {code:"4205",name:"日本ゼオン",sector:"化学",shares:5,buyPrice:1843,currentPrice:1831,annualDiv:56,divMonth:[3,9]},
  {code:"4519",name:"中外製薬",sector:"医薬品",shares:3,buyPrice:2700,currentPrice:6800,annualDiv:88,divMonth:[6,12]},
  {code:"4540",name:"ツムラ",sector:"医薬品",shares:4,buyPrice:4200,currentPrice:4050,annualDiv:110,divMonth:[3,9]},
  {code:"4719",name:"アルファシステムズ",sector:"情報・通信",shares:3,buyPrice:2600,currentPrice:3200,annualDiv:92,divMonth:[3,9]},
  {code:"5108",name:"ブリヂストン",sector:"ゴム製品",shares:4,buyPrice:5200,currentPrice:5800,annualDiv:200,divMonth:[6,12]},
  {code:"6345",name:"アイチコーポレーション",sector:"機械",shares:3,buyPrice:1100,currentPrice:1250,annualDiv:45,divMonth:[3,9]},
  {code:"6436",name:"アマノ",sector:"機械",shares:2,buyPrice:3100,currentPrice:3400,annualDiv:110,divMonth:[3,9]},
  {code:"6785",name:"鈴木",sector:"電気機器",shares:5,buyPrice:1600,currentPrice:1850,annualDiv:70,divMonth:[6]},
  {code:"6809",name:"TOA",sector:"電気機器",shares:6,buyPrice:1250,currentPrice:1380,annualDiv:52,divMonth:[3,9]},
  {code:"7202",name:"いすゞ自動車",sector:"輸送用機器",shares:5,buyPrice:1950,currentPrice:2100,annualDiv:86,divMonth:[3,9]},
  {code:"7270",name:"SUBARU",sector:"輸送用機器",shares:3,buyPrice:2500,currentPrice:2900,annualDiv:100,divMonth:[3,9]},
  {code:"7974",name:"任天堂",sector:"その他製品",shares:1,buyPrice:8500,currentPrice:9200,annualDiv:206,divMonth:[3,9]},
  {code:"8316",name:"三井住友FG",sector:"銀行業",shares:3,buyPrice:6200,currentPrice:9800,annualDiv:330,divMonth:[3,9]},
  {code:"8418",name:"山口フィナンシャルG",sector:"銀行業",shares:5,buyPrice:1200,currentPrice:1580,annualDiv:52,divMonth:[3,9]},
];

/* ═══════════════════════════════════════════
   SCREENING SAMPLE DATA (from spreadsheet 2 style - 65 stocks)
   ═══════════════════════════════════════════ */
const SCREENING_DATA = [
  {no:1,market:"東証STD",code:"3205",sector:"繊維製品",name:"ダイドーリミテッド",price:1370,settlementMonth:"2026年3月",divPerShare:100,divYield:7.30,revenueIncCount:6,revenueIncRate:37.5,opsMarginLatest:-0.2,opsMargin10y:-4.0,consecutiveProfitYrs:0,epsIncCount:6,epsIncRate:37.5,roeLatest:"-",roe10y:13.4,equityRatio:30.5,opsCFNegCount:4,opsCFNegRate:25.0,netCashDivCapacity:-4.0},
  {no:6,market:"東証PRM",code:"7148",sector:"証券・商品先物",name:"FPG",price:2091,settlementMonth:"2026年9月",divPerShare:125.4,divYield:6.00,revenueIncCount:14,revenueIncRate:87.5,opsMarginLatest:19.6,opsMargin10y:38.1,consecutiveProfitYrs:0,epsIncCount:12,epsIncRate:75.0,roeLatest:32,roe10y:28.0,equityRatio:45.0,opsCFNegCount:8,opsCFNegRate:50.0,netCashDivCapacity:-0.1},
  {no:22,market:"東証PRM",code:"8595",sector:"証券・商品先物",name:"ジャフコグループ",price:475.52,settlementMonth:"2026年3月",divPerShare:133,divYield:5.37,revenueIncCount:9,revenueIncRate:56.3,opsMarginLatest:42.2,opsMargin10y:38.4,consecutiveProfitYrs:1,epsIncCount:10,epsIncRate:62.5,roeLatest:7,roe10y:11.1,equityRatio:83.0,opsCFNegCount:5,opsCFNegRate:31.3,netCashDivCapacity:0.7},
  {no:27,market:"東証STD",code:"367A",sector:"小売業",name:"プリモグローバルHD",price:2263,settlementMonth:"2026年8月",divPerShare:120,divYield:5.30,revenueIncCount:2,revenueIncRate:40.0,opsMarginLatest:11.2,opsMargin10y:8.7,consecutiveProfitYrs:4,epsIncCount:4,epsIncRate:80.0,roeLatest:10,roe10y:7.8,equityRatio:39.2,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:-9.7},
  {no:32,market:"東証PRM",code:"7172",sector:"証券・商品先物",name:"ジャパンインベストメントアドバイザー",price:2073,settlementMonth:"2026年12月",divPerShare:108,divYield:5.21,revenueIncCount:14,revenueIncRate:87.5,opsMarginLatest:48.7,opsMargin10y:39.0,consecutiveProfitYrs:2,epsIncCount:10,epsIncRate:62.5,roeLatest:14,roe10y:12.6,equityRatio:27.3,opsCFNegCount:9,opsCFNegRate:64.3,netCashDivCapacity:128.1},
  {no:37,market:"東証STD",code:"6927",sector:"電気機器",name:"ヘリオステクノHD",price:1394,settlementMonth:"2026年3月",divPerShare:72,divYield:5.16,revenueIncCount:8,revenueIncRate:50.0,opsMarginLatest:9.1,opsMargin10y:7.9,consecutiveProfitYrs:0,epsIncCount:8,epsIncRate:50.0,roeLatest:5,roe10y:8.5,equityRatio:76.1,opsCFNegCount:2,opsCFNegRate:12.5,netCashDivCapacity:3.4},
  {no:38,market:"東証PRM",code:"8219",sector:"小売業",name:"青山商事",price:2638,settlementMonth:"2026年3月",divPerShare:136,divYield:5.16,revenueIncCount:10,revenueIncRate:62.5,opsMarginLatest:6.4,opsMargin10y:4.0,consecutiveProfitYrs:0,epsIncCount:9,epsIncRate:56.3,roeLatest:5,roe10y:4.0,equityRatio:55.8,opsCFNegCount:2,opsCFNegRate:12.5,netCashDivCapacity:-10.4},
  {no:39,market:"東証STD",code:"7305",sector:"鉄鋼",name:"新家工業",price:5850,settlementMonth:"2026年3月",divPerShare:300,divYield:5.13,revenueIncCount:7,revenueIncRate:43.8,opsMarginLatest:3.8,opsMargin10y:4.9,consecutiveProfitYrs:1,epsIncCount:10,epsIncRate:62.5,roeLatest:7,roe10y:5.8,equityRatio:59.8,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:361.7},
  {no:40,market:"東証STD",code:"365A",sector:"繊維製品",name:"伊澤タオル",price:684,settlementMonth:"2026年2月",divPerShare:35.04,divYield:5.12,revenueIncCount:2,revenueIncRate:50.0,opsMarginLatest:6.5,opsMargin10y:8.1,consecutiveProfitYrs:0,epsIncCount:2,epsIncRate:50.0,roeLatest:15,roe10y:21.4,equityRatio:46.3,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:11.8},
  {no:42,market:"東証PRM",code:"5988",sector:"金属製品",name:"パイオラックス",price:1800,settlementMonth:"2026年3月",divPerShare:92,divYield:5.11,revenueIncCount:11,revenueIncRate:68.8,opsMarginLatest:3.8,opsMargin10y:10.5,consecutiveProfitYrs:0,epsIncCount:9,epsIncRate:56.3,roeLatest:2,roe10y:6.1,equityRatio:85.8,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:6.0},
  {no:55,market:"東証STD",code:"3571",sector:"繊維製品",name:"ソトー",price:796,settlementMonth:"2026年3月",divPerShare:40,divYield:5.03,revenueIncCount:8,revenueIncRate:50.0,opsMarginLatest:-1.5,opsMargin10y:-0.7,consecutiveProfitYrs:0,epsIncCount:7,epsIncRate:43.8,roeLatest:3,roe10y:5.3,equityRatio:74.4,opsCFNegCount:2,opsCFNegRate:12.5,netCashDivCapacity:5.1},
  // Additional well-known high-dividend stocks
  {no:100,market:"東証PRM",code:"8058",sector:"卸売業",name:"三菱商事",price:2580,settlementMonth:"2026年3月",divPerShare:100,divYield:3.88,revenueIncCount:13,revenueIncRate:81.3,opsMarginLatest:5.8,opsMargin10y:4.5,consecutiveProfitYrs:3,epsIncCount:12,epsIncRate:75.0,roeLatest:14,roe10y:11.2,equityRatio:38.5,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:15.2},
  {no:101,market:"東証PRM",code:"8001",sector:"卸売業",name:"伊藤忠商事",price:7200,settlementMonth:"2026年3月",divPerShare:200,divYield:2.78,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:6.2,opsMargin10y:5.1,consecutiveProfitYrs:5,epsIncCount:13,epsIncRate:81.3,roeLatest:16,roe10y:14.5,equityRatio:35.2,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:8.5},
  {no:102,market:"東証PRM",code:"9432",sector:"情報・通信",name:"NTT",price:155,settlementMonth:"2026年3月",divPerShare:5.2,divYield:3.35,revenueIncCount:14,revenueIncRate:87.5,opsMarginLatest:14.2,opsMargin10y:13.1,consecutiveProfitYrs:2,epsIncCount:13,epsIncRate:81.3,roeLatest:14,roe10y:12.8,equityRatio:35.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:4.2},
  {no:103,market:"東証PRM",code:"2914",sector:"食料品",name:"JT",price:4200,settlementMonth:"2025年12月",divPerShare:194,divYield:4.62,revenueIncCount:10,revenueIncRate:62.5,opsMarginLatest:24.5,opsMargin10y:22.0,consecutiveProfitYrs:1,epsIncCount:10,epsIncRate:62.5,roeLatest:13,roe10y:14.2,equityRatio:50.5,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:3.8},
  {no:104,market:"東証PRM",code:"4452",sector:"化学",name:"花王",price:5900,settlementMonth:"2025年12月",divPerShare:152,divYield:2.58,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:10.5,opsMargin10y:12.8,consecutiveProfitYrs:0,epsIncCount:10,epsIncRate:62.5,roeLatest:9,roe10y:15.2,equityRatio:56.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:2.1},
  {no:105,market:"東証PRM",code:"8766",sector:"保険業",name:"東京海上HD",price:5600,settlementMonth:"2026年3月",divPerShare:162,divYield:2.89,revenueIncCount:13,revenueIncRate:81.3,opsMarginLatest:10.5,opsMargin10y:8.2,consecutiveProfitYrs:4,epsIncCount:12,epsIncRate:75.0,roeLatest:17,roe10y:11.5,equityRatio:16.2,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:5.5},
  {no:106,market:"東証PRM",code:"9433",sector:"情報・通信",name:"KDDI",price:5000,settlementMonth:"2026年3月",divPerShare:145,divYield:2.90,revenueIncCount:15,revenueIncRate:93.8,opsMarginLatest:19.8,opsMargin10y:18.5,consecutiveProfitYrs:3,epsIncCount:14,epsIncRate:87.5,roeLatest:14,roe10y:14.8,equityRatio:44.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:6.2},
  {no:107,market:"東証PRM",code:"8306",sector:"銀行業",name:"三菱UFJ FG",price:1850,settlementMonth:"2026年3月",divPerShare:50,divYield:2.70,revenueIncCount:10,revenueIncRate:62.5,opsMarginLatest:28.5,opsMargin10y:24.0,consecutiveProfitYrs:2,epsIncCount:10,epsIncRate:62.5,roeLatest:9,roe10y:6.8,equityRatio:5.2,opsCFNegCount:2,opsCFNegRate:12.5,netCashDivCapacity:12.0},
  {no:108,market:"東証PRM",code:"8316",sector:"銀行業",name:"三井住友FG",price:9800,settlementMonth:"2026年3月",divPerShare:330,divYield:3.37,revenueIncCount:11,revenueIncRate:68.8,opsMarginLatest:30.2,opsMargin10y:26.5,consecutiveProfitYrs:3,epsIncCount:11,epsIncRate:68.8,roeLatest:10,roe10y:7.5,equityRatio:5.8,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:9.8},
  {no:109,market:"東証PRM",code:"8031",sector:"卸売業",name:"三井物産",price:3200,settlementMonth:"2026年3月",divPerShare:120,divYield:3.75,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:5.5,opsMargin10y:4.8,consecutiveProfitYrs:4,epsIncCount:12,epsIncRate:75.0,roeLatest:13,roe10y:10.5,equityRatio:38.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:11.0},
  {no:110,market:"東証PRM",code:"9434",sector:"情報・通信",name:"ソフトバンク",price:195,settlementMonth:"2026年3月",divPerShare:8.6,divYield:4.41,revenueIncCount:9,revenueIncRate:75.0,opsMarginLatest:17.2,opsMargin10y:16.0,consecutiveProfitYrs:1,epsIncCount:7,epsIncRate:58.3,roeLatest:24,roe10y:32.5,equityRatio:13.5,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:-2.5},
  {no:111,market:"東証PRM",code:"4502",sector:"医薬品",name:"武田薬品工業",price:4100,settlementMonth:"2026年3月",divPerShare:188,divYield:4.59,revenueIncCount:11,revenueIncRate:68.8,opsMarginLatest:9.8,opsMargin10y:11.2,consecutiveProfitYrs:0,epsIncCount:8,epsIncRate:50.0,roeLatest:5,roe10y:5.8,equityRatio:42.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:1.2},
  {no:112,market:"東証PRM",code:"8593",sector:"その他金融",name:"三菱HCキャピタル",price:1050,settlementMonth:"2026年3月",divPerShare:40,divYield:3.81,revenueIncCount:14,revenueIncRate:87.5,opsMarginLatest:11.2,opsMargin10y:9.5,consecutiveProfitYrs:5,epsIncCount:13,epsIncRate:81.3,roeLatest:9,roe10y:8.2,equityRatio:15.0,opsCFNegCount:2,opsCFNegRate:12.5,netCashDivCapacity:3.5},
  {no:113,market:"東証PRM",code:"1928",sector:"建設業",name:"積水ハウス",price:3551,settlementMonth:"2026年1月",divPerShare:129,divYield:3.63,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:8.5,opsMargin10y:7.8,consecutiveProfitYrs:2,epsIncCount:11,epsIncRate:68.8,roeLatest:12,roe10y:11.0,equityRatio:52.0,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:4.0},
  {no:114,market:"東証PRM",code:"8725",sector:"保険業",name:"MS&ADインシュアランスG",price:3500,settlementMonth:"2026年3月",divPerShare:145,divYield:4.14,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:8.2,opsMargin10y:5.5,consecutiveProfitYrs:3,epsIncCount:12,epsIncRate:75.0,roeLatest:15,roe10y:8.5,equityRatio:15.5,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:7.2},
  {no:115,market:"東証PRM",code:"5108",sector:"ゴム製品",name:"ブリヂストン",price:5800,settlementMonth:"2025年12月",divPerShare:200,divYield:3.45,revenueIncCount:10,revenueIncRate:62.5,opsMarginLatest:11.5,opsMargin10y:10.8,consecutiveProfitYrs:2,epsIncCount:10,epsIncRate:62.5,roeLatest:12,roe10y:11.0,equityRatio:58.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:5.8},
  {no:116,market:"東証PRM",code:"9101",sector:"海運業",name:"日本郵船",price:5200,settlementMonth:"2026年3月",divPerShare:260,divYield:5.00,revenueIncCount:10,revenueIncRate:62.5,opsMarginLatest:6.8,opsMargin10y:4.2,consecutiveProfitYrs:1,epsIncCount:9,epsIncRate:56.3,roeLatest:15,roe10y:9.5,equityRatio:52.0,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:18.5},
  {no:117,market:"東証PRM",code:"8053",sector:"卸売業",name:"住友商事",price:3800,settlementMonth:"2026年3月",divPerShare:150,divYield:3.95,revenueIncCount:11,revenueIncRate:68.8,opsMarginLatest:5.2,opsMargin10y:4.0,consecutiveProfitYrs:2,epsIncCount:11,epsIncRate:68.8,roeLatest:12,roe10y:9.2,equityRatio:35.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:7.5},
  {no:118,market:"東証PRM",code:"4063",sector:"化学",name:"信越化学工業",price:5500,settlementMonth:"2026年3月",divPerShare:120,divYield:2.18,revenueIncCount:13,revenueIncRate:81.3,opsMarginLatest:32.0,opsMargin10y:28.5,consecutiveProfitYrs:1,epsIncCount:12,epsIncRate:75.0,roeLatest:12,roe10y:13.5,equityRatio:82.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:22.0},
  {no:119,market:"東証PRM",code:"2802",sector:"食料品",name:"味の素",price:6200,settlementMonth:"2026年3月",divPerShare:74,divYield:1.19,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:13.5,opsMargin10y:9.8,consecutiveProfitYrs:4,epsIncCount:13,epsIncRate:81.3,roeLatest:16,roe10y:10.5,equityRatio:52.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:8.5},
  {no:120,market:"東証PRM",code:"7751",sector:"電気機器",name:"キヤノン",price:4800,settlementMonth:"2025年12月",divPerShare:150,divYield:3.13,revenueIncCount:9,revenueIncRate:56.3,opsMarginLatest:9.2,opsMargin10y:8.0,consecutiveProfitYrs:2,epsIncCount:9,epsIncRate:56.3,roeLatest:10,roe10y:8.5,equityRatio:60.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:4.5},
  {no:121,market:"東証PRM",code:"8008",sector:"卸売業",name:"4℃ HD",price:2200,settlementMonth:"2026年2月",divPerShare:83,divYield:3.77,revenueIncCount:8,revenueIncRate:50.0,opsMarginLatest:8.5,opsMargin10y:9.2,consecutiveProfitYrs:1,epsIncCount:8,epsIncRate:50.0,roeLatest:8,roe10y:9.5,equityRatio:68.0,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:6.2},
  {no:122,market:"東証PRM",code:"9986",sector:"卸売業",name:"蔵王産業",price:1850,settlementMonth:"2026年3月",divPerShare:80,divYield:4.32,revenueIncCount:10,revenueIncRate:62.5,opsMarginLatest:12.8,opsMargin10y:10.5,consecutiveProfitYrs:2,epsIncCount:10,epsIncRate:62.5,roeLatest:8,roe10y:7.5,equityRatio:82.5,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:12.5},
  {no:123,market:"東証STD",code:"9769",sector:"サービス業",name:"学究社",price:2150,settlementMonth:"2026年3月",divPerShare:100,divYield:4.65,revenueIncCount:11,revenueIncRate:68.8,opsMarginLatest:22.5,opsMargin10y:18.0,consecutiveProfitYrs:3,epsIncCount:11,epsIncRate:68.8,roeLatest:25,roe10y:20.0,equityRatio:72.0,opsCFNegCount:0,opsCFNegRate:0.0,netCashDivCapacity:8.0},
  {no:124,market:"東証PRM",code:"7466",sector:"卸売業",name:"SPK",price:2100,settlementMonth:"2026年3月",divPerShare:88,divYield:4.19,revenueIncCount:14,revenueIncRate:87.5,opsMarginLatest:7.5,opsMargin10y:6.8,consecutiveProfitYrs:6,epsIncCount:13,epsIncRate:81.3,roeLatest:9,roe10y:8.0,equityRatio:55.0,opsCFNegCount:1,opsCFNegRate:6.3,netCashDivCapacity:5.5},
  {no:125,market:"東証PRM",code:"8584",sector:"その他金融",name:"ジャックス",price:4200,settlementMonth:"2026年3月",divPerShare:210,divYield:5.00,revenueIncCount:12,revenueIncRate:75.0,opsMarginLatest:9.0,opsMargin10y:8.5,consecutiveProfitYrs:2,epsIncCount:11,epsIncRate:68.8,roeLatest:10,roe10y:9.5,equityRatio:8.5,opsCFNegCount:3,opsCFNegRate:18.8,netCashDivCapacity:2.0},
];

/* ═══════════════════════════════════════════
   20-YEAR ANALYSIS SAMPLE DATA (for individual analysis)
   ═══════════════════════════════════════════ */
const YEARS20 = Array.from({length:20},(_,i)=>2005+i);
let _s=42;
function sRand(){_s=(_s*16807)%2147483647;return(_s-1)/2147483646}

const ANALYSIS_STOCKS_RAW = [
  {code:"7203",name:"トヨタ自動車",sector:"輸送用機器",divYield:2.8,rs:21000,rg:1.6,es:150,eg:2.0,om:7.5,ot:2.5,er:38,ert:5,cs:3500,cg:1.5,cas:4000,cag:1.8,ds:50,dg:3.0},
  {code:"9432",name:"NTT",sector:"情報・通信",divYield:3.3,rs:10800,rg:0.5,es:120,eg:1.8,om:13,ot:2,er:33,ert:8,cs:2800,cg:0.8,cas:1000,cag:0.5,ds:40,dg:3.5},
  {code:"2914",name:"JT",sector:"食料品",divYield:4.8,rs:2200,rg:0.3,es:130,eg:0.8,om:22,ot:3,er:48,ert:6,cs:500,cg:0.6,cas:300,cag:0.4,ds:75,dg:1.5},
  {code:"8058",name:"三菱商事",sector:"卸売業",divYield:3.5,rs:5500,rg:1.2,es:180,eg:2.5,om:4.5,ot:3,er:32,ert:10,cs:600,cg:1.8,cas:800,cag:1.2,ds:40,dg:4.0},
  {code:"8001",name:"伊藤忠商事",sector:"卸売業",divYield:3.2,rs:4400,rg:1.0,es:140,eg:2.8,om:5,ot:2.5,er:28,ert:10,cs:500,cg:1.5,cas:500,cag:1.0,ds:30,dg:5.0},
  {code:"4452",name:"花王",sector:"化学",divYield:2.9,rs:1200,rg:0.4,es:100,eg:1.2,om:12,ot:1.5,er:52,ert:8,cs:200,cg:0.6,cas:250,cag:0.5,ds:52,dg:2.2},
  {code:"8766",name:"東京海上HD",sector:"保険業",divYield:3.6,rs:3500,rg:0.8,es:160,eg:2.2,om:9,ot:2,er:14,ert:6,cs:400,cg:1.0,cas:600,cag:0.8,ds:45,dg:4.5},
  {code:"9433",name:"KDDI",sector:"情報・通信",divYield:3.1,rs:3500,rg:0.6,es:110,eg:1.5,om:18,ot:1.5,er:42,ert:8,cs:800,cg:0.7,cas:300,cag:0.6,ds:35,dg:3.8},
  {code:"8306",name:"三菱UFJ FG",sector:"銀行業",divYield:3.8,rs:5800,rg:0.3,es:50,eg:2.0,om:22,ot:2,er:4.5,ert:1.5,cs:1500,cg:0.5,cas:50000,cag:0.3,ds:12,dg:4.5},
  {code:"8316",name:"三井住友FG",sector:"銀行業",divYield:4.0,rs:4200,rg:0.4,es:200,eg:1.8,om:25,ot:1.5,er:5,ert:1,cs:1200,cg:0.6,cas:40000,cag:0.4,ds:80,dg:3.5},
  {code:"4063",name:"信越化学工業",sector:"化学",divYield:2.2,rs:1000,rg:1.0,es:150,eg:2.5,om:25,ot:5,er:78,ert:5,cs:250,cg:1.5,cas:500,cag:2.0,ds:40,dg:3.0},
  {code:"5108",name:"ブリヂストン",sector:"ゴム製品",divYield:3.2,rs:2800,rg:0.4,es:120,eg:1.5,om:10,ot:1.5,er:55,ert:5,cs:400,cg:0.5,cas:300,cag:0.3,ds:50,dg:2.5},
  {code:"9101",name:"日本郵船",sector:"海運業",divYield:5.0,rs:1800,rg:0.8,es:40,eg:3.0,om:3,ot:4,er:30,ert:15,cs:150,cg:2.0,cas:200,cag:2.0,ds:20,dg:6.0},
  {code:"8593",name:"三菱HCキャピタル",sector:"その他金融",divYield:4.5,rs:800,rg:0.6,es:40,eg:2.0,om:10,ot:1,er:12,ert:3,cs:300,cg:0.8,cas:200,cag:0.5,ds:12,dg:4.0},
  {code:"1928",name:"積水ハウス",sector:"建設業",divYield:3.8,rs:1600,rg:0.5,es:80,eg:1.8,om:7,ot:2,er:48,ert:5,cs:150,cg:0.6,cas:200,cag:0.4,ds:36,dg:3.0},
];

const oR=Math.random;Math.random=sRand;
const ANALYSIS_STOCKS=ANALYSIS_STOCKS_RAW.map(s=>{
  const fin=YEARS20.map((yr,i)=>{const t=i/19;const n=()=>(Math.random()-0.5)*0.08;
    const rev=s.rs*(1+s.rg*t+n()*s.rs*0.3);const om=s.om+s.ot*t+n()*3;
    const eps=s.es*(1+s.eg*t+n()*2);const er2=s.er+s.ert*t+n()*3;
    const cf=s.cs*(1+s.cg*t+n()*0.5);const ca=s.cas*(1+s.cag*t+n()*0.3);
    const dv=s.ds*(1+s.dg*t+n()*0.1);const pr=eps>0?(dv/eps)*100:0;
    return{year:yr,revenue:Math.round(rev),opsMargin:+(om.toFixed(1)),eps:+(eps.toFixed(1)),
      equityRatio:+(er2.toFixed(1)),opsCF:Math.round(cf),cash:Math.round(ca),
      dividend:+(dv.toFixed(1)),payoutRatio:+(pr.toFixed(1))}});
  return{...s,financials:fin}});
Math.random=oR;

function analyzeStock(stock){
  const d=stock.financials,l5=d.slice(-5),m5=d.slice(-10,-5);
  const avg=(arr,k)=>arr.reduce((a,b)=>a+b[k],0)/arr.length;
  const revG=((avg(l5,"revenue")/avg(m5,"revenue")-1)*100);
  const epsG=((avg(l5,"eps")/avg(m5,"eps")-1)*100);
  const om=avg(l5,"opsMargin"),er=avg(l5,"equityRatio"),pr=avg(l5,"payoutRatio");
  const cfOk=l5.every(y=>y.opsCF>0);
  const cashUp=d[d.length-1].cash>d[d.length-6].cash;
  let conDiv=0;for(let i=d.length-1;i>0;i--){if(d[i].dividend>=d[i-1].dividend)conDiv++;else break}
  const items=[
    {label:"売上高成長(5年)",value:`${revG.toFixed(1)}%`,status:revG>5?"pass":revG>0?"caution":"fail"},
    {label:"EPS成長(5年)",value:`${epsG.toFixed(1)}%`,status:epsG>5?"pass":epsG>0?"caution":"fail"},
    {label:"営業利益率",value:`${om.toFixed(1)}%`,status:om>=8?"pass":om>=5?"caution":"fail"},
    {label:"自己資本比率",value:`${er.toFixed(1)}%`,status:er>=60?"pass":er>=40?"caution":"fail"},
    {label:"営業CF(5年黒字)",value:cfOk?"全て黒字":"赤字あり",status:cfOk?"pass":"fail"},
    {label:"現金等残高",value:`${d[d.length-1].cash.toLocaleString()}億円`,status:cashUp?"pass":"caution"},
    {label:"連続増配",value:`${conDiv}年`,status:conDiv>=10?"pass":conDiv>=5?"caution":"fail"},
    {label:"配当性向",value:`${pr.toFixed(1)}%`,status:pr>=30&&pr<=60?"pass":pr<30||pr<=70?"caution":"fail"},
  ];
  const pc=items.filter(i=>i.status==="pass").length;
  return{items,passCount:pc,scorePercent:Math.round((pc*2+items.filter(i=>i.status==="caution").length)/(items.length*2)*100),
    metrics:{divYield:stock.divYield,revenueGrowth5y:revG,epsGrowth5y:epsG,latestOpsMargin:om,latestEquityRatio:er,
      latestPayoutRatio:pr,allOpsCFPositive:cfOk,consecutiveDivIncrease:conDiv}}
}

/* ═══════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════ */
const StatusBadge=({status})=>{
  const c={pass:{l:"合格",bg:"rgba(34,197,94,0.15)",c:C.success,i:<CheckCircle size={13}/>},
    caution:{l:"注意",bg:"rgba(245,158,11,0.15)",c:C.warning,i:<AlertTriangle size={13}/>},
    fail:{l:"不合格",bg:"rgba(239,68,68,0.15)",c:C.danger,i:<XCircle size={13}/>}};
  const s=c[status];
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:16,background:s.bg,color:s.c,fontSize:11,fontWeight:600}}>{s.i} {s.l}</span>};

const ScoreGauge=({percent})=>{
  const r=50,circ=2*Math.PI*r,off=circ*(1-percent/100);
  const gc=percent>=75?C.success:percent>=50?C.warning:C.danger;
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke={C.border} strokeWidth="8"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={gc} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 0.8s ease"}}/>
      <text x="60" y="56" textAnchor="middle" fill={C.text} fontSize="28" fontWeight="bold">{percent}</text>
      <text x="60" y="76" textAnchor="middle" fill={C.textMuted} fontSize="12">/ 100</text>
    </svg>
    <span style={{color:gc,fontWeight:700,fontSize:13,marginTop:2}}>{percent>=75?"優良":percent>=50?"普通":"要注意"}</span>
  </div>};

const colorForGrade=(val,thresholds)=>{
  if(thresholds.higher){return val>=thresholds.excellent?C.success:val>=thresholds.good?"#22d3ee":val>=thresholds.caution?C.warning:C.danger}
  return val<=thresholds.excellent?C.success:val<=thresholds.good?"#22d3ee":val<=thresholds.caution?C.warning:C.danger};

/* ═══════════════════════════════════════════
   TAB 1: PORTFOLIO MANAGEMENT
   ═══════════════════════════════════════════ */
const PortfolioTab=({onNavigateToAnalysis})=>{
  const [holdings,setHoldings]=useState(INITIAL_PORTFOLIO);
  const [showAddModal,setShowAddModal]=useState(false);
  const [editingIdx,setEditingIdx]=useState(null);
  const [form,setForm]=useState({code:"",name:"",sector:"",shares:0,buyPrice:0,currentPrice:0,annualDiv:0,divMonth:""});

  const totalBuyAmount=useMemo(()=>holdings.reduce((a,h)=>a+h.shares*h.buyPrice,0),[holdings]);
  const totalCurrentValue=useMemo(()=>holdings.reduce((a,h)=>a+h.shares*h.currentPrice,0),[holdings]);
  const totalPL=totalCurrentValue-totalBuyAmount;
  const plPercent=totalBuyAmount>0?((totalPL/totalBuyAmount)*100).toFixed(2):0;
  const totalAnnualDiv=useMemo(()=>holdings.reduce((a,h)=>a+h.shares*h.annualDiv*0.79685,0),[holdings]);
  const divYield=totalCurrentValue>0?((holdings.reduce((a,h)=>a+h.shares*h.annualDiv,0)/totalCurrentValue)*100).toFixed(2):0;

  // Sector allocation
  const sectorData=useMemo(()=>{
    const map={};holdings.forEach(h=>{const v=h.shares*h.currentPrice;map[h.sector]=(map[h.sector]||0)+v});
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);},[holdings]);

  // Monthly dividend
  const monthlyDiv=useMemo(()=>{
    const m=Array(12).fill(0);
    holdings.forEach(h=>{if(h.divMonth){const perPayment=h.shares*h.annualDiv*0.79685/h.divMonth.length;h.divMonth.forEach(mo=>m[mo-1]+=perPayment)}});
    return m.map((v,i)=>({month:MONTH_LABELS[i],amount:Math.round(v)}));},[holdings]);

  // Yield distribution
  const yieldDist=useMemo(()=>{
    const buckets={"~1%":0,"1~2%":0,"2~3%":0,"3~4%":0,"4~5%":0,"5%~":0};
    holdings.forEach(h=>{const y=h.currentPrice>0?(h.annualDiv/h.currentPrice*100):0;
      if(y<1)buckets["~1%"]++;else if(y<2)buckets["1~2%"]++;else if(y<3)buckets["2~3%"]++;
      else if(y<4)buckets["3~4%"]++;else if(y<5)buckets["4~5%"]++;else buckets["5%~"]++});
    return Object.entries(buckets).map(([range,count])=>({range,count}));},[holdings]);

  // Defensive / Cyclical
  const defValue=useMemo(()=>holdings.filter(h=>DEFENSIVE_SECTORS.includes(h.sector)).reduce((a,h)=>a+h.shares*h.currentPrice,0),[holdings]);
  const cycValue=totalCurrentValue-defValue;

  // Top dividend
  const topDiv=useMemo(()=>[...holdings].sort((a,b)=>(b.shares*b.annualDiv)-(a.shares*a.annualDiv)).slice(0,10),[holdings]);

  const openAdd=()=>{setForm({code:"",name:"",sector:"",shares:0,buyPrice:0,currentPrice:0,annualDiv:0,divMonth:""});setEditingIdx(null);setShowAddModal(true)};
  const openEdit=(i)=>{const h=holdings[i];setForm({...h,divMonth:h.divMonth.join(",")});setEditingIdx(i);setShowAddModal(true)};
  const saveHolding=()=>{
    const newH={...form,shares:Number(form.shares),buyPrice:Number(form.buyPrice),currentPrice:Number(form.currentPrice),annualDiv:Number(form.annualDiv),divMonth:form.divMonth.split(",").map(Number).filter(Boolean)};
    if(editingIdx!==null){const arr=[...holdings];arr[editingIdx]=newH;setHoldings(arr)}
    else setHoldings([...holdings,newH]);
    setShowAddModal(false)};
  const deleteHolding=(i)=>{setHoldings(holdings.filter((_,j)=>j!==i))};

  const Card=({children,style})=><div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px 20px",...style}}>{children}</div>;
  const StatCard=({label,value,sub,color})=><Card><div style={{color:C.textMuted,fontSize:12,marginBottom:4}}>{label}</div><div style={{color:color||C.text,fontSize:22,fontWeight:800}}>{value}</div>{sub&&<div style={{color:C.textDim,fontSize:11,marginTop:2}}>{sub}</div>}</Card>;

  return <div>
    {/* Summary Cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
      <StatCard label="保有資産額" value={`¥${totalCurrentValue.toLocaleString()}`}/>
      <StatCard label="購入額" value={`¥${totalBuyAmount.toLocaleString()}`}/>
      <StatCard label="損益額" value={`${totalPL>=0?"+":""}¥${totalPL.toLocaleString()}`} sub={`(${totalPL>=0?"+":""}${plPercent}%)`} color={totalPL>=0?C.success:C.danger}/>
      <StatCard label="配当利回り" value={`${divYield}%`} color={C.primaryLight}/>
      <StatCard label="年間配当金(税引後)" value={`¥${Math.round(totalAnnualDiv).toLocaleString()}`} color={C.success}/>
    </div>

    {/* Charts Row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,380px),1fr))",gap:16,marginBottom:20}}>
      {/* Sector Pie */}
      <Card><div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:8}}>業種割合（評価額）</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart><Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name} ${(percent*100).toFixed(1)}%`} labelLine={true} style={{fontSize:10}}>
            {sectorData.map((_,i)=><Cell key={i} fill={C.pie[i%C.pie.length]}/>)}</Pie>
            <Tooltip formatter={(v)=>`¥${v.toLocaleString()}`} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
          </PieChart></ResponsiveContainer></Card>

      {/* Monthly Dividend */}
      <Card><div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:8}}>配当金支払額（月別・税引後）</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyDiv}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/>
            <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
            <Bar dataKey="amount" fill={C.primary} radius={[4,4,0,0]} name="配当金(税引後)"/></BarChart></ResponsiveContainer></Card>

      {/* Yield Distribution */}
      <Card><div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:8}}>銘柄数（利回り別）</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={yieldDist}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="range" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}} allowDecimals={false}/>
            <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
            <Bar dataKey="count" fill={C.success} radius={[4,4,0,0]} name="銘柄数"/></BarChart></ResponsiveContainer></Card>

      {/* Defensive/Cyclical */}
      <Card><div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:8}}>銘柄構成比（評価額）</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart><Pie data={[{name:"ディフェンシブ",value:defValue},{name:"景気敏感",value:cycValue}]} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name} ${(percent*100).toFixed(1)}%`} style={{fontSize:11}}>
            <Cell fill="#6366f1"/><Cell fill="#f59e0b"/></Pie>
            <Tooltip formatter={(v)=>`¥${v.toLocaleString()}`} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/></PieChart></ResponsiveContainer></Card>
    </div>

    {/* Top Dividends */}
    <Card style={{marginBottom:20}}>
      <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:12}}>配当金 Top10</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
        {topDiv.map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div><div style={{color:C.text,fontWeight:600,fontSize:13}}>{i+1}. {h.name}</div><div style={{color:C.textDim,fontSize:11}}>{h.code}</div></div>
          <div style={{color:C.success,fontWeight:700,fontSize:13}}>¥{Math.round(h.shares*h.annualDiv*0.79685).toLocaleString()}</div>
        </div>)}
      </div>
    </Card>

    {/* Holdings Table */}
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{color:C.text,fontWeight:700,fontSize:14}}>保有銘柄一覧 ({holdings.length}銘柄)</div>
        <button onClick={openAdd} style={{display:"flex",alignItems:"center",gap:4,background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontWeight:600,fontSize:12}}>
          <PlusCircle size={14}/> 銘柄追加</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:C.bg}}>
            {["コード","銘柄名","業種","株数","取得単価","現在値","取得金額","評価額","損益","利回り","操作"].map(h=>
              <th key={h} style={{padding:"8px 10px",textAlign:"left"(color:C.textMuted,fontWeight:600,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>{holdings.map((h,i)=>{const buyAmt=h.shares*h.buyPrice;const curAmt=h.shares*h.currentPrice;const pl=curAmt-buyAmt;const yld=h.currentPrice>0?(h.annualDiv/h.currentPrice*100).toFixed(2):"0";
            return <tr key={i} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{padding:"8px 10px",color:C.textMuted}}>{h.code}</td>
              <td style={{padding:"8px 10px",color:C.text,fontWeight:600,cursor:"pointer"}} onClick={()=>onNavigateToAnalysis(h)}>{h.name}</td>
              <td style={{padding:"8px 10px",color:C.textDim}}>{h.sector}</td>
              <td style={{padding:"8px 10px",color:C.text}}>{h.shares}</td>
              <td style={{padding:"8px 10px",color:C.text}}>¥{h.buyPrice.toLocaleString()}</td>
              <td style={{padding:"8px 10px",color:C.primaryLight,fontWeight:600}}>¥{h.currentPrice.toLocaleString()}</td>
              <td style={{padding:"8px 10px",color:C.text}}>¥{buyAmt.toLocaleString()}</td>
              <td style={{padding:"8px 10px",color:C.text}}>¥{curAmt.toLocaleString()}</td>
              <td style={{padding:"8px 10px",color:pl>=0?C.success:C.danger,fontWeight:600}}>{pl>=0?"+":""}¥{pl.toLocaleString()}</td>
              <td style={{padding:"8px 10px",color:C.primaryLight}}>{yld}%</td>
              <td style={{padding:"8px 10px"}}>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>openEdit(i)} style={{background:"rgba(99,102,241,0.15)",border:"none",borderRadius:6,padding:4,cursor:"pointer"}}><Edit3 size={13} color={C.primaryLight}/></button>
                  <button onClick={()=>deleteHolding(i)} style={{background:"rgba(239,68,68,0.15)",border:"none",borderRadius:6,padding:4,cursor:"pointer"}}><Trash2 size={13} color={C.danger}/></button>
                </div></td>
            </tr>})}</tbody>
        </table>
      </div>
    </Card>

    {/* Add/Edit Modal */}
    {showAddModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:200,padding:16}} onClick={()=>setShowAddModal(false)}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:24,width:"100%",maxWidth:420}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{color:C.text,fontWeight:700,fontSize:16}}>{editingIdx!==null?"銘柄編集":"銘柄追加"}</span>
          <button onClick={()=>setShowAddModal(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20} color={C.textMuted}/></button>
        </div>
        {[{k:"code",l:"銘柄コード"},{k:"name",l:"銘柄名"},{k:"sector",l:"業種"},{k:"shares",l:"保有株数",t:"number"},{k:"buyPrice",l:"取得単価",t:"number"},{k:"currentPrice",l:"現在値",t:"number"},{k:"annualDiv",l:"年間配当(1株)",t:"number"},{k:"divMonth",l:"配当月(カンマ区切り 例:3,9)"}].map(f=>
          <div key={f.k} style={{marginBottom:10}}>
            <label style={{color:C.textMuted,fontSize:12,display:"block",marginBottom:4}}>{f.l}</label>
            <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:f.t==="number"?e.target.value:e.target.value})} type={f.t||"text"}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 12px",fontSize:13,boxSizing:"border-box"}}/>
          </div>)}
        <button onClick={saveHolding} style={{width:"100%",background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontWeight:700,fontSize:14,marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Save size={16}/> 保存</button>
      </div>
    </div>}
  </div>};

/* ═══════════════════════════════════════════
   TAB 2: SCREENING (from spreadsheet 2)
   ═══════════════════════════════════════════ */
const ScreeningTab=({onSelectStock})=>{
  const [filters,setFilters]=useState({divYieldMin:3,opsMarginMin:0,equityRatioMin:0,roeMin:0,revenueIncRateMin:0,epsIncRateMin:0,opsCFNegRateMax:100,consecutiveProfitMin:0});
  const [sortKey,setSortKey]=useState("divYield");
  const [sortAsc,setSortAsc]=useState(false);

  const filtered=useMemo(()=>SCREENING_DATA.filter(s=>
    s.divYield>=filters.divYieldMin&&
    s.opsMarginLatest>=filters.opsMarginMin&&
    s.equityRatio>=filters.equityRatioMin&&
    (typeof s.roeLatest==="number"?s.roeLatest>=filters.roeMin:true)&&
    s.revenueIncRate>=filters.revenueIncRateMin&&
    s.epsIncRate>=filters.epsIncRateMin&&
    s.opsCFNegRate<=filters.opsCFNegRateMax&&
    s.consecutiveProfitYrs>=filters.consecutiveProfitMin
  ),[filters]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{
    let va=a[sortKey]??0,vb=b[sortKey]??0;
    if(typeof va==="string")va=0;if(typeof vb==="string")vb=0;
    return sortAsc?va-vb:vb-va}),[filtered,sortKey,sortAsc]);

  const handleSort=(k)=>{if(sortKey===k)setSortAsc(!sortAsc);else{setSortKey(k);setSortAsc(false)}};

  const downloadCSV=useCallback(()=>{
    const h="No,市場,コード,業種,名称,終値,配当利回り(%),営業利益率(%),自己資本比率(%),ROE(%),売上増加率(%),EPS増加率(%),営業CF赤字率(%),連続増益(年)\n";
    const rows=sorted.map(s=>`${s.no},${s.market},${s.code},${s.sector},${s.name},${s.price},${s.divYield},${s.opsMarginLatest},${s.equityRatio},${s.roeLatest},${s.revenueIncRate},${s.epsIncRate},${s.opsCFNegRate},${s.consecutiveProfitYrs}`).join("\n");
    const blob=new Blob(["\uFEFF"+h+rows],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="screening_results.csv";a.click();},[sorted]);

  const SliderF=({label,value,onChange,min,max,step=1,unit="%"})=>(
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{color:C.textMuted,fontSize:12}}>{label}</span>
        <span style={{color:C.primaryLight,fontWeight:600,fontSize:12}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{width:"100%",accentColor:C.primary}}/>
    </div>);

  const cellColor=(val,type)=>{
    if(typeof val!=="number")return C.textDim;
    switch(type){
      case "margin":return val>=15?C.success:val>=8?"#22d3ee":val>=3?C.warning:C.danger;
      case "equity":return val>=60?C.success:val>=40?"#22d3ee":val>=20?C.warning:C.danger;
      case "roe":return val>=15?C.success:val>=10?"#22d3ee":val>=5?C.warning:C.danger;
      case "rate":return val>=75?C.success:val>=50?"#22d3ee":val>=30?C.warning:C.danger;
      case "cfneg":return val===0?C.success:val<=10?"#22d3ee":val<=25?C.warning:C.danger;
      default:return C.text}};

  return <div>
    {/* Filter Panel */}
    <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px 20px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <Filter size={16} color={C.primaryLight}/>
        <span style={{color:C.text,fontWeight:700,fontSize:15}}>スクリーニング条件</span>
        <span style={{color:C.textDim,fontSize:11,marginLeft:"auto"}}>色分け: <span style={{color:C.success}}>●優秀</span> <span style={{color:"#22d3ee"}}>●良好</span> <span style={{color:C.warning}}>●要確認</span> <span style={{color:C.danger}}>●注意</span></span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"4px 24px"}}>
        <SliderF label="配当利回り(以上)" value={filters.divYieldMin} onChange={v=>setFilters({...filters,divYieldMin:v})} min={0} max={8} step={0.5}/>
        <SliderF label="営業利益率(以上)" value={filters.opsMarginMin} onChange={v=>setFilters({...filters,opsMarginMin:v})} min={-5} max={30}/>
        <SliderF label="自己資本比率(以上)" value={filters.equityRatioMin} onChange={v=>setFilters({...filters,equityRatioMin:v})} min={0} max={90} step={5}/>
        <SliderF label="ROE(以上)" value={filters.roeMin} onChange={v=>setFilters({...filters,roeMin:v})} min={0} max={30}/>
        <SliderF label="売上増加確率(以上)" value={filters.revenueIncRateMin} onChange={v=>setFilters({...filters,revenueIncRateMin:v})} min={0} max={100} step={5}/>
        <SliderF label="EPS増加確率(以上)" value={filters.epsIncRateMin} onChange={v=>setFilters({...filters,epsIncRateMin:v})} min={0} max={100} step={5}/>
        <SliderF label="営業CF赤字確率(以下)" value={filters.opsCFNegRateMax} onChange={v=>setFilters({...filters,opsCFNegRateMax:v})} min={0} max={100} step={5}/>
        <SliderF label="連続増益年数(以上)" value={filters.consecutiveProfitMin} onChange={v=>setFilters({...filters,consecutiveProfitMin:v})} min={0} max={10} unit="年"/>
      </div>
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
      <span style={{color:C.text,fontWeight:600,fontSize:14}}>結果: <span style={{color:C.primaryLight}}>{sorted.length}</span> 銘柄</span>
      <button onClick={downloadCSV} style={{display:"flex",alignItems:"center",gap:4,background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontWeight:600,fontSize:12}}><Download size={14}/> CSV</button>
    </div>

    <div style={{overflowX:"auto",borderRadius:12,border:`1px solid ${C.border}`}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,whiteSpace:"nowrap"}}>
        <thead><tr style={{background:C.card}}>
          {[{k:"no",l:"No."},{k:"code",l:"コード"},{k:"name",l:"名称"},{k:"sector",l:"業種"},{k:"price",l:"終値"},{k:"divYield",l:"配当利回り"},{k:"opsMarginLatest",l:"営業利益率"},{k:"opsMargin10y",l:"営利10年平均"},{k:"consecutiveProfitYrs",l:"連続増益"},{k:"revenueIncRate",l:"売上増加率"},{k:"epsIncRate",l:"EPS増加率"},{k:"roeLatest",l:"ROE"},{k:"equityRatio",l:"自己資本比率"},{k:"opsCFNegRate",l:"営業CF赤字率"},{k:"netCashDivCapacity",l:"配当余力"}].map(col=>
            <th key={col.k} onClick={()=>handleSort(col.k)} style={{padding:"8px 10px",textAlign:"left",color:C.textMuted,fontWeight:600,cursor:"pointer",borderBottom:`1px solid ${C.border}`,userSelect:"none"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:2}}>{col.l} <ArrowUpDown size={10} color={sortKey===col.k?C.primaryLight:C.textDim}/></span></th>)}
        </tr></thead>
        <tbody>{sorted.length===0?<tr><td colSpan={15} style={{padding:30,textAlign:"center",color:C.textDim}}>条件に合致する銘柄がありません</td></tr>:
          sorted.map(s=><tr key={s.code} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>onSelectStock({code:s.code,name:s.name})}>
            <td style={{padding:"7px 10px",color:C.textDim}}>{s.no}</td>
            <td style={{padding:"7px 10px",color:C.textMuted}}>{s.code}</td>
            <td style={{padding:"7px 10px",color:C.text,fontWeight:600}}>{s.name}</td>
            <td style={{padding:"7px 10px",color:C.textDim}}>{s.sector}</td>
            <td style={{padding:"7px 10px",color:C.text}}>¥{s.price.toLocaleString()}</td>
            <td style={{padding:"7px 10px",color:s.divYield>=4?C.success:s.divYield>=3?C.primaryLight:C.text,fontWeight:600}}>{s.divYield}%</td>
            <td style={{padding:"7px 10px",color:cellColor(s.opsMarginLatest,"margin")}}>{s.opsMarginLatest}%</td>
            <td style={{padding:"7px 10px",color:cellColor(s.opsMargin10y,"margin")}}>{s.opsMargin10y}%</td>
            <td style={{padding:"7px 10px",color:s.consecutiveProfitYrs>=3?C.success:s.consecutiveProfitYrs>=1?C.warning:C.danger}}>{s.consecutiveProfitYrs}年</td>
            <td style={{padding:"7px 10px",color:cellColor(s.revenueIncRate,"rate")}}>{s.revenueIncRate}%</td>
            <td style={{padding:"7px 10px",color:cellColor(s.epsIncRate,"rate")}}>{s.epsIncRate}%</td>
            <td style={{padding:"7px 10px",color:cellColor(typeof s.roeLatest==="number"?s.roeLatest:0,"roe")}}>{s.roeLatest}%</td>
            <td style={{padding:"7px 10px",color:cellColor(s.equityRatio,"equity")}}>{s.equityRatio}%</td>
            <td style={{padding:"7px 10px",color:cellColor(s.opsCFNegRate,"cfneg")}}>{s.opsCFNegRate}%</td>
            <td style={{padding:"7px 10px",color:s.netCashDivCapacity>=5?C.success:s.netCashDivCapacity>=0?C.warning:C.danger}}>{s.netCashDivCapacity}</td>
          </tr>)}</tbody>
      </table>
    </div>
  </div>};

/* ═══════════════════════════════════════════
   TAB 3: INDIVIDUAL ANALYSIS
   ═══════════════════════════════════════════ */
const AnalysisTab=({stock:initialStock,onBack})=>{
  const [codeInput,setCodeInput]=useState(initialStock?.code||"");
  const [nameInput,setNameInput]=useState(initialStock?.name||"");
  const [selected,setSelected]=useState(initialStock?ANALYSIS_STOCKS.find(s=>s.code===initialStock.code)||null:null);

  useEffect(()=>{if(initialStock){const f=ANALYSIS_STOCKS.find(s=>s.code===initialStock.code);if(f){setSelected(f);setCodeInput(f.code);setNameInput(f.name)}}},[initialStock]);

  const handleSearch=()=>{const f=ANALYSIS_STOCKS.find(s=>s.code===codeInput||s.name.includes(nameInput));if(f){setSelected(f);setCodeInput(f.code);setNameInput(f.name)}};
  const analysis=selected?analyzeStock(selected):null;

  const ChartCard=({title,children})=><div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 18px",marginBottom:14}}>
    <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:10}}>{title}</div>{children}</div>;

  const tt={background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:11};

  return <div>
    <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 18px",marginBottom:20}}>
      {onBack&&<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",color:C.primaryLight,cursor:"pointer",marginBottom:10,padding:0,fontSize:12,fontWeight:600}}><ArrowLeft size={14}/> 戻る</button>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <input value={codeInput} onChange={e=>setCodeInput(e.target.value)} placeholder="銘柄コード" style={{flex:"0 0 110px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 12px",fontSize:13}}/>
        <input value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="銘柄名" onKeyDown={e=>e.key==="Enter"&&handleSearch()} style={{flex:1,minWidth:140,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 12px",fontSize:13}}/>
        <button onClick={handleSearch} style={{display:"flex",alignItems:"center",gap:4,background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13}}><Search size={15}/> 分析</button>
      </div>
      <div style={{color:C.textDim,fontSize:11,marginTop:6}}>対応銘柄: {ANALYSIS_STOCKS.map(s=>`${s.name}(${s.code})`).join(", ")}</div>
    </div>

    {!selected?<div style={{textAlign:"center",padding:50,color:C.textDim}}><BarChart3 size={40} style={{marginBottom:10,opacity:0.5}}/><div>銘柄コードまたは名前を入力してください</div></div>:
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:16,marginBottom:20,alignItems:"start"}}>
        <div>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{color:C.text,fontSize:22,fontWeight:800}}>{selected.name}</span>
            <span style={{color:C.textDim,fontSize:13}}>{selected.code} / {selected.sector}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:6,marginTop:12}}>
            {analysis.items.map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
              <div><div style={{color:C.textMuted,fontSize:11}}>{item.label}</div><div style={{color:C.text,fontWeight:600,fontSize:13}}>{item.value}</div></div>
              <StatusBadge status={item.status}/></div>)}
          </div>
        </div>
        <ScoreGauge percent={analysis.scorePercent}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,440px),1fr))",gap:14}}>
        <ChartCard title="売上高の推移（億円）"><ResponsiveContainer width="100%" height={200}>
          <BarChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><Bar dataKey="revenue" fill={C.primary} radius={[3,3,0,0]} name="売上高"/></BarChart></ResponsiveContainer></ChartCard>

        <ChartCard title="EPS（円）"><ResponsiveContainer width="100%" height={200}>
          <AreaChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="eps" stroke={C.success} fill="rgba(34,197,94,0.12)" name="EPS"/></AreaChart></ResponsiveContainer></ChartCard>

        <ChartCard title="営業利益率（%）"><ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><ReferenceLine y={8} stroke={C.success} strokeDasharray="4 4" label={{value:"8%",fill:C.success,fontSize:10}}/><Line type="monotone" dataKey="opsMargin" stroke={C.warning} strokeWidth={2} dot={{r:2}} name="営業利益率"/></ComposedChart></ResponsiveContainer></ChartCard>

        <ChartCard title="自己資本比率（%）"><ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><ReferenceLine y={60} stroke={C.success} strokeDasharray="4 4" label={{value:"60%",fill:C.success,fontSize:10}}/><Area type="monotone" dataKey="equityRatio" stroke="#06b6d4" fill="rgba(6,182,212,0.1)" name="自己資本比率"/></ComposedChart></ResponsiveContainer></ChartCard>

        <ChartCard title="営業CF（億円）"><ResponsiveContainer width="100%" height={200}>
          <BarChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><ReferenceLine y={0} stroke={C.textDim}/><Bar dataKey="opsCF" fill={C.success} radius={[3,3,0,0]} name="営業CF"/></BarChart></ResponsiveContainer></ChartCard>

        <ChartCard title="現金等（億円）"><ResponsiveContainer width="100%" height={200}>
          <AreaChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="cash" stroke="#ec4899" fill="rgba(236,72,153,0.1)" name="現金等"/></AreaChart></ResponsiveContainer></ChartCard>

        <ChartCard title="配当金（円/株）"><ResponsiveContainer width="100%" height={200}>
          <BarChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}}/><Tooltip contentStyle={tt}/><Bar dataKey="dividend" fill={C.primaryLight} radius={[3,3,0,0]} name="配当金"/></BarChart></ResponsiveContainer></ChartCard>

        <ChartCard title="配当性向（%）"><ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={selected.financials}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textDim,fontSize:10}}/><YAxis tick={{fill:C.textDim,fontSize:10}} domain={[0,100]}/><Tooltip contentStyle={tt}/><ReferenceLine y={30} stroke={C.success} strokeDasharray="4 4"/><ReferenceLine y={60} stroke={C.success} strokeDasharray="4 4" label={{value:"30-60%",fill:C.success,fontSize:10,position:"right"}}/><Line type="monotone" dataKey="payoutRatio" stroke={C.danger} strokeWidth={2} dot={{r:2}} name="配当性向"/></ComposedChart></ResponsiveContainer></ChartCard>
      </div>
    </div>}
  </div>};

/* ═══════════════════════════════════════════
   TAB 4: PRICE UPDATE STATUS
   ═══════════════════════════════════════════ */
const PriceUpdateTab=()=>{
  const [lastUpdate]=useState("2026-04-01 04:00:15");
  const [nextUpdate]=useState("2026-04-02 04:00:00");
  return <div style={{maxWidth:600,margin:"0 auto"}}>
    <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:24}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <div style={{background:"rgba(34,197,94,0.15)",borderRadius:10,padding:8}}><RefreshCw size={20} color={C.success}/></div>
        <div>
          <div style={{color:C.text,fontWeight:700,fontSize:16}}>自動株価更新</div>
          <div style={{color:C.textDim,fontSize:12}}>毎朝4:00に前日終値を自動取得</div>
        </div>
      </div>
      <div style={{display:"grid",gap:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{color:C.textMuted,fontSize:13}}>ステータス</div>
          <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:16,background:"rgba(34,197,94,0.15)",color:C.success,fontSize:12,fontWeight:600}}>
            <CheckCircle size={13}/> 稼働中</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{color:C.textMuted,fontSize:13}}>最終更新</div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:C.text,fontSize:13,fontWeight:600}}><Clock size={13} color={C.textDim}/>{lastUpdate}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{color:C.textMuted,fontSize:13}}>次回更新予定</div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:C.primaryLight,fontSize:13,fontWeight:600}}><Clock size={13} color={C.textDim}/>{nextUpdate}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{color:C.textMuted,fontSize:13}}>データソース</div>
          <div style={{color:C.text,fontSize:13}}>Yahoo Finance Japan API</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{color:C.textMuted,fontSize:13}}>更新スケジュール</div>
          <div style={{color:C.text,fontSize:13}}>平日 毎朝 4:00 JST</div>
        </div>
      </div>
      <div style={{marginTop:16,padding:12,background:"rgba(99,102,241,0.08)",borderRadius:10,border:`1px solid rgba(99,102,241,0.2)`}}>
        <div style={{color:C.primaryLight,fontSize:12,fontWeight:600,marginBottom:4}}>自動更新の仕組み</div>
        <div style={{color:C.textMuted,fontSize:11,lineHeight:1.6}}>
          毎朝4:00に定期タスクが実行され、ポートプオヸオ内の全銘柄の前日終値を取得し、現在値を自動更新します。土日祝日は市場が休場のため、直近の営業日の終値が適用されます。
        </div>
      </div>
    </div>
  </div>};

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App(){
  const [activeTab,setActiveTab]=useState("portfolio");
  const [analysisStock,setAnalysisStock]=useState(null);

  const navToAnalysis=(stock)=>{setAnalysisStock(stock);setActiveTab("analysis")};
  const navToScreeningStock=(stock)=>{setAnalysisStock(stock);setActiveTab("analysis")};

  const tabs=[
    {key:"portfolio",label:"ポートフォリオ",icon:<Briefcase size={14}/>},
    {key:"screening",label:"スクリーニング",icon:<Filter size={14}/>},
    {key:"analysis",label:"個別分析",icon:<BarChart3 size={14}/>},
    {key:"priceUpdate",label:"株価更新",icon:<RefreshCw size={14}/>},
  ];

  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
    {/* Header */}
    <header style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderBottom:`1px solid ${C.border}`,padding:"12px 20px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
      <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:"rgba(99,102,241,0.2)",borderRadius:8,padding:6}}><TrendingUp size={20} color={C.primaryLight}/></div>
          <div><div style={{fontWeight:800,fontSize:16,letterSpacing:"-0.3px"}}>高配当株 管理・分析ツール</div>
            <div style={{color:C.textDim,fontSize:10}}>High Dividend Stock Manager & Analyzer</div></div>
        </div>
        <div style={{display:"flex",background:"rgba(0,0,0,0.3)",borderRadius:10,padding:2,flexWrap:"wrap"}}>
          {tabs.map(t=><button key={t.key} onClick={()=>setActiveTab(t.key)} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:activeTab===t.key?C.primary:"transparent",color:activeTab===t.key?"#fff":C.textMuted,transition:"all 0.2s",whiteSpace:"nowrap"}}>{t.icon} {t.label}</button>)}
        </div>
      </div>
    </header>

    {/* Content */}
    <main style={{maxWidth:1280,margin:"0 auto",padding:"20px 14px"}}>
      {activeTab==="portfolio"&&<PortfolioTab onNavigateToAnalysis={navToAnalysis}/>}
      {activeTab==="screening"&&<ScreeningTab onSelectStock={navToScreeningStock}/>}
      {activeTab==="analysis"&&<AnalysisTab stock={analysisStock} onBack={()=>setActiveTab("screening")}/>}
      {activeTab==="priceUpdate"&&<PriceUpdateTab/>}
    </main>

    <footer style={{textAlign:"center",padding:"20px 14px",color:C.textDim,fontSize:10,borderTop:`1px solid ${C.border}`}}>
      <Info size={11} style={{verticalAlign:"middle",marginRight:3}}/>
      サンプルデータによるデモ版です。投資判断は自己責任でお願いします。株価は毎朝4:00に自動更新されます。
    </footer>
  </div>}
