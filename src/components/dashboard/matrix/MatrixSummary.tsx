import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Sliders, Scale } from 'lucide-react';
import { MatrixSummaryStats } from './types';

export interface MatrixSummaryProps {
  summary: MatrixSummaryStats;
  bloomGuidance: {
    nb: number;
    th: number;
    vd: number;
  };
  onUpdateBloomGuidance: (newGuidance: { nb: number; th: number; vd: number }) => void;
  enableDistributionControl: boolean;
  pointsMode?: 'equal' | 'by_section';
  onChangePointsMode?: (mode: 'equal' | 'by_section') => void;
}

export const MatrixSummary: React.FC<MatrixSummaryProps> = ({
  summary,
  bloomGuidance,
  onUpdateBloomGuidance,
  enableDistributionControl,
}) => {
  const total = summary.matrixTotal || 0;
  const totalPct = bloomGuidance.nb + bloomGuidance.th + bloomGuidance.vd;
  const totalPoints = totalPct / 10;
  const is100Percent = totalPct === 100;
  const isAlert = enableDistributionControl && !is100Percent;

  // Percentage updater
  const handlePctChange = (field: 'nb' | 'th' | 'vd', val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    onUpdateBloomGuidance({
      ...bloomGuidance,
      [field]: clamped,
    });
  };

  // Points updater (1.0 point = 10%)
  const handlePointsChange = (field: 'nb' | 'th' | 'vd', points: number) => {
    const clamped = Math.max(0, Math.min(10, points));
    const newPct = Math.round(clamped * 10);
    onUpdateBloomGuidance({
      ...bloomGuidance,
      [field]: newPct,
    });
  };

  // Quick action: reset to standard 40-30-30
  const handleNormalize = () => {
    onUpdateBloomGuidance({
      nb: 40,
      th: 30,
      vd: 30,
    });
  };

  return (
    <tfoot className="border-t-2 border-slate-300 text-slate-800 sticky bottom-0 z-20 shadow-2xs">
      {/* ROW 1: TỔNG SỐ CÂU THỰC TẾ TRONG MA TRẬN */}
      <tr className="font-bold text-xs bg-slate-50 border-b border-slate-200">
        <td
          colSpan={4}
          className="px-4 py-3 text-right uppercase tracking-wider text-slate-700 font-bold border-r border-slate-200"
        >
          <div className="flex items-center justify-end gap-2">
            <span>Tổng số câu hỏi</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-200/80 text-slate-800 font-mono font-bold">
              {total} câu
            </span>
          </div>
        </td>

        {/* Total NB */}
        <td className="px-2 py-3 text-center border-r border-slate-200 whitespace-nowrap">
          <div className="font-extrabold text-xs text-emerald-800">
            {summary.totalNB} câu
          </div>
          {total > 0 && (
            <div className="text-[10px] text-slate-400 font-normal">
              {Math.round((summary.totalNB / total) * 100)}% thực tế
            </div>
          )}
        </td>

        {/* Total TH */}
        <td className="px-2 py-3 text-center border-r border-slate-200 whitespace-nowrap">
          <div className="font-extrabold text-xs text-blue-800">
            {summary.totalTH} câu
          </div>
          {total > 0 && (
            <div className="text-[10px] text-slate-400 font-normal">
              {Math.round((summary.totalTH / total) * 100)}% thực tế
            </div>
          )}
        </td>

        {/* Total VD */}
        <td className="px-2 py-3 text-center whitespace-nowrap">
          <div className="font-extrabold text-xs text-indigo-800">
            {summary.totalVD} câu
          </div>
          {total > 0 && (
            <div className="text-[10px] text-slate-400 font-normal">
              {Math.round((summary.totalVD / total) * 100)}% thực tế
            </div>
          )}
        </td>
      </tr>

      {/* ROW 2: TỈ LỆ PHÂN BỔ ĐỊNH HƯỚNG (%) - TƯƠNG TÁC THỰC TẾ & CẢNH BÁO ĐỎ NẾU != 100% */}
      <tr
        className={`text-xs transition-colors ${
          isAlert
            ? 'bg-red-50/95 border-y-2 border-red-500 text-red-900'
            : 'bg-white/95 border-b border-slate-200 text-slate-800'
        }`}
      >
        <td
          colSpan={4}
          className={`px-4 py-2.5 text-right border-r ${
            isAlert ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 font-bold">
              <Sliders
                className={`w-3.5 h-3.5 ${
                  isAlert ? 'text-red-600' : 'text-[var(--primary)]'
                }`}
              />
              <span>Tỉ lệ phân bổ (%)</span>
            </div>

            {/* Alert / Status display */}
            {enableDistributionControl ? (
              isAlert ? (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 mt-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>
                    ⚠️ Tổng tỉ lệ hiện tại là {totalPct}% - Cần điều chỉnh lại cho đủ chính xác 100%
                  </span>
                  <button
                    type="button"
                    onClick={handleNormalize}
                    className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-red-700 border border-red-300 hover:bg-red-100/50 cursor-pointer shadow-2xs"
                    title="Đặt nhanh về tỉ lệ chuẩn 40% - 30% - 30%"
                  >
                    Đặt 40-30-30
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>✓ Tổng tỉ lệ chuẩn: 100%</span>
                </div>
              )
            ) : (
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Kiểm soát tỉ lệ: Đang tắt (tự do)
              </span>
            )}
          </div>
        </td>

        {/* Stepper NB % */}
        <td
          className={`px-2 py-2 text-center border-r whitespace-nowrap ${
            isAlert ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <div className="inline-flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => handlePctChange('nb', bloomGuidance.nb - 5)}
              disabled={bloomGuidance.nb <= 0}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Giảm 5%"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={100}
              value={bloomGuidance.nb}
              onChange={(e) => handlePctChange('nb', parseInt(e.target.value, 10) || 0)}
              className="w-10 text-center font-extrabold text-xs text-emerald-800 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handlePctChange('nb', bloomGuidance.nb + 5)}
              disabled={bloomGuidance.nb >= 100}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Tăng 5%"
            >
              +
            </button>
            <span className="text-[10px] font-bold text-slate-500 pr-0.5">%</span>
          </div>
        </td>

        {/* Stepper TH % */}
        <td
          className={`px-2 py-2 text-center border-r whitespace-nowrap ${
            isAlert ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <div className="inline-flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => handlePctChange('th', bloomGuidance.th - 5)}
              disabled={bloomGuidance.th <= 0}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Giảm 5%"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={100}
              value={bloomGuidance.th}
              onChange={(e) => handlePctChange('th', parseInt(e.target.value, 10) || 0)}
              className="w-10 text-center font-extrabold text-xs text-blue-800 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handlePctChange('th', bloomGuidance.th + 5)}
              disabled={bloomGuidance.th >= 100}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Tăng 5%"
            >
              +
            </button>
            <span className="text-[10px] font-bold text-slate-500 pr-0.5">%</span>
          </div>
        </td>

        {/* Stepper VD % */}
        <td
          className={`px-2 py-2 text-center whitespace-nowrap ${
            isAlert ? 'border-red-300' : ''
          }`}
        >
          <div className="inline-flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => handlePctChange('vd', bloomGuidance.vd - 5)}
              disabled={bloomGuidance.vd <= 0}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Giảm 5%"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={100}
              value={bloomGuidance.vd}
              onChange={(e) => handlePctChange('vd', parseInt(e.target.value, 10) || 0)}
              className="w-10 text-center font-extrabold text-xs text-indigo-800 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handlePctChange('vd', bloomGuidance.vd + 5)}
              disabled={bloomGuidance.vd >= 100}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Tăng 5%"
            >
              +
            </button>
            <span className="text-[10px] font-bold text-slate-500 pr-0.5">%</span>
          </div>
        </td>
      </tr>

      {/* ROW 3: TRỌNG SỐ PHẦN (THANG ĐIỂM 10) - QUY ĐỔI 2 CHIỀU VỚI TỈ LỆ % */}
      <tr
        className={`text-xs transition-colors ${
          isAlert
            ? 'bg-red-50/80 border-b-2 border-red-500 text-red-900'
            : 'bg-slate-50/70 text-slate-800'
        }`}
      >
        <td
          colSpan={4}
          className={`px-4 py-2.5 text-right border-r ${
            isAlert ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 font-bold">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Trọng số phần (Thang điểm 10)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Quy đổi: {totalPoints.toFixed(1)} / 10 điểm (1.0 điểm = 10%). Có thể nhập trực tiếp điểm để đổi ngược sang %.
            </span>
          </div>
        </td>

        {/* Points NB */}
        <td
          className={`px-2 py-2 text-center border-r whitespace-nowrap ${
            isAlert ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <div className="inline-flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() =>
                handlePointsChange('nb', parseFloat(((bloomGuidance.nb - 5) / 10).toFixed(1)))
              }
              disabled={bloomGuidance.nb <= 0}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Giảm 0.5 điểm"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={(bloomGuidance.nb / 10).toFixed(1)}
              onChange={(e) => handlePointsChange('nb', parseFloat(e.target.value) || 0)}
              className="w-10 text-center font-extrabold text-xs text-emerald-800 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() =>
                handlePointsChange('nb', parseFloat(((bloomGuidance.nb + 5) / 10).toFixed(1)))
              }
              disabled={bloomGuidance.nb >= 100}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Tăng 0.5 điểm"
            >
              +
            </button>
            <span className="text-[10px] font-bold text-slate-500 pr-0.5">đ</span>
          </div>
        </td>

        {/* Points TH */}
        <td
          className={`px-2 py-2 text-center border-r whitespace-nowrap ${
            isAlert ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <div className="inline-flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() =>
                handlePointsChange('th', parseFloat(((bloomGuidance.th - 5) / 10).toFixed(1)))
              }
              disabled={bloomGuidance.th <= 0}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Giảm 0.5 điểm"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={(bloomGuidance.th / 10).toFixed(1)}
              onChange={(e) => handlePointsChange('th', parseFloat(e.target.value) || 0)}
              className="w-10 text-center font-extrabold text-xs text-blue-800 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() =>
                handlePointsChange('th', parseFloat(((bloomGuidance.th + 5) / 10).toFixed(1)))
              }
              disabled={bloomGuidance.th >= 100}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Tăng 0.5 điểm"
            >
              +
            </button>
            <span className="text-[10px] font-bold text-slate-500 pr-0.5">đ</span>
          </div>
        </td>

        {/* Points VD */}
        <td
          className={`px-2 py-2 text-center whitespace-nowrap ${
            isAlert ? 'border-red-300' : ''
          }`}
        >
          <div className="inline-flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() =>
                handlePointsChange('vd', parseFloat(((bloomGuidance.vd - 5) / 10).toFixed(1)))
              }
              disabled={bloomGuidance.vd <= 0}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Giảm 0.5 điểm"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={(bloomGuidance.vd / 10).toFixed(1)}
              onChange={(e) => handlePointsChange('vd', parseFloat(e.target.value) || 0)}
              className="w-10 text-center font-extrabold text-xs text-indigo-800 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() =>
                handlePointsChange('vd', parseFloat(((bloomGuidance.vd + 5) / 10).toFixed(1)))
              }
              disabled={bloomGuidance.vd >= 100}
              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Tăng 0.5 điểm"
            >
              +
            </button>
            <span className="text-[10px] font-bold text-slate-500 pr-0.5">đ</span>
          </div>
        </td>
      </tr>
    </tfoot>
  );
};

export interface MatrixSummaryBottomBarProps {
  summary: MatrixSummaryStats;
  bloomGuidance: {
    nb: number;
    th: number;
    vd: number;
  };
  enableDistributionControl: boolean;
  pointsMode?: 'equal' | 'by_section';
  onChangePointsMode?: (mode: 'equal' | 'by_section') => void;
}

export const MatrixSummaryBottomBar: React.FC<MatrixSummaryBottomBarProps> = ({
  summary,
  bloomGuidance,
  enableDistributionControl,
  pointsMode = 'by_section',
  onChangePointsMode,
}) => {
  const total = summary.matrixTotal || 0;
  const totalPct = bloomGuidance.nb + bloomGuidance.th + bloomGuidance.vd;
  const is100Percent = totalPct === 100;
  const isAlert = enableDistributionControl && !is100Percent;

  return (
    <div
      className={`p-4 border-t flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
        isAlert ? 'bg-red-50/70 border-red-300' : 'bg-white border-slate-200'
      }`}
    >
      {/* Left: Horizontal scannable summary in 1 line on desktop */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          TỔNG CỘNG:
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            Nhận biết: <strong>{summary.totalNB} câu</strong> · {bloomGuidance.nb}% (
            {(bloomGuidance.nb / 10).toFixed(1)}đ)
          </span>
        </div>
        <span className="text-slate-300 font-light hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>
            Thông hiểu: <strong>{summary.totalTH} câu</strong> · {bloomGuidance.th}% (
            {(bloomGuidance.th / 10).toFixed(1)}đ)
          </span>
        </div>
        <span className="text-slate-300 font-light hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/80">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>
            Vận dụng: <strong>{summary.totalVD} câu</strong> · {bloomGuidance.vd}% (
            {(bloomGuidance.vd / 10).toFixed(1)}đ)
          </span>
        </div>
        <span className="text-slate-300 font-light hidden sm:inline">|</span>

        {/* Total Badge with alert styling if != 100% */}
        {isAlert ? (
          <div className="px-3 py-1 rounded-lg bg-red-600 text-white font-extrabold shadow-2xs flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Tổng: {total} câu · {totalPct}% ({(totalPct / 10).toFixed(1)}/10đ) — Lệch 100%
            </span>
          </div>
        ) : (
          <div
            className="px-3 py-1 rounded-lg text-white font-extrabold shadow-2xs"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Tổng số: {total} câu · {totalPct}% ({(totalPct / 10).toFixed(1)}đ)
          </div>
        )}
      </div>

      {/* Right: Point Distribution mode */}
      <div className="flex items-center gap-3 text-xs text-slate-700 shrink-0">
        <span className="font-bold text-slate-800">Cơ chế tính điểm:</span>
        <div className="inline-flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="radio"
              name="pointsDistributionMode"
              checked={pointsMode === 'by_section'}
              onChange={() => onChangePointsMode?.('by_section')}
              className="accent-[var(--primary)] cursor-pointer"
            />
            <span className="font-semibold">Chia theo phần (Thang điểm 10)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-slate-900">
            <input
              type="radio"
              name="pointsDistributionMode"
              checked={pointsMode === 'equal'}
              onChange={() => onChangePointsMode?.('equal')}
              className="accent-[var(--primary)] cursor-pointer"
            />
            <span>Chia đều toàn đề</span>
          </label>
        </div>
      </div>
    </div>
  );
};
